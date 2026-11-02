---
name: multi-agent-orchestration-survey
title: 多 Agent 编排全景：从一次委派到一支舰队
summary: 从 74 星委派脚本到 4 万星编排器的全景调研：通信模式已收敛，选型由异构度与值守方式决定，附两套可落地设计。
date: 2026-11-02
source: https://github.com/robbin/grokbot-local-agent
tags: [multi-agent, orchestration, pi, adapter, survey]
related: []
---

把一项重活交给另一个 agent，在 2026 年不缺工具，缺的是选型判断。这篇调研从一个 74 星的小仓库出发，途经 DeepSeek 的 superagent 原型和五个活跃的开源编排器，最后收敛成两个变量：**异构度决定你用哪一档适配器，值守方式决定架构长什么形状**。通信层的共识已经稳定——结构化调用、工件落盘、门铃通知、磁盘对账；分歧只剩你要为多少种 agent 维护多少种协议。文末给出两套可以直接落地的设计：一套 Claude 主控、四种 worker 各走各家订阅；一套全 pi 栈、自备网关，角色换模型只改一行配置。

![适配器谱系：进程内 subagent、原生 RPC、MCP 包装、tmux 终端模拟四个档位，纵轴控制深度、横轴异构容忍度](/sdlc-playbook/articles/multi-agent-orchestration-survey/cover.svg)

## 四条通道：一个小仓库把委派做对了

调研的起点是 robbin 的 grokbot-local-agent：云端的 Grok Bot 把耗轮次的活交给同机的 pi，任务可追踪、可续、可取消，完成后唤醒 Bot 核查汇报。核心是四个脚本、一千余行、零 npm 依赖。star 不多，但它把「委派」当可靠性问题来解，每个边界都处理得干净。

<a class="repo-card" href="https://github.com/robbin/grokbot-local-agent">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">robbin/</span><span class="rc-name">grokbot-local-agent</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Let Grok Bot hand heavy work to a local agent (Pi) on its own computer, and get woken by webhook when tasks finish.</p>
  <span class="rc-snapshot"><span>74 stars · 9 forks · MIT · JavaScript</span><span>evaluated 2026-11-02</span></span>
</a>

它没有让两个 agent 互发消息，而是把通信拆成四条互不越界的通道：控制通道是进程级 RPC，pi-task 以 JSON 行驱动 `pi --mode rpc` 子进程，prompt 进、事件流回、abort 可达；数据通道是共享文件系统，每个任务一个目录，状态、事件流、结果、逐轮提示词各自落盘；唤醒通道是一个 detached 通知进程 POST 五字段 JSON——只有定位符，没有内容；管理通道是一组 CLI 子命令，负责查询、找回和认领。

![grokbot-local-agent 的四条通信通道：控制走 RPC、数据落磁盘、唤醒走 webhook、管理走子命令](/sdlc-playbook/articles/multi-agent-orchestration-survey/channels.svg)

两条设计决策值得展开。第一条，**通知是门铃，不是数据通道**。完成通知只含 `{source, id, owner, state, exit_code}`，磁盘记录才是事实来源；通知丢了，下次唤醒用 `pending` 找回未汇报的结果，绝不重跑。至少一次投递加幂等消费，这个模式它用不到一百行就做完了。第二条，**上下文自包含**。pi 看不到 Bot 的会话，Bot 给的每个 prompt 都带目标、约束、路径和验收标准；pi 交回工件，不交聊天记录。主控的核查纪律写进技能文本：回复是主张，不是证据。

## 规模上去之后：dsh-superagent 的账本

同一个问题放到团队规模，grokbot 的四个文件不够用了。DeepSeek 的 dsh-superagent-prototype 监听 GitHub 和飞书，人发起请求，Eval 判断，建 Ticket，派给 Executor Session 干活，在原对话里以 PR 交付，web 面板给人看哪些事需要人。README 标注得很清楚：研究原型，非官方产品。

<a class="repo-card" href="https://github.com/deepseek-ai/dsh-superagent-prototype">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">deepseek-ai/</span><span class="rc-name">dsh-superagent-prototype</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Towards a More Autonomous Agent System</p>
  <span class="rc-snapshot"><span>11.2k stars · 1.1k forks · MIT</span><span>evaluated 2026-11-02</span></span>
</a>

它值得读的是领域模型，不是代码量。Source 产出不可变的 Trigger（带读位置，重启不重放），Thread 聚合上下文，Eval 分两层，确定性 gate 加模型研判，通过后发不可变的 Mandate（含策略版本、范围、强度），Ticket 持有执行与订阅，Assignment 绑定 Executor。底层是单个 SQLite：effect 队列做投递重试（两秒起指数退避），outbox 给每条外发消息记回执，同一 id 永不重复入队，被丢弃的消息保留原因。所有域事件先落库再执行。

