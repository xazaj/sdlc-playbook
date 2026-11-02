---
name: local-multi-agent-coordination
title: 主 Agent 不该是消息总线
summary: agentbus 只解决通信。把任务、执行、通信拆成三层，主 Agent 才能从消息中转里退出来。
date: 2026-10-30
source: https://github.com/ekinertac/agentbus
tags: [multi-agent, orchestration, claude-code, token]
related: [superpowers-writing-plans]
---

本地同时开着 Claude Code、Codex、omp 和 pi，最自然的想法是让它们互相发消息：Claude 派活，另外三个干活，谁卡住就在会话里说一声。我先试了 [agentbus](https://github.com/ekinertac/agentbus)。它确实很轻，但试完发现，能说话和能协同开发之间还隔着三层。

![左：消息总线，每条消息都进入主 Agent 的上下文；右：控制平面，主 Agent 只收到任务信封，worker 在独立 worktree 中执行](/sdlc-playbook/articles/local-multi-agent-coordination/cover.svg)

## agentbus 做对了什么

agentbus 是 2026 年 9 月发布的一个 Python 包，0.1.0，MIT，标准库零依赖，只支持同一台机器。它没有另造协议，而是逆向出 Claude Code 的本地会话消息协议：一个希望被其他会话找到的 Claude Code 进程会写 `~/.claude/sessions/<pid>.json`，监听 `/tmp/cc-socks/<pid>.sock`，再发布一个 per-session token。agentbus 让别的 agent 也做这三件事，于是对 Claude 来说，pi 或 Codex 看起来就像另一个 Claude 会话。

在 Claude Code 里用 `@peer-name` 就能发消息；其他 host 通过 MCP 拿到 `list_claude_sessions`、`send_to_claude`、`check_messages`，代码里还有一个 `set_session_name`。投递分两种：Claude、pi、opencode 可以打断正在跑的 turn，消息立即进入；Codex、kiro 这类纯 MCP host 不能被打断，消息进 spool，等模型自己调 `check_messages`。

它没有 daemon，没有任务表，没有 ack，没有重试。它是一座干净的桥。桥只负责把话送到，不负责谁去做、做完没有。

## 消息总线补不上的洞

**任务没有地方存。** `send_to_claude` 只能发一段文本，没有依赖、优先级、claim、完成定义。两个 worker 可以同时接同一件事，也可以都以为自己接的是唯一一件。Claude Code 的 `@` 很顺手，但它不是任务队列。

**分派不可靠。** 发一条消息，不等于启动一个 turn。Codex 和 omp 要等模型下一次调 `check_messages`；空闲 session 不会被唤醒；协议里的 delivery receipt，agentbus 当前也不读。消息没送到，任务就没派出。

**没有隔离和验收。** 所有 agent 共享同一个工作目录，没有 worktree，没有 diff 边界，没有独立跑的测试，也没有合并队列。消息可以告诉 Codex“去改 auth”，但没人保证它只改了 auth，也没人保证改完能合。

**Token 模型相反。** agentbus 的消息是原文注入对方上下文，没有摘要、没有信封、没有严重级别。主 Agent 挂在总线上，每条 peer 消息都会进来；聊得越多，后面每一轮越贵。这和省主 Agent token 的目标正好相反。

另外三个限制更现实：omp 不在官方支持列表里，只能试 generic MCP；只支持同机 Unix socket；0.1.0 的协议是逆向来的，Claude Code 升级可能让它失效，`agentbus doctor` 只能检查，不能修复。

| 需求 | agentbus | 后果 |
|---|---|---|
| 任务图、依赖、claim | 没有 | 重复接活，顺序靠人记 |
| 派发、超时、重试 | 只有 send | 对方不查消息就永远不动 |
| 完成检测、验收 | 只有回信 | 不知道是真做完还是说完了 |
| worktree 隔离 | 没有 | 并行改同一文件会冲突 |
| 主 Agent 省 token | 原文进上下文 | 越聊越贵 |
| omp、多机 | 未支持 | 需要自己补 |

这不是说 agentbus 没用。它适合低频的 L2 升级、交叉 review、人给 agent 留一句话；不适合当任务总线。把它放在通信层，价值很清楚；把它放在调度中心，缺口就会一个接一个冒出来。

## 四种做法

把本地多 Agent 协同拆开看，常见做法有四种，各自解决不同的一段。

| 做法 | 强项 | 代价 | 适合 |
|---|---|---|---|
| Claude Code 原生 subagents / `--bg` | 中间工具输出不进主上下文，只回最终摘要 | 只能跑 Claude 模型 | 全 Claude 团队 |
| [agentbus](https://github.com/ekinertac/agentbus) / [AgentBridge](https://github.com/raysonmeng/agent-bridge) | 实时消息、互评、低安装成本 | 没有任务和执行层 | 通信、L2 升级 |
| MCP 直连 | 把 Codex/pi 包成工具，调用简单 | 同步阻塞，输出直接进主上下文 | 短问答、单次 review |
| 控制平面 | 任务图、worktree、验收、合并 | 要写一层胶水 | 2 个以上异构 agent |

[Gas Town](https://github.com/gastownhall/gastown) 是第四种的一个完整变体：Mayor 是 Claude Code，Rig 是仓库，Polecat 是临时 worker，Hook 是 worktree，Beads 是账本，Convoy 是工作包，Witness 和 Deacon 负责看门狗和升级。它已经把任务、worktree、看门狗这些事做完了，官方说能稳定跑 20–30 个 agent，代价是工作流被规定，原生安装依赖 tmux、Dolt 和 Go，Mayor 的上下文也不便宜。想少写代码，可以先试它；想控制 token 和调度细节，还是自己搭一层薄的。

## 三层

![通信层、任务与状态层、执行层各司其职；主 Agent 只接触最上面一层](/sdlc-playbook/articles/local-multi-agent-coordination/layers.svg)

通信层管谁说了什么。agentbus、AgentBridge、Claude Code 原生的 `@` 都在这一层。它应该是可选的，因为任务状态不该靠聊天记录维护。

任务层管该做什么、做到哪。[Beads](https://github.com/gastownhall/beads) 管任务图、依赖、优先级、claim 和 close；SQLite 管 run、PID、lease、token、checks 和 artifact；[Kanzo](https://github.com/emanuele-em/kanzo) 只是人类看板，在这个架构里是 Beads 的只读投影。三层里只有一个真源：Beads 管任务，SQLite 管执行，Kanzo 不参与调度。

这里有一个容易混的细节：Beads 不是 SQLite，底层是 Dolt，带版本、分支和跨机同步；Kanzo 才是 SQLite，一个几 MB 的 Rust 二进制，带浏览器看板和 MCP。两者都能叫“任务表”，但一个管依赖和 claim，一个管人看得见的卡片。不要双写。

执行层管谁来做、做完没有。编排层我暂时叫 orchestra，CLI 叫 `orch`；它负责 dispatch、并发、超时、worktree、adapter、验收和合并。worker 不写 Beads，也不直接和主 Agent 聊天；它只拿到任务卡，在自己的 worktree 里干活，最后交一个结果信封。

主 Agent 只读任务卡和信封；进度、日志、工具调用、源码全文都留在主上下文之外。

## 主 Agent 的一天

![v0 循环：bd ready 取任务，orch dispatch 起 worker，验收后合并，主 Agent 只收到信封和升级](/sdlc-playbook/articles/local-multi-agent-coordination/flow.svg)

v0 的循环只有五步：

```bash
bd create "实现 refresh token 轮换" -p 1 -t task --description "$(cat task.md)"
bd dep add bd-child bd-parent

orch dispatch --ready --max 4
orch wait --timeout 120
orch result bd-a1b2
orch diff bd-a1b2

git merge --squash task/bd-a1b2
orch cleanup bd-a1b2
```

`bd ready` 只返回没有未闭合阻塞的任务。`orch dispatch --ready --max 4` 读这些任务，检查并发和预算，给每个任务建一个 worktree，启动一个 detached supervisor 进程，然后立刻返回。`orch wait` 阻塞读 SQLite，有任务完成、失败或需要决策才返回；等待期间不花 token。`orch result` 默认只给摘要、文件、checks、风险和 artifact 路径；要看 diff 才升级。`orch cleanup` 在合并后关闭 bead、删除 worktree。

这里把事件分三层：L0 是心跳、工具调用、中间输出，只进 SQLite 和日志；L1 是完成、失败、重试、验收通过，聚合成 digest；L2 是阻塞、冲突、需要人拍板，立即返回。信封里只有 `summary`、`files`、`checks`、`risks` 和 artifact 路径，没有 worker 的对话记录。

有两个状态不能混：`done` 是 worker 跑完且验收通过，`merged` 是代码真的进了目标分支。v0 不自动合并，也不自动关闭 bead；主 Agent 看完 diff 再决定。失败也不自动重试，主 Agent 决定换 agent、改任务还是重派。少一个自动重试状态机，就少一类“重试了三次其实第一次已经成功”的事故。

主 Agent 的上下文入口可以定得很死：

| 事件 | 上限 |
|---|---|
| 任务结果信封 | 500 token |
| L1 digest | 600 token |
| L2 升级 | 300 token |
| 终审 diff | 2k token |
| `bd prime` | 1k token，每会话一次 |

一个包含 8 个任务的功能，主 Agent 大约看到 8 个信封、两三条 digest、一两次升级。按每个任务 400 token 算，是 3–4k；聊天中转按每个任务 5k 原始输出算，是 40k，而且后面每一轮还要重新携带。即使有 prompt 缓存，这些内容仍然占上下文窗口。数字是示意，不是基准测试，但方向很清楚：少一条消息，比压缩一条消息更值钱。

还有两个直接的省法：Beads 用 CLI，不挂 MCP，省掉 10–50k 的 schema；Kanzo 也不挂主 Agent，daemon 自己连，主 Agent 一个 Kanzo token 都不花。

## 先跑 v0

完整方案很容易越写越大：daemon、MCP、Kanzo 镜像、AgentBridge、四个 adapter、reviewer、merge queue、三级事件、预算表、八状态状态机、多机同步。真正先跑起来，可以砍到只剩：

> Beads + SQLite 两张表 + `orch` CLI + Claude/Codex 两个 adapter + git worktree + 独立验收 + 结果信封。

| 原组件 | v0 处理 | 替代 | 什么时候再加 |
|---|---|---|---|
| daemon | 砍 | 每个 run 一个 detached supervisor | 需要跨会话自动调度、自动重试 |
| MCP 7 工具 | 砍 | `orch` CLI 6 个命令 | 需要结构化权限、多客户端 |
| Kanzo + 镜像 | 砍 | `bd ready` / `bd list` / `watch` | 人类需要浏览器看板和评论 |
| AgentBridge | 砍 | `orch wait` 长轮询 | 主 Agent 空闲时需要 L2 push |
| pi/omp adapter | 砍 | 先 Claude + Codex | 任务确实需要它们的模型或成本 |
| reviewer agent | 砍 | 主 Agent 自己看 diff | review 成为瓶颈 |
| merge queue | 砍 | 主 Agent 串行 merge | 同时合并超过两个分支 |
| 三级事件 | 砍 | `info` / `attention` 两级 | 事件量大到需要聚合 |
| 5 张表 | 砍 | `runs`、`events` 两张 | 需要镜像、预算、outbox |
| 8 状态 | 砍 | `queued/running/done/failed/blocked` | 需要 review/merge 状态 |
| 多机 | 砍 | 单机、单写者 | 第二台机器真的加入 |

按我的估计，v0 大约 600–900 行，2–3 天能跑通。不能砍的是 worktree、任务卡和信封、独立验收、Beads 的依赖图和 claim、SQLite 的 run 账本、`orch wait` 的阻塞等待，以及单一真源。这几项砍了，系统会退化成“多开几个终端”。上线前先用 [ccusage](https://github.com/ryoppippi/ccusage) 量主 Agent 的实际 token，再决定要不要加层。

## 什么时候加回来

![从 v0 出发，只有出现具体痛点时才加入 Kanzo、agentbus、daemon 或多机同步](/sdlc-playbook/articles/local-multi-agent-coordination/decision.svg)

| 触发条件 | 加什么 | 代价 |
|---|---|---|
| 人类需要看板、评论 | Kanzo 只读镜像 | 一个 MCP client、映射表、AGPL 评估 |
| 主 Agent 空闲时需要 L2 | agentbus 或 AgentBridge | 消息噪声、实验性通道 |
| 任务确实需要 pi/omp | 第三个 adapter | 一套 CLI/RPC 适配 |
| 主 Agent review 成为瓶颈 | reviewer agent | 多一个 worker、findings schema |
| 同时合并超过两个分支 | merge queue | 锁、rebase、冲突处理 |
| 需要跨会话自动调度 | daemon | 常驻进程、IPC、恢复逻辑 |
| 第二台机器加入 | Dolt sync + claim | 网络、单写者约定 |
| 上下文经常超预算 | [Serena](https://github.com/oraios/serena) / context pack | 索引、选择策略 |

每加一层，都应该对应一个已经发生的痛点。没有痛点的层，最后都会变成维护成本。

## 场景

| 场景 | 机制 | 主 Agent 看到什么 |
|---|---|---|
| 四个 agent 并行做一个功能 | 依赖 DAG + 并发 dispatch + worktree | 计划、四个信封、一条 digest |
| 交叉 review | reviewer worker 只看 diff | verdict、findings 数量、最高 severity |
| 长任务跨额度 | checkpoint + resume | 一条 L2、恢复摘要 |
| worker 或 daemon 崩溃 | SQLite 账本 + PID 对账 | 一条失败/恢复摘要 |
| 人类看板介入 | Kanzo 评论回传 | 人的决定 |
| 规格驱动 | [Spec Kit](https://github.com/github/spec-kit) / [OpenSpec](https://github.com/Fission-AI/OpenSpec) → Beads DAG | spec 和任务图 |
| 同题多解 | 同一 bead 派两个 worktree | 两个信封，选一个 |
| 多机 | Beads Dolt sync + claim | 跨机 claim 和完成事件 |

最常见的用法是四个 worker 并行。主 Agent 把一个功能拆成六个 bead，写清依赖和验收，一次派出四个 ready 任务：Claude 做 API，Codex 做测试，pi 做文档，omp 做重构。四个 worker 各在自己的 worktree 里干活。主 Agent 调一次 `orch wait`，收到“两个完成、一个失败、一个还在跑”的摘要；完成的看信封，失败的看 checks tail，再决定重派还是改任务。它不需要知道每个 worker 读了哪些文件、跑了哪些命令。

交叉 review 是另一种用法。Codex 写完，orchestra 自动派 Claude reviewer，只给 diff 和验收标准。reviewer 返回结构化 findings；有 high severity 就自动创建一个修复 bead 派回 Codex，全部通过再合并。主 Agent 只看到“approved，两个 findings，一个 high”。需要实时讨论时，再让 agentbus 或 AgentBridge 把两个人接起来；对话不 CC 主 Agent。

长任务会跨额度窗口。worker 跑到额度或时间上限，adapter 在回合边界停下，写 checkpoint，orchestra 标记 paused。窗口刷新后，用 `--resume`、`codex queue` 或 RPC 续接；一侧不可用就换另一侧。任务状态在 Beads 和 SQLite，不在某个会话的上下文里，所以重启不丢。

崩溃恢复靠账本。worker 退出非 0，adapter 记录 exit code 和日志 tail；daemon 重启后对账，running 但 PID 不存在就标记 failed；已合并的 run 不会重复合并，已关闭的 bead 不会重复派发。这些事不需要人肉检查“跑到哪了”。

## 名字

如果现在要起名，我会选 **Interlocking（联锁）**。铁路联锁的核心是：不允许两条冲突的进路同时开放，道岔和信号必须互相锁住。这和多 agent 并行时的任务路由、worktree 锁、合并队列、L2 信号是同一件事。它比 Gantry 更独特，也不像 Trainmaster 那样容易被听成模型训练。

另外两个备选是 **Gantry（龙门架）**，短、好打、品牌感强，但 npm 和 PyPI 同名都被占了，要用 scoped package；**Trainmaster（调度长）**，含义直白，包名基本可用，但 “train” 在 AI 语境里容易被听成训练。名字不是架构，别在这上面花一周。

## 结论

agentbus 让我确认了一件事：通信层可以很轻，但通信不是协同。要让多个 agent 真的并行开发，任务要有账本，执行要有调度，结果要有验收，主 Agent 得从消息中转里退出来。

先跑 v0。让 Beads 管任务，SQLite 管执行，worktree 管隔离，信封管 token。人类需要看板时加 Kanzo；主 Agent 需要被空闲唤醒时加 agentbus 或 AgentBridge；第二台机器加入时再做多机。每加一层，都先问一句：它解决的是哪个已经发生的问题。
