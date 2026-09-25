---
name: claude-code-best-practice
title: Claude Code 最佳实践：从 vibe coding 到 agentic engineering
summary: Claude Code 创造者 Boris Cherny 与社区一线的 83 条技巧，外加概念地图、十套工作流对照与跨模型方案，中文全译。
date: 2026-09-25
source: https://github.com/shanraisshan/claude-code-best-practice
author: shanraisshan
tags: [claude-code, subagents, commands, skills, hooks, workflows, mcp, cross-model]
related: [superpowers-brainstorming, superpowers-tdd, superpowers-writing-plans, gstack-plan-review, gstack-design-consultation]
translated: true
---

from vibe coding to agentic engineering — practice makes claude perfect

<img src="https://img.shields.io/badge/updated_with_Claude_Code-Sep%2025%2C%202026%209%3A50%20AM%20PKT-white?style=flat&labelColor=555" alt="updated with Claude Code" height="20"> <a href="https://github.com/shanraisshan/claude-code-best-practice/stargazers"><img src="https://img.shields.io/github/stars/shanraisshan/claude-code-best-practice?style=flat&label=%E2%98%85&labelColor=555&color=white" alt="GitHub Stars" height="20"></a><br>

[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/tree/main/best-practice) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/tree/main/implementation) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/orchestration-workflow.svg" alt="Orchestration Workflow" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/orchestration-workflow/orchestration-workflow.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://code.claude.com/docs) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice#-tips-and-tricks) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community.svg" alt="Community" height="20">](https://github.com/shanraisshan/claude-code-best-practice#-subscribe) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/click-badges.svg" alt="Click on these badges below to see the actual sources" height="20"><br>
<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> = Agents · <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/c.svg" height="14"> = Commands · <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> = Skills

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="Claude Code mascot jumping" width="120" height="100"><br>
  <a href="https://github.com/trending"><img src="/sdlc-playbook/articles/claude-code-best-practice/root/github-trending-day.svg" alt="GitHub Trending #1 Repository Of The Day" height="55"></a>
</p>

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/root/supported-label.svg" alt="Supported by:" height="34">&nbsp;&nbsp;<a href="https://disrupt.com/?utm_source=github&utm_campaign=shayan_claude_code_best_practice"><img src="/sdlc-playbook/articles/claude-code-best-practice/root/supported-disrupt.svg" alt="Disrupt.com — Ventures Reimagined" height="34"></a>&nbsp;&nbsp;<a href="https://claudekit.cc/?utm_source=github&utm_medium=sponsorship&utm_campaign=shayan_claude_code_best_practice"><img src="/sdlc-playbook/articles/claude-code-best-practice/root/supported-claudekit.svg" alt="ClaudeKit — Production-ready skills and workflows" height="34"></a>
</p>

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/root/boris-slider.gif" alt="Boris Cherny on Claude Code" width="600"><br>
  Boris Cherny 在 X 上（<a href="https://x.com/bcherny/status/2007179832300581177">tweet 1</a> · <a href="https://x.com/bcherny/status/2017742741636321619">tweet 2</a> · <a href="https://x.com/bcherny/status/2021699851499798911">tweet 3</a>）
</p>

> 💡 想把这个仓库真正用透，先读下面的「如何使用」一节。

## 🧠 概念

| 功能 | 位置 | 说明 |
|---------|----------|-------------|
| <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> [**Subagents**](https://code.claude.com/docs/en/sub-agents) | `.claude/agents/<name>.md` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-subagents.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-subagents-implementation.md) |
| <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/c.svg" height="14"> [**Commands**](https://code.claude.com/docs/en/commands) | `.claude/commands/<name>.md` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-commands.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-commands-implementation.md) |
| <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> [**Skills**](https://code.claude.com/docs/en/skills) | `.claude/skills/<name>/SKILL.md` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-skills.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-skills-implementation.md) [官方技能库](https://github.com/anthropics/skills/tree/main/skills) · [monorepo 里的 Skills](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-skills-for-larger-mono-repos.md) |
| [**Workflows**](https://code.claude.com/docs/en/common-workflows) | [`.claude/commands/weather-orchestrator.md`](https://github.com/shanraisshan/claude-code-best-practice/blob/main/.claude/commands/weather-orchestrator.md) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/orchestration-workflow.svg" alt="Orchestration Workflow" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/orchestration-workflow/orchestration-workflow.md) |
| [**Hooks**](https://code.claude.com/docs/en/hooks) | `.claude/hooks/` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-hooks) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-hooks) [指南](https://code.claude.com/docs/en/hooks-guide) |
| [**MCP Servers**](https://code.claude.com/docs/en/mcp) | `.claude/settings.json`, `.mcp.json` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-mcp.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/.mcp.json) |
| [**Plugins**](https://code.claude.com/docs/en/plugins) | 可分发的包 | [插件市场](https://code.claude.com/docs/en/discover-plugins) · [创建插件市场](https://code.claude.com/docs/en/plugin-marketplaces) |
| [**Settings**](https://code.claude.com/docs/en/settings) | `.claude/settings.json` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/.claude/settings.json) [权限](https://code.claude.com/docs/en/permissions) · [模型配置](https://code.claude.com/docs/en/model-config) · [输出样式](https://code.claude.com/docs/en/output-styles) · [沙箱](https://code.claude.com/docs/en/sandboxing) · [键位](https://code.claude.com/docs/en/keybindings) · [Auto Mode 配置](https://code.claude.com/docs/en/auto-mode-config) |
| [**Status Line**](https://code.claude.com/docs/en/statusline) | `.claude/settings.json` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-status-line) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/.claude/settings.json) |
| [**Memory**](https://code.claude.com/docs/en/memory) | `CLAUDE.md`, `.claude/rules/`, `~/.claude/rules/`, `~/.claude/projects/<project>/memory/` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-memory.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/CLAUDE.md) [自动记忆](https://code.claude.com/docs/en/memory) · [自动记忆深读](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-agent-memory.md) · [Rules](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/) |
| [**Checkpointing**](https://code.claude.com/docs/en/checkpointing) | 自动（文件编辑追踪） |  |
| [**Sessions**](https://code.claude.com/docs/en/sessions) | `--resume`, `--continue`, `/resume`, `/branch` |  |
| [**Context Window**](https://code.claude.com/docs/en/context-window) | `/compact`, `/clear`, `/context` |  |
| [**CLI Startup Flags**](https://code.claude.com/docs/en/cli-reference) | `claude [flags]` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-cli-startup-flags.md) [交互模式](https://code.claude.com/docs/en/interactive-mode) · [环境变量](https://code.claude.com/docs/en/env-vars) |
| **AI Terms** | | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-codex-cursor-gemini/blob/main/reports/ai-terms.md) |
| [**Best Practices**](https://code.claude.com/docs/en/best-practices) | | [Prompt Engineering](https://github.com/anthropics/prompt-eng-interactive-tutorial) · [扩展 Claude Code](https://code.claude.com/docs/en/features-overview) |
| [**Prompt Library**](https://code.claude.com/docs/en/prompt-library) | |  |

### 🔥 热点

| 功能 | 位置 | 说明 |
|---------|----------|-------------|
| [**Ultrareview**](https://code.claude.com/docs/en/ultrareview) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `/code-review ultra`, `claude ultrareview [target]` | [任务追踪](https://code.claude.com/docs/en/ultrareview#track-a-running-review) |
| [**Devcontainers**](https://code.claude.com/docs/en/devcontainer) | `.devcontainer/` |  |
| [**Channels**](https://code.claude.com/docs/en/channels) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `--channels`，基于插件 | [参考文档](https://code.claude.com/docs/en/channels-reference) |
| [**No Flicker Mode**](https://code.claude.com/docs/en/fullscreen) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `/tui fullscreen`, `CLAUDE_CODE_NO_FLICKER=1` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/bcherny/status/2039421575422980329) |
| [**Auto Mode**](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode) | `--permission-mode auto`, `Shift+Tab` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/claudeai/status/2036503582166393240) [博客](https://claude.com/blog/auto-mode) |
| [**Power-ups**](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-power-ups.md) | `/powerup` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-power-ups.md) |
| [**Fast Mode**](https://code.claude.com/docs/en/fast-mode) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `/fast`, `"fastMode": true` |  |
| [**Advisor**](https://code.claude.com/docs/en/advisor) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `/advisor`, `advisorModel`, `--advisor` | [博客](https://claude.com/blog/the-advisor-strategy) |
| [**Computer Use**](https://code.claude.com/docs/en/computer-use) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `computer-use` MCP server | [桌面版](https://code.claude.com/docs/en/desktop#let-claude-use-your-computer) |
| [**Agent SDK**](https://code.claude.com/docs/en/agent-sdk/overview) | `npm` / `pip` 包 | [快速上手](https://code.claude.com/docs/en/agent-sdk/quickstart) · [示例](https://github.com/anthropics/claude-agent-sdk-demos) |
| [**Ralph Wiggum Loop**](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) | 插件 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/ghuntley/how-to-ralph-wiggum) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/ralph-wiggum-self-evolving-loop) |
| [**Chrome**](https://code.claude.com/docs/en/chrome) | `--chrome`，浏览器扩展 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-in-chrome-v-chrome-devtools-mcp.md) |
| [**Claude Code Web**](https://code.claude.com/docs/en/claude-code-on-the-web) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `claude.ai/code` | [Routines](https://code.claude.com/docs/en/routines) |
| [**Artifacts**](https://code.claude.com/docs/en/artifacts) | `/share`, `Artifact` 工具 |  |
| [**Slack**](https://code.claude.com/docs/en/slack) | Slack 里的 `@Claude` |  |
| [**Code Review**](https://code.claude.com/docs/en/code-review) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | GitHub App（托管） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/claudeai/status/2031088171262554195) [博客](https://claude.com/blog/code-review) [本地 /code-review](https://code.claude.com/docs/en/commands) |
| [**GitHub Actions**](https://code.claude.com/docs/en/github-actions) | `.github/workflows/` | [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) |
| [**Remote Control**](https://code.claude.com/docs/en/remote-control) | `/remote-control`, `/rc` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/noahzweben/status/2032533699116355819) [Headless 模式](https://code.claude.com/docs/en/headless) |
| [**Deep Links**](https://code.claude.com/docs/en/deep-links) | `claude-cli://open?repo=…&q=…` |  |
| [**Dynamic Workflows**](https://code.claude.com/docs/en/workflows) | `/workflows`, `ultracode` 关键字, `/effort ultracode`, `.claude/workflows/` | [Deep Research](https://code.claude.com/docs/en/workflows#run-a-bundled-workflow) |
| [**Agent Teams**](https://code.claude.com/docs/en/agent-teams) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | 内置（环境变量开关） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/bcherny/status/2019472394696683904) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-agent-teams-implementation.md) |
| [**Agent View**](https://code.claude.com/docs/en/agent-view) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `claude agents`, `--bg`, `/bg` |  |
| [**Cross-Session Messaging**](https://code.claude.com/docs/en/cross-session-messaging) | `SendMessage`, `ListAgents`, `/list-agents` |  |
| [**Scheduled Tasks**](https://code.claude.com/docs/en/scheduled-tasks) | `/loop`, `/schedule`, cron 工具 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/bcherny/status/2030193932404150413) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-scheduled-tasks-implementation.md) [桌面版定时任务](https://code.claude.com/docs/en/desktop-scheduled-tasks) · [公告](https://x.com/noahzweben/status/2036129220959805859) |
| [**Routines**](https://code.claude.com/docs/en/routines) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/beta.svg" alt="beta" height="20"> | `claude.ai/code/routines`, `/schedule` | [桌面版任务](https://code.claude.com/docs/en/desktop-scheduled-tasks) |
| [**Tasks**](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-global-vs-project-settings.md#tasks-system) | `/tasks`, `~/.claude/tasks/` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-global-vs-project-settings.md) [Ultrareview 追踪](https://code.claude.com/docs/en/ultrareview#track-a-running-review) |
| [**Goal**](https://code.claude.com/docs/en/goal) | `/goal <condition>`, `/goal clear` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-goal-implementation.md) |
| [**Voice Dictation**](https://code.claude.com/docs/en/voice-dictation) | `/voice` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/trq212/status/2028628570692890800) |
| [**Bundled Skills**](https://code.claude.com/docs/en/skills#bundled-skills) | `/code-review`, `/batch` | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/bcherny/status/2027534984534544489) |
| [**Git Worktrees**](https://code.claude.com/docs/en/worktrees) | `--worktree`/`-w`, `.worktreeinclude`, `EnterWorktree`/`ExitWorktree`, `isolation: "worktree"`, `WorktreeCreate`/`WorktreeRemove` hooks | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/best-practice.svg" alt="Best Practice" height="20">](https://x.com/bcherny/status/2025007393290272904) |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/orchestration-workflow/orchestration-workflow.md"><img src="/sdlc-playbook/articles/claude-code-best-practice/tags/orchestration-workflow-hd.svg" alt="Orchestration Workflow" height="40"></a> 编排工作流

<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/c.svg" height="14"> **Command** → <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> **Agent** → <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> **Skill** 模式的实现细节见 [orchestration-workflow](https://github.com/shanraisshan/claude-code-best-practice/blob/main/orchestration-workflow/orchestration-workflow.md)。

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/orchestration-workflow/orchestration-workflow.svg" alt="Command Skill Agent Architecture Flow" width="100%">
</p>

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/orchestration-workflow/orchestration-workflow.gif" alt="Orchestration Workflow Demo" width="600">
</p>

<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/how-to-use.svg" alt="How to Use" height="20">

```bash
claude
/weather-orchestrator
```

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## ⚙️ 开发工作流

主流工作流最后都收敛到同一个架构模式：**Research → Plan → Execute → Review → Ship**

| 名称 | ★ | 工作流 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/c.svg" height="14"> | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> |
|------|---|----------|---|---|---|
| [Superpowers](https://github.com/obra/superpowers) | 291k | <img src="https://img.shields.io/badge/brainstorming-ddf4ff" alt="brainstorming" align="middle" height="20"> → <img src="https://img.shields.io/badge/using--git--worktrees-ddf4ff" alt="using-git-worktrees" align="middle" height="20"> → <img src="https://img.shields.io/badge/writing--plans-ddf4ff" alt="writing-plans" align="middle" height="20"> → <img src="https://img.shields.io/badge/subagent--driven--development-ddf4ff" alt="subagent-driven-development" align="middle" height="20"> → <img src="https://img.shields.io/badge/executing--plans-ddf4ff" alt="executing-plans" align="middle" height="20"> → <img src="https://img.shields.io/badge/test--driven--development-fff3b0" alt="test-driven-development" align="middle" height="20"> → <img src="https://img.shields.io/badge/requesting--code--review-ddf4ff" alt="requesting-code-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/finishing--a--development--branch-ddf4ff" alt="finishing-a-development-branch" align="middle" height="20"> | 0 | 0 | 15 |
| [Matt Pocock Skills](https://github.com/mattpocock/skills) | 269k | <img src="https://img.shields.io/badge/setup--matt--pocock--skills-ddf4ff" alt="setup-matt-pocock-skills" align="middle" height="20"> → <img src="https://img.shields.io/badge/grill--with--docs-ddf4ff" alt="grill-with-docs" align="middle" height="20"> → <img src="https://img.shields.io/badge/to--spec-ddf4ff" alt="to-spec" align="middle" height="20"> → <img src="https://img.shields.io/badge/to--tickets-ddf4ff" alt="to-tickets" align="middle" height="20"> → <img src="https://img.shields.io/badge/implement-ddf4ff" alt="implement" align="middle" height="20"> → <img src="https://img.shields.io/badge/tdd-fff3b0" alt="tdd" align="middle" height="20"> → <img src="https://img.shields.io/badge/code--review-fff3b0" alt="code-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/improve--codebase--architecture-ddf4ff" alt="improve-codebase-architecture" align="middle" height="20"> | 0 | 0 | 38 |
| [Everything Claude Code](https://github.com/affaan-m/ECC) | 267k | <img src="https://img.shields.io/badge/ecc:plan-ddf4ff" alt="ecc:plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/tdd--workflow-fff3b0" alt="tdd-workflow" align="middle" height="20"> → <img src="https://img.shields.io/badge/implement-ddf4ff" alt="implement" align="middle" height="20"> → <img src="https://img.shields.io/badge/code--review-ddf4ff" alt="code-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/build--fix-fff3b0" alt="build-fix" align="middle" height="20"> → <img src="https://img.shields.io/badge/security--scan-fff3b0" alt="security-scan" align="middle" height="20"> → <img src="https://img.shields.io/badge/e2e--testing-fff3b0" alt="e2e-testing" align="middle" height="20"> → <img src="https://img.shields.io/badge/test--coverage-fff3b0" alt="test-coverage" align="middle" height="20"> → <img src="https://img.shields.io/badge/save--session-ddf4ff" alt="save-session" align="middle" height="20"> | 68 | 147 | 292 |
| [Spec Kit](https://github.com/github/spec-kit) | 139k | <img src="https://img.shields.io/badge/%2Fspeckit.constitution-ddf4ff" alt="/speckit.constitution" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fspeckit.specify-ddf4ff" alt="/speckit.specify" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fspeckit.plan-ddf4ff" alt="/speckit.plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fspeckit.tasks-ddf4ff" alt="/speckit.tasks" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fspeckit.implement-fff3b0" alt="/speckit.implement" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fspeckit.converge-fff3b0" alt="/speckit.converge" align="middle" height="20"> | 0 | 10 | 0 |
| [gstack](https://github.com/garrytan/gstack) | 134k | <img src="https://img.shields.io/badge/%2Foffice--hours-ddf4ff" alt="/office-hours" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fplan--ceo--review-fff3b0" alt="/plan-ceo-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fplan--design--review-fff3b0" alt="/plan-design-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fplan--devex--review-fff3b0" alt="/plan-devex-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fplan--eng--review-fff3b0" alt="/plan-eng-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fdesign--shotgun-fff3b0" alt="/design-shotgun" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fdesign--html-fff3b0" alt="/design-html" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Freview-ddf4ff" alt="/review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fqa-ddf4ff" alt="/qa" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fship-ddf4ff" alt="/ship" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fland--and--deploy-ddf4ff" alt="/land-and-deploy" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fretro-ddf4ff" alt="/retro" align="middle" height="20"> | 0 | 0 | 53 |
| [agent-skills](https://github.com/addyosmani/agent-skills) | 89k | <img src="https://img.shields.io/badge/%2Fspec-ddf4ff" alt="/spec" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fplan-ddf4ff" alt="/plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fbuild-ddf4ff" alt="/build" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Ftest-ddf4ff" alt="/test" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Freview-ddf4ff" alt="/review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fship-ddf4ff" alt="/ship" align="middle" height="20"> | 3 | 7 | 21 |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | 70k | <img src="https://img.shields.io/badge/%2Fopsx:onboard-ddf4ff" alt="/opsx:onboard" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:explore-ddf4ff" alt="/opsx:explore" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:propose-ddf4ff" alt="/opsx:propose" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:ff-fff3b0" alt="/opsx:ff" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:apply-fff3b0" alt="/opsx:apply" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:verify-ddf4ff" alt="/opsx:verify" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:sync-ddf4ff" alt="/opsx:sync" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fopsx:archive-ddf4ff" alt="/opsx:archive" align="middle" height="20"> | 0 | 12 | 12 |
| [Get Shit Done](https://github.com/gsd-build/get-shit-done) | 64.6k | <img src="https://img.shields.io/badge/%2Fgsd--new--project-ddf4ff" alt="/gsd-new-project" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--explore-ddf4ff" alt="/gsd-explore" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--spec--phase-ddf4ff" alt="/gsd-spec-phase" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--plan--phase-ddf4ff" alt="/gsd-plan-phase" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--execute--phase-ddf4ff" alt="/gsd-execute-phase" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--review-fff3b0" alt="/gsd-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--validate--phase-ddf4ff" alt="/gsd-validate-phase" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fgsd--ship-ddf4ff" alt="/gsd-ship" align="middle" height="20"> | 33 | 97 | 0 |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 53k | <img src="https://img.shields.io/badge/bmad--forge--idea-ddf4ff" alt="bmad-forge-idea" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--prd-ddf4ff" alt="bmad-prd" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--architecture-ddf4ff" alt="bmad-architecture" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--spec-ddf4ff" alt="bmad-spec" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--create--epics--and--stories-ddf4ff" alt="bmad-create-epics-and-stories" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--build-fff3b0" alt="bmad-build" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--code--review-fff3b0" alt="bmad-code-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--review-ddf4ff" alt="bmad-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/bmad--retrospective-ddf4ff" alt="bmad-retrospective" align="middle" height="20"> | 0 | 0 | 32 |
| [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) | 39.3k | <img src="https://img.shields.io/badge/deep--interview-ddf4ff" alt="deep-interview" align="middle" height="20"> → <img src="https://img.shields.io/badge/ralplan-ddf4ff" alt="ralplan" align="middle" height="20"> → <img src="https://img.shields.io/badge/team--plan-fff3b0" alt="team-plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/team--prd-fff3b0" alt="team-prd" align="middle" height="20"> → <img src="https://img.shields.io/badge/team--exec-fff3b0" alt="team-exec" align="middle" height="20"> → <img src="https://img.shields.io/badge/team--verify-fff3b0" alt="team-verify" align="middle" height="20"> → <img src="https://img.shields.io/badge/team--fix-fff3b0" alt="team-fix" align="middle" height="20"> | 19 | 21 | 43 |
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | 25.3k | <img src="https://img.shields.io/badge/%2Fce--brainstorm-ddf4ff" alt="/ce-brainstorm" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fce--plan-ddf4ff" alt="/ce-plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fce--work-ddf4ff" alt="/ce-work" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fce--simplify--code-fff3b0" alt="/ce-simplify-code" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fce--code--review-fff3b0" alt="/ce-code-review" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fce--compound-ddf4ff" alt="/ce-compound" align="middle" height="20"> | 0 | 1 | 36 |
| [HumanLayer](https://github.com/humanlayer/humanlayer) | 11.6k | <img src="https://img.shields.io/badge/%2Fresearch__codebase-ddf4ff" alt="/research_codebase" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fcreate__plan-ddf4ff" alt="/create_plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fvalidate__plan-ddf4ff" alt="/validate_plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fimplement__plan-ddf4ff" alt="/implement_plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fiterate__plan-fff3b0" alt="/iterate_plan" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fcommit-ddf4ff" alt="/commit" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Fdescribe__pr-ddf4ff" alt="/describe_pr" align="middle" height="20"> → <img src="https://img.shields.io/badge/%2Flocal__review-ddf4ff" alt="/local_review" align="middle" height="20"> | 6 | 27 | 0 |

> *注：黄色标签是子循环——在父步骤内部重复的步骤（如逐任务、逐 story，或直到验证条件通过）。*

### 其他

- [RPI](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/rpi/rpi-workflow.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/rpi/rpi-workflow.md)
- [Ralph Wiggum Loop](https://www.youtube.com/watch?v=eAtvoGlpeRU) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/ralph-wiggum-self-evolving-loop)
- [Andrej Karpathy（OpenAI 创始成员）的工作流](https://x.com/karpathy/status/2015883857489522876)
- [Peter Steinberger（OpenClaw 作者）的工作流](https://youtu.be/8lF7HmQ_RgY?t=2582)
- Boris Cherny（Claude Code 创造者）的工作流——[13 条技巧](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-13-tips-03-jan-26.md) · [10 条](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-10-tips-01-feb-26.md) · [12 条](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-12-tips-12-feb-26.md) · [2 条](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-2-tips-25-mar-26.md) · [15 条](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-15-tips-30-mar-26.md) · [6 条](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny)
- Thariq（Anthropic）的工作流——[Skills](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-17-mar-26.md) · [会话管理](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212)

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 🔀 跨模型工作流

让 Claude Code 与其他模型协同——Codex、Gemini、GPT、Kimi、DeepSeek、本地模型——有三条路：

- **Plugin**——别家模型的 CLI 跑进 Claude Code 里（斜杠命令如 `/codex:review`）
- **MCP**——Claude Code 通过 Model Context Protocol 把别家模型当工具调
- **Router**——把 Claude Code 的 API 端点换到别家 provider

方法论：[跨模型（Claude Code + Codex）工作流](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/implemented.svg" alt="Implemented" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md)——手动双终端：Claude 出计划，Codex 做 QA 评审。

| 名称 | ★ | 类型 | 桥接 | 干什么 |
|------|---|------|------------|--------------|
| [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router) | 34k | Router | OpenRouter, DeepSeek, Ollama, Gemini, Kimi, Qwen, Groq 等 | 把 Claude Code 的 API 路由到任何兼容 provider，按任务选模型 |
| [router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) | 32k | Router | Gemini CLI, Codex, Claude Code, Antigravity | 把各家 CLI 包装成 OpenAI/Gemini/Claude/Codex 兼容的 API 服务 |
| [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | 18k | Plugin | Codex / GPT-5 | OpenAI 官方插件：在 Claude Code 里用 `/codex:review`、`/codex:adversarial-review`、`/codex:rescue` |
| [BeehiveInnovations/pal-mcp-server](https://github.com/BeehiveInnovations/pal-mcp-server) | 12k | MCP | Gemini, OpenAI, Azure, Grok, Ollama, OpenRouter（50+ 模型） | 多模型 MCP server（前身 `zen-mcp-server`）——把其他模型当 Claude 的工具调 |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 🧰 技能合集

以 `SKILL.md` 文件库闻名的仓库（区别于上面整套工作流方法论）。按 star 降序。

| 名称 | ★ | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> |
|------|---|---|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 269k | 38 |
| [anthropics/skills](https://github.com/anthropics/skills) | 178k | 19 |
| [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | 67k | 8 |
| [scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | 46k | 166 |
| [wshobson/agents](https://github.com/wshobson/agents) | 40k | 183 |
| [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 35k | 1,497+（精选清单） |
| [impeccable](https://github.com/pbakaus/impeccable) | 27k | 1（另附 7 个设计领域参考） |
| [agent-skills](https://github.com/addyosmani/agent-skills) | 27k | 21 |
| [claude-skills](https://github.com/alirezarezvani/claude-skills) | 15k | 246（跨 9 个领域） |
| [shanraisshan/draw-json-architecture-skill](https://github.com/shanraisshan/draw-json-architecture-skill) | 3 | 1 |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 🤖 Agent 合集

以 subagent 定义库（`.claude/agents/*.md`）闻名的仓库。按 star 降序。

| 名称 | ★ | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> |
|------|---|---|
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | 154k | 279 |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 25k | 158 |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 💡 技巧与窍门（83）

🚫👶 = 不用盯着

提示词 · 规划 · 上下文 · 会话 · CLAUDE.md + .claude/rules · Agents · Commands · Skills · Hooks · Workflows · Workflows 进阶 · Git / PR · 调试 · 实用工具 · 日常

<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community.svg" alt="Community" height="20">

### ■ 提示词（3）

| 技巧 | 出处 |
|-----|--------|
| 挑战 Claude——"grill me on these changes and don't make a PR until I pass your test"，或者 "prove to me this works"，让 Claude 拿 main 和你的分支做 diff 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742752566632544) |
| 修得平庸时——"knowing everything you know now, scrap this and implement the elegant solution" 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742752566632544) |
| 多数 bug Claude 自己就能修——贴上报错，说一句 "fix"，别管它怎么改 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742750473720121) |

### ■ 规划 / 规格（7）

| 技巧 | 出处 |
|-----|--------|
| 永远从 [plan mode](https://code.claude.com/docs/en/common-workflows) 开始 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179845336527000) |
| 从一份最小的 spec 或 prompt 起步，让 Claude 用 [AskUserQuestion](https://code.claude.com/docs/en/cli-reference) 工具反过来采访你；然后再开一个新会话去执行 spec | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2005315275026260309) |
| 计划要按阶段设闸门，每个阶段配多种测试（单元、自动化、集成） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/videos/claude-dex-mlops-community-24-mar-26.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/YwZR6tc7qYg?t=1032) |
| 把 PRD 拆成贯穿所有层的垂直切片（tracer bullets，DB + service + UI）——AI 默认按水平分层推进（先 DB，再 API，再前端），端到端反馈被拖到最后一阶段才出现。出自《程序员修炼之道》 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-matt.svg" alt="Matt" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/videos/claude-matt-pocock-24-apr-26.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/-QFHIoCo-Ko) |
| 再开一个 Claude，让它以 staff engineer 的姿态审你的计划，或者用[跨模型](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md)方案来审 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742745365057733) |
| 交接之前把 spec 写细、把歧义挤掉——你说得越具体，产出越好 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742752566632544) |
| 原型 > PRD——与其写 spec，不如做 20–30 个版本；构建成本低，多打几枪 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://youtu.be/julbw1JuAz0?t=3630) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/julbw1JuAz0?t=3630) |

### ■ 上下文（5）

| 技巧 | 出处 |
|-----|--------|
| 1M 上下文模型上，context rot 大约在 30–40 万 token 开始出现——对智力敏感的任务，别让会话飘过这条线 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| 笨拙区大约在 40% 上下文占用时出现——"你会碰到一个产出明显退化的点"。新手："尽量压在 40% 以下，到 60% 就该考虑收尾了"。老手："激进地压在 30% 以下"——只有简单任务才推到 60%。切任务时手动 [/compact](https://code.claude.com/docs/en/interactive-mode) 或 [/clear](https://code.claude.com/docs/en/cli-reference) 复位 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/videos/claude-dex-mlops-community-24-mar-26.md) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/YwZR6tc7qYg?t=1541) |
| rewind 优于打补丁——双击 Esc 或 [/rewind](https://code.claude.com/docs/en/checkpointing) 回到失败尝试之前，带着新学到的教训重新 prompt，而不是让失败加修正堆在上下文里 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| 带提示的 [/compact](https://code.claude.com/docs/en/interactive-mode)（如 /compact focus on the auth refactor, drop the test debugging）比等自动 compact 强——自动 compact 触发时，模型正处在 context rot 之下最不聪明的时刻 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| 用 subagent 管上下文——问自己"这个工具输出我还要复用吗，还是只要结论？"——20 次读文件、12 次 grep、3 条死路都留在子上下文里，回来的只有最终报告 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |

### ■ 会话管理（6）

| 技巧 | 出处 |
|-----|--------|
| 每一轮都是一个分岔口——Claude 结束一轮后，按"要带走多少现有上下文"在 Continue、/rewind、/clear、/compact、Subagent 之间选 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| 新任务 = 新会话——相关任务（比如给刚写完的东西补文档）可以复用上下文省事，真正的全新任务值得一个干净的会话 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| rewind 之前先说 "summarize from here"，让 Claude 写一份交接信息——像未来的 Claude 给上一版自己留的条 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| /compact 与 /clear——compact 有损但保节奏（任务中途，细节模糊点无所谓）；/clear 加一段简报更费事，但带走什么由你精确控制（下一步 stakes 高时用它） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) |
| 长会话开 recaps——Claude 做了什么、下一步是什么的短摘要，离开几分钟或几小时再回来时有用。在 /config 里可关 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |
| 给重要会话 [/rename](https://code.claude.com/docs/en/cli-reference)（比如 [TODO - refactor task]），之后 [/resume](https://code.claude.com/docs/en/cli-reference) 回来——同时跑多个 Claude 时，给每个实例都贴上标签 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/cat-wu.svg" alt="Cat" height="20">](https://every.to/podcast/how-to-use-claude-code-like-the-people-who-built-it) |

### ■ CLAUDE.md + .claude/rules（8）

| 技巧 | 出处 |
|-----|--------|
| [CLAUDE.md](https://code.claude.com/docs/en/memory) 每个文件控制在 [200 行](https://code.claude.com/docs/en/memory#write-effective-instructions)以内；humanlayer 用的是 [60 行](https://www.humanlayer.dev/blog/writing-a-good-claude-md)（[即便这样也不保证 100% 被遵守](https://www.reddit.com/r/ClaudeCode/comments/1qn9pb9/claudemd_says_must_use_agent_claude_ignores_it_80/)） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179840848597422) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://www.humanlayer.dev/blog/writing-a-good-claude-md) |
| .claude/rules/*.md 像 CLAUDE.md 一样自动进每个会话——在 YAML frontmatter 里加 paths:，只有 Claude 碰到匹配 glob 的文件时才加载 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/) |
| 给领域相关的 CLAUDE.md 规则套上 [\<important if="..."\> 标签](https://www.hlyr.dev/blog/stop-claude-from-ignoring-your-claude-md)，文件变长后防止 Claude 无视它们 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://www.hlyr.dev/blog/stop-claude-from-ignoring-your-claude-md) |
| monorepo 用[多份 CLAUDE.md](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-memory.md)——祖先目录加子孙目录叠加加载 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2016339448863355206) |
| 大块指令拆进 [.claude/rules/](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/) |
| 任何一个开发者打开 Claude 说 "run the tests"，第一次就该能跑通——跑不通，说明 CLAUDE.md 缺了必要的 setup/build/test 命令 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://x.com/dexhorthy/status/2034713765401551053) |
| 代码库保持干净，迁移要做完——迁了一半的框架会把模型带偏，它可能挑错模式 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://youtu.be/julbw1JuAz0?t=1112) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/julbw1JuAz0?t=1112) |
| harness 强制的行为（署名、权限、模型）交给 [settings.json](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md)——既然 attribution.commit: "" 是确定性生效的，就别在 CLAUDE.md 里写 "NEVER add Co-Authored-By" | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-davila7.svg" alt="davila7" height="20">](https://x.com/dani_avila7/status/2036182734310195550) |

### <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/a.svg" height="14"> Agents（4）

| 技巧 | 出处 |
|-----|--------|
| 要领域专属的 [sub-agent](https://code.claude.com/docs/en/sub-agents)（额外上下文）配 [skill](https://code.claude.com/docs/en/skills)（渐进式披露），别搞通用 qa、backend engineer | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179850139000872) |
| 说一句 "use subagents" 就是给问题加算力——把任务卸载出去，主上下文保持干净聚焦 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742755737555434) |
| [agent teams](https://code.claude.com/docs/en/agent-teams) 配 tmux 和 [git worktrees](https://x.com/bcherny/status/2025007393290272904)，做并行开发 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2025007393290272904) |
| 用 [test time compute](https://code.claude.com/docs/en/sub-agents)——独立的上下文窗口让结果更好；一个 agent 闯的祸，另一个同型号的 agent 找得出来 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2031151689219321886) |

### <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/c.svg" height="14"> Commands（3）

| 技巧 | 出处 |
|-----|--------|
| 自己的工作流用 [command](https://code.claude.com/docs/en/skills)，而不是 [sub-agent](https://code.claude.com/docs/en/sub-agents) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179847949500714) |
| 一天要做很多次的"内循环"工作流都做成[斜杠命令](https://code.claude.com/docs/en/skills)——省掉重复 prompt；command 放在 .claude/commands/，随 git 提交 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179847949500714) |
| 一天做超过一次的事，就把它变成 [skill](https://code.claude.com/docs/en/skills) 或 [command](https://code.claude.com/docs/en/skills)——去做 /techdebt、context-dump、analytics 这类命令 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742748984742078) |

### <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/s.svg" height="14"> Skills（9）

| 技巧 | 出处 |
|-----|--------|
| 用 [context: fork](https://code.claude.com/docs/en/skills) 让 skill 跑在隔离的 subagent 里——主上下文只看到最终结果，看不到中间的工具调用。agent 字段可以指定 subagent 类型 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/lydia.svg" alt="Lydia" height="20">](https://x.com/lydiahallie/status/2033603164398883042) |
| monorepo 把 [skill 放子目录](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-skills-for-larger-mono-repos.md) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://code.claude.com/docs/en/skills) |
| skill 是文件夹不是单个文件——用 references/、scripts/、examples/ 子目录做[渐进式披露](https://code.claude.com/docs/en/skills) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| 每个 skill 里建一节 Gotchas——信号密度最高的内容，把 Claude 踩过的坑持续补进去 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| skill 的 description 字段是触发器不是摘要——写给模型看（"我什么时候该被触发？"） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| skill 里别写正确的废话——聚焦能把 Claude 推出默认行为的内容 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| skill 里别给 Claude 铺铁轨——给目标和约束，不给一步一步的处方 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| skill 里带上脚本和库，让 Claude 做组合，而不是重新发明样板 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| 在 SKILL.md 里嵌 !command，把动态 shell 输出注入 prompt——调用时 Claude 执行它，模型只看到结果 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/lydia.svg" alt="Lydia" height="20">](https://x.com/lydiahallie/status/2034337963820327017) |

### ■ Hooks（5）

| 技巧 | 出处 |
|-----|--------|
| skill 里用[按需 hook](https://code.claude.com/docs/en/skills)——/careful 拦危险命令，/freeze 拦目录外的编辑 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| 用 [PreToolUse hook](https://code.claude.com/docs/en/skills) 统计 skill 的使用情况，找出高频的和触发不足的 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| 用 [PostToolUse hook](https://code.claude.com/docs/en/hooks) 自动格式化——Claude 生成的代码已经够规整，hook 收掉最后 10%，免得 CI 挂 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179852047335529) |
| 用 hook 把[权限请求](https://code.claude.com/docs/en/hooks)转给 Opus——让它扫一遍有没有攻击，安全的自动放行 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742755737555434) |
| 用 [Stop hook](https://code.claude.com/docs/en/hooks) 在一轮结束时推 Claude 一把，让它继续或验证自己的产出 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2021701059253874861) |

### ■ Workflows（5）

| 技巧 | 出处 |
|-----|--------|
| 用 [/model](https://code.claude.com/docs/en/model-config) 选模型与推理档，[/context](https://code.claude.com/docs/en/interactive-mode) 看上下文占用，[/usage](https://code.claude.com/docs/en/costs) 查套餐额度，[/extra-usage](https://code.claude.com/docs/en/interactive-mode) 配置超额计费，[/config](https://code.claude.com/docs/en/settings) 改设置——plan mode 用 Opus、写码用 Sonnet，两头的好处都拿到 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/cat-wu.svg" alt="Cat" height="20">](https://x.com/_catwu/status/1955694117264261609) |
| 在 /config 里始终开 [thinking mode](https://code.claude.com/docs/en/model-config)（看推理过程），Output Style 用 [Explanatory](https://code.claude.com/docs/en/output-styles)（看带 ★ Insight 框的详细输出），Claude 的决策更容易看懂 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179838864666847) |
| prompt 里写 ultrathink 关键词，换[高档推理](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#tips-and-best-practices) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#tips-and-best-practices) |
| /focus 模式藏掉所有中间过程，只给最终结果——相信模型会跑对命令，只看产出（用 /focus 切换） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |
| 用 Opus 4.7 的自适应思考调 effort——low 要速度省 token，max 要智力拉满（档位：low · medium · high · xhigh · max） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |

### ■ Workflows 进阶（9）

| 技巧 | 出处 |
|-----|--------|
| 多用 ASCII 图来理解自己的架构 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742759218794768) |
| [/loop](https://code.claude.com/docs/en/scheduled-tasks) 做本地周期监控（最长 7 天）；[/schedule](https://code.claude.com/docs/en/routines) 做云端周期任务，机器关了也照跑 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2038454341884154269) |
| 长时间自治任务用 [Ralph Wiggum 插件](https://github.com/shanraisshan/ralph-wiggum-self-evolving-loop) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179858435281082) |
| [/permissions](https://code.claude.com/docs/en/permissions) 用通配符（Bash(npm run *)、Edit(/docs/**)）替代 dangerously-skip-permissions | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2007179854077407667) |
| [/sandbox](https://code.claude.com/docs/en/sandboxing) 用文件与网络隔离减少权限弹窗——内部数据降了 84% | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2021700506465579443) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/cat-wu.svg" alt="Cat" height="20">](https://creatoreconomy.so/p/inside-claude-code-how-an-ai-native-actually-works-cat-wu) |
| 在[产品验证](https://code.claude.com/docs/en/skills) skill 上投资（signup-flow-driver、checkout-verifier）——值得花一周打磨 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/thariq.svg" alt="Thariq" height="20">](https://x.com/trq212/status/2033949937936085378) |
| 用 [auto mode](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode) 替代 dangerously-skip-permissions——一个基于模型的分类器判断每条命令是否安全，安全的自动批，有风险停下来问。Shift+Tab 在 Ask → Plan → Auto 之间循环 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |
| 用 /less-permission-prompts skill 扫描会话历史，找出反复弹窗的安全 bash/MCP 命令，生成推荐白名单贴进 [settings](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md) | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |
| 做一个 /go skill：先用 bash/浏览器/computer use 端到端测试，再跑 /simplify，最后开 PR——你回来的时候，就知道代码是好的 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) |

### ■ Git / PR（5）

| 技巧 | 出处 |
|-----|--------|
| PR 保持小而聚焦——p50 是 [118 行](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-2-tips-25-mar-26.md)（一天 141 个 PR、4.5 万行变更）；一个 PR 一个功能，好评好回滚 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2038552880018538749) |
| PR 一律 [squash merge](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-2-tips-25-mar-26.md)——干净的线性历史，一个功能一个 commit，git revert 和 git bisect 都顺手 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2038552880018538749) |
| 勤提交——至少每小时一次；任务一完成就 commit | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| 在同事的 PR 上标 [@claude](https://github.com/apps/claude)，让它把反复出现的 review 意见自动生成为 lint 规则——把自己从 code review 里自动化出去 🚫👶 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://youtu.be/julbw1JuAz0?t=2715) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/julbw1JuAz0?t=2715) |
| 用 [/code-review](https://code.claude.com/docs/en/code-review) 做多 agent 的 PR 分析——合并前抓住 bug、安全漏洞和回归 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2031089411820228645) |

### ■ 调试（6）

| 技巧 | 出处 |
|-----|--------|
| 卡住就截图给 Claude，养成习惯 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| 用 MCP（[Claude in Chrome](https://code.claude.com/docs/en/chrome)、[Playwright](https://github.com/microsoft/playwright-mcp)、[Chrome DevTools](https://developer.chrome.com/blog/chrome-devtools-mcp)）让 Claude 自己去看 Chrome 控制台日志 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Claude" height="20">](https://code.claude.com/docs/en/chrome) |
| 想看哪个终端的日志，就让 Claude 把它作为后台任务跑——调试体验更好 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| [/doctor](https://code.claude.com/docs/en/cli-reference) 诊断安装、认证与配置问题 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| QA 用[跨模型](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md)——比如 [Codex](https://github.com/shanraisshan/codex-cli-best-practice) 来审计划和实现 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| agentic 搜索（glob + grep）胜过 RAG——Claude Code 试过向量数据库又放弃了：代码会漂移失步，权限又复杂 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://youtu.be/julbw1JuAz0?t=3095) [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/video.svg" alt="Video" height="20">](https://youtu.be/julbw1JuAz0?t=3095) |

### ■ 实用工具（5）

| 技巧 | 出处 |
|-----|--------|
| 终端用 [iTerm](https://iterm2.com/)/[Ghostty](https://ghostty.org/)/[tmux](https://github.com/tmux/tmux)，不用 IDE（[VS Code](https://code.visualstudio.com/)/[Cursor](https://www.cursor.com/)） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2017742753971769626) |
| 语音 prompt 用 [/voice](https://code.claude.com/docs/en/voice-dictation) 或 [Wispr Flow](https://wisprflow.ai)（10 倍效率） | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2038454362226467112) |
| [claude-code-hooks](https://github.com/shanraisshan/claude-code-hooks)，给 Claude 加反馈提示 | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| [status line](https://github.com/shanraisshan/claude-code-status-line)——随时感知上下文占用，快速 compact | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2021700784019452195) <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| 翻翻 [settings.json](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md) 里的功能，比如 [Plans Directory](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md#plans-directory)、[Spinner Verbs](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md#display--ux)，调出顺手的手感 | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny/status/2021701145023197516) |

### ■ 日常（2）

| 技巧 | 出处 |
|-----|--------|
| 每天[更新](https://code.claude.com/docs/en/setup) Claude Code | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |
| 每天开工先读 [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-shayan.svg" alt="Shayan" height="20"> |

<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Boris Cherny + Team" height="20">

### 文章 / 推文

| 文章 / 推文 | 出处 |
|-----------------|--------|
| [6 Tips for Getting More Out of Opus 4.7 (Boris) \| 16/Apr/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-6-tips-16-apr-26.md) | [Tweet](https://x.com/bcherny) |
| [Session Management & 1M Context (Thariq) \| 16/Apr/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-16-apr-26.md) | [Tweet](https://x.com/trq212) |
| [15 Hidden & Under-Utilized Features in Claude Code (Boris) \| 30/Mar/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-15-tips-30-mar-26.md) | [Tweet](https://x.com/bcherny/status/2038454336355999749) |
| [Squash Merging & PR Size Distribution (Boris) \| 25/Mar/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-2-tips-25-mar-26.md) | [Tweet](https://x.com/bcherny/status/2038552880018538749) |
| [Lessons from Building Claude Code: How We Use Skills (Thariq) \| 17/Mar/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-17-mar-26.md) | [Article](https://x.com/trq212/status/2033949937936085378) |
| [Code Review & Test Time Compute (Boris) \| 10/Mar/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-2-tips-10-mar-26.md) | [Tweet](https://x.com/bcherny/status/2031089411820228645) |
| /loop——最长排 3 天的周期任务（Boris）\| 2026-03-07 | [Tweet](https://x.com/bcherny/status/2030193932404150413) |
| AskUserQuestion + ASCII Markdowns（Thariq）\| 2026-02-28 | [Tweet](https://x.com/trq212/status/2007543858289250472) |
| Seeing like an Agent——做 Claude Code 学到的事（Thariq）\| 2026-02-28 | [Article](https://x.com/trq212/status/2027463795355095314) |
| Git Worktrees——Boris 的五种用法 \| 2026-02-21 | [Tweet](https://x.com/bcherny/status/2025007393290272904) |
| Lessons from Building Claude Code: Prompt Caching Is Everything（Thariq）\| 2026-02-20 | [Article](https://x.com/trq212/status/2024574133011673516) |
| [12 ways how people are customizing their claudes (Boris) \| 12/Feb/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-12-tips-12-feb-26.md) | [Tweet](https://x.com/bcherny/status/2021699851499798911) |
| [10 tips for using Claude Code from the team (Boris) \| 01/Feb/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-10-tips-01-feb-26.md) | [Tweet](https://x.com/bcherny/status/2017742741636321619) |
| [How I use Claude Code — 13 tips from my surprisingly vanilla setup (Boris) \| 03/Jan/26](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-13-tips-03-jan-26.md) | [Tweet](https://x.com/bcherny/status/2007179832300581177) |
| Ask Claude to interview you using AskUserQuestion tool（Thariq）\| 2025-12-28 | [Tweet](https://x.com/trq212/status/2005315275026260309) |
| Always use plan mode, give Claude a way to verify, use /code-review（Boris）\| 2025-12-27 | [Tweet](https://x.com/bcherny/status/2004711722926616680) |

#### 来自 Claude Code CLI 二进制的技巧

[Spinner Verbs & Tips（从 CLI 二进制 v2.1.121 提取）](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-spinner-verbs-and-tips.md)

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 🎬 视频 / 播客

| 视频 / 播客 | 出品 | YouTube |
|-----------------|--------|--------|
| From Vibe Coding to Agentic Engineering (Andrej) \| 2026-05-02 \| AI Engineer | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-karpathy.svg" alt="Karpathy" height="20">](https://x.com/karpathy) | [YouTube](https://www.youtube.com/watch?v=96jN2OCOfLs) |
| Full Walkthrough: Workflow for AI Coding (Matt) \| 2026-04-24 \| Matt Pocock | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-matt.svg" alt="Matt" height="20">](https://x.com/mattpocockuk) | [YouTube](https://youtu.be/-QFHIoCo-Ko) |
| Everything We Got Wrong About Research-Plan-Implement (Dex) \| 2026-03-24 \| MLOps Community | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community-dex.svg" alt="Dex" height="20">](https://x.com/daborhyde) | [YouTube](https://youtu.be/YwZR6tc7qYg) |
| Building Claude Code with Boris Cherny (Boris) \| 2026-03-04 \| The Pragmatic Engineer | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny) | [YouTube](https://youtu.be/julbw1JuAz0) |
| Head of Claude Code: What happens after coding is solved (Boris) \| 2026-02-19 \| Lenny's Podcast | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny) | [YouTube](https://youtu.be/We7BZVKbCVw) |
| Inside Claude Code With Its Creator Boris Cherny (Boris) \| 2026-02-17 \| Y Combinator | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny) | [YouTube](https://youtu.be/PQU9o_5rHC4) |
| Boris Cherny (Creator of Claude Code) On What Grew His Career (Boris) \| 2025-12-15 \| Ryan Peterman | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny) | [YouTube](https://youtu.be/AmdLVWMdjOk) |
| The Secrets of Claude Code From the Engineers Who Built It (Cat) \| 2025-10-29 \| Every | [<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/boris-cherny.svg" alt="Boris" height="20">](https://x.com/bcherny) | [YouTube](https://youtu.be/IDSAMqip6ms) |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 🔔 订阅

| 渠道 | 名称 | 徽章 |
|--------|------|-------|
| <img src="https://img.shields.io/badge/-FF4500?style=flat&logo=reddit&logoColor=white" alt="Reddit" height="20"> | [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/), [r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/), [r/Anthropic](https://www.reddit.com/r/Anthropic/) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Boris + Team" height="20"> |
| <img src="https://img.shields.io/badge/-000?style=flat&logo=x&logoColor=white" alt="X" height="20"> | [Claude](https://x.com/claudeai), [Claude Devs](https://x.com/ClaudeDevs), [Anthropic](https://x.com/AnthropicAI), [Boris](https://x.com/bcherny), [Thariq](https://x.com/trq212), [Cat](https://x.com/_catwu), [Lydia](https://x.com/lydiahallie), [Noah](https://x.com/noahzweben), [Anthony](https://x.com/amorriscode), [Alex](https://x.com/alexalbert__), [Kenneth](https://x.com/neilhtennek) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Boris + Team" height="20"> |
| <img src="https://img.shields.io/badge/-000?style=flat&logo=x&logoColor=white" alt="X" height="20"> | [Jesse Kriss](https://x.com/obra) ([Superpowers](https://github.com/obra/superpowers)), [Affaan Mustafa](https://x.com/affaanmustafa) ([ECC](https://github.com/affaan-m/everything-claude-code)), [Garry Tan](https://x.com/garrytan) ([gstack](https://github.com/garrytan/gstack)), [Dex Horthy](https://x.com/dexhorthy) ([HumanLayer](https://github.com/humanlayer/humanlayer)), [Kieran Klaassen](https://x.com/kieranklaassen) ([Compound Eng](https://github.com/EveryInc/compound-engineering-plugin)), [Tabish Gilani](https://x.com/0xTab) ([OpenSpec](https://github.com/Fission-AI/OpenSpec)), [Brian McAdams](https://x.com/BMadCode) ([BMAD](https://github.com/bmad-code-org/BMAD-METHOD)), [Lex Christopherson](https://x.com/official_taches) ([GSD](https://github.com/gsd-build/get-shit-done)), [Matt Pocock](https://x.com/mattpocockuk) ([Skills](https://github.com/mattpocock/skills)), [Dani Avila](https://x.com/dani_avila7) ([CC Templates](https://github.com/davila7/claude-code-templates)), [Dan Shipper](https://x.com/danshipper) ([Every](https://every.to/)), [Andrej Karpathy](https://x.com/karpathy) ([AutoResearch](https://x.com/karpathy/status/2015883857489522876)), [Peter Steinberger](https://x.com/steipete) ([OpenClaw](https://x.com/openclaw)), [Sigrid Jin](https://x.com/realsigridjin) ([claw-code](https://github.com/ultraworkers/claw-code)), [Yeachan Heo](https://x.com/bellman_ych) ([oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community.svg" alt="Community" height="20"> |
| <img src="https://img.shields.io/badge/-F00?style=flat&logo=youtube&logoColor=white" alt="YouTube" height="20"> | [Anthropic](https://www.youtube.com/@anthropic-ai) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude.svg" alt="Boris + Team" height="20"> |
| <img src="https://img.shields.io/badge/-F00?style=flat&logo=youtube&logoColor=white" alt="YouTube" height="20"> | [Lenny's Podcast](https://www.youtube.com/@LennysPodcast), [Y Combinator](https://www.youtube.com/@ycombinator), [The Pragmatic Engineer](https://www.youtube.com/@pragmaticengineer), [Ryan Peterman](https://www.youtube.com/@ryanlpeterman), [Every](https://www.youtube.com/@every_media), [MLOps Community](https://www.youtube.com/@MLOps) | <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/community.svg" alt="Community" height="20"> |

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## ☠️ 创业公司与替代品

| Claude | 被替代的 |
|-|-|
|[**Code Review**](https://code.claude.com/docs/en/code-review)|[Greptile](https://greptile.com), [CodeRabbit](https://coderabbit.ai), [Devin Review](https://devin.ai), [OpenDiff](https://opendiff.com), [Cursor BugBot](https://bugbot.dev)|
|[**Voice Dictation**](https://code.claude.com/docs/en/voice-dictation)|[Wispr Flow](https://wisprflow.ai), [SuperWhisper](https://superwhisper.com/)|
|[**Remote Control**](https://code.claude.com/docs/en/remote-control)|[OpenClaw](https://openclaw.ai/)|
|[**Claude in Chrome**](https://code.claude.com/docs/en/chrome)|[Playwright MCP](https://github.com/microsoft/playwright-mcp), [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp)|
|[**Computer Use**](https://docs.anthropic.com/en/docs/agents-and-tools/computer-use)|[OpenAI CUA](https://openai.com/index/computer-using-agent/)|
|[**Cowork**](https://claude.com/blog/cowork-research-preview)|[ChatGPT Agent](https://openai.com/chatgpt/agent/), [Perplexity Computer](https://www.perplexity.ai/computer/), [Manus](https://manus.im)|
|[**Tasks**](https://x.com/trq212/status/2014480496013803643)|[Beads](https://github.com/steveyegge/beads)|
|[**Plan Mode**](https://code.claude.com/docs/en/common-workflows)|[Agent OS](https://github.com/buildermethods/agent-os)|
|[**Design**](https://claude.com/design)|[Figma](https://figma.com), [Framer](https://framer.com), [Sketch](https://sketch.com), [v0](https://v0.dev)|
|[**Agent SDK**](https://code.claude.com/docs/en/agent-sdk/overview)|[LangChain](https://langchain.com), [LangGraph](https://www.langchain.com/langgraph), [CrewAI](https://www.crewai.com), [AutoGen](https://github.com/microsoft/autogen), [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)|
|[**Skills / Plugins**](https://code.claude.com/docs/en/plugins)|YC 的 AI 套壳创业公司（[reddit](https://reddit.com/r/ClaudeAI/comments/1r6bh4d/claude_code_skills_are_basically_yc_ai_startup/)）|

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/billion-dollar-questions.svg" alt="Billion-Dollar Questions" height="44"> 十亿美元问题

*有答案的话，写信到 shanraisshan@gmail.com。*

**记忆与指令（4）**

1. CLAUDE.md 里到底该放什么，不该放什么？
2. 已有 CLAUDE.md 的情况下，单独的 constitution.md 或 rules.md 真的有必要吗？
3. CLAUDE.md 多久更新一次？怎么知道它已经过时？
4. 为什么 Claude 还是会无视 CLAUDE.md 里的指令——哪怕写的是全大写的 MUST？（[reddit](https://reddit.com/r/ClaudeCode/comments/1qn9pb9/claudemd_says_must_use_agent_claude_ignores_it_80/)）

**Agents、Skills 与 Workflows（6）**

1. 什么时候用 command、agent、skill，什么时候原装 Claude Code 反而更好？
2. 模型在进步，agents、commands、workflows 该多久跟着更新一次？
3. subagent 要通才还是领域/角色专属？给 subagent 一份详细人设能不能提质？做研究/视觉的"完美人设 prompt"长什么样？
4. 靠 Claude Code 内置的 plan mode，还是自建一个能贯彻团队流程的 planning command/agent？
5. 有了自己的 skill（比如带个人风格的 /implement），怎么引入社区 skill（比如 /simplify）不打架？冲突时谁说了算？
6. 到那一步了吗——把现有代码库转成 spec，删掉代码，让 AI 只凭 spec 复原出一模一样的代码？

**规格与文档（3）**

1. 仓库里每个功能都该有一份 markdown spec 吗？
2. spec 多久更新一次，才不会在新功能落地后变成废纸？
3. 实现新功能时，怎么处理它对其他功能 spec 的连带影响？

### 🤔 [代码还重要吗？](https://github.com/shanraisshan/agentic-engineering)

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## 报告

<p align="center">
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-agent-sdk-vs-cli-system-prompts.md"><img src="https://img.shields.io/badge/Agent_SDK_vs_CLI-555?style=for-the-badge" alt="Agent SDK vs CLI" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-in-chrome-v-chrome-devtools-mcp.md"><img src="https://img.shields.io/badge/Browser_Automation_MCP-555?style=for-the-badge" alt="Browser Automation MCP" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-global-vs-project-settings.md"><img src="https://img.shields.io/badge/Global_vs_Project_Settings-555?style=for-the-badge" alt="Global vs Project Settings" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-skills-for-larger-mono-repos.md"><img src="https://img.shields.io/badge/Skills_in_Monorepos-555?style=for-the-badge" alt="Skills in Monorepos" height="28"></a>
  <br>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-agent-memory.md"><img src="https://img.shields.io/badge/Agent_Memory-555?style=for-the-badge" alt="Agent Memory" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-advanced-tool-use.md"><img src="https://img.shields.io/badge/Advanced_Tool_Use-555?style=for-the-badge" alt="Advanced Tool Use" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-usage-and-rate-limits.md"><img src="https://img.shields.io/badge/Usage_&_Rate_Limits-555?style=for-the-badge" alt="Usage & Rate Limits" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-agent-command-skill.md"><img src="https://img.shields.io/badge/Agents_vs_Commands_vs_Skills-555?style=for-the-badge" alt="Agents vs Commands vs Skills" height="28"></a>
  <br>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/llm-day-to-day-degradation.md"><img src="https://img.shields.io/badge/LLM_Degradation-555?style=for-the-badge" alt="LLM Degradation" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/why-harness-is-important.md"><img src="https://img.shields.io/badge/Why_Harness_is_Important-555?style=for-the-badge" alt="Why Harness is Important" height="28"></a>
  <a href="https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-spinner-verbs-and-tips.md"><img src="https://img.shields.io/badge/Spinner_Verbs_&_Tips-555?style=for-the-badge" alt="Spinner Verbs & Tips" height="28"></a>
</p>

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/how-to-use-hd.svg" alt="How to Use" height="40"> 如何使用

照下面几步走，把这个仓库的价值榨干：

1. **把它当课程读，不要当 workflow 或 skill 装。** 它首先是参考资料；跑是后面的事。
2. **别把 Claude 当聊天机器人。** 学原语——agents、commands、skills、hooks——组装成你自己的工作流。
3. **跑一遍 [`/weather-orchestrator`](https://github.com/shanraisshan/claude-code-best-practice/blob/main/orchestration-workflow/orchestration-workflow.md)**，看一条完整的 command → agent → skill 链路。把它当模板，套进任何开发流程，从规划到发布。
4. **干活时留意自定义 hook 的提示音。** 实现在专门的 [Claude Code Hooks 仓库](https://github.com/shanraisshan/claude-code-hooks)；其他模式（如 [Agent Teams](https://github.com/shanraisshan/claude-code-best-practice/blob/main/implementation/claude-agent-teams-implementation.md)）在本仓库 `implementation/` 目录里。
5. **进阶主题看 🔥 热点那张子表**——比如 [Ralph Wiggum 自进化循环](https://github.com/shanraisshan/ralph-wiggum-self-evolving-loop)是一个完整可克隆的仓库，能看到这类模式从头到尾长什么样。
6. **在你自己的项目里，让 Claude 读「技巧与窍门」那节并提修改建议**——尤其是怎么重组你的 `CLAUDE.md`。每条技巧都来自 Claude 团队或社区，带出处。
7. **订阅「订阅」一节里的 Reddit 和 YouTube 频道**，跟上社区。

**🎬 视频**

<a href="https://www.youtube.com/watch?v=AkAhkalkRY4"><img src="/sdlc-playbook/articles/claude-code-best-practice/thumbnail/video-1.png" alt="Watch on YouTube" width="240"></a>
<a href="https://youtu.be/lPjhM6BBK0Q"><img src="/sdlc-playbook/articles/claude-code-best-practice/thumbnail/video-2.png" alt="Watch on YouTube" width="240"></a>

**📊 演讲**

<a href="https://github.com/shanraisshan/claude-code-best-practice/tree/main/presentation/2026-04-25-gdg-kolachi-cli-claude-code-gemini"><img src="/sdlc-playbook/articles/claude-code-best-practice/thumbnail/presentation-1.png" alt="Claude Code & Gemini CLI — GDG Kolachi" width="240"></a>

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

<p align="center">
  <a href="https://github.com/trending"><img src="/sdlc-playbook/articles/claude-code-best-practice/root/github-trending.png" alt="GitHub Trending" width="1200"></a><br>
  ✨2026 年 3 月登上 GitHub Trending✨
</p>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=shanraisshan/claude-code-best-practice&type=Date&v=2)](https://star-history.com/#shanraisshan/claude-code-best-practice&Date)

<a href="https://github.com/shanraisshan/claude-code-best-practice/stargazers"><img src="https://img.shields.io/github/stars/shanraisshan/claude-code-best-practice?style=flat&label=%E2%98%85&labelColor=555&color=white" alt="GitHub Stars" align="center" height="20"></a> 颗 star，还在涨

## 其他仓库

<table>
<tr>
<td align="center" width="140">
  <a href="https://github.com/shanraisshan/claude-code-hooks"><img src="/sdlc-playbook/articles/claude-code-best-practice/claude-speaking.svg" alt="Claude Code Hooks" width="64" height="64"></a><br>
  <a href="https://github.com/shanraisshan/claude-code-hooks"><strong>Claude Code<br>Hooks</strong></a>
</td>
<td align="center" width="140">
  <a href="https://github.com/shanraisshan/codex-cli-best-practice"><img src="/sdlc-playbook/articles/claude-code-best-practice/codex-jumping.svg" alt="Codex CLI Best Practice" width="64" height="64"></a><br>
  <a href="https://github.com/shanraisshan/codex-cli-best-practice"><strong>Codex CLI<br>Best Practice</strong></a>
</td>
<td align="center" width="140">
  <a href="https://github.com/shanraisshan/codex-cli-hooks"><img src="/sdlc-playbook/articles/claude-code-best-practice/codex-speaking.svg" alt="Codex CLI Hooks" width="64" height="64"></a><br>
  <a href="https://github.com/shanraisshan/codex-cli-hooks"><strong>Codex CLI<br>Hooks</strong></a>
</td>
<td align="center" width="140">
  <a href="https://github.com/shanraisshan/gemini-cli-best-practice"><img src="/sdlc-playbook/articles/claude-code-best-practice/gemini-jumping.svg" alt="Gemini CLI Best Practice" width="64" height="64"></a><br>
  <a href="https://github.com/shanraisshan/gemini-cli-best-practice"><strong>Gemini CLI<br>Best Practice</strong></a>
</td>
<td align="center" width="140">
  <a href="https://github.com/shanraisshan/gemini-cli-hooks"><img src="/sdlc-playbook/articles/claude-code-best-practice/gemini-speaking.svg" alt="Gemini CLI Hooks" width="64" height="64"></a><br>
  <a href="https://github.com/shanraisshan/gemini-cli-hooks"><strong>Gemini CLI<br>Hooks</strong></a>
</td>
</tr>
</table>

## 开发者

<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/developed-by.svg" alt="Developed by" height="32">

> | # | Workflow | 说明 |
> |---|----------|-------------|
> | 1 | /workflows:development-workflows | 并行调研全部 10 个工作流仓库，更新 DEVELOPMENT WORKFLOWS 表与跨工作流分析报告 |
> | 2 | /workflows:skill-collections | 并行调研全部 5 个技能合集仓库，更新 SKILL COLLECTIONS 表 |
> | 3 | /workflows:agent-collections | 并行调研全部 agent 合集仓库，更新 AGENT COLLECTIONS 表 |
> | 4 | /workflows:best-practice:workflow-concepts | 跟进 Claude Code 最新功能与概念，更新 README 的 CONCEPTS 一节 |
> | 5 | /workflows:best-practice:workflow-claude-settings | 跟踪 settings 报告的变更，找出需要更新的内容 |
> | 6 | /workflows:best-practice:workflow-claude-subagents | 跟踪 subagents 报告的变更，找出需要更新的内容 |
> | 7 | /workflows:best-practice:workflow-claude-commands | 跟踪 commands 报告的变更，找出需要更新的内容 |
> | 8 | /workflows:best-practice:workflow-claude-skills | 跟踪 skills 报告的变更，找出需要更新的内容 |

## 附加链接

[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude-for-oss.svg" alt="Claude for OSS" height="32">](https://claude.com/contact-sales/claude-for-oss)
[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude-community-ambassador.svg" alt="Claude Community Ambassador" height="32">](https://claude.com/community/ambassadors)
[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/claude-certified-architect.svg" alt="Claude Certified Architect" height="32">](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)
[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/anthropic-academy.svg" alt="Anthropic Academy" height="32">](https://anthropic.skilljar.com/)
[<img src="/sdlc-playbook/articles/claude-code-best-practice/tags/whatsapp-claude-pakistan.svg" alt="加入 Claude Pakistan WhatsApp 社区" height="32">](https://chat.whatsapp.com/BDUV2stIS0c7X5uY7RY6nS)

<p align="center">
  <img src="/sdlc-playbook/articles/claude-code-best-practice/claude-jumping.svg" alt="section divider" width="60" height="50">
</p>

## <img src="/sdlc-playbook/articles/claude-code-best-practice/tags/sponsor-heart.svg" width="22" height="22" align="center"> 赞助作者

这个仓库帮到你的话，请我喝杯 doodh pati（奶茶）🍵：

<a href="https://buy.polar.sh/polar_cl_R6wjUESl8RiJD0iVaTyStBUV6WNuYvDmLJ0si1XXj4C"><img src="/sdlc-playbook/articles/claude-code-best-practice/tags/polar.svg" alt="Polar" width="40" height="40" align="center"></a> <a href="https://buy.polar.sh/polar_cl_R6wjUESl8RiJD0iVaTyStBUV6WNuYvDmLJ0si1XXj4C"><strong>Polar</strong></a>

**想把品牌放到页头？** 页头位置有偿开放——邮件 [shanraisshan@gmail.com](mailto:shanraisshan@gmail.com)。