对照 grokbot，门铃是同一个哲学，dsh 的版本叫「先落库再投递、投递只加速不裁决」。所有权在 grokbot 里是一个 owner 字段加 ack 过滤，到 dsh 长成 Policy、Mandate、Subscription 一整套授权模型。规模变了，模式没变。

## 编排器全景：谁在做，做到哪

按「主控派活、多个 worker 分头干」筛了一遍开源生态，逐个核了 star、推送日期和发布记录。真正匹配且活跃的是下面这几个，数据全部截至 2026-11-02。

<a class="repo-card" href="https://github.com/Yeachan-Heo/oh-my-claudecode">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">Yeachan-Heo/</span><span class="rc-name">oh-my-claudecode</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Teams-first Multi-agent orchestration for Claude Code</p>
  <span class="rc-snapshot"><span>40.5k stars · 3.6k forks · MIT · TypeScript</span><span>v5.7.30 · 2026-11-02</span></span>
</a>

oh-my-claudecode（OMC）社区最大，Claude Code 当主控，编排面有两层：会话内的 `/team` 走 Claude Code 原生 agent teams，五段流水线是计划、PRD、执行、验证、修复循环；终端里 `omc team N:codex "任务"` 直接开 tmux 分屏，spawn 真实的 codex、gemini、antigravity、grok、cursor 进程，按需起、干完即退。它的一个转向颇能说明问题：v4.4.0 移除了 Codex 和 Gemini 的 MCP 接入，换成 tmux CLI worker。维护 N 个 wrapper 进程的成本，压过了结构化协议带来的收益。

<a class="repo-card" href="https://github.com/omnigent-ai/omnigent">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">omnigent-ai/</span><span class="rc-name">omnigent</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">The open-source meta-harness for all your AI agents: swap or combine harnesses without rewriting, enforce policies and sandboxing.</p>
  <span class="rc-snapshot"><span>11.2k stars · 1.8k forks · Apache-2.0 · Python</span><span>v0.20.0 · 2026-10-28 · alpha</span></span>
</a>

Omnigent 走另一条路：不选主控，做元 harness。同一个会话里混编 Claude Code、Codex、Cursor、OpenCode、Hermes、pi 和 YAML 自定义 agent，可以让一个评审另一个的产出。适配层是 `harnesses/*_native` 一组 SDK 优先的 Python 模块，pi 适配器连订阅凭证管理和断点续跑都做完了。治理是它的亮点：policy 可以在危险动作前暂停等人批准、封顶消费、限制工具；沙箱覆盖 Modal、E2B、K8s 等十几种。状态明标 alpha，两千多个 open issue，选它就是接受陪跑。

<a class="repo-card" href="https://github.com/awslabs/cli-agent-orchestrator">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">awslabs/</span><span class="rc-name">cli-agent-orchestrator</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Multi-agent orchestration for AI coding CLIs — Claude Code, Kiro, Codex, and more, coordinated by a supervisor.</p>
  <span class="rc-snapshot"><span>1.5k stars · 313 forks · Apache-2.0 · Python</span><span>v2.5.3 · 2026-10-08</span></span>
</a>

AWS 官方实验室的 CAO 工程化程度最高：常驻 cao-server，supervisor profile 当主控，用 tmux 隔离会话跑十二种 provider CLI——Claude Code、Codex、Kiro、Copilot、OpenCode，甚至包括 Oh My Pi。Web UI、运维 MCP、定时 flows、跨会话记忆、工具白名单、EKS 集群部署都有。star 不高，但机构背书加当天活跃，要服务器化运维时它最稳。

![CAO 的产品卡：supervisor 协调多个 provider CLI](/sdlc-playbook/articles/multi-agent-orchestration-survey/cao-banner.png)

<a class="repo-card" href="https://github.com/OrchestratorInc/agent-orchestrator">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">OrchestratorInc/</span><span class="rc-name">agent-orchestrator</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Plan, run and supervise fleets of agents from task to merged PR.</p>
  <span class="rc-snapshot"><span>14k stars · 1.9k forks · Apache-2.0 · Electron</span><span>evaluated 2026-11-02</span></span>
</a>

Orchestrator.inc 是 dsh 哲学的桌面版：主 agent 规划拆分，每个任务一个 worker、一个分支、一个 worktree，看板按 PR、CI、review 状态自动分道，CI 失败和评审意见路由回拥有该分支的 worker，直到 PR 合并。形态是给人盯的 GUI，主控不是你对话里的那个 agent。

初筛淘汰的几个例子同样有信息量。vibe-kanban 三万星，README 顶部挂着官方关停公告，star 数与工程存续没有关系。claude-squad 八千七百星，两个半月没有推送，而且它只是 tmux 会话管理器，没有主控委派。HKUDS 的 DeepCode 一万七千星，但那是港大自己的多 agent 研究系统，不做异构 CLI 编排，不在本题范围内。

