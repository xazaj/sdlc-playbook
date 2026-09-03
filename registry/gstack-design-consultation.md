---
name: gstack-design-consultation
title: design-consultation（gstack）
summary: 从零产出完整设计方案：美学方向、字体、色彩、布局、间距、动效，并生成预览。
category: design
kind: skill
origin: external
provider: gstack
asset: design-consultation
upstream: https://github.com/garrytan/gstack
install_path: ~/.claude/skills/design-consultation
release_source: vendor
agents:
  - Claude Code
evaluated_version: "1.77.0.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/20-design/DECIDE.md` 判定需要完整设计系统（长期演进、需要品牌辨识度）之后，用它产出具体方案：美学方向、字体、色彩、布局、间距、动效，并生成预览。

判定为 AI 直接生成视觉时不使用它。它的产出规模远超一次性界面所需。

## 这一版怎么样（1.77.0.0）

- 流程完整：先理解产品与竞品，再提出设计系统，最后生成字体与配色预览供人选择。
- 它是 gstack 套件中的一个技能，安装时会连同整套 gstack 一起装入。套件中其他技能（如 `/browse`）会声明接管浏览器操作，与本项目无关的规则不要顺手写进目标项目。
- 产出是设计方案而非约束文件。要让后续 agent 生成的界面遵守该方案，需要把结果固化为项目内的 DESIGN.md，见下面的安装 prompt。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请为本项目建立设计系统约束，要求：

1. 确保可以使用 gstack 的 design-consultation 技能。
   若尚未安装 gstack，按 https://github.com/garrytan/gstack 的说明安装
   （Claude Code：克隆到 ~/.claude/skills/gstack 后运行 ./setup）。

2. 运行 design-consultation，与我确认美学方向、字体、色彩、布局、间距与动效。

3. 把确认后的结果写入本项目根目录的 DESIGN.md：YAML frontmatter 存 token
   （色彩、字体、间距、圆角），正文写意图（应有什么感觉、什么绝对不要）。
   若文件已存在则更新对应部分，不要重复追加。

4. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换：

## Design constraints

- All UI work must follow DESIGN.md at the project root. Read it before
  generating or modifying any interface.
- Use tokens from DESIGN.md; never hard-code colors, fonts, or spacing.
- Do not fall back to default component-library themes or generic layouts
  (gradient hero, centered three-column feature grid).

5. 完成后列出你改动或新增的文件。
````

确认方式：让 agent 新增一个页面，检查它是否先读 DESIGN.md，并且颜色与字体引用的是 token 而非硬编码值。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 gstack 自身管理：本机版本见 `~/.claude/skills/gstack/VERSION`，更新检查见 `~/.gstack/last-update-check`，升级用 `gstack-upgrade` 技能。

评估历史：1.77.0.0（2026-09-03）
