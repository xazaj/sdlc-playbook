---
name: lody-automation
title: Agent 如何在「挂起、限流、等待 CI」后优雅复活？Lody Automation 与状态感知
summary: Agent 挂起、限流、等 CI 后如何精准复活：Lody 用 SQLite Ledger、CodeMode 沙箱里的 JS 条件等待与 Effect 运行时搭出持久化基底。
date: 2026-11-12
source: https://x.com/wibus_wee/status/2120716116733706749
author: "@wibus_wee"
tags: [agent, durable-execution, event-driven, architecture, lody]
related: []
---

![题图：圆角瓷砖排成穹顶曲面，青绿渐变由边缘向中心变亮，中央是衬线字体的 Lody Automation 标题](/sdlc-playbook/articles/lody-automation/cover.jpg)

过去一段时间，关于 LLM Agent 架构的讨论很多：从 Harness 层的 Loop 设计、上下文窗口管理，到 Tool Call 与 Write-Ahead Journal 的实现。

但要在真实生产环境里构建事件驱动（Event-Driven）的自主 Agent 工作流，很快就会撞上一道隐藏的技术硬壁：我们缺一层干净、通用的「持久化基底」（Durable Substrate）。

今天基于在 Sorbet 和 Lody 中遇到的实际演进问题，聊聊支撑一个事件驱动 Agent，底层究竟缺了什么，架构上该怎么设计。

> Lody 的最新 PR（#1925）引入了基于 lody automation 与 lody_automation MCP 工具的 Durable、Session-bound JavaScript Waits。你可以在 Lody 里问你的 Agent「Lody automation 是什么呀？」了解更多。借助 Lody Automation，你会得到一种与以往不同的工作流编排模式。

之前的推文里已经稍微剧透过，今天写篇文章记录一下。

> 11 月 7 日
>
> 最近给 lody 引入了一个新的自动化模块，算是底层的一个小能力。在考虑模型未来发展的同时，兼顾现阶段模型的能力，设计出了这个小东西。这个模块可以释放很大的自由编排能力；同时我们靠它分析 Agent 的调用行为轨迹，对我研究 Agent 也是一个比较好的参考点。

## 当 Agent 试图「睡去并被事件唤醒」

来想象一下，这里有四个情况：

1. **CI 失败与闭环恢复**：Agent 提交代码后，Session 进入闲置等待 CI。CI 跑完返回 Failure，系统需要把带日志的上下文作为 Context-Event 唤醒原 Session 展开修复，而且 10 次重复 Webhook 应该只触发 1 次精准 Admission。
2. **Provider 额度耗尽**：Agent 执行到一半，API 抛出 5 小时窗口的 Rate Limit。现有系统通常把它简单分类为 `model_error` 或网络超时。真正的要求是把当前 Session、已完成的 Effects 状态、请求边界安全地「挂起」，额度恢复时自动 Continue，同时严禁盲目重放已成功的副反应。
3. **事实触发与条件稳定**：PR 被合并后，用户希望归档 Session。但这必须建立在整个 Session 组真正稳定的条件之上，光看起来「暂时闲置」不算数。
4. **Agent 动态安装持久规则**：Agent 收到自然语言指令「以后该 Repo CI 失败就唤醒对应 Session」。这应该通过宿主授权的 Action 转化为一条跨 Session 存活的 Durable Rule，不能是随着当前 Tool Call 结束就销毁的临时闭包。

现有的很多 Agent Runtime 里，执行层往往已经非常完善，Runtime 的持久化接缝却依然一片空白。

## 那么我们需要怎样的通用 Substrate？

Core 里不需要硬编码 GitHub、PR、Workspace 这些业务概念，也不需要引入昂贵的 BPMN/DAG 工作流引擎。提炼下来，底层诉求只有 6 个通用的系统能力。

**1 · 插件自治的持久化记录**

- 追加写（Append-only）、有序、带 Cursor 的持久化分区
- 提交语义与 Composition Authority 一致：committed / not-committed / unknown / conflict
- 插件卸载或停用时，不能悄悄抹掉历史数据；插件之间的数据必须严格隔离

**2 · 持久化触发器**

- 宿主可为插件调度未来的工作或投递外部事件，提供 At-least-once 投递和稳定的幂等键（Idempotency Key）
- 触发器的元数据、下次执行时间、时钟策略和 Callback 绑定都必须持久化
- 触发动作必须生成由 Scheduler Journal 托管的 Operation，不能依赖易失的内存计时器

**3 · 激活时重水合**

