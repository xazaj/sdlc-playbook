---
name: claude-code-everything
title: Claude Code：你需要知道的一切
summary: 以「何时用、何时跳过」的矩阵讲清 Claude Code 五个扩展点与四种并行协作方式，附可直接复制的实例仓库，模型与定价口径截至 2026 年 7 月。
date: 2026-09-23
source: https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know
author: Wesam Abousaid
tags: [claude-code, skills, hooks, subagents, workflows, agent-teams, mcp]
related: []
translated: true
---

这是一份 Claude Code 实战指南——从第一条 prompt 讲到多 agent 自动化、Hooks、MCP 与团队工作流。它围绕清晰的思维模型和真实可跑的示例构建，不搞营销话术；本库收录的是其中文全译。给谁读：正在用（或准备用）Claude Code 的开发者——新手拿到一条引导路径，重度用户拿到 Skills、Hooks、MCP、Agent Teams 的深度内容。

```bash
npm install -g @anthropic-ai/claude-code
```

## 按需取阅

| 你是谁 | 从这里开始 | 耗时 |
|---|---|---|
| 刚接触 Claude Code | 安装 → Prompt 工程深潜 → 第一个 Skill | 约 15 分钟 |
| 已经在用，想要深度 | Skills · Hooks · MCP | 每篇约 30 分钟 |
| 在搭团队或自动化 | 动态工作流 · Agent Teams · BMAD | 视情况 |

## 五个扩展点：何时用、何时跳过

Claude Code 的五个扩展点并排放在一张表里，判断标准是「重复到什么程度、要不要自动触发、任务有多大」：

| 工具 | 什么时候用 | 什么时候跳过 | 放在哪里 |
|---|---|---|---|
| **Skills**（斜杠命令） | 同一条 prompt 或工作流重复 ≥3 次 | 一次性任务 | `.claude/commands/*.md` |
| **Hooks** | 想让代码在工具调用、会话启动等时机**自动**执行 | 只想手动触发 | `.claude/settings.json` |
| **Subagents** | 子任务大到需要独立的上下文窗口 | 任务塞得进主会话 | `.claude/agents/*.md` |
| **Workflows** | 活儿需要的 agent 数量超出一场对话能协调的范围 | 一两个 subagent 就够 | `.claude/workflows/*.js` |
| **MCP servers** | 需要 Claude 使用**外部**工具（浏览器、数据库、API） | 数据都在本地文件里 | 按项目配置 |

这五个可以组合。打磨得好的配置通常组合其中两到三个。

## Claude Code 是什么

Claude Code 是 Anthropic 官方的终端 CLI。你把它指向一个项目，它读代码、做计划、改文件、跑命令、提交——全部从 prompt 行完成。它能做三件聊天界面做不到的事：

- **读你真实的仓库**——不是粘贴的片段。Claude 看到你的文件树，跑 `grep`，顺着 import 走，回答落在真实上下文里。
- **就地编辑并跑你的测试**——diff 感知的编辑，然后当场跑 `pytest`/`vitest`/`go test` 验证改动。
- **与你技术栈的其余部分组合**——斜杠命令、hooks、sub-agent、MCP server，加上你惯常的 git/shell 工作流。

用过 Copilot 或 Cursor 的话，可以把 Claude Code 当作它们的「终端里的 agent」同类：思路相同，界面不同，不被编辑器锁定。

```bash
claude          # 在当前仓库开始一个会话
> explain what this codebase does
> fix the failing test in src/api.test.ts
> open a PR with the changes
```

## Claude 5 时代的模型阵容

2026 年夏天三次发布接踵而至：**Claude Opus 4.8**（2026 年 5 月 28 日）接任 Opus 档旗舰；**Claude Fable 5** 与其受限的同胞 **Claude Mythos 5**（2026 年 6 月 9 日）在 Opus 之上开出新的 Mythos 级；**Claude Sonnet 5**（2026 年 6 月 30 日）成为 Claude Code 的默认模型。当前 Opus、Sonnet、Fable 系模型已标配 1M token 上下文——无 beta 开关、无长上下文加价——最大输出 128K。

| 模型 | 什么时候选它 |
|---|---|
| **Sonnet 5**（默认） | 日常编码，多数任务都在这一档。入门价 $2/$10 每 MTok 至 2026 年 8 月 31 日（之后 $3/$15） |
| **Opus 4.8** | 复杂推理、大型重构、编排 agent——$5/$25，与 4.7 持平 |
| **Fable 5** | 真正的难题——高于 Opus 的 Mythos 级能力，$10/$50 |
| **Haiku 4.5** | 快而轻的任务——快问快答、文档更新（$1/$5，200K 上下文） |

Opus 4.7/4.6 与 Sonnet 4.6 现为**旧模型**（仍可经 API 与 `/model` 使用）；Opus 4.1 于 2026 年 8 月 5 日退役。**Mythos 5** 与 Fable 5 是同一底层模型、安全护栏更少——仅限获准组织经 Project Glasswing 邀请使用。完整规格、能力与定价见仓库的 [docs/reference/models.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/models.md)。

## 安装与上手

五分钟从零到第一次 AI 辅助提交。

