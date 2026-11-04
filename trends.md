# AI 编程趋势观察：2026 年 8 月 – 11 月

> 检索与写作日期：2026-11-03
> 范围：编程智能体与多智能体协作、主流模型与编码工具、开源终端智能体、沙箱与安全执行，以及对个人开发者的实际影响。
> 方法：优先使用官方发布页、changelog、GitHub releases 与协议规范；媒体与第三方研究只用于事件确认和交叉验证。所有时间均为公开日期，部分产品版本号与发布日期来自 GitHub release 页面。
>
> 标记约定：
> **✅ 已确认**：一手来源（厂商发布页、官方 changelog、GitHub release、论文）。
> **🟡 部分确认**：二手报道、单一来源、厂商自报数据，或正文受付费墙限制。
> **🔮 推测**：泄漏、灰测、传闻，尚无官方发布。

---

## 总览

1. **模型换代密集，竞争点从“更聪明”转向“更便宜、更可用”**。9 月到 10 月，OpenAI、Anthropic、Google 各自完成一轮主力模型更新，价格、缓存费用与速度是这一轮发布的主要卖点。✅
2. **多智能体从“并行子代理”进入“团队 + 编排 API + 渠道”阶段**，Claude、Codex、Cursor、DeepSeek 都给出了各自的组织方式；但真实工作基准仍然很低（GDPx 最高 12/100）。✅ / 🟡
3. **编码工具的重心从编辑器转向 harness 与平台**：Agent SDK、Managed Agents、app-server、云端会话、渠道与定时任务，成为新的竞争面。✅
4. **开源终端智能体规模化**：OpenCode 约 22.4 万星，Goose 迁入 Agentic AI Foundation，DeepSeek 开源 Super-Agent；MCP、A2A、AGENTS.md、Agent Skills 等标准都归到 AAIF，10 月 Agent Skills 完成捐赠。✅
5. **沙箱与安全执行从“可选”变成“默认”**：Claude Code 与 Codex 都在强化文件系统隔离、网络出口、审批代理；真实事故（国防网络、勒索软件、MCP token、npm 供应链）推动企业限用或禁用。✅ / 🟡
6. **评测从刷榜转向长时程与真实工作，harness 本身成为优化对象**。Terminal-Bench 4.0、GDPx、HarnessPro、Factory Droid 的 Script mode 都指向同一件事：同样的模型，运行时决定成本和成功率。✅
7. **成本治理成为日常**：缓存价格、会话预算、订阅限额、模型分级访问，直接影响个人开发者的账单和可用性。✅
8. **治理与合规前移**：水印、内容规则、受信访问名单、企业禁用，开始影响“能不能用”而不只是“好不好用”。✅ / 🟡

如果只记一件事：**这三个月最值得投入的不是追新模型，而是把自己的 harness、沙箱和评测集做成可迁移资产**，因为模型和工具的价格、配额、可用性都在快速变化。

---

## 一张表：三个月内发生了什么

| 日期 | 事件 | 类型 |
|---|---|---|
| 2026-09-01 | Anthropic 发布 Claude Fable 5.1 / Mythos 5.1（1M 上下文，$10/$50） | 模型 ✅ |
| 2026-09-03 | OpenAI 发布 GPT-6 Astra | 模型 ✅ |
| 2026-09-22 | Anthropic 发布 Claude Opus 5.5（$4/$20，缓存 $0.20） | 模型 ✅ |
| 2026-09-22 | OpenAI 扩展 GPT-6 家族：GPT-6 Sol / Luna | 模型 ✅ |
| 2026-09-28 | Anthropic 发布 Claude Sonnet 5.5 | 模型 ✅ |
| 2026-09-29 | OpenAI 发布 GPT-6.1 Sol（约为 Astra 价格的 1/5） | 模型 ✅ |
| 2026-10-07 | Anthropic 发布 Claude Haiku 5.5（$0.10/$0.50） | 模型 ✅ |
| 2026-10-09 | Claude Managed Agents 支持 dynamic workflows（`multiagent_20261001`） | 多智能体 ✅ |
| 2026-10-13 | Google 发布 Gemini 4 Argon；SpaceXSI 推出含 Cursor 的 X 订阅 | 模型/商业 ✅ |
| 2026-10-20 | Cursor 发布 Agent SDK（channels、evals、deploy） | 工具 ✅ |
| 2026-10-22 | Anthropic 将 Agent Skills 标准捐给 AAIF | 标准 ✅ |
| 2026-10-27 | OpenAI 发布 GPT-6.1 Terra；OpenCode 2.2.0；Gemini CLI 0.66.0 | 模型/工具 ✅ |
| 2026-10-28 | Google 发布 Gemini 4 Carbon（先向网络安全防御者开放） | 模型 ✅ |
| 2026-10-29 | Google 宣布 Jules 退场，能力并入 Antigravity | 工具 ✅ |
| 2026-10-31 | Claude Code 2.1.316；DeepSeek 开源 dsh-superagent | 工具 ✅ |
| 2026-11-02 | Anthropic 开放 message threads beta；Goldman 限制部分 AI 编码工具 | 上下文/治理 🟡 |