- 宿主重启后，插件不能靠在 apply 里「重新打一遍规则」假装还活着
- 需要显式的 Rehydration 生命周期：插件读取自身 Records，重新向宿主声明未完成的工作，由宿主重新 Admit 或 Re-evaluate

**4 · 宿主托管的 Session Input 入口**

插件决定「唤醒某个 Session」时：

- 不能伪造 User Message，必须以带完整 Provenance（来源溯源）的 Context-Event 注入
- 必须显式声明 Busy Policy（例如入队而非丢弃），且入队意图在被正式 Admit 之前就是持久的
- 必须返回身份稳定的 Receipt，保证重试不会产生第二个 Turn

**5 · 单插件的 Admission 预算与防护**

「规则唤醒 Turn → Turn 又触发规则」很容易形成死循环，宿主必须在插件维度设防：

- 限制最大 Admitted-Turns 预算和衍生深度（Derivation Depth）
- 连续失败时进入隔离（Quarantine）
- 用户的 Stop / Cancel 拥有最高优先级，无条件压过任何自动恢复策略

**6 · Runtime 层的 Capacity 分类与挂起意图**

容量耗尽是 Journal 的原生语义，不归插件的业务逻辑管：

- Runtime 需要结构化的 Provider 错误解码器，把额度耗尽归类为 `blocked_on_capacity`，别丢进通用 Error
- 以持久化的 Work Intent 记录未完成状态；估算的重置时间一到，只触发 Re-check，不直接认定「容量已恢复」

## 核心架构与运作流

简单说一下 Lody Automation 的解决方案，更多协调细节可以在 Lody 的代码里了解。

![架构图，自上而下：Session（CLI、MCP 或本地 Electron）经 Scoped local control 进入 Machine-local automation ledger，PR 与 Session 的观察从侧面汇入；Ledger 下接 Effect runtime 与 CodeMode；条件是否就绪的判断不成立时回到 Ledger，成立则携带 resume result 落盘回执与续跑身份，Opt-in Session 策略从侧面汇入；随后依次经过授权与源证据复核、Session 准入与 Inbox，最终继续注册它的那个 Session](/sdlc-playbook/articles/lody-automation/architecture.jpg)

最简单的形式概括下来：Session 注册一段 JavaScript 条件，Host 在本地反复求值；条件满足时，只往原 Session 的队列里放一条续跑输入，其余交给既有的 Session / Inbox 机制。

前面期望的 6 种能力，在 Lody 里大致落成了下面几层。

**1 · 用一段 JS 描述「等什么」**

等待条件是一个函数，写在 CodeMode 支持的 JavaScript 子集里：

```typescript
async ({ ctx }) => {
  const { value } = await ctx.read('github.workflowRuns');
  if (value.status !== 'observed') return false;
  const failed = value.pullRequests.flatMap((pr) =>
    pr.runs.filter((run) => run.status === 'completed' && run.conclusion === 'failure')
  );
  if (!failed.length) return false;
  return { resumeText: 'CI 失败了，查看结果并继续修复。', payload: failed };
};
```

- 返回 `false`：继续等待
- 返回 `{ resumeText, payload? }`：等待结束，在注册它的那个 Session 里排入一条续跑输入；resumeText 成为输入文本，payload 作为参考数据附带
- 注册可以走 CLI（`lody automation register --file condition.js`），也可以走 MCP 工具 `lody_automation`，Agent 自己就能给自己「设闹钟」
- 检查从注册时就开始，条件已经成立的话不用等下一次状态变化。默认间隔 30 秒（最小 1 秒），可设绝对过期时间；过期的等待不会再产生续跑。同一个 Session 里相同的活跃注册会自动去重

**JS 能做什么、不能做什么。** 程序只拿到一个 ctx，里面有 sessionId、now 和 `read(resource)`。它读到的是 Host 授权的观察数据，拿不到任意系统状态：

| 资源 | 读到什么 |
| --- | --- |
| `session` | 当前 Session 的输入标识、是否已 Stop / 归档 |
| `session.group` | Session 组是否已稳定（yes / no / unknown） |
| `github.pullRequests` | 关联 PR 的生命周期与带时间戳的轮询观察 |
| `github.workflowRuns` | 当前 PR HEAD 上可信的 CI Run / Attempt，或 unknown |
| `provider.capacity` | 当前绑定的额度窗口与可用性（不主动查询 Provider） |
| `events` | 该 Session 已持久化的事实，可按时间和条数过滤 |