<a class="repo-card" href="https://github.com/BloopAI/vibe-kanban">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">BloopAI/</span><span class="rc-name">vibe-kanban</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Get 10X more out of Claude Code, Codex or any coding agent — sunsetting per the official announcement.</p>
  <span class="rc-snapshot"><span>28.6k stars · 3.1k forks · Apache-2.0</span><span>sunsetting · 2026-10-29</span></span>
</a>

<a class="repo-card" href="https://github.com/smtg-ai/claude-squad">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">smtg-ai/</span><span class="rc-name">claude-squad</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Manage multiple AI terminal agents like Claude Code, Codex, OpenCode, and Amp.</p>
  <span class="rc-snapshot"><span>8.7k stars · 623 forks · AGPL-3.0</span><span>last push 2026-08-20</span></span>
</a>

<a class="repo-card" href="https://github.com/HKUDS/DeepCode">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">HKUDS/</span><span class="rc-name">DeepCode</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Open Agentic Coding — Agent Harness &amp; Loop Engineering &amp; Multi-Agent Orchestration.</p>
  <span class="rc-snapshot"><span>16.8k stars · 2.2k forks · MIT · Python</span><span>evaluated 2026-11-02</span></span>
</a>

## 适配器经济学：tmux 为什么赢，输在哪

把这批项目放在一起，规律很直接：**异构度每加一，适配器就往通用的一侧退一步**。谱系有四档：进程内 subagent（pi-subagents、Claude Code 原生 teams）拿到的是同进程事件总线；原生 RPC 或 headless（`pi --mode rpc`、`claude -p --output-format stream-json`、`codex exec`）拿到结构化事件和精确退出码，但每家一套方言；MCP 包装把调用标准化了，wrapper 还得逐家维护；tmux 终端模拟的契约只剩一条，能在终端里跑，于是什么都能接，代价是拿到的全是渲染后的屏幕。

OMC 从 MCP 退到 tmux，CAO 十二个 provider 全压在 tmux 上，原因不是 tmux 更好，而是它更省：终端是唯一一个 30 年没变过语义的接口，且自带一个所有 SDK 都没有的特性——人可以随时 attach 进去看，甚至接管，出了问题像看同事屏幕一样看 worker。付出的代价同样具体：完成检测靠解析屏幕文本，spinner 和折行都能骗过解析器；结果没有结构，token 用量全靠刮；中止只能发 Ctrl-C，可能误伤 agent 开着的编辑器；最尖锐的是安全——把刮下来的屏幕内容喂给主控模型，等于把不可信文本注入主控上下文。

所以 tmux 不是终点，是标准缺位期的桥。历史上这个剧本演过：Expect 脚本靠伪终端驱动网络设备十几年，直到 SNMP 标准化才退役；Selenium 从抓屏进化到 WebDriver 再进 W3C 标准。agent 领域的 WebDriver 候选是 A2A 协议，但它目前停在框架层，CLI coding agent 没有人真的用它对接。当下的工程解是混合分层：tmux 只管生命周期（可旁观、可 detach），协议走 headless 命令的结构化输出；有 headless 模式的 provider 写薄 adapter，长尾才退到抓屏。

## 两套落地设计

### 混合栈：Claude 主控，四个 worker 各走各家订阅

Claude Code 当主控，worker 是 Claude Code、Codex、pi、Oh My Pi 四种。四个都支持订阅认证下的 headless 调用，所以不需要抓屏：Claude Code 用 `claude -p --output-format stream-json` 加 `--resume`；Codex 用 `codex exec` 走 ChatGPT 登录；pi 用 `--mode rpc`；OMP 是 pi-mono 的 fork，`omp --mode rpc` 与 pi 同方言，一份驱动覆盖两个 worker。每家 CLI 由使用者本人登录一次，adapter 不碰 auth 文件，spawn 前清掉环境里的通知密钥。

这套设计的必需件有五个。统一 adapter 接口只要四个方法：run、abort、resume、capabilities。文件任务库照搬 grokbot 的目录结构，崩溃恢复靠每次入口的孤儿检查。写任务一律 git worktree 隔离，验收看分支 diff。额度要感知：订阅限额在各家事件流里都有信号，识别后退避，四份额度池可以互为备份。最后一条是纪律：主控亲自验收 diff 和测试。provider 层不用从零写：Omnigent 的 `*_native` 适配器（Apache-2.0，Python）是最完整的现成代码，订阅凭证管理和续跑是自建最费劲的部分，它都做完了；Node 路线则是抄 grokbot 的 54 行 pi 驱动覆盖 pi 加 OMP，Claude 和 Codex 各写百来行。CAO 的 provider 代码不用抽，它就是 tmux 路线，但它十二份 provider 文档是现成的怪癖速查表。

