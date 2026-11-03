---
name: super-agent-architecture
title: Super-Agent：多任务的上限不是模型，是人的注意力
summary: DeepSeek Harness 的 Super-Agent 拆开路由、事件、上下文和运行环境；多任务稀缺的是注意力。
date: 2026-11-03
source: https://x.com/criscxuan/status/2117139890957861046
author: "@criscxuan"
tags: [super-agent, agent-architecture, multi-agent, harness, context-engineering]
related: []
---

一个人同时盯几个 coding agent，超过三个就开始记不清谁在做什么。@criscxuan 把这件事写成一句话：单任务的上限取决于模型，多任务的上限取决于人的注意力。DeepSeek Harness 团队文章里提出的 [Super-Agent 架构](https://mp.weixin.qq.com/s/vt2qgHGAmzpqY-CXBWAj0g)，就是想把 Session 从人的眼前拿走，让一个人还能管住一组任务。

这篇是对[那条 X 帖](https://x.com/criscxuan/status/2117139890957861046)的再整理。我按 [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) 的文档核对了一遍：哪些是原型已经有的，哪些只是文章方向。原型是研究代码，README 自己写着“not an official DeepSeek product”，不要把它当成可以直接上生产的产品。

![左边是一个人盯着多个会话，注意力被切碎；右边是 Router 把任务分给 Worker，用户只看到一个 Super-Agent](/sdlc-playbook/articles/super-agent-architecture/cover.svg)

## 一个 Session 装不下多任务

现在的 coding agent 基本都以 Session 为单位：一个会话、一段上下文、一个主循环。单任务里这很合理，模型越强，能做的事越多。但多任务一来，问题就换了。

把所有工作塞进一个 Session，连续性好，吞吐低。开很多 Session，吞吐上去了，人却要在窗口之间切换，记住每个任务的前因后果。作者给了一个经验值：一个人能同时放在心上的 Session 大概三到五个。这不是测量结果，但和很多人的体感对得上。

所以多任务的瓶颈不在 token，也不在模型，而在人的注意力。Super-Agent 不追求更聪明的模型；它要用户少管几个 Session。

## 把 Session 从用户眼前拿走

Super-Agent 先动的是 Session 的组织方式：Router 和 Worker 分开。

Router 是常驻的全局路由层，负责和人交互、理解意图、把工作分给合适的 Worker。它不执行具体任务，也不钻进某个任务的细节。文章建议 Router 不需要最强的模型，轻量模型就够，因为它做的是分发和协调。

Worker 负责执行。每个 Worker 有自己的上下文、自己的工具、自己的任务，彼此不通信。一个 Worker 接到复杂任务时，可以再 fork 子 Agent，自己变成一个小团队。Worker 则用最强的模型，因为真正干活的是它。这是建议，不是硬规则；原型里的模型是可配置的。

原型里能找到这个结构的对应：主 Session 使用 `dsh-superagent-router` 预设，只做路由；每个 Ticket 有一个 `worker-<ticket id>` Session 和一个独立目录。主 Session 不允许 `sleep`，shell 超时被压到 30 秒，job wait 被压到 5 秒，目的是不让它卡在某个任务上。Worker 的汇报、问题和新任务会以消息形式回到主 Session，主 Session 不轮询。

“两层”只是形式，真正重要的是一个纪律：**Session 不能成为用户的负担。** 用户看到的是一个 Super-Agent，不是五个窗口。

## 事件先于 prompt

接下来是事件：把“拉取式对话”换成“事件驱动”。

在 Super-Agent 里，GitHub 评论、PR 变更、CI 结果、IM 消息、邮件和日程提醒都叫 Trigger。Trigger 是不可变的事件，先落库，再处理。相关的 Trigger 串成一条 Thread，比如一个 PR 下的所有评论、一封邮件下的往来、一个 IM 话题里的消息。Thread 是上下文单位。

Trigger 进来之后先过 Gate。Gate 是确定性的第一层：谁可以发起工作、在哪个来源、以什么强度。它先挡掉大部分噪音，不让所有消息都进模型。剩下的才进 Assessment，由模型判断这件事要不要接、接到什么程度。两层合起来叫 Eval，结果是一个 Decision：接单、停止、忽略，或者暂时处理不了。

Decision 接单之后，系统创建一个 Ticket。Ticket 是授权单位，不是上下文单位；它记录这次工作为什么可以做、范围到哪里、依据的是哪个 Policy 版本。Ticket 再通过 Assignment 绑定到一个 Executor，Executor 在自己的目录里干活。Ticket 和 Thread 之间是 Subscription：Thread 上的新消息会 fan-out 给订阅它的 Ticket，作为上下文，但不会自动授予新的权限。

原型文档把这条链拆得很细：Source、Trigger、Thread、Eval、Gate、Assessment、Decision、Mandate、Ticket、Assignment、Subscription、Executor。它还有一个很关键的工程选择：**先落库，再做副作用。** 发消息、启动 Assignment、投递 Input 都先写进 outbox / effects，再异步执行；外发消息有回执，同一个 id 不会重复入队，被丢弃的消息保留原因。失败按退避重试，同一件事不会因为重启而重复做。

Ticket 的状态不跟着 Executor Session 走。它可以被 handoff、resume，甚至由多个 Executor 跑；这也是为什么 Ticket 要自己定义状态。Mandate 是这次接单的授权凭据，不可变：只有人的 stop 能撤回它，Policy 不再成立时会被撤销。Assignment 则是把 Ticket 交给某个 Executor 的一次绑定。

![Trigger 从来源进入 Gate，慢路径经过 Assessment 和 Decision，最后变成 Ticket 和 Worker；Thread 负责上下文，Ticket 负责授权](/sdlc-playbook/articles/super-agent-architecture/lifecycle.svg)

这里有一个容易被忽略的区分：Thread 是“这件事的来龙去脉”，Ticket 是“谁被允许做、做到哪”。把两者混在一起，系统就会把“有人在讨论”误当成“有人授权开工”。Super-Agent 把授权单独抽出来，才敢让 Agent 主动接活。

## 上下文不是越大越好

再往下是上下文：信息怎么进窗口。文章用了两个词：Inline 和 Spill。

Inline 是把近期很可能用到的信息直接放进当前窗口，省掉一次工具调用。Spill 是把超出预算或低频使用的完整信息留在窗口外，只在窗口里保留引用或摘要，等模型需要时再读。像工作台：手边放常用的，剩下的放档案柜。

这听起来像操作系统的内存页换入换出，但有一个关键差别：缺页是内核自动处理的，模型没有这个机制。东西被 Spill 出去之后，模型得自己意识到“我这里还有一个引用”，然后主动去读。读不读、读多少，全靠它判断。所以同一套 Inline / Spill，换个模型，效果可能差很多。

文章还提了一个 Chain of Recall：给 Trigger、Thread、Worker 这些对象编 ID，注入时顺手带上下一跳的 ID，让它们在底层连成一张引用图。用户问“昨天那个问题修得怎么样了”，Router 手上只有一条消息，但消息挂着 Thread ID；顺着 Thread 找到 Worker；Worker 的状态里挂着 PR 的 Thread ID；再查过去，就找到修改记录。它不靠巨大的记忆库，靠的是一张能实时走通的图。

这一节要打个折：Inline / Spill、Chain of Recall 和后面提到的投机执行，在原型文档里没有对应的实现说明，更像文章给出的方向。读的时候要分清“设计意图”和“已经落地的代码”。

![上下文窗口只放当前任务、近期消息和引用；旧日志、PR 历史、文档留在 Spill 存储里，按需读取](/sdlc-playbook/articles/super-agent-architecture/context.svg)

## 异步与多信道

前台对话不能等后台任务。

传统 ReAct 是一问一答：一个 run 发出去，整个循环等结果。异步 ReAct 是 start 之后立刻返回，循环继续跑，工具结果回来再处理。用户可以在任务运行期间继续补充要求、改约束，不必排队等上一轮结束。

原型里的工程化版本是：主 Session 不被允许长时间等待，Worker 的前台 shell 命令超过 5 秒会转到后台，后台任务最多跑 30 分钟；任务结束时如果还有后台工作，Worker 会保留 slot，等结果回来再继续。这些限制看起来琐碎，但它们决定了“多任务”能不能真的并行，还是每个任务都卡在一条长命令上。

多信道是另一半。Super-Agent 的输入不只来自一个聊天框：GitHub 的 Issue、PR、review comment，飞书的群话题，CI 的结果，都可以成为 Trigger；回复也回到原来的渠道，不把所有人拉进一个统一收件箱。原型支持 GitHub 和飞书两种 Source，Ticket 的 Channel 负责把回复写回对应的 Thread。

## 计算、状态、环境拆开

运行环境被拆成三样：

- 计算：Agent Loop 在跑的那个过程。
- 状态：会话记录、Ticket、Decision、消息。
- 环境：代码仓库、本地文件、工具链、凭据。

如果三样都绑在一台电脑上，电脑一关机，Agent 就停了；换一台机器，本地环境又没了。文章提出两步解耦：先把计算和状态分开，Agent Loop 放进可替换的容器，状态单独存数据库；再把计算和环境分开，本地环境不动，装一个轻量 daemon，只负责执行命令、把结果送回去。这就是 BYOM，Bring Your Own Machine。

这个方向很吸引人，但它有一个硬前提：云端和端侧要互相信任。云端一旦被攻破，它连着的所有设备都危险。文章没有回避这一点，原型也没有把它做成一个完整的安全边界。

原型里能看到的是更朴素的一层：SQLite 存状态，每个 Ticket 一个目录，执行环境通过变量注册，Worker 和 Source 通过 `gh` / `lark-cli` 访问外部系统。云端容器、BYOM daemon、完整的信任模型，属于文章方向，不是原型现状。

![计算、状态、环境三列分开；计算可以替换，状态必须持久，环境留在工作发生的地方；Watchdog 在主循环之外](/sdlc-playbook/articles/super-agent-architecture/separation.svg)

## Watchdog

最后是 Watchdog。

持久在线的系统不能只靠进程存活探测。Agent 卡住的时候，进程可能还活着，但 LLM 已经陷入死循环，或者偏离了目标。文章的做法是配一个 Watchdog Session，定时用消息驱动，发现异常就介入，必要时纠偏。它本身也是一个 Agent Session，开发者可以问它“为什么卡住”，而不是只看一堆心跳日志。

这个想法对做长任务的人很有用：保活只是最低要求，真正需要的是“知道它还在不在正确的路上”。但原型文档里没有 Watchdog 的实现说明，它目前是文章给出的控制回路，不是可以直接复用的代码。

## 文章和原型的距离

这篇材料最容易被误读的地方，是把“文章提出的架构”当成“原型已经完成的东西”。把两者拆开看，会清楚很多：

| 机制 | 文章 | 原型 | 读法 |
|---|---|---|---|
| Router / Worker | 有 | 主 Session + 每 Ticket 一个 Worker Session | 已落地 |
| Source / Trigger / Thread / Eval / Ticket | 有 | 文档 001–004 有完整定义 | 已落地 |
| 异步 / 后台执行 | 有 | 主 Session 等待限制 + Worker 后台任务 | 部分 |
| 计算 / 状态 / 环境分离 | 有 | SQLite + 每 Ticket 目录 + 执行环境变量 | 部分 |
| Inline / Spill / Chain of Recall | 有 | 没有对应实现说明 | 方向 |
| BYOM / 本地 daemon | 有 | 没有对应实现说明 | 方向 |
| Watchdog | 有 | 没有对应实现说明 | 方向 |

这张表不是给原型挑错；它提醒：不要把文章的方向当成已经可复用的代码。

## 这套架构适合谁

按文章的描述，它适合这些场景：

- 多个任务长期并行，而不是一次性问答。
- 任务来自外部事件：PR、Issue、CI、IM、邮件。
- 一个团队、一个仓库、一个持续在线的 Agent。
- 人的注意力是稀缺资源，需要系统主动收敛信息。

以下场景不适合，或者成本不划算：

- 一次性短任务：Router / Worker / Ticket 这套账本比任务本身还重。
- 每一步都要人批准的高风险操作：Super-Agent 的价值是减少介入，不是增加审批。
- 多租户、不可信代码、强合规环境：原型不是安全边界。
- 单仓库、DeepSeek Harness 绑定：原型围绕一个 GitHub 仓库和一个 Harness 写，换环境要重做适配。
- 没有可靠状态存储的团队：先补账本，再谈自治。

## 我的判断

五个名词不是重点；几条不变量才是：

1. **路由和执行分开。** 主 Agent 只做分发和协调，不钻进每个任务的细节；Worker 在独立上下文里干活。
2. **Thread 和 Ticket 分开。** Thread 是上下文，Ticket 是授权；讨论不等于开工。
3. **Gate 在模型之前。** 先用确定性规则挡噪音，再让模型判断，别把一切都丢给 LLM。
4. **先落库，再做副作用。** 消息、启动、投递都先持久化；失败可重试，重启不重复。
5. **Worker slot 和人的优先级。** 并发有上限，但人的消息可以插队；系统要主动收敛“需要人”的队列。
6. **恢复前先核对现场。** 重启后的 Worker 先看目录、git 历史和 PR，再决定要不要重复动作。

需要谨慎的是文章和原型之间的落差。Router/Worker、Trigger/Thread、Gate/Eval、Ticket/Assignment 在原型里有对应；Inline/Spill、Chain of Recall、投机执行、BYOM、Watchdog 更像方向。把两者当成同一套已经完成的东西，会高估现状。

对本地多 Agent 来说，这套架构更像“下一层”。先用 Beads 管任务图、SQLite 管执行账本、worktree 管隔离、信封管 token；当任务变成长期、事件驱动、多来源时，再考虑 Router/Worker 和 Thread/Ticket。顺序反过来，就会先建一套很漂亮的调度器，却没有可靠的任务账本。这条路径和[《主 Agent 不该是消息总线》](/sdlc-playbook/articles/local-multi-agent-coordination/)里的判断一致；生态层面的选型可以看[《多 Agent 编排全景》](/sdlc-playbook/articles/multi-agent-orchestration-survey/)。

Super-Agent 不是唯一解。它是一套把注意力从 Session 里抽出来的设计。多任务的上限不是模型，是人的注意力；任何架构如果让用户记住更多 Session，它就在往反方向走。