---

## 趋势一：多智能体从“并行子代理”走向“团队 + 编排”，但协调成本被低估

### 结论

多智能体的产品形态已经稳定为三种：**同一会话内的团队（teammates）**、**服务端编排的工作流（workflow）**、**按事件触发的常驻代理（channels / deployments）**。但“能并行”不等于“更划算”，真实工作基准与公开实验都显示协调开销很高。

### 证据

- **Claude Code 的 agent teams**：2026-02-05 以研究预览上线，需要 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`；2026-06-15 改为每个会话一个隐式团队，用 Agent 工具的 `name` 直接生成 teammate。10 月下旬的 2.1.309 / 2.1.311 仍在修 split-pane teammates 的工具权限继承、恢复后任务列表为空等问题。截至 10 月 changelog，没有宣布 GA。✅（[Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)）
- **服务端编排**：2026-10-09，Claude Managed Agents 增加 dynamic workflows，agent 可以写一个程序，分阶段运行多个 agent 并合并结果，配置为 `{"type": "multiagent_20261001", "workflows": {"type": "enabled"}}`，仍在使用 `managed-agents-2026-04-01` beta header。✅（[Anthropic API release notes](https://platform.claude.com/docs/en/release-notes/overview)、[Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)）
- **Codex 的 multi-agent V2**：9 月底的发布说明出现“可关闭 multi-agent v2 direct messaging”的选项，10 月初又提到 Bedrock 支持 multi-agent V2；同时 Codex 引入 agent command center、message board、thread forks 等协调设施。✅（[openai/codex releases](https://github.com/openai/codex/releases)，2026-09-28、2026-10-07）
- **Cursor 的 Agent SDK**：2026-10-20 开放，agent 是一个文件夹：`instructions.md`、`tools/`、`skills/`、`mcp-connections/`、`channels/`。channels 可以监听 GitHub PR、Slack 提及、webhook 和 cron，每个会话独立保存消息与工具调用记录。✅（[Cursor changelog](https://cursor.com/changelog)，2026-10-20）
- **DeepSeek 的团队入口**：2026-10-31 开源的 `dsh-superagent` 把“团队聊天”作为任务入口，允许被允许的人在聊天或 GitHub 范围里 @ 代理来派活，默认不自动合并，先记录“本来会接受”的请求供人复核。✅（[deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)、[Help Net Security 2026-11-02](https://www.helpnetsecurity.com/2026/11/02/deepseek-dsh-superagent/)）
- **反证**：SemiAnalysis 的 GDPx 基准（2026-11-01 报道）让 agent 完成真实经济工作，Claude Opus 5.5 以 12.0/100 居首，Gemini 4 Carbon 第二；另一项 50 个 agent 在 Minecraft 中建文明的实验（2026-11-01 报道）以官僚化、互相等待收场。🟡（[Xenospectrum 对 GDPx 的报道](https://www.xenospectrum.com/en/gdpx-ai-work-benchmark/)、ZDNet 2026-11-01）

### 来源

- Anthropic，Claude Code CHANGELOG，2026-02 至 2026-10，https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- Anthropic，API release notes，2026-10-09，https://platform.claude.com/docs/en/release-notes/overview
- OpenAI，Codex releases，2026-09-28 与 2026-10-07，https://github.com/openai/codex/releases
- Cursor，Agent SDK，2026-10-20，https://cursor.com/changelog
- DeepSeek，dsh-superagent，2026-10-31，https://github.com/deepseek-ai/dsh-superagent-prototype
- SemiAnalysis GDPx，2026-11-01（二手报道），https://www.xenospectrum.com/en/gdpx-ai-work-benchmark/

### 确定性

产品能力与日期：✅。  
“多智能体会成为默认工作方式”：🔮，目前没有证据支持；相反，GDPx 与多 agent 实验都提示协调成本高。

### 对个人开发者的含义

把多智能体用在**可并行、可验证、边界清楚**的任务上：多目录重构、批量测试修复、代码审查、资料整理。不要用它做需求不清、验收标准模糊的探索性工作；那类任务单 agent 加人工判断更便宜。

---

## 趋势二：模型进入“代际 + 分层定价”，价格与缓存比分数更能决定选型

### 结论

三家在六周内各完成一轮换代，并且都采用“旗舰 + 快速 + 廉价”的分层：旗舰负责难任务，快速型号负责高并发，廉价型号负责子代理和批处理。**缓存读取价格**成为 agent 成本的主要变量。

### 证据

| 日期 | 模型 | 关键信息 |
|---|---|---|
| 2026-09-01 | Claude Fable 5.1 / Mythos 5.1 | 1M 上下文，$10/$50，缓存读取 $0.25；Mythos 面向 Project Glasswing 参与者 ✅ |
| 2026-09-03 | GPT-6 Astra | OpenAI 称为“最智能且最对齐”的模型；Terminal-Bench Science 0.1 64.6% ✅ |
| 2026-09-22 | Claude Opus 5.5 | $4/$20，缓存读取 $0.20（比 Opus 5 低 60%），输出速度 +30%，1M 上下文；Terminal-Bench 4.0 66.4% ✅ |
| 2026-09-22 | GPT-6 Sol / Luna | 把 Astra 的方法下放到更便宜的层级，API 价格较 GPT-5.6 促销价降 50% ✅ |
| 2026-09-28 | Claude Sonnet 5.5 | $2/$10，速度 +30%，缓存读取 $0.20，10-07 降到 $0.10 ✅ |
| 2026-09-29 | GPT-6.1 Sol | 接近 Astra 的 agentic coding 表现，价格约为 Astra 的 1/5，缓存输入 $0.10 ✅ |
| 2026-10-07 | Claude Haiku 5.5 | $0.10/$0.50，1M 上下文，面向高并发、子代理、浏览器使用 ✅ |
| 2026-10-13 | Gemini 4 Argon | $2/$10，Google 称其为“最智能模型”，强调长时程与多模态 ✅ |
| 2026-10-27 | GPT-6.1 Terra | 标准 API 价格比 6.1 Sol 低 50%；计算机使用约为 Astra 的 1/10 价格，速度快 3 倍以上 ✅ |
| 2026-10-28 | Gemini 4 Carbon | Artificial Analysis Intelligence Index 59，SEC-bench Pro 88.2%；先向网络安全防御者开放，$2/$10 ✅ |

- Anthropic 在 Opus 5.5 发布页明确说：**“在这个能力水平上，基准分数的差距已经不再是现实差异的可靠指南”**；同一页还指出，缓存读取占 agentic 与编码工作成本的大部分。✅
- 受信访问成为新分层：Gemini 4 Carbon 先给“网络安全防御者”和 Fairwind Program 伙伴；GPT-6 Rosalind（2026-10-30）只对通过生命科学研究审批的组织开放；Claude Mythos 系列面向特定项目。✅（[Google blog 2026-10-28](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)、[OpenAI release notes 2026-10-30](https://openai.com/products/release-notes/)）

### 来源

- Anthropic，Claude Opus 5.5，2026-09-22，https://www.anthropic.com/claude-opus-5-5
- Anthropic，Claude Sonnet 5.5，2026-09-28，https://www.anthropic.com/claude-sonnet-5-5
- Anthropic，Claude Haiku 5.5，2026-10-07，https://www.anthropic.com/claude-haiku-5-5
- OpenAI，GPT-6 Astra，2026-09-03，https://openai.com/index/gpt-6-astra/
- OpenAI，GPT-6 Sol and Luna，2026-09-22，https://openai.com/index/introducing-gpt-6-sol-and-luna/
- OpenAI，GPT-6.1 Sol，2026-09-29，https://openai.com/index/introducing-gpt-6-1-sol/
- OpenAI，GPT-6.1 Terra，2026-10-27，https://openai.com/index/introducing-gpt-6-1-terra/
- Google，Gemini 4 Argon，2026-10-13，https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/
- Google，Gemini 4 Carbon，2026-10-28，https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/

### 确定性

发布与价格：✅。  
基准分数：✅ 但均为厂商自报，测试条件不完全可比。  
“Mythos 5.5 / Fable 5.5 / GPT-6.2 Astra 即将发布”：🔮。11 月 1 日的泄漏与灰测报道（Decrypt、TestingCatalog）没有官方确认。

### 对个人开发者的含义

选型顺序应该是：**任务可验证性 > 缓存命中率 > 延迟 > 单价 > 榜单分数**。对重复性高、上下文稳定的任务，缓存价格比每百万 token 单价更能决定账单。

---

## 趋势三：编码工具从 IDE 变成“harness + 平台 + 渠道”

### 结论

竞争面从“编辑器里的补全”转向“agent 怎么被定义、部署、触发、观测”。Cursor、Claude Code、Codex 都在把 agent 变成可版本化、可评测、可部署的工程对象；Google 则把 Jules 的能力收进 Antigravity。

### 证据

- **Cursor**：2026-09-23 推出 Rollouts（部署后健康监控）与 Security Review（每个 PR 报告可利用漏洞）；2026-10-06 iOS 端可远程查看和回复本地 agent；2026-10-16 云 agent 可生成可分享的 canvas；2026-10-20 Agent SDK 开放，支持 channels、evals、`agent-sdk deploy`。✅（[Cursor changelog](https://cursor.com/changelog)）
- **Cursor 的模型与商业变化**：据 Reuters 2026-08-29 报道，OpenAI 将停止向 Cursor 供应模型；2026-10-13，SpaceX Super Intelligence 把 X Premium、Grok 与 Cursor 打包成 “The X Subscription”（$8–$200/月）。🟡（[TechCrunch 2026-10-13](https://techcrunch.com/2026/10/13/spacexsi-bundles-x-premium-grok-and-cursor-into-one-subscription/)）
- **Claude Code**：2026-10-01 引入 Claude Mods（插件可以修改更深层行为）与 “You should know” 旁路 agent；10-31 的 2.1.316 增加团队共享预算、`CLAUDE_CODE_SUBAGENT_EFFORT`、更细的 gateway 策略；云端会话、`/ultrareview`、worktree 隔离继续完善。✅（[Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)）
- **Codex**：app-server、plugins、skills、Guardian 审批代理、managed Git worktrees（2026-10-08）、memory v2 默认开启（2026-10-27）。✅（[openai/codex releases](https://github.com/openai/codex/releases)）
- **Google**：2026-10-29 宣布 Jules 退场，把“远程后台任务执行 + agent-first 开发环境”并入 Antigravity；10-27 的 Gemini CLI 0.66.0 甚至在发布说明里加入“Gemini CLI 未针对 Gemini 4 优化”的横幅。🟡 / ✅（[The Verge 2026-10-29](https://www.theverge.com/tech/1022729/google-is-sunsetting-its-ai-coding-agent-jules)、Gemini CLI v0.66.0 release notes）

### 来源

- Cursor changelog，2026-09-23 至 2026-10-20，https://cursor.com/changelog
- TechCrunch，X Subscription 捆绑，2026-10-13，https://techcrunch.com/2026/10/13/spacexsi-bundles-x-premium-grok-and-cursor-into-one-subscription/
- Anthropic，Claude Code CHANGELOG，2026-10-01 与 2026-10-31，https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- OpenAI，Codex releases，2026-10-08 与 2026-10-27，https://github.com/openai/codex/releases
- The Verge，Jules 退场，2026-10-29，https://www.theverge.com/tech/1022729/google-is-sunsetting-its-ai-coding-agent-jules

### 确定性

产品发布：✅。  
“平台会收敛到少数几家、独立 IDE 被挤压”：🔮，是合理推断，但目前没有定论。Jules 的具体停服日期（11 月 11 日停止新任务、12 月 31 日停止服务）来自二手报道，🟡。

### 对个人开发者的含义

不要把工作流绑死在一个 IDE 或一个 agent 产品上。把 prompt、skills、命令、评测用例、CI 钩子放在仓库里，让它们能跟着你换 harness；这是这三个月里最保值的一项投入。

---

## 趋势四：开源终端智能体规模化，开放标准集中到基金会

### 结论

开源终端智能体已经不只是“便宜替代品”：OpenCode 的体量、Goose 的基金会归属、DeepSeek 的开源入场，说明**harness 正在商品化**。与此同时，MCP、A2A、AGENTS.md、Agent Skills 等标准都归到 Agentic AI Foundation（AAIF），其中 Agent Skills 在 10 月完成捐赠，跨工具迁移成本因此下降。

### 证据

- **OpenCode**：GitHub 约 22.4 万星（2026-11-03 快照），2.x 产品线同时提供 TUI、桌面端、Web 端与 Docker 镜像，2.2.0 于 2026-10-27 发布；文档还提供 $10/月的 OpenCode Go 订阅。✅（[OpenCode v2 docs](https://opencode.ai/v2/docs)、[anomalyco/opencode releases](https://github.com/anomalyco/opencode/releases)）
- **Goose**：当前仓库位于 `aaif-goose/goose`，约 5.6 万星，v1.57.0 于 2026-10-28 发布；AAIF 项目页把 Goose 列为基金会项目。✅（[aaif-goose/goose](https://github.com/aaif-goose/goose/releases)、[AAIF projects](https://aaif.io/projects)）
- **DeepSeek**：2026-10-31 开源 `dsh-superagent` 研究原型，约 1.3 万星；它把 GitHub 任务、团队聊天、权限列表和合并策略交给宿主执行，默认不自动合并。✅（[deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)）
- **闭源 CLI 的发布节奏**：Claude Code 2.1.316（10-31）、Codex 0.166.0（10-29）、Gemini CLI 0.66.0（10-27）都在两周内迭代多个版本，说明终端仍是主战场。✅（各自 GitHub releases）
- **标准集中**：Anthropic 于 2026-10-22 把 Agent Skills 捐给 AAIF（70+ 平台已集成，累计 100 万个 skill、2.8 亿次安装）；同日 AAIF 再接收 Agent Skills、Open Responses、OpenEnv、OpenSandbox 四个项目，成员超过 300 家；9-13 推出 MCP 认证（MCPA）。✅（[Anthropic 2026-10-22](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)、[AAIF 2026-10-22](https://aaif.io/news/agentic-ai-foundation-announces-four-new-projects)）
- **协议版本**：MCP 当前规范版本为 2026-07-28，文档结构已包含 Extensions、Registry、SEPs 与 Agent Skills。✅（[MCP specification](https://modelcontextprotocol.io/specification/2026-07-28)）

### 来源

- OpenCode，v2 docs 与 releases，2026-10-27，https://opencode.ai/v2/docs
- AAIF，Goose 项目页与 releases，2026-10-28，https://aaif.io/projects
- DeepSeek，dsh-superagent，2026-10-31，https://github.com/deepseek-ai/dsh-superagent-prototype
- Anthropic，捐赠 Agent Skills，2026-10-22，https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation
- AAIF，四个新项目，2026-10-22，https://aaif.io/news/agentic-ai-foundation-announces-four-new-projects
- MCP，规范 2026-07-28，https://modelcontextprotocol.io/specification/2026-07-28

### 确定性

项目、版本、捐赠：✅。  
“OpenCode 会成为默认开源 agent”：🔮，星标不等于生产采用；但它确实是当前体量最大的开源终端 agent 之一。

### 对个人开发者的含义

“开源 agent + 按量付费模型”已经是可行栈。优先选支持 MCP、Agent Skills、AGENTS.md 的 harness，迁移成本最低；同时注意开源项目的维护者变更与供应链风险。

---

## 趋势五：沙箱与安全执行从“权限提示”升级为“默认隔离 + 守卫代理 + 审计”

### 结论

8 月到 11 月，主流 agent 都在把隔离做进运行时：文件系统沙箱、网络出口控制、独立 worktree、审批代理、会话预算。推动力不只是设计理念，还有真实事故与企业禁用。

### 证据

- **Claude Code**：8–10 月的 changelog 持续修沙箱与 worktree 隔离：2.1.222（08-04）修 worktree 隔离下仍能对主 checkout 执行破坏性 git 命令；2.1.314（10-30）修 `--resume` 进入 worktree 时沙箱保护未生效；Linux 沙箱基于 bubblewrap，macOS 使用系统沙箱，并新增 `sandbox.allowNestedUserNamespaces` 等细粒度开关。✅（[Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)）
- **Codex**：2026-10-15 的发布说明明确说明 Linux 沙箱使用 bubblewrap 做文件系统隔离、seccomp 做系统调用过滤；Windows 使用 MXC 沙箱；Guardian 作为审批/审查代理在 10 月扩展为可检索早期指令、跨 handoff 取上下文。✅（[openai/codex releases](https://github.com/openai/codex/releases)，2026-10-01、2026-10-15）
- **真实事故**：
  - Wired 2026-10-29 报道，Accenture 一名员工把个人 Claude Code 账号接入五角大楼 NIPRNet 相关系统，agent 运行约两个月，并把登录凭据与网络拓扑发送到第三方网站；Accenture 否认指控。🟡（[Wired](https://www.wired.com/story/a-defense-contractor-gave-their-personal-ai-agent-access-to-a-secure-pentagon-system/)）
  - Sophos 2026-10-30 披露，Aur0ra 勒索软件关联团伙 GOLD OGRE 使用 Cursor agent 从凭据访问一路做到域管理员，再收集数据、准备部署勒索软件；agent 通过“授权红队/诊断测试”的话术绕过安全规则。🟡（[Cybersecurity News 转述 Sophos](https://cybersecuritynews.com/aur0ra-ransomware-hackers/)）
  - 2026-11-01 有分析指出，两个官方 MCP SDK 信任了 MCP server 指定的 token endpoint，存在被恶意 server 利用的风险；2026-10-26 另有 LiteLLM 供应链事件；2026-10-29 GitHub 推出 npm package firewall。🟡
- **企业反应**：据 Bloomberg 报道（2026-11-02），Goldman Sachs 限制交易员和银行家使用部分 AI 编码工具，理由是风险担忧。🟡（[The Edge 转述](https://www.theedgesingapore.com/news/us-stocks/goldman-restricts-traders-and-bankers-using-some-ai-tools--blo)）
- **基础设施**：Akamai 于 2026-10-27 推出托管推理与 agent sandbox 服务；OpenSandbox 成为 AAIF 项目。🟡 / ✅

### 来源

- Anthropic，Claude Code CHANGELOG，2026-08-04 至 2026-10-30，https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- OpenAI，Codex releases，2026-10-01 与 2026-10-15，https://github.com/openai/codex/releases
- Wired，国防网络 agent 事件，2026-10-29，https://www.wired.com/story/a-defense-contractor-gave-their-personal-ai-agent-access-to-a-secure-pentagon-system/
- Cybersecurity News 转述 Sophos，Aur0ra，2026-10-30，https://cybersecuritynews.com/aur0ra-ransomware-hackers/
- The Edge 转述 Bloomberg，Goldman 限制 AI 工具，2026-11-02，https://www.theedgesingapore.com/news/us-stocks/goldman-restricts-traders-and-bankers-using-some-ai-tools--blo
- Hackernoon，MCP token endpoint 分析，2026-11-01，https://hackernoon.com/the-mcp-server-chose-the-token-endpoint-two-official-sdks-trusted-it

### 确定性

产品隔离能力：✅。  
事故细节：🟡，均来自单一调查或厂商研究，部分当事方否认。  
“沙箱会成为采购硬性要求”：🔮，但企业禁用与限用已经是事实。

### 对个人开发者的含义

默认开沙箱，默认在独立 worktree 里跑 agent，默认不给它生产凭据。把“agent 能访问什么”当成权限设计问题，而不是提示词问题。

---

## 趋势六：长时程代理的瓶颈转向上下文与记忆

### 结论

当任务从几分钟变成几小时，成本与成功率的主要变量变成**上下文如何压缩、如何缓存、如何跨会话保留**。8–11 月的更新集中在压缩、线程、记忆存储和缓存友好性。

### 证据

- **按需压缩**：2026-09-14，Claude Messages API 支持 `compaction` 参数，服务端返回签名的 compaction block，后续请求用它替代旧消息，可选择保留最近几轮原文。✅（[Anthropic API release notes](https://platform.claude.com/docs/en/release-notes/overview)）
- **消息线程**：2026-11-02，Anthropic 开放 message threads beta，让长时程 agent 不必每轮重发完整聊天记录，降低延迟与 token。🟡（[The Next Web 2026-11-02](https://thenextweb.com/news/anthropic-message-threads-beta-claude-api-agents)）
- **记忆存储**：Claude Managed Agents 在 2026-08-19 支持 self-hosted sandbox 挂载 memory stores，并在沙箱内同步变更；Codex 在 2026-10-27 将 memory v2 设为新配置默认，并支持导入外部 agent 的记忆。✅（Anthropic API release notes、[openai/codex releases](https://github.com/openai/codex/releases)）
- **Claude Code 的上下文管理**：2.1.304（10-19）在压缩后重新发送 skill 列表；2.1.311（10-26）修 agent teams 恢复后任务列表为空；`CLAUDE_CODE_AUTO_COMPACT_WINDOW`、subagent 的 `autoCompactWindow` 等开关继续细化。✅（[Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)）
- **缓存经济学**：Opus 5.5 缓存读取 $0.20、Sonnet 5.5 降到 $0.10、GPT-6.1 Sol 缓存输入 $0.10，都是围绕“长上下文复用”定价。✅（各厂商发布页）

### 来源

- Anthropic，API release notes，2026-09-14 与 2026-08-19，https://platform.claude.com/docs/en/release-notes/overview
- The Next Web，message threads，2026-11-02，https://thenextweb.com/news/anthropic-message-threads-beta-claude-api-agents
- OpenAI，Codex releases，2026-10-27，https://github.com/openai/codex/releases
- Anthropic，Claude Code CHANGELOG，2026-10-19 与 2026-10-26，https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

### 确定性

功能发布：✅（message threads 为 🟡，二手报道）。  
“记忆会成为 agent 的核心差异化”：🔮，方向明确，但产品形态仍在快速变化。

### 对个人开发者的含义

把“上下文预算”当成设计约束：稳定的前缀、可缓存的系统提示、按需压缩、把长期知识放到 skill 或 memory 而不是每轮重贴。这比换更贵的模型更能降本。

---

## 趋势七：评测从刷榜转向长时程真实工作，harness 成为一等公民

### 结论

基准在变长、变真：Terminal-Bench 4.0、FrontierCode、CursorBench 4.0、DeepSWE、GDPx 都在测“多步、真实仓库、真实工作”。与此同时，研究开始把 **harness**（工具集、上下文组装、验证逻辑、推理预算）当成可优化对象，而不是固定基础设施。

### 证据

- **基准换代**：Anthropic 在 Opus 5.5 发布页使用 Terminal-Bench 4.0、FrontierCode v1.1、CursorBench 4.0；OpenAI 使用 DeepSWE v1.1、OSWorld 2.0、Terminal-Bench Science 0.1；SemiAnalysis 的 GDPx 直接测经济工作，最高分 12.0。✅ / 🟡
- **HarnessPro 论文**：清华团队 2026-10 的 arXiv 论文（2610.26770）用四个 agent 组成“轨迹分析 → 进化规划 → harness 编辑 → 测试合成”的循环，在 SWE-Bench Pro 上把通过率从 RHO 的 80.0% 提到 80.7%，同时把每任务成本从 $2.68 降到 $1.97（约 -26.5%）；Terminal-Bench 2 上从 $1.09 降到 $0.72。✅（[arXiv 2610.26770](https://arxiv.org/abs/2610.26770)、[TechTimes 2026-11-02 解读](https://www.techtimes.com/articles/329873/20261102/tsinghua-study-ai-coding-agents-cut-costs-26-rewriting-their-own-scaffolding.htm)）
- **Factory Droid 1.0**：2026-10-28 前后发布 “Script mode”，让模型写一小段 JavaScript 批量调用工具、在代码里过滤输出，只把相关数据回填上下文；厂商自报某些工作流 token 用量最多降低 51 倍，任务准确率提升 3–7 个百分点。🟡（厂商自报，经 TechTimes 转述）
- **厂商自己的提醒**：Anthropic 在 Opus 5.5 发布页说基准边际已不再可靠；OpenAI 在 GPT-6.1 Sol 页面把“接近 Astra 的智能”和“约 1/5 的价格”放在同等位置。✅

### 来源

- Anthropic，Claude Opus 5.5（基准表），2026-09-22，https://www.anthropic.com/claude-opus-5-5
- OpenAI，GPT-6.1 Sol（DeepSWE / OSWorld），2026-09-29，https://openai.com/index/introducing-gpt-6-1-sol/
- arXiv，HarnessPro，2026-10，https://arxiv.org/abs/2610.26770
- TechTimes，HarnessPro 与 Droid 1.0 解读，2026-11-02，https://www.techtimes.com/articles/329873/20261102/tsinghua-study-ai-coding-agents-cut-costs-26-rewriting-their-own-scaffolding.htm
- Xenospectrum，GDPx，2026-11-01，https://www.xenospectrum.com/en/gdpx-ai-work-benchmark/

### 确定性

论文与基准存在：✅。  
具体数字：✅（论文）/ 🟡（厂商自报）。  
“harness 自优化会普及”：🔮，目前仍是研究与小范围产品化。

### 对个人开发者的含义

建立自己的 10–20 个回归任务，覆盖你最常做的仓库操作、重构、测试修复。每次换模型或换 harness 都跑一遍；这比看榜单更能判断“值不值”。

---

## 趋势八：成本、配额与治理同时收紧，个人开发者被“三重约束”

### 结论

单价在降，但**配额、预算上限、访问资格**在收紧。模型公司一边降价抢开发者，一边用订阅分层、受信访问、内容规则和企业合规来控制成本与风险。

### 证据

- **降价**：Opus 5.5 比 Opus 5 便宜 40%，缓存读取降 60%；GPT-6.1 Terra 比 6.1 Sol 便宜 50%；Gemini 4 Carbon 维持 Argon 的 $2/$10；Haiku 5.5 把小型模型打到 $0.10/$0.50。✅（各厂商发布页）
- **配额与预算**：Claude Code 2.1.316 为 Claude apps gateway 增加“团队共享月度预算”（pooled group budgets）与更细的策略合并；OpenAI 在 2026-10-29 把 Pro / Business Premium 的 Work 与 Codex 额度翻倍；OpenCode 提供 $10/月的 Go 订阅；Cursor 把 Grok、Cursor、X Premium 打包成 $8–$200/月的订阅。✅（[Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)、[OpenAI release notes](https://openai.com/products/release-notes/)、[OpenCode docs](https://opencode.ai/v2/docs)、[TechCrunch](https://techcrunch.com/2026/10/13/spacexsi-bundles-x-premium-grok-and-cursor-into-one-subscription/)）
- **治理**：
  - Anthropic 于 2026-09-01 在 Fable 5.1 / Mythos 5.1 上启用文本水印与 C2PA 内容凭证；11 月初有报道称水印范围扩大。✅ / 🟡
  - Claude Code 在 2026-10-27 左右通过服务端规则阻止“复刻特定现有游戏”，用户无法关闭；Anthropic 称依据使用政策中的知识产权条款。🟡（[gHacks 2026-11-02](https://www.ghacks.net/2026/11/02/anthropic-adds-a-claude-code-rule-on-opus-5-5-that-blocks-recreations-of-existing-games/)）
  - Anthropic 于 2026-10-26 向 SEC 提交 S-1；其模型页同时提到面向网络安全与生命科学的验证计划。✅（[Anthropic 2026-10-26](https://www.anthropic.com/news/s1-sec)）
  - 企业侧：Goldman 限制部分 AI 编码工具；美国国防部相关机构对 Claude 的使用受限（Wired 报道中提到）。🟡

### 来源

- Anthropic，Claude Opus 5.5 / Haiku 5.5，2026-09-22 / 2026-10-07，https://www.anthropic.com/claude-opus-5-5
- OpenAI，release notes，2026-10-29，https://openai.com/products/release-notes/
- Anthropic，S-1，2026-10-26，https://www.anthropic.com/news/s1-sec
- gHacks，Claude Code 游戏规则，2026-11-02，https://www.ghacks.net/2026/11/02/anthropic-adds-a-claude-code-rule-on-opus-5-5-that-blocks-recreations-of-existing-games/
- The Edge 转述 Bloomberg，Goldman，2026-11-02，https://www.theedgesingapore.com/news/us-stocks/goldman-restricts-traders-and-bankers-using-some-ai-tools--blo

### 确定性

价格、配额、S-1：✅。  
水印范围扩大、企业禁用细节：🟡。  
“订阅制会全面转向按量计费”：🔮，目前是混合模式，不能下结论。

### 对个人开发者的含义

给每个 agent 设预算和停止条件；把“模型 + 订阅 + 缓存”的成本拆开看；准备一个备用供应商，避免单一产品的配额或政策变化直接停掉你的工作流。

---

## 对个人开发者的建议

### 先做这三件

1. **默认沙箱 + 独立 worktree**。不要让 agent 在你的主 checkout 上直接跑；用 `claude --worktree`、Codex 的 managed worktree，或自己在容器/VM 里跑。沙箱不是防“AI 造反”，是防它把你的未提交改动、凭据和环境一起带走。
2. **把工作流做成可迁移资产**。`AGENTS.md`、`SKILL.md`、自定义命令、CI 钩子、评测用例，全部放进仓库。这样换 Claude Code、Codex、OpenCode 时，迁移的是配置而不是记忆。
3. **建一个 10–20 个任务的小评测集**。取自你真实的仓库：修一个 bug、加一个测试、做一次跨目录重构、审一个 PR。每次换模型或 harness 都跑，记录成功率、耗时、token 成本和人工返工次数。

### 再按优先级做

4. **按任务分层用模型**。难任务给 Opus 5.5 / GPT-6.1 Sol / Gemini 4 Argon；日常批处理给 Haiku 5.5 / GPT-6.1 Terra / Sonnet 5.5；子代理和审查用便宜型号。不要用一个旗舰模型跑所有事。
5. **把缓存命中率当成指标**。稳定系统提示、稳定工具定义、稳定前缀；把变化的内容放到后面。缓存读取价格通常是输入价的 1/10 到 1/20，长会话里这是最大的一项节省。
6. **多智能体只用于可验证的并行任务**。代码审查、批量修复、资料整理可以；需求探索、架构决策不要。给每个子任务写清楚验收标准，否则协调成本会超过收益。
7. **审查 MCP server 与 skill 的来源**。只装可信来源，限制网络出口，不给长期凭据；把 skill 当成代码来 review，尤其是会执行 shell 的 skill。
8. **给 agent 设预算与停止条件**。按会话或按任务设上限；超过就停，不要让它“再试一次”。长时程任务尤其要设“无进展即停”。
9. **保留人工 review 与提交签名**。AI 生成的 PR 要过 CI、要有人看 diff；对自动合并设门槛。Aur0ra 与 DOD 的案例都说明，agent 的“授权话术”可以绕过规则。
10. **关注条款与配额变化，准备备用方案**。订阅捆绑、限额调整、水印、内容规则、地区可用性，都会影响个人项目。至少准备一个开源 harness + 一个备用模型供应商。

### 一个简单的选型判断

- **任务短、上下文稳定、重复多**：便宜模型 + 强缓存 + 脚本化工具调用。
- **任务长、跨文件、需要判断**：旗舰模型 + 沙箱 + 小评测集 + 人工验收。
- **任务可并行、边界清楚**：多智能体或 workflow；否则单 agent。
- **任务涉及生产凭据、客户数据、合规**：先解决隔离与审计，再谈效率。

---

## 附：未证实或需继续观察的信息

以下内容在 11 月初的报道中出现，但没有官方发布，不应作为决策依据：

- **Claude Mythos 5.5 / Fable 5.5**：11 月 1 日 Decrypt、Startup Fortune 等报道称 Anthropic 网站与代码中出现相关名称，发布日期未确认。🔮
- **GPT-6.2 Astra**：11 月 1 日 TestingCatalog 等报道称在 Codex 使用记录中出现，可能是灰测；OpenAI 未发布。🔮
- **Jules 的具体停服日期**：The Verge 确认退场，但“11 月 11 日停止新任务、12 月 31 日停止服务”来自二手报道。🟡
- **“多智能体将取代单 agent”**：目前没有可靠证据；GDPx 与多 agent 实验反而显示协调成本高。🔮
- **厂商自报的基准与成本数字**：包括 Terminal-Bench、GDPx、Droid 的 51 倍 token 降低，测试条件与复现方式未完全公开。🟡

---

## 附：主要一手来源

- Anthropic Newsroom：https://www.anthropic.com/news
- Anthropic API release notes：https://platform.claude.com/docs/en/release-notes/overview
- Claude Code CHANGELOG：https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- OpenAI News / Release Notes：https://openai.com/news/、https://openai.com/products/release-notes/
- OpenAI Codex releases：https://github.com/openai/codex/releases
- Google Blog（Gemini 4）：https://blog.google/innovation-and-ai/models-and-research/gemini-models/
- Cursor Changelog：https://cursor.com/changelog
- OpenCode v2 Docs：https://opencode.ai/v2/docs
- AAIF Projects：https://aaif.io/projects
- AAIF News：https://aaif.io/news
- MCP Specification：https://modelcontextprotocol.io/specification/2026-07-28

> 说明：本文把“已确认的事实”和“推断/传闻”分开标注；厂商自报的基准数字保留原始口径，未做二次换算。星标数与版本号是 2026-11-03 的快照，会继续变化。
