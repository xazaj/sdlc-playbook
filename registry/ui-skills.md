---
name: ui-skills
title: UI 技能目录与安装器（ui-skills）
summary: 9.2k stars 的设计工程技能目录站（ibelick 维护）：按主题浏览 200+ UI 技能与 17 份公司设计规范，CLI 一键装进项目。
category: design
kind: skill
invoke: install
origin: external
provider: ibelick
asset: ui-skills
upstream: https://github.com/ibelick/ui-skills
license: MIT
pairs_with:
  - frontend-design
agents:
  - Claude Code
  - Codex
  - Cursor
release_source: npm
evaluated_version: "dc7ab320"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

本库登记的是「何时用哪一个」的判断，当判断结果是「需要的 UI 技能不在本库登记之列」——比如可访问性专项（WCAG 2.2 审计）、Remotion、色彩、排版、某个特定公司的 design.md——去这个目录按主题找，找到后经它安装。它是发现渠道：目录 + CLI（`npx ui-skills`）+ MCP 三种用法，技能按 Visual/Accessibility/Motion/Craft 等主题分类，每条带上游仓库与安装命令。

不适用：把它当质量背书——目录收录是策展不是审计，本次评估就在其中发现一句指针、无自包含规则的空壳技能（antfu/web-design-guidelines）；决策入口仍走本库的 DECIDE.md，这里只解决「去哪找」；安装后仍须按各资产自己的边界写 AGENTS.md 约束。

## 这一版怎么样（dc7ab320）

评估基于对站点与仓库的实际浏览（9.2k stars、MIT、TypeScript/Astro，2026-01 创建、持续活跃）：

- 策展密度高：200+ 技能条目几乎都回链 GitHub 上游（安装命令即 `npx skills add <上游仓库>`），17 份公司 design.md（Vercel、Atlassian、Ant Design、DSFR、Nuxt……）是设计规范类资产目前最集中的分发点。
- 每条技能页展示 SKILL.md 全文——这是它比一般 awesome 列表有用得多的地方：不用装就能读到内容，空壳技能当场现形。
- CLI 与 MCP 让批量场景（给团队初始化一套 UI 技能）可脚本化。

风险：目录增长快，条目质量不齐；上游技能更新不经过它，安装后版本以上游 git 为准。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话：

````text
请让 ui-skills 目录 CLI 在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】确认 npx 可用（node >= 18）；检查本项目是否已有
   .claude/skills/ 或 .agents/skills/ 下的技能与 package.json 记录，
   报告已装了哪些 UI 相关技能。

2. 【对版本】查 https://www.npmjs.com/package/ui-skills 的最新版本，
   与第 1 步若发现的已装版本比较；读不到就如实说明。

3. 【安装】不需要全局安装 CLI 本身。用
   npx ui-skills 交互式浏览，或对已确定的具体技能直接
   npx skills add <上游仓库> --skill <名> 装进项目。
   注意：装之前先在 https://www.ui-skills.com/skills/<owner>/<name>
   读一遍该技能的 SKILL.md 全文，确认它有自包含规则而非一句指针，
   再决定安装。

4. 【加载确认】装完确认技能出现在可用技能列表；本会话不可见时告知
   激活方式（通常重开会话），不要装作可用。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## UI skills catalog (ui-skills)

- Use the ui-skills catalog to discover and install UI skills beyond
  what this repo already registers; read a skill's SKILL.md on its
  catalog page BEFORE installing to reject pointer-only shells.
- The catalog is a discovery channel, not a quality guarantee; each
  installed skill still needs its own scope boundary in this file.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：在目录里任选一个技能页，检查它是否展示 SKILL.md 全文并给出指向上游仓库的安装命令；两个都有，发现渠道就算通了。装一个技能后重开会话能触发，才算装对。

## 版本

CLI 以 npm 分发，当前版本查询：<https://www.npmjs.com/package/ui-skills>；仓库版本见 <https://github.com/ibelick/ui-skills/commits/main>。本卡 `evaluated_version` 钉评估时仓库 HEAD（dc7ab320）。

评估历史：dc7ab320（2026-09-30）
