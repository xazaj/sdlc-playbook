---
name: frontend-design
title: 有辨识度的前端设计生成（frontend-design）
summary: Anthropic 官方技能：生成有生产质感、避开 AI 通用审美的前端界面，从设计方向探索到实现，179k stars 官方仓库维护。
category: design
kind: skill
invoke: install
origin: external
provider: Anthropic
asset: frontend-design
upstream: https://github.com/anthropics/skills
license: unspecified
pairs_with:
  - design-constraint-loop
agents:
  - Claude Code
  - Codex
  - Cursor
release_source: git
evaluated_version: "8a1541c4"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

决定「AI 直接生成视觉」后（走到这一步的判定见 `stages/20-design/DECIDE.md`），用它做生成：一次性演示、原型、内部工具、一到三屏的界面。它的职责是让生成结果避开模型默认审美——紫色渐变、居中英雄区、三栏特性网格那一套——产出有方向感的实现，而不是「像所有其他 AI 产品」的界面。

不适用：长期演进的产品直接裸用（超过五屏必散架，需要配合设计约束文件沉淀方向，见 `registry/design-constraint-loop.md`，两资产配合使用）；需要强品牌表达且品牌规范已存在的场合（沿用既有规范）；后端与非界面代码。它是生成器不是设计系统——界面的跨屏一致性仍靠约束与 token 层保证。

## 这一版怎么样（8a1541c4）

评估基于 anthropics/skills 仓库 HEAD（8a1541c4）与该技能在本库会话生态中的长期挂载表现：

- 官方维护是它的核心信号：仓库 179k stars，技能随 Claude Code 生态默认分发，多数环境开箱可用——先检测再安装，很多时候第 1 步就会发现已经装了。
- 触发描述覆盖「构建有设计质感的前端界面、避免通用 AI 审美」，与它的实际行为一致：先立设计方向（排版配对、色彩体系、构图节奏）再写代码，方向不落空时产物明显区别于无约束生成。
- 注意两点：其一，上游仓库 GitHub API 未识别出许可文件，介意许可的团队装前自行确认；其二，它的触发面宽（一切前端构建），与项目里其他前端类技能同装时要在 AGENTS.md 写明分工，否则会抢触发。

待验证（本卡未实测）：与 improve-animations、interfaces-better 同装时的触发竞争。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话：

````text
请让 frontend-design（Anthropic 官方前端设计技能）在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别的安装状态，只报告结论：
   - 用户级：~/.claude/skills/frontend-design/
   - 项目级：.claude/skills/frontend-design/、.agents/skills/frontend-design/
   另外它常随 Claude Code 官方技能包预装——若你的可用技能里已能触发，
   直接报告「已可用」并说明判断依据（触发描述出现在技能列表里）。

2. 【对版本】已安装时：查 https://github.com/anthropics/skills/commits/main
   最新 commit 与本地记录比较；读不到本地记录就如实说明，不要猜。

3. 【安装】未安装时：从上游仓库 skills/ 目录取 frontend-design 整目录
   放入 .claude/skills/frontend-design/。会 npx 的环境可用 npx skills add
   https://github.com/anthropics/skills --skill frontend-design（附注）。

4. 【加载确认】确认本会话真的可用（触发描述在技能列表里）。新装技能
   本会话不可见时不要装作可用，告诉用户怎么生效（通常重开会话），停下
   等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## Frontend design generation (frontend-design)

- Use frontend-design when generating UI from scratch: demos,
  prototypes, internal tools, small surfaces (up to ~3 screens).
- Do NOT use it as a substitute for a design system on long-lived
  products; cross-screen consistency comes from constraint files and
  tokens (see design-constraint-loop), not from per-screen generation.
- When other frontend skills are installed, this one owns visual
  direction and implementation of new surfaces only.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：让它做一个落地页且不给任何方向约束。装对了它会先陈述一个具体的设计方向（命名排版配对与色彩体系）再实现，产物没有紫色渐变与居中三栏；直接开写且产出「像所有 AI 产品」的，是没触发或没装对。

## 版本

上游以 git 管理（无 release），当前版本查询：<https://github.com/anthropics/skills/commits/main>。许可状态：GitHub API 未识别出许可文件，本卡评估时上游以公开仓库分发。

评估历史：8a1541c4（2026-09-30）