### 同构栈：全 pi，自备网关

如果主控和 worker 都用 pi，适配器问题就整个消失了，因为模型异构被网关吃掉。结构分三层：底层 `~/.pi/agent/models.json` 一段配置把网关注册成 provider，主控和所有 worker 共读；中层 `.pi/agents/*.md` 定义角色，frontmatter 一行 model 绑定网关里的模型，coder 用快而便宜的，researcher 用旗舰加高思考；顶层就是你对话里的 pi 会话，装上 pi-subagents 后获得 Agent 工具：后台并行、完成通知、运行中转向、会话恢复、确定性工作流（`parallel()` 与无栅栏的 `pipeline()`）、worktree 隔离，全部是现成的。

![全 pi 栈三层结构：models.json 网关层、.pi/agents 角色层、主控会话加 pi-subagents 并行分派](/sdlc-playbook/articles/multi-agent-orchestration-survey/allpi.svg)

<a class="repo-card" href="https://github.com/tintinweb/pi-subagents">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">tintinweb/</span><span class="rc-name">pi-subagents</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Claude Code-style sub-agents and workflow orchestration for pi — parallel execution, live widgets, steering, resume.</p>
  <span class="rc-snapshot"><span>1.4k stars · 338 forks · MIT · TypeScript</span><span>v0.22.1 · 2026-10-30</span></span>
</a>

![pi-subagents 的舰队视图：每个子代理一行，显示状态、工具活动与 token 计数](/sdlc-playbook/articles/multi-agent-orchestration-survey/pi-subagents.png)

pi-subagents 是进程内扩展，编排状态跟着主会话走：有人坐在会话前看进度，它就是完整答案。需求一旦变成无人值守，定时执行、重启后仍存活、webhook 唤醒，就换 pi SDK 自建：`createAgentSession` 起 worker，`prompt`、`steer`、`abort` 的语义 SDK 里原生就有，再配 grokbot 那套文件任务库。两条路线共享同一份 models.json 和同一组角色定义，迁移不推翻任何东西。判断规则一句话：有人看用扩展，没人看用 SDK 加账本。

想换一个更重的宿主，Oh My Pi 是 pi-mono 的 coding-first 分叉：同样的 RPC 入口，外加 Agent Hub，子代理的实时活动、用量和转向操作都在一个界面里，主控与 worker 仍然是一个方言。

<a class="repo-card" href="https://github.com/can1357/oh-my-pi">
  <span class="rc-top"><span class="rc-title"><span class="rc-owner">can1357/</span><span class="rc-name">oh-my-pi</span> <span class="rc-arrow">↗</span></span></span>
  <p class="rc-desc">Coding agent with the IDE wired in. A coding-first fork of Pi with TUI, one-shot, Node SDK, RPC and ACP entry points.</p>
  <span class="rc-snapshot"><span>37.5k stars · 4.2k forks · MIT · TypeScript</span><span>evaluated 2026-11-02</span></span>
</a>

![Oh My Pi 的任务视图：子代理的活动与产出在同一界面里跟踪](/sdlc-playbook/articles/multi-agent-orchestration-survey/omp-task.webp)

## 选型收敛成一张表

| 场景 | 方案 | 代表 |
|---|---|---|
| 单人本地，主控就是你的会话 | 全 pi 栈 + pi-subagents，网关一次配置 | 本文 §同构栈 |
| 主控 Claude，worker 异构、各走订阅 | 薄 RPC adapter ×N + worktree + 额度降级链 | 本文 §混合栈 |
| 团队值守一个仓库，最小化人类注意力 | 票据域模型 + 看板 + PR 生命周期 | dsh-superagent、Orchestrator.inc |
| 跨机器，云 Bot 派活给本地 | 文件任务库 + webhook 门铃 | grokbot-local-agent |
| 服务器化、定时、多 provider 运维 | cao-server + tmux 会话 | CAO |

三条判断规则：异构度决定适配器档位，worker 少于三五个就停在原生 RPC 这一档，薄 adapter 是最划算的位置，tmux 的兼容税不值得交。值守方式决定架构形状，有人值守用进程内扩展，无人值守用 SDK 加文件账本，跨机用门铃加磁盘对账。验收永远归主控，worker 的回复是主张不是证据，这条与栈无关，与协议无关，只与责任有关。

对 grokbot-local-agent 的逐行解剖另有[项目卡](/sdlc-playbook/projects/robbin-grokbot-local-agent/)；消息总线为什么不是答案，见[《主 Agent 不该是消息总线》](/sdlc-playbook/articles/local-multi-agent-coordination/)。