此外还有两个受限的出口：`ctx.fetch` 只能发 HTTP(S) 的 GET / HEAD，响应体上限 64 KiB，拒绝 URL 凭据和重定向；`ctx.exec` 在 Session 工作目录里直接运行本地可执行文件，不经 shell，环境变量由 Host 显式提供。

每次检查都有硬预算：30 秒超时、最多 32 次读取 / 请求 / 命令调用、4 路并发、单次操作 128 KiB。连续 5 次检查出错，等待以 failed 结束；中间只要有一次成功，错误计数就清零。Session 或等待被取消时，解释器及其进行中的操作会一起被中断并等待收尾。

JS 也不能选择动作、授权或目标：条件程序只负责回答「该不该醒」，「醒了做什么」由 Lody 的原生代码决定。

**2 · 本地 SQLite Ledger：一切状态都落盘**

等待、结果、动作回执、源证据快照，以及固定下来的续跑身份，全部存在机器本地的 SQLite Ledger 里，不出本机。几条决定韧性的规则：

- **匹配即定局（Match is final）**：条件一旦为真，Host 把匹配结果、捕获的证据和续跑身份原子地一起提交，此后程序不会再被执行。如果每次恢复都重跑条件，事件可能已经滑出读取窗口，一个已经匹配的等待就会永远卡在 blocked。重启后由同一张回执驱动投递
- **先落映射，再产生副作用**：动作 / Session / Turn 的稳定映射先持久化，再去执行。提交确认丢失时，系统对同一个 Turn 做对账，不会再发一遍 prompt；只有确认「从未提交」的输入，才会用同一组 id 重新生成
- **未决状态持久保留**：动作的截止时间写在回执里，重启后依然有效，到期只写一条去重的 `timer.due` 事实。Session 的 Turn 结果先暂存，再释放 Inbox；恢复时只处理这些暂存的身份，绝不扫描历史去猜「可能没做完的活」。未确认的释放和失败的观察会一直保留，直到下一次检查成功
- **检查可重试，副作用不可当步骤**：被打断的检查会重试，工具的副作用不能当作持久化的步骤，所以 `ctx.exec` 只适合可以安全重复的检查

调度循环和解释器由原生 Effect 托管；准入、排队、取消和最终执行，仍然归 Session 与 Inbox 所有。Automation 不另起一套执行通道。

**3 · 唤醒前的重新校验**

等待期间世界会变：PR 可能被重新 push、CI 重新跑了、授权被撤销、Session 被用户 Stop。所以「条件匹配」和「真正投递」之间有一道校验：

- **源证据由 Host 捕获，不采信 JS 的声明**：CI 的 Run、Attempt 和源码 Revision 由 Host 记录并冻结在回执里，结果无法伪造来源。fork、缺失、过期或被截断的证据一律标记为 unknown，不当「没问题」处理
- **投递前再校验一遍**：准入时重新检查当前授权（与冻结时的授权取交集）、Session 状态和源证据；HEAD 变化或 CI 重跑会让旧证据失效。CI 类续跑在发出 prompt 的前一刻，还会校验被引用的 checkout
- **已接受的续跑会让数据源保持「有需求」**：PR 轮询器会为活跃的 CI 等待和尚未投递的续跑保留当前 PR 的轮询需求，包括已经终结的 PR，同时仍受既有的配额与公平性限制约束

**4 · 用户的 Stop 永远优先**

- Session 被 Stop 后，条件检查照常进行，但续跑不会被准入。已匹配的续跑进入 blocked，原因是 `target_stopped`，不算检查错误，也不会静默地换一个新 Session
- 只有用户通过协作控制显式「恢复」才会解除。解除后系统重新检查授权、Session 和证据，再提交同一条续跑
- 取消（Cancel）会先撤销未来的准入、中断正在进行的检查，并通过所属的机制取消已经产生的那条输入。已经完成的工作不会被撤销
- 繁忙的 Session 不丢弃续跑，把它们放进队列

**5 · 内置的 Session 策略（全部默认关闭）**

事件到动作的映射固定在 Lody 的原生代码里，没有暴露给用户做规则编排。用户只能通过 `lody automation configure` 打开这些开关：

```json
{
  "recoverCapacity": true,
  "archiveAfterMerge": true,
  "compactWhenIdle": { "contextTokens": 300000, "cacheTtlMs": 600000, "leadTimeMs": 60000 }
}
```

