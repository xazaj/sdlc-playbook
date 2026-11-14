---
name: building-always-on-agents
title: 搭建常驻 agent
summary: Anthropic 官方拆解常驻 agent 的五个原语：事件收件箱、定时器、记忆、权限、发件箱，以及 run 与 session 循环怎么把它们拼成一台「永远在线」的机器。
date: 2026-11-15
source: https://claude.com/resources/articles/building-always-on-agents
author: William Hu（Anthropic）
translated: true
tags: [always-on-agents, architecture, event-inbox, memory, anthropic]
related: []
---

过去几个月，常驻 agent（always-on agents）重新热了起来。

常驻 agent 有状态、会主动：它们跨会话管理上下文，在没有直接监督的情况下采取行动。底层和其他 agent 一样跑同一个[核心循环](https://www.anthropic.com/research/building-effective-agents)；差别在外围架构，由几个原语构成，控制 agent 什么时候醒、两次运行之间留下什么、工作成果怎么到达用户。

这波回潮主要来自模型进步。其一，新一代模型判断力更好：理解用户意图、知道什么时候该来确认，都更可靠。其二，智能在变便宜，长程任务受益最大：在[一个长程编码基准](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)上，Opus 5.5 每解出一题的成本比 Opus 5 低 78%，普通负载上只低 40%。

客户开始问我们怎么把这类体验做进自己的产品：有的想把现有 agent 变得更主动，有的想从零搭。这篇文章拆开常驻 agent 背后的原语，过一遍它们怎么拼在一起。

## 常驻 agent 的循环

常驻 agent 并不真的「一直开着」，这只是用户体验上的说法。实际上它大部分时间在睡觉，周期性醒来干活。每一段工作叫一次**运行（run）**：agent 收到一个事件，完成任务，把经过保存下来。运行发生在**会话（session）**里，会话是消息与工具调用的完整记录。运行结束，agent 继续睡，循环无限重复。

![动图：常驻 agent 的时间轴，大段「Asleep，不花 token」的睡眠被短暂的 Run 打断；每次运行四步，事件到达、会话开始、agent 循环运转、运行写回存储状态；存储状态跨运行携带，会话读、运行写](/sdlc-playbook/articles/building-always-on-agents/cycle.gif)

## 核心原语

常驻 agent 的外围架构有五个核心原语：事件收件箱、定时器、记忆、权限、发件箱。逐个看。

### 事件收件箱

多数 AI agent 只在用户发消息时运行；常驻 agent 可以被多种事件触发：webhook、计划任务、后台作业。

省事的做法是让每个事件源直接调 agent，但那有几个失败模式：两个事件同时到达会启动互相竞争的运行，一次崩溃可能把事件整个丢掉。事件收件箱就是为此存在的：事件源不直接调 agent，把事件投进收件箱，由一个 worker 取走。

最简版本三件套：

- 一张持久的事件清单，通常是一张数据库表
- 一个 handler，通常是 HTTP 端点，把事件写进清单
- 一个 worker，通常是后台服务，从清单里读

收件箱要跟踪每个事件的状态，并按事件源的唯一标识去重。关系型数据库就很合适，每个事件追加一行。建议从每用户一个收件箱开始，需要更高并行度再拆细。

![示意图：handler（HTTP 端点）把事件写进收件箱（一张数据库表，记时间、内容、会话与状态，重复 ID 的行标 dropped），并唤醒 worker；worker 读取待办、发起运行、等它结束、把事件标为 done](/sdlc-playbook/articles/building-always-on-agents/inbox.png)

新事件到达时，handler 写入收件箱并唤醒 worker；worker 读取待办，发起一次运行。延续先前工作的事件（比如用户的回复）恢复已有会话，其余的开新会话。接着 worker 把事件交给 agent 循环，等运行结束，把对应事件标为完成。实现细节容易踩坑，几条最佳实践：

- **handler 要快速确认收到。**有些事件源（如 webhook 提供方）把慢响应当失败。handler 可以做轻量检查，更深的校验（比如查提示注入）放到运行里做。
- **收件箱是唯一事实来源。**worker 被唤醒后先从收件箱拉最新事件。这样 worker 中途死掉，新的 worker 能捡起同一事件重试。
- **一个收件箱同时只有一个活跃 worker。**防止两次运行重复干活或互相覆盖。运行中出现新事件，可以推给下一次运行、并入当前运行，或中断重开。
- **worker 应把待办事件合并处理。**比如用户连发几条消息，worker 并成一次运行，agent 只需回一次。

### 定时器

定时器和事件收件箱一起，让常驻 agent 有了主动性。定时器分两类：**跟进（follow-up）**是 agent 给自己设的期限，比如回头查看一条回复；**日程（schedule）**是按已知节奏重复的任务，比如每日简报。

定时器住自己的持久存储（通常另一张表），和收件箱分开，收件箱只放马上可干的事件。两类定时器可以用相近的表结构，日程要多记一列重复规则。

![示意图：运行往定时器表里设一条（周四 18:00 查回复有没有来，是 agent 设的跟进；周五 09:00 每日简报，是用户设的日程）；调度器找出到期项，往事件收件箱加一个事件，由此启动下一次运行](/sdlc-playbook/articles/building-always-on-agents/timers.png)

定时器自己不发起运行。一个调度器（通常也是后台服务）按固定间隔轮询存储，把到期的点火。每一轮它：

1. 扫描存储，找出到期的定时器
2. 按类别更新：跟进标为完成；日程把到期时间改到下一次
3. 往收件箱加一个事件，唤醒 worker

调度器可以自建服务，也可以用持久化执行引擎。

### 记忆

常驻 agent 的工作散落在许多互不相连的运行里，靠记忆维持连续性。

和收件箱、定时器一样，记忆要有自己的存储。我们的产品（Claude Code 的 [auto memory](https://code.claude.com/docs/en/memory)、Messages API 的 [memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)）把它实现成一个文件目录。常驻 agent 的目录应映射到持久存储（数据库或对象存储），让记忆比 worker 活得久。

一条经验法则：记忆只存 agent 无法再查一次的东西。某样东西已经活在别的系统里（比如 issue 跟踪器），就存一个指针。常驻 agent 该存的记忆分四类：

- **用户指令：**用户对 agent 行为的任何指示，单独存一个文件，每次运行开头加载。用户不会总在场掌舵，指令必须跨运行携带。
- **用户笔记：**agent 学到的关于用户的东西，比如角色、偏好、纠正过的错误。可以先一个文件，多了再拆小文件；拆分后每次运行只加载索引，需要细节时 agent 再把单个文件拉进上下文。
- **历史消息：**agent 要记得自己已对用户说过什么，免得重复。可以存独立文件每次加载，也可以让 worker 装载 agent 与用户最近的几条消息。
- **任务进度：**每个进行中的任务一份进度文件，记完成了什么、还剩什么。任何新运行读它，接着上次的干。与用户笔记一样，运行开头只加载索引，需要时再拉具体文件。

![示例记忆目录：instructions.md（用户指令）、index.md（notes 与 progress 的索引）、reported.md（已告诉过用户什么）每次运行都加载；notes/（关于用户的笔记，小而聚焦）与 progress/（每个任务一份进度）按需读取；运行期间写入](/sdlc-playbook/articles/building-always-on-agents/memory.png)

以上都是运行期间保存的记忆。还可以加「做梦（dreaming）」：回顾过往会话来整编记忆，替换过期条目，发现只在多次运行间才显形的模式。想深入的话，我们[关于 agent 记忆的文章](https://www.anthropic.com/research/components-of-agent-memory)讲得更细。

#### 上下文窗口内部

干活之前，agent 先装载系统提示词、工具定义和记忆文件。这份初始上下文「开销」每次运行都在，建议保持精简，并用[提示缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)降成本。

新会话只带这份开销和触发运行的事件；已有会话则会带回此前运行的消息与工具调用。会话太长，可以[压缩旧消息](https://platform.claude.com/docs/en/build-with-claude/compaction)，也可以另起会话。两者都会丢细节，所以要留存的东西沿途写进记忆。

![动图：上下文随时间的占用。系统提示词、工具与记忆是一条每次运行都在的固定带；已有会话带回完整记录并持续增长，直到压缩把旧记录变成摘要](/sdlc-playbook/articles/building-always-on-agents/context.gif)

### 权限

权限是常驻 agent 风险最大的地方。一次运行握着用户的访问权，且设计上就在无人值守中运转。每次工具调用，agent 都要决定：自己继续、拦下，还是等批准。

组件和其他 agent 用的是同一套：

- **凭据存储：**常驻 agent 要有用，往往需要用户的敏感凭据，比如密码或访问令牌。[推荐的模式](https://code.claude.com/docs/en/agent-sdk/secure-deployment#credential-management)是在 agent 环境之外放一个代理，由它给出站请求附加凭据：agent 发出的请求不带凭据，代理在转发前注入真凭据。
- **自动模式：**常驻 agent 应当能离开用户持续输入而工作。Claude Code 的 [auto mode](https://www.anthropic.com/research/claude-code-auto-mode) 解过一个版本：用分类器审查高风险动作、拦下识别为危险的，让 Claude 另找安全路子。最重要的决定仍需要人来审。
- **延迟工具调用：**Claude Code 里 [hook 可以把一次工具调用挂起](https://code.claude.com/docs/en/hooks#defer-a-tool-call-for-later)，等用户的补充输入。常驻 agent 同理，某些动作前需要澄清或批准。调用被挂起时，运行结束、会话在调用中途保存；请求展示给用户（比如用 [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) 做的交互卡片），答复作为事件回到收件箱，触发新运行，带着用户输入恢复保存的会话。挂起等答复期间，worker 可以处理别的事件，agent 不会因此阻塞。

### 发件箱

多数 AI agent 边生成边把响应流给用户，用户能看着 Claude 推理、调工具、写答案。常驻 agent 的大部分工作在后台完成：用户拿到的是结果和少许细节，全程逐步拆解不给。

![示意图：一次运行有三种收场，无话可说、send 工具调用、请求用户的延迟工具调用；消息进发件箱（一张数据库表），dispatcher 投给用户；延迟请求可走发件箱，也可以直接显示在你自己的界面](/sdlc-playbook/articles/building-always-on-agents/outbox.png)

一次运行有三种收场：agent 往发件箱发一条消息；agent 判定没什么可发；agent 用一次延迟工具调用请求许可或补充输入。

多数常驻 agent 用一个直接把消息发给用户的 send 工具就够了。想给 agent 的消息控节奏、或让发送能从错误中恢复，才需要正式的发件箱。发件箱是另一张外发消息表，与事件收件箱对称；dispatcher 与 worker 对称：读取待发消息，决定投递哪些，发给用户。延迟调用的请求可以走发件箱，也可以直接展示在界面里。

投递之外，还要调 agent 发多少消息。发太多变噪音，发太少漏掉用户该知道的。建议建评测找平衡。实践上，让 agent 从安静起步、随时间挣得用户更多注意力，更稳。

## 全部怎么拼起来

![动图：五个原语的拼装。定时器与事件收件箱启动运行（开始或恢复会话），运行在会话里与记忆（读写所学）和权限（每次工具调用都过检）协作，产出发往发件箱（发送或沉默），dispatcher 交给用户，用户的答复作为事件回到收件箱；运行也可以设一条跟进定时器](/sdlc-playbook/articles/building-always-on-agents/together.gif)

每次运行都从收件箱的一个事件开始，用户消息、webhook 或定时器都算。worker 取到事件，发起运行，在新会话或已有会话里唤醒 agent。agent 读记忆拿到基线，在权限范围内行动，再把学到的东西更新进记忆。运行结束，agent 往发件箱推一行，dispatcher 把消息投给用户。

这些拼成一个循环：运行可以设定时器，稍后再唤醒 agent；用户回复消息，答复作为事件回到收件箱。每次运行都短暂，循环无限进行下去，agent 看起来就一直在线。

## 致谢

作者 William Hu，特别感谢 Rodrigo Olivares 与 Michael Segner 的贡献。