1. 安装：`npm install -g @anthropic-ai/claude-code`。需要 Node.js 18+；其他安装方式（Homebrew、curl、原生二进制）见[官方安装指南](https://code.claude.com/docs/en/setup)。
2. 认证：首次运行 `claude` 会打开浏览器登录 Anthropic 账号（Pro、Max、API key 都行）。之后在会话内用 `/login`、`/logout` 随时重认证，或在 shell 里 `claude auth login|status|logout`。
3. 跑第一条 prompt：进任意项目目录执行 `claude`，然后试 `explain what this codebase does`（读仓库并总结）、`add a README section about installation`（按项目生成内容）、`find and fix the failing test in src/api.test.ts`（诊断并就地修复）。
4. 可选，生成 `CLAUDE.md`：运行 `/init`，生成项目级指令文件——Claude 每次会话都读它，相当于项目的「家规」。
5. 附赠，直接搬走这个仓库的配置。本仓库的 [`.claude/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude) 目录是一个**能跑的** Claude Code 项目——每种扩展点各有一份实物，不是截图：

| 路径 | 拿到什么 | 什么时候抄 |
|---|---|---|
| [`.claude/commands/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/commands) | 7 个斜杠 Skill——`/pr`、`/review`、`/tdd`、`/test`、`/five`、`/ux`、`/todo` | 想要 PR 规范与评审严格性，又不想自己写 prompt |
| [`.claude/skills/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/skills) | 一个 Agent Skill——`/claude-md-review` 审计 `CLAUDE.md` 的含糊、死路径与臃肿 | 想要一份 frontmatter 契约的完整范例 |
| [`.claude/agents/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/agents) | 5 个 subagent，另有 10 个角色 prompt 在 `specialized-agents/` | 想要专家角色又不想自己写——它们同时可作 Agent Teams 队友 |
| [`.claude/workflows/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/workflows) | 一个动态 workflow——`/stale-docs-audit` 把 agent 扇出到全部文档，然后反驳自己的发现 | 想先读一个真实脚本再写自己的 |
| [`.claude/hooks/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/hooks) | Python hooks——`post_tool_use.py`、`notification.py`、`stop.py`、`subagent_stop.py` | 想要生命周期自动化（需要 [uv](https://docs.astral.sh/uv/getting-started/installation/)） |
| [`.claude/settings.json`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/.claude/settings.json) | 权限与 hook 接线 | 抄 hooks 时记得把硬编码的 uv 路径换成 `$(which uv)` |

```bash
git clone --depth 1 https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know /tmp/cc-guide
cp -r /tmp/cc-guide/.claude/commands/pr.md  your-project/.claude/commands/   # take what you want
```

复制之前先读一遍：Skills、hooks、agents、workflows 都是以你的权限运行的可执行指令——包括来自这个仓库的。逐个文件复制并逐个读过，就像 source 一个 shell 脚本之前先审一遍；别整目录 `cp -r` 一个没打开过的 `.claude/`。

## Prompt 工程深潜

`CLAUDE.md` 会成为 Claude prompt 的一部分，所以要像打磨常用 prompt 一样打磨它。常见错误是往里堆内容却从不迭代验证效果。

### 1. 探索 → 计划 → 编码 → 提交

适合复杂问题的通用流程。探索阶段读相关文件、图片、URL，用 subagent 交叉验证，**先不写代码**；计划阶段让 Claude 出计划，在 prompt 里写 `think`、`think hard`、`think harder` 或 `ultrathink` 拨深思考（完整旋钮见下文 effort levels），可存档备用；编码阶段实现方案，边写边验证合理性；最后提交、开 PR、更新 README/changelog。Claude 有两个默认模式：Plan Mode 与 Accept Edits Mode，用 `Shift + Tab` 切换。

![Plan Mode 界面](/sdlc-playbook/articles/claude-code-everything/01-plan-mode.png)

![Accept Edits Mode 界面](/sdlc-playbook/articles/claude-code-everything/02-accept-edit-mode.png)

复杂任务先研究、先计划，产出质量显著更好。

### 2. 测试驱动工作流

适合能用单元/集成测试验证的改动。先按预期输入输出写测试并标记 TDD；跑一遍确认失败，此时不写实现；满意后提交测试；再写实现让测试通过，期间用 subagent 验证；全部通过后最终提交。清晰的目标（测试、mock）能显著提高迭代效率。

### 3. 视觉迭代工作流

提供截图或视觉稿，实现代码、截图、迭代直到产出与稿一致，满意后提交。通常 2–3 轮迭代就够。

### 4. Effort levels：Claude 想多用力

思维模型：effort 是**行为旋钮**，不是 token 预算——它改变思考深度、工具调用意愿、回答长度，以及 Claude 在多步工作上的韧性。档位高不等于更聪明；上下文质量常常更重要。API 有 5 档（`low` → `max`，默认 `high`）；Claude Code 在此之上加了第六档：

| 档位 | 什么时候用 |
|---|---|
| `low` | 你在实时掌舵的快问答——改文件名、简单 grep |
| `medium` | 一般编码、小重构、计划已明确的自助会话 |
| `high` | 多文件重构、复杂排查——当前模型的默认档 |
| `xhigh` | 长自助 agent 会话（Fable 5、Mythos 5、Opus 4.8/4.7、Sonnet 5） |
| `max` | 架构、隐蔽 bug、安全评审——真正的难题专用。仅限当次会话 |
| `ultracode`（仅 Claude Code） | `xhigh` 推理**外加**自动多 agent [workflow 编排](https://code.claude.com/docs/en/workflows)。仅限当次会话 |

2026 年 7 月的默认值：Opus 4.8 全端 `high`；Sonnet 5 在 API 与 Claude Code 上 `high`。用 `/effort` 查看当前值。史注：2026 年 4 月的 Claude Code v2.1.117 在三月的「削弱版 medium」事件后，首次把 Pro/Max 默认统一为 `high`。

按持久化程度从短到长设置：

```bash
# This turn only — adds an in-context cue (does not change API effort)
> ultrathink — design the migration strategy

# This session — slider with no args, level name with arg
/effort xhigh
/effort ultracode               # xhigh + automatic multi-agent workflows
/effort auto                    # reset to model default

# All sessions (low/medium/high/xhigh) — add this key to .claude/settings.json:
#   "effortLevel": "high"
# max and ultracode are session-only by design and can't be persisted.
```

两个值得知道的坑：`max` 在常规工作上收益递减且更容易过度思考——这是 Anthropic 自己的指引，别当默认档用；上下文质量常常胜过更高 effort，如果你在为一个不该用 max 的任务够 max，八成问题在上游——`CLAUDE.md` 更锋利、计划更原子、点名文件。完整拆解见仓库的 [docs/reference/effort-levels.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/effort-levels.md)。

一个模式：**Opus 出计划、Sonnet 执行**。用 Opus 4.8（或 Fable 5）在 xhigh 或 max 出计划；把原子的、零歧义的计划交给 Sonnet 5 在更低档位执行。Sonnet 跟随清晰计划不漂移，计划锋利时廉价执行就是可靠的。

## 命令

Claude Code 自带几十个内建斜杠命令（[官方参考](https://code.claude.com/docs/en/commands)），也允许用 Skill（`.claude/commands/` 里的 markdown 文件）自定义。两者配合：内建的管常见操作，自定义的管团队工作流。

第一天就该会的：

| 命令 | 用途 |
|---|---|
| `/init` | 为项目生成 `CLAUDE.md`——Claude 每次会话都读的「家规」 |
| `/help` | 列出全部可用命令 |
| `/clear` | 想要干净起点时重置对话历史 |
| `/usage` | 跟踪 token 与套餐用量（v2.1.118 起 `/cost` + `/stats` 合并而来） |
| `/model` | 切换模型——选择会成为新会话默认（按 `s` 仅本次会话） |

精心筛选的速查表（含 `/fast`、`/hooks`、`/mcp`、`/teleport`、`/workflows`、`/rewind` 等）在仓库的 [docs/reference/commands.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/commands.md)。自定义斜杠命令与 Skills 是同一件事——见下节。

## Skills

思维模型：Skill 把一个工作流打包进一个 markdown 文件。两种等价格式，官方已统一为一个系统——**斜杠 Skill**（`.claude/commands/<name>.md`，用 `/<name>` 调用）与 **Agent Skill**（`.claude/skills/<name>/SKILL.md` 带 YAML frontmatter；描述匹配任务时 Claude 也可自动调用）。`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都生成 `/deploy`。Skill 遵循开放的 [agentskills.io](https://agentskills.io) 标准，Claude Code 之外约 40 个产品采用（Codex、Copilot、Cursor、Gemini CLI……）。

安全提醒：Skills 是以你的 shell 权限运行的可执行指令。添加任何第三方 skill 前先通读——如同 source 前先审 shell 脚本。

![Skill 解析顺序：键入 /name 或 Claude 匹配 description，都进入同一次查找——先项目 .claude/，再用户 ~/.claude/，再插件，再内建，首个命中生效](/sdlc-playbook/articles/claude-code-everything/03-skill-resolution.svg)

项目级压过用户级压过内建——本仓库自定义的 `/review` 就是故意遮蔽内建版本。斜杠 Skill 在 `/` 自动补全时加载；Agent Skill 只预载元数据，正文按需读取。完整查找表见 [docs/skills.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/skills.md)。

三分钟写出第一个 Skill：

```bash
mkdir -p .claude/commands

cat > .claude/commands/analyze.md << 'EOF'
# Code Analysis

Analyze the current code for:
- Potential bugs and edge cases
- Performance optimizations
- Code quality improvements
- Security vulnerabilities

Provide specific, actionable recommendations.
EOF

claude       # then type: /analyze
```

这就成了一个能用的斜杠 Skill。之后想升级成 Agent Skill，把它移到 `.claude/skills/analyze/SKILL.md` 并加 `name`/`description` frontmatter 即可。

[docs/skills.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/skills.md) 的完整指南覆盖：本仓库自带的 8 个 Skill（`/pr`、`/review`、`/tdd`、`/test`、`/five`、`/ux`、`/todo` 加 Agent Skill `/claude-md-review`）；内建捆绑 Skill（如 `/dataviz`、`/debug`、`/keybindings-help`）；斜杠 Skill 与 Agent Skill 之别及完整 frontmatter 参考——包括为什么 `allowed-tools` 是**授予**而非限制权限；工作流配方（TDD + PR 的特性开发、bug 调查、UX 优先开发）；怎么写自己的 Skill；以及 FAQ 与排障。

生态方面，社区已建起庞大的 Agent Skill 目录。三个入口：[anthropics/skills](https://github.com/anthropics/skills)（Anthropic 官方 Skill——PDF、幻灯片、品牌规范、文档创建，158k+ star）；SkillHub、SkillsMP、Smithery、skills.sh 等可搜索市场；travisvn 与 ComposioHQ 的 awesome-claude-skills 精选列表。值得知道的名字：`skill-creator`、`skill-installer`、`mcp-builder`、`systematic-debugging`、`pair-programming`、`github-code-review`、`pptx`、`react`、`frontend-design`、`prompt-engineering-patterns`、`superpowers`、`brainstorming` 等。

## Hooks

思维模型：Hook 是挂在 Claude Code 生命周期上的可编程检查点（工具调用前后、会话启动、prompt 提交等）。你的脚本检视即将发生的动作，返回 allow / deny / modify。

最能说服团队的三件事：**保存即自动格式化**——每次 Edit 后跑 `prettier`/`ruff`/`gofmt`，让 Claude 的输出符合你的风格；**封锁敏感路径**——无论 Claude 怎么尝试，拒绝改动 `.env`、`secrets/`、`infra/prod/`；**动作审计日志**——把每次工具调用记入文件，留下 Claude 做过什么、何时做的纸面记录。这三件都不心动的话，可以跳过本节。

![Hooks 工作流](/sdlc-playbook/articles/claude-code-everything/04-hooks-workflow.png)

### 配置

Hook 写在四个层级的 settings 文件里（后者覆盖前者）：用户级 `~/.claude/settings.json`；项目级（入库）`.claude/settings.json`；项目本地（gitignore）`.claude/settings.local.json`；企业托管策略（按平台）。最快的方式是交互菜单：`/hooks` 浏览、启用、配置，不碰 JSON。手动配置（针对本仓库的脚本）：把 `.claude/hooks/` 拷进项目，删掉不需要的脚本，装 uv，拷 `.claude/settings.json`，并把其中硬编码的 uv 路径换成 `$(which uv)` 的输出。

### 事件

Hook 响应 Claude Code 生命周期中的各类事件（示例见 [claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)）：

- **`PreToolUse`**：在 Claude 生成工具参数之后、处理调用之前运行。
- **`PostToolUse`**：工具成功完成后立即运行。
- **`Notification`**：Claude Code 发通知时运行，例如需要权限或输入闲置。
- **`UserPromptSubmit`**：用户提交 prompt 后、Claude 处理前运行。
- **`Stop`**：主 agent 结束回答时运行（用户打断则不触发）。
- **`SubagentStop`**：subagent（Task 工具调用）结束回答时运行。
- **`SessionEnd`**：会话结束时运行。
- **`PreCompact`**：即将执行 compact 之前运行。
- **`SessionStart`**：新会话开始或恢复时运行。
- **`TeammateIdle`**：Agent Teams 的队友空闲时运行——退出码 2 把队友打回去干活。
- **`TaskCompleted`**：任务被标记完成时运行——退出码 2 阻止这次完成。

以上是最高频的事件。完整目录共 **30 个事件**（SubagentStart、PermissionRequest、FileChanged、WorktreeCreate、PostCompact……），见[官方 hooks 参考](https://code.claude.com/docs/en/hooks)。

### 输入与输出

Hook 经 **stdin 收 JSON**。每个事件都带 `session_id`、`transcript_path`、`cwd`；事件专属字段如 `PreToolUse` 的 `tool_name`、`tool_input`，`PostToolUse` 再加 `tool_response`，`Notification` 的 `message`，`UserPromptSubmit` 的 `prompt`，`Stop`/`SubagentStop` 的 `stop_hook_active`，`PreCompact` 的 `trigger` 与 `custom_instructions`，`SessionStart` 的 `source`，`SessionEnd` 的 `reason`，`TeammateIdle` 的 `teammate_id` 与 `last_activity`，`TaskCompleted` 的 `task_id`、`task_name`、`completion_time`。（`TaskCreated`/`TaskCompleted`/`TeammateIdle` 载荷里的 `team_name` 自 v2.1.178 起已弃用——现在每会话一个隐式团队。）

往回通信有两条路：简单控制用**退出码**，细粒度行为用 **stdout 的 JSON**。退出码 `0` 成功（stdout 显示在 transcript 模式；对 `UserPromptSubmit`/`SessionStart`，stdout 会进入 Claude 的上下文）；`2` 阻断（stderr 回喂 Claude 或显示给用户以阻止动作——在 `PreToolUse` 停工具调用，在 `UserPromptSubmit` 停 prompt 处理）；其他码显示 stderr、继续执行。结构化 JSON 方面：`PreToolUse` 可返回 `permissionDecision`（`allow`/`deny`/`ask`）与修改参数的 `updatedInput`；`PostToolUse` 与 `UserPromptSubmit` 可返回 `decision: block` 与 `additionalContext`；`Stop`/`SubagentStop` 可返回 `decision: block`；`SessionStart` 可返回 `additionalContext`。

### 安全与执行

Hook 以你的用户权限**自动运行任意 shell 命令**——能读、改、删你能碰的任何文件，Anthropic 对你的 hook 做什么不提供担保。实践清单：校验并清洗 stdin JSON 的全部输入；shell 变量加引号（`"$var"` 不是 `$var`）；封死路径穿越（`..`、项目外绝对路径）；被调脚本用绝对路径，防 PATH 劫持；显式跳过敏感文件（`.env`、`.git/`、`secrets/`）。Claude Code 会在会话开始时快照 hook 配置，会话中途变更会告警——应用前先审。

执行细节：超时按类型而异——`command`/`http`/`mcp_tool` hook 600 秒，`prompt` hook 30 秒，`agent` hook 60 秒（个别事件更低，如 `UserPromptSubmit` 的 command hook 30 秒），可按 hook 配置；所有匹配的 hook 并行执行，相同处理器自动去重；hook 在当前目录、Claude Code 的环境里运行，可用 `CLAUDE_PROJECT_DIR`。排障：`/hooks` 看当前配置，`claude --debug` 看 hook 执行日志，手动测脚本时把 JSON 载荷 pipe 给 stdin。

## Subagent 与并行运行 agent 的四种方式

Claude Code 有**四种**同时跑 agent 的方式，容易混淆。先问一个分辨它们的问题：**谁来协调工作**？

| 方式 | 谁协调 | 什么时候用 |
|---|---|---|
| **Subagents**（下文） | Claude，逐轮，在一个会话内 | 一项支线任务会用搜索结果、日志、文件内容淹没主对话，而你不会再引用它们 |
| **Agent view**——`claude agents`（研究预览） | **你**——派出去，回头来看 | 有几件独立任务，想派发、扫一眼状态、只在某件需要时介入。每个派发的会话**自动配独立 worktree** |
| **Agent Teams**（实验性） | 一个 lead agent 监管平级会话 | 工作成员需要**互相对话**——共享发现、互相挑战、从共享任务列表自领任务 |
| **动态工作流** | **一个脚本**，不是 Claude 的判断 | 活儿超出了几个 subagent 的规模，或想要发现互相交叉核验：全库审计、500 文件迁移 |

另有两个不构成独立协调方式的支撑工具：**git worktree**——多份检出让并行会话永不碰同一批文件；**`/batch`**——内建 Skill，研究代码库、把一个大改动拆成 **5–30 个独立单元**，每单元在自己 worktree 里起一个后台 subagent 并各开一个 PR。查正在跑的工作：当前会话的后台任务用 `/tasks`，后台会话用 `claude agents`，workflow 运行用 `/workflows`。注意 `/agents`（v2.1.198 已移除的向导）与 `claude agents` 完全是两回事。

### 1. Git worktree：并行分支，并行会话

[git worktree](https://git-scm.com/docs/git-worktree) 让一个仓库同时检出多个分支，各自一个目录。配上「每个 worktree 一个 Claude Code 会话」，就能跑多条独立工作流：

```bash
git worktree add -b feature-a ../feature-a    # create the worktree
cd ../feature-a && claude                     # start Claude in it
# Repeat in another terminal for feature-b. Each session is independent.
git worktree remove ../feature-a              # clean up when done
```

![三个终端各建一个 worktree，然后确认分支各自独立检出](/sdlc-playbook/articles/claude-code-everything/05-work-trees.png)

用 [tmux](https://github.com/tmux/tmux/wiki/Installing) 让每个 worktree 的会话在关掉终端后仍挂着。不想手动管的话：`claude agents`（agent view）给每个派发会话**自动**配 worktree，`/batch` 对每个工作单元做同样的事。

### 2. 通用 subagent：一个 Claude 不够时

在主会话里让 Claude 为并行子任务派 subagent。每个 subagent 跑在自己的上下文窗口里，汇报摘要回来，主会话保持专注：

```markdown
Analyze the implementation of the payment feature.
Spawn 5 subagents to accelerate the work.
Ultrathink.
```

![同一条派发 prompt 输入三个独立会话](/sdlc-playbook/articles/claude-code-everything/06-agents-prompt.png)

![每个会话并发跑五个 subagent，各有自己的工具调用与 token 计数](/sdlc-playbook/articles/claude-code-everything/07-subagents.png)

### 3. 专门化 subagent：拿来即用的角色 prompt

专门化 agent 是预写好的角色 prompt，放进 `.claude/agents/` 即用。每个自带焦点与工具面——`security-reviewer` 只盯威胁，不顺便点评代码风格。一个 agent 就是一个带 YAML frontmatter 的 markdown 文件——建 `.claude/agents/security-reviewer.md`，或让 Claude 写（旧的 `/agents` 向导已于 v2.1.198 移除）：

```markdown
---
name: security-reviewer
description: Use after changes touching auth, input handling, or secrets — reviews diffs for vulnerabilities.
tools: Read, Grep, Glob
---

You are a security engineer. Review the changes for injection risks,
secrets in code, authZ/authN gaps, and unsafe input handling. Report
findings by severity with concrete fixes.
```

`description` 是主会话决定何时委派的依据——写两三句「何时用」的判据；frontmatter 之下的正文就是该 agent 的系统提示。本仓库的 [`.claude/agents/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude/agents) 有五个能跑的例子。

仓库还带 **10 个生产可用的专家 prompt**，放进 `.claude/agents/` 即用：Backend Engineer、Frontend Engineer、Database Engineer、Tech Lead、Code Reviewer、Security Reviewer、UX Engineer、Design Reviewer、Project Manager、Business Analyst——每种一份系统提示加一份角色描述，都在 [`specialized-agents/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/specialized-agents)。

有了专门化 agent，主会话按名字编排它们：

```markdown
Have backend-engineer suggest UI improvements; have frontend-engineer
implement them; have code-reviewer review the changes; have
frontend-engineer address the review feedback.
```

![十个角色 prompt 的画板，从一个通用 agent 扇形展开](/sdlc-playbook/articles/claude-code-everything/08-orchestration.png)

那块画板是 [`specialized-agents/agent-orchestration-workflow.canvas`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/specialized-agents/agent-orchestration-workflow.canvas)——用 Obsidian 或任何 canvas 兼容查看器打开，可并排读全部 prompt。同一批 prompt 也可直接当 **Agent Teams 的队友**。

## Agent Teams（实验性）

Agent Teams 是实验性功能：一个 Claude Code 会话通过**共享任务列表**协调**多个专家 agent**。主会话当队长；队友各自做任务（有时并行）、汇报进展、更新共享列表。整栈特性、大型重构、多视角真正有益的场合用它；单文件修改和快修不用。

开启方式：`export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`（写进 `~/.zshrc` 持久化），或更稳地在 `settings.json` 里写 `{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }`。

大多数「起 N 个队友」的 prompt 用 subagent 一样能跑，下面这个不能——它需要队友**互相对话**：

```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

辩论结构本身就是机制。顺序调查会锚定：第一个理论被展开后，后面一切都偏向它。让独立调查者主动互相反驳，活下来的理论才更可能是真正的根因。

队友可以**从 subagent 定义生成**——本仓库的 `.claude/agents/` 与 10 个专家 prompt 因此既是 subagent 也是队友：`Spawn a teammate using the security-reviewer agent type to audit the auth module.` 会遵守该定义的 `tools` 白名单与 `model`，正文**追加**到队友的系统提示后面（`skills` 与 `mcpServers` frontmatter 对队友**不**生效）。

三件最容易踩的事：**队友不继承 lead 的 `/model`**——在 `/config` 里设 Default teammate model（选 Default (leader's model) 则跟随 lead），或每次生成时点名模型；队友继承 lead 的 effort 档位，模型与 fast mode 在生成时固定，`/model` 与 `/fast` 只对 lead 生效。**队友拿不到 lead 的对话历史**——它们照常加载 `CLAUDE.md`、MCP server 与 Skill，任务相关信息必须写进生成 prompt。**没有 worktree 隔离**——与 agent view 不同，teams 不隔离队友，两个队友改同一文件就是硬覆盖，文件划分要自己做。

监控在 prompt 输入框下方的 **agent 面板**：`↑`/`↓` 选择，`Enter` 打开转录并直接给该队友发消息，`Esc` 打断，`Ctrl+T` 看任务列表。消失的空闲行是**隐藏而非停止**——队友下一轮回来。注意 `claude agents` 打开的是 agent view（后台会话的另一个界面），不是队伍监控；subagent 与队友显示在同一个 agent 面板里，看到行不能证明队伍真的成立了。

最佳实践：

| 该做 | 别做 |
|---|---|
| 从 **3–5 个队友**、每人约 5–6 个任务起步 | 工作还没到规模就扩编——三个专注的胜过五个散的 |
| 给每个队友互不重叠的文件切片 | 让两个队友改同一个文件 |
| 任务细节写进生成 prompt | 假设队友看过你的对话 |
| 给队友起可寻址的描述性名字 | 用 `agent1`、`agent2` |
| 学习期先从**研究与评审**开始 | 一上来就并行实现 |
| 用 `TaskCompleted` hook 把关「完成」（退出码 2 阻断） | 让队友在测试还红着时宣布胜利 |

完整指南在仓库的 [docs/agent-teams.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/agent-teams.md)——显示模式、计划审批、邮箱架构、权限、hooks、排障与坦诚的局限清单。权威参考：[code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams)。

## 动态工作流

思维模型：动态 workflow 是**一个编排 subagent 的 JavaScript 脚本**。Claude 按你描述的任务写脚本；运行时在后台执行它，会话保持响应。本页其余一切都是 Claude 逐轮决定下一步跑什么——在这里，**计划握在脚本手里**。

两个后果让它超越「更多 agent」：**你的上下文保持干净**——中间结果存在脚本变量里，不在 Claude 的上下文窗口里，所以 workflow 能协调 200 个 agent，而一场对话连 10 个都协调不动；**质量模式变得可复用**——脚本可以让独立的 agent 在汇报之前**互相反驳对方的发现**，或从多个角度起草计划再权衡，每次运行同一个结构。

两分钟试一次，不用写脚本：

```text
/deep-research What changed in the Node.js permission model between v20 and v22?
```

`/deep-research` 是内建的。它从多个角度扇出搜索、交叉核验来源、对每条断言投票，返回带引用的报告——未通过交叉核验的断言已被过滤。批准运行后用 `/workflows` 看阶段、agent 数与实时 token 花费。

起步路径：单个任务，在 prompt 里说 `ultracode` 或「用一个 workflow」；整个会话，`/effort ultracode`（或 `claude --effort ultracode`），Claude 会为每件实质性任务规划 workflow；永久化，运行 `/workflows`、选一次运行、按 `s` 把脚本存进 `.claude/workflows/`——它成为 `/<name>`，克隆仓库的人人可用。

三个能稳定改善 Claude 所写脚本的短语：**adversarially verify each finding**（让怀疑者 agent 试图反驳结果）；**in its own isolated copy**（每个 agent 一个 git worktree，并行编辑不冲突）；**until two rounds in a row find nothing new**（用收敛条件替代拍脑袋的次数）。本仓库带一个能跑的：[`.claude/workflows/stale-docs-audit.js`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/.claude/workflows/stale-docs-audit.js)——每个文档文件一个读者 agent，然后独立的怀疑者试图反驳每条发现，之后才汇报。克隆后运行 `/stale-docs-audit`。

两件出人意料的事：workflow 派生的 subagent **始终以 `acceptEdits` 运行**，不管你会话的权限模式如何——文件编辑自动批准；停止运行时仍在跑的 agent 不被缓存，所以**多个小 agent 比少数大 agent 在恢复时保住多得多的进度**。上限：**16 个并发 agent**、**每次运行 1000 个**、运行中不能接受用户输入、仅同会话内可恢复。成本控制在 `/config`（Dynamic workflow size，默认 `medium` ≈ 15 个 agent 以内）——最便宜的习惯是先在一个目录上跑，再上全仓库。

## 不止一个终端：2026 年的自动化版图

2026 年年中，Claude Code 长出一组与上述一切可组合的编排能力：

| 能力 | 做什么 | 文档 |
|---|---|---|
| **云代码评审** | `/code-review ultra` 在云端跑多 agent 评审（别名 `/ultrareview`——Pro/Max 每月 3 次免费，之后扣用量额度）；`claude ultrareview` 非交互运行，供 CI | [commands](https://code.claude.com/docs/en/commands) |
| **Routines** | `/schedule`（别名 `/routines`）在 Anthropic 托管的云基础设施上跑定时 agent；本地调度用 `/loop` 与 Cron 工具 | [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) |
| **Artifacts**（beta） | 从 CLI 直接发布活的可分享网页到 claude.ai——Pro/Max/Team/Enterprise，CSP 沙箱，16 MiB 上限 | [artifacts](https://code.claude.com/docs/en/artifacts) |
| **Auto memory** | 默认开启——Claude 在 `~/.claude/projects/<project>/memory/` 维护项目记忆，带 `MEMORY.md` 索引；用 `/memory` 管理 | [memory](https://code.claude.com/docs/en/memory) |
| **Claude in Chrome** | 驱动浏览器的 agent，v2.1.198（2026 年 7 月 1 日）起 GA | — |

Subagent 也在变利：默认**后台运行**（v2.1.198）、可嵌套 **5 层**（v2.1.172）、`claude agents` 打开实时多 agent 仪表盘（研究预览）。`/agents` 设置向导已移除——直接编辑 `.claude/agents/` 定义 agent，或让 Claude 写。

## MCP（Model Context Protocol）

思维模型：MCP 是一台万能翻译机，让任何 AI 工具经一个开放协议对话任何数据源——AI 集成的 USB-C。

### 精选 MCP server

完整配置走查在仓库的 [`mcp-servers/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/mcp-servers)。新手从 [`mcp-servers/playwright.md`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/playwright.md) 开始，三行配置就能跑。

| Server | 增加什么 | 走查 |
|---|---|---|
| **Serena** | 跨多语言的符号级代码导航与编辑 | [serena.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/serena.md) |
| **Sequential Thinking** | 把复杂问题拆成可管理步骤的分步推理 | [sequential-thinking.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/sequential-thinking.md) |
| **Memory** | 跨会话的持久上下文 | [memory.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/memory.md) |
| **Playwright** | 浏览器自动化——交互、抓取、测试、无障碍 | [playwright.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/playwright.md) |

[`mcp-servers/README.md`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/mcp-servers/README.md) 有对照矩阵、安装命令与排障；它的一条建议值得先记：同时只保留 3–6 个 MCP server——每个接入的 server 都往 Claude 的上下文里加工具。

更多值得知道的 server：**Context7**（把按版本钉住的实时库文档喂进 prompt，[upstash/context7](https://github.com/upstash/context7)）、**Tavily**（为 agent 设计的搜索与页面抽取，[tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp)）、**Chrome DevTools**（驱动真实 Chrome——DOM、网络日志、控制台、性能轨迹、截图，[ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)）、**mem0**（托管长期记忆，跨会话跨项目语义召回，[mem0ai/mem0](https://github.com/mem0ai/mem0)）。专用类按工作流取用：**context-mode**（按需打包项目上下文，多仓库场景）、**Shadcn**（把组件源码拉进会话）、**LangSmith**（在终端里追踪评估 LLM 应用）、**TrustGraph**（知识图谱 RAG）。

### MCP 解决的 N×M 问题

![MCP 之前的 N×M 问题](/sdlc-playbook/articles/claude-code-everything/09-mcp-nxm.png)

MCP 之前，每个 AI 应用要为每个工具写一份定制集成：`n` 个应用 × `m` 个工具 = `n × m` 条脆弱的一次性连接。同公司内部也会反复重造同一个 Slack/GitHub/Postgres 集成。

![没有 MCP 与有 MCP 的对比](/sdlc-playbook/articles/claude-code-everything/10-mcp-with-without.png)

MCP 把它塌缩成 **N + M**：每个应用实现一次 MCP，每个工具暴露一次 MCP，任意组合都能协作——与 Web API 之于应用与服务器、LSP 之于编辑器与语言工具是同一个模式。

![协议的演化](/sdlc-playbook/articles/claude-code-everything/11-mcp-protocols.png)

### 三根支柱

![MCP 三根支柱](/sdlc-playbook/articles/claude-code-everything/12-mcp-pillars.png)

每根支柱让所有权明确，谁在驱动始终清楚：**Tools** 由模型控制，让 AI 行动——查库、调 API、写文件；**Resources** 由应用控制，喂 AI 结构化上下文——文件、错误日志、JSON 对象；**Prompts** 由用户控制，斜杠命令式快捷方式，启动多步工作流。

### 注册表与自我发现的 agent

![agent 现学新能力](/sdlc-playbook/articles/claude-code-everything/13-mcp-registry.png)

[官方 MCP Registry](https://registry.modelcontextprotocol.io/)（2025 年 9 月起公开预览）是 MCP server 的应用商店。一个要看 Grafana 日志却没有 Grafana 工具的 agent，可以查询注册表、找到验证过的 server、装上、继续——当场给自己教会一项新能力。

### 生态现状

中立治理——MCP 于 2025 年 12 月与 Block 的 goose、OpenAI 的 AGENTS.md 一同捐给 [Agentic AI Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)（Linux 基金会定向基金）。注册表——官方与社区 server 在 registry.modelcontextprotocol.io 可搜（官方仍标预览）。MCP Apps——第一个官方扩展（2026 年 1 月）：server 可以在沙箱 iframe 里带交互 UI 组件，不再只有文本工具。规范节奏——现行批准版 2025-11-25；[2026-07-28 候选版](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)（无状态内核、官方扩展）是发布以来最大修订。规模——截至 2025 年 12 月，SDK 月下载 9700 万+，活跃 server 约 1 万个。

```bash
claude mcp add <server> npx '@<package>@latest'   # install a server
claude mcp login <server>                          # OAuth sign-in (v2.1.186+)
/mcp                                               # list connected servers
```

## Fast Mode

`/fast` 切换快速模式——输出最快快 **2.5 倍**、价格 **2 倍**，跑在 **Opus 4.8** 上（v2.1.154 起的默认快速模式模型）。仅 CLI，需 v2.1.36+。**↯** 指示符亮起即已开启。订阅套餐上，fast mode 扣的是用量额度而非套餐限额。

| | 标准 Opus 4.8 | Fast Mode（Opus 4.8） |
|---|---|---|
| 输入（每 MTok） | $5 | $10（2 倍） |
| 输出（每 MTok） | $25 | $50（2 倍） |

旧 Opus 上的 fast mode 正在退场：Opus 4.7 fast（$30/$150）6 月 25 日弃用、**2026 年 7 月 24 日移除**；Opus 4.6 自 6 月 29 日起悄悄以标准速度运行。别把工作流建在两者之上。

```bash
/fast                                    # toggle on (↯ appears)
> fix the auth bug in src/login.ts       # faster output
/fast                                    # toggle off when done
```

决策规则：延迟重要时用（现场调试、演示准备、限时修复）。2 倍价格比旧的 6 倍好下决心得多——但后台工作仍然不需要它。用 `/usage` 监控。

## Super Claude 框架

Super Claude 是套在 Claude Code 之上的开源框架，提供预建的角色、命令与工作流：15+ 现成专家 agent（架构、安全、性能、前端等）、一批结构化斜杠命令（`/sc:analyze`、`/sc:improve`、`/sc:design`）与行为开关，装进 `~/.claude/` 即成 Claude Code 的扩展。配对价值：跳过「自己写角色 prompt」阶段，直接拿到社区迭代过的专家库——既当日常工具，也当学习 prompt 写法的范例库。想要预建专家又不想自建，或想靠读好范例学 prompt 模式时用它。[源码](https://github.com/SuperClaude-Org/SuperClaude_Framework)。

## BMAD 方法

BMAD（Breakthrough Method of Agile AI-driven Development）是一个多 agent 框架，用一组定义好角色的 Claude agent 把项目从想法走到可运行软件：分析师、PM、架构师、开发者、QA、Scrum Master 协同贯穿完整 SDLC，每个角色产出特定工件（PRD、架构文档、story 文件）供下一个角色消费，以 Claude Code 扩展（skills 与 agents）形式工作。配对价值：为绿地项目提供有文档、可重复的工作流——不是对 Claude 说「给我做个应用」，而是走完分析师 → PM → 架构师 → 开发者 → QA，每个 agent 产出结构化输出喂给下一个。绿地项目、大型特性、想在写码前上规划纪律时用；快修或单文件重构是杀鸡用牛刀。[源码](https://github.com/bmad-code-org/BMAD-METHOD)。

## 常见问题

完整 FAQ（模型、定价、token、套餐、Fast Mode、worktree、Pro 套餐优化）在仓库的 [docs/reference/faq.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/faq.md)。被问得最多的几条：

**Pro 套餐每 5 小时多少条消息？** Anthropic 已不再公布确切数字——第三方估计 Pro 约每 5 小时窗口 ~45 条，且 Claude Code 的五小时限额已于 **2026 年 5 月 6 日翻倍**（[公告](https://www.anthropic.com/news/higher-limits-spacex)）。

**Pro、Max 5x、Max 20x 差在哪？** Pro $20/月，Max 5x $100/月起（5 倍用量），Max 20x $200/月（20 倍用量）。所有付费档都含 Claude Code 与当前模型阵容——Fable 5 扣用量额度而非套餐限额。

**该用 Fast Mode 吗？** 现在跑在 Opus 4.8 上，2 倍价换最多 2.5 倍输出速度——延迟重要时容易下决心。

**自定义斜杠命令和 Skill 有什么区别？** 官方已统一为一个系统——`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都生成 `/deploy`。

**能用 1M token 上下文窗口吗？** 能——Sonnet 5、Opus 4.8、Fable 5 已标配 1M 上下文，无长上下文加价。

## 更新与废弃（截至 2026 年 7 月）

完整变更日志在仓库的 [docs/reference/changelog.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/changelog.md)，记录至 2026 年 7 月上旬（Claude Code v2.1.201）。近期要点：

- **Claude Sonnet 5**（2026 年 6 月 30 日）——Claude Code 新默认模型；1M token 上下文标配。
- **Claude Opus 4.8**（2026 年 5 月 28 日）——Opus 旗舰，定价不变；**Fable 5 / Mythos 5**（2026 年 6 月 9 日）开出 Opus 之上的 Mythos 级。
- **动态工作流 + `ultracode`**——Claude 编排数十到数百个后台 subagent；用 `/workflows` 观看。
- **Artifacts**（beta）——从 CLI 发布活网页到 claude.ai。
- **v2.1.198**（2026 年 7 月 1 日）——Claude in Chrome GA，subagent 默认后台运行，`/agents` 向导移除。
- 改名——`/cost` + `/stats` → `/usage`；`/extra-usage` → `/usage-credits`；权限模式 default → Manual（v2.1.200）；`/simplify` → `/code-review`（后以只做清理的评审重新引入）。
- 限额——2026 年 5 月 6 日 Pro/Max/Team 五小时限额翻倍。
- 弃用——Opus 4.1 于 2026 年 8 月 5 日退役；Opus 4.7 fast mode 2026 年 7 月 24 日移除。

功能、定价与可用性变化频繁，以[官方 Claude Code 文档](https://code.claude.com/docs/en/overview)为准。

## 延伸阅读

原仓库的 [docs/reference/further-reading.md](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/reference/further-reading.md) 维护着完整书单——Anthropic 官方文档、MCP 资源、hooks 示例、workflow 教程、定价参考与相邻工具。点击最多的起点：

- [Claude Code 总览（官方）](https://code.claude.com/docs/en/overview)
- [Claude Code 最佳实践（官方）](https://code.claude.com/docs/en/best-practices)
- [Building effective agents（Anthropic 工程博客）](https://www.anthropic.com/engineering/building-effective-agents)
- [官方 MCP Registry](https://registry.modelcontextprotocol.io/)
- [Hooks 参考（官方）](https://code.claude.com/docs/en/hooks)

## 仓库里还有什么（译注）

以上是 README 主线的全译。原仓库的二级目录各藏一块深水区，价值足够单独一提，但不必逐篇全译——按需回查原文即可：

| 目录 | 内容 | 值得去的场合 |
|---|---|---|
| [`docs/skills.md`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/skills.md) | Skills 完整指南：查找顺序全表、frontmatter 参考、工作流配方、生态分类表 | 要写自己的 Skill 或想弄清 `allowed-tools` 的权限语义时 |
| [`docs/workflows.md`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/workflows.md) | 动态工作流深潜：权限模型、断点续跑、脚本结构 | 要写 workflow 脚本时 |
| [`docs/agent-teams.md`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/blob/main/docs/agent-teams.md) | Agent Teams 完整指南：邮箱架构、计划审批、hooks、排障与局限清单 | 真要组队时 |
| [`docs/reference/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/docs/reference) | commands 速查表、effort-levels 深挖（含「上下文质量陷阱」）、models 规格与定价、faq、changelog、further-reading | 查具体命令、档位、价格与版本沿革 |
| [`mcp-servers/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/mcp-servers) | Serena、Sequential Thinking、Memory、Playwright 四份配置走查，加对照矩阵与排障 | 选型与装第一个 server 时 |
| [`specialized-agents/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/specialized-agents) | 10 个角色的系统提示与角色描述，外加一张 Obsidian canvas 编排图 | 想直接拿角色 prompt 而不是自己写时 |
| [`.claude/`](https://github.com/wesammustafa/Claude-Code-Everything-You-Need-to-Know/tree/main/.claude) | 每种扩展点各一份能跑的实物：7 个命令、1 个 Skill、5 个 agent、4 个 Python hook、1 个 workflow | 学「一个真实的 `.claude/` 长什么样」最直观的途径 |

译注：这些二级文档中，effort-levels 的「上下文质量陷阱」与 workflows/agent-teams 的实践细节，比官方文档更贴使用视角，是 README 之外最值得回读的部分；commands/models/faq 一类速查表则会随版本漂移，查证时以官方文档对照为准。