- **额度恢复（Capacity Recovery）**：结构化的额度耗尽和 Codex 过载都归在这一个开关下。失败发生时，原生会话、启动绑定、输入和工具边界都会在释放执行前先保存。所有上报的额度窗口都参与判断。重置时间只触发一次重新查询，不代表「可以发了」。数据缺失或过期永远不会被当成「有额度」，未知就等新的观察。过载最多重试 3 次，间隔递增（5 / 10 / 20 秒）。未确认的释放或工具副作用会阻断恢复，新的输入会取代旧的恢复任务
- **合并后归档（Archive after Merge）**：由 PR 轮询器记录状态变化和持久的「已合并」证据。归档要等整个 Session 组（含子 Session、队列、Goal 以及原生和 Automation 的未完成工作）稳定，再在准入屏障下复核，最后提交根 Session
- **闲置压缩（Idle Compact）**：上下文占用达到阈值，同一个闲置 Turn 仍是当前 Turn，且原生适配器声明支持 /compact。一有新输入或到期就作废。cacheTtlMs 是运营者的估计，不代表 Provider 缓存的真实状态

## 然后呢？恢复只是第一个用例，真正的目标是状态感知

额度恢复、CI 闭环、合并后归档，看上去是三个功能，其实是同一个模式的三次实例：从既有的所有者那里观察事实，用一段条件判断「该不该醒」，再通过正常的准入路径把 Agent 叫回来。能接的「事实」远远不止这三类。

这正是 Lody Automation 在未来发展下会产生更多自由编排可玩性的原因。先看看已经有了什么：

- **条件是 JS，数据源是可扩展的资源**：`ctx.read` 现在有 6 种资源（session、session.group、github.\*、provider.capacity、events）。加一种新的数据源，只需要在对应的所有者旁边写一个适配器，说明它的范围、新鲜度和准入证据，不用改调度和账本
- **ctx.fetch 和 ctx.exec 已经是通用出口**：查一个部署状态页、跑一条本地命令看长任务是否结束，今天就能写成一个等待条件，只是还没有被封装成一等的资源
- **events 是该 Session 已持久化的事实流**：它同时也是「Agent 自己做了什么」的记录

基础原语已经在了，剩下的是往哪走。可能是：

**1 · 更多的外部状态源？** 部署完成与否、监控告警、Code Review 评论、Issue 状态变化、长时间运行的本地任务……凡是「Agent 现在不该盯着、但结果出来后需要它回来」的事，都可以变成一种资源。Agent 不用靠轮询或占着一个 Turn 空等，把等待交给 Lody 就行。

**2 · 多 Session 的状态感知**：session.group 已经能判断一整组 Session（含子 Session、队列、Goal 和原生工作）是否真的稳定。往前一步，是让一个负责人 Session 等它派出去的子任务全部收敛再醒来汇总；或者让多个 Session 在共享同一个 PR 或 CI 结果时互相感知，避免重复劳动。

**3 · 感知 Agent 自己**：lody automation 的 events 记录的是 Agent 的行为轨迹：卡在哪、重复失败了几次、上下文压力多大、闲了多久。这些信号既能驱动闲置压缩这样的策略，也能帮人更好地研究 Agent 的行为，这也是我最初做这个模块的动机之一。

**4 · 从「出事了再救」到「出事前先知道」**：目前的额度恢复是失败之后才处理。有了持续的 provider.capacity 观察，下一步可以是提前发现「窗口快用完了」，交给用户或策略决定，比如缩小任务、改为排队，别等撞墙。

**5 · 把这层能力还给插件**：前文列出的 6 种通用能力里，今天 Lody 只落地了与 Session 续跑直接相关的那一部分，服务的是内置策略。更长期的方向，是让持久化记录、持久化触发器、激活时重水合这些能力成为插件平台的通用基底，第三方也能在不碰 Core 的前提下写出「会睡觉、会被唤醒」的能力。

## 总结

从「随用随跑的命令行对话工具」迈向「长驻后台的自动化协作者」，Agent 框架的竞争终将从上层的 Prompt Eng / Workflow 编排，回归到底层的状态机与持久化系统设计。

当 Agent 从「一次性问答工具」蜕变为「能在后台默默帮你等 CI、扛过 API 额度耗尽、并在条件成熟时精准唤醒的自主协作者」，Durable State 与 Event-Driven Substrate 就是那块不可或缺的地基。

Lody 通过 SQLite Ledger + CodeMode 沙箱 + Effect 运行时的轻量组合，为 Agent 运行时的状态韧性开辟了一条实现路径。

如果你对 Lody 的实现感兴趣，欢迎来看看：[github.com/LodyAI/Lody](https://github.com/LodyAI/Lody)
