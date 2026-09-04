---
name: interfaces-better
title: better-* 界面技能家族（interfaces）
summary: 排版、色彩、布局、无障碍、UI、文案六域打磨规则，外加变体探索与实现逆向。
category: design
kind: skill
origin: external
provider: interfaces@interfaces（jakubkrehel/skills 自带 marketplace）
asset: better-interface / better-ui / better-typography / better-colors / better-accessibility / better-layout / better-writing / variant / explain-interface
upstream: https://github.com/jakubkrehel/skills
release_source: plugin
pairs_with:
  - gstack-design-consultation
  - ai-design-three-stages
agents:
  - Claude Code
  - Codex
evaluated_version: "1.6.3"
evaluated_at: "2026-09-04"
updated_at: "2026-09-04"
---

## 何时用

`stages/20-design/DECIDE.md` 判定由 agent 生成或改写界面之后，用它执行打磨。六个领域各一个技能（typography / colors / layout / accessibility / ui / writing），`better-interface` 是六域合并的总审查入口。另含两个辅助：`variant` 为单个组件生成多个方向供选择迭代；`explain-interface` 逆向弄清某个动画或界面效果是怎么实现的。

它只管界面质量。正确性、测试、安全属于项目自己的代码审查，它会点名一次然后交还；产出完整设计系统是 `gstack-design-consultation` 的事，两者是上下游。一次性 demo 不必全量打磨。

## 这一版怎么样（1.6.3）

- 规则带具体数值而非口号：300 以下字重只许用于 28px 以上的展示字号；正文行高 1.5–1.6、标题约 1.1；长文每行 60–75 字符；iOS 上小于 16px 的输入框会触发整页缩放，并给出两种修法及取舍。每域末尾有 Mistake→Fix 对照表与 Block/Approve 判定。
- 域间所有权切分干净：文字渲染归 typography、语义结构归 accessibility、对比度测量归 colors——同一问题不会被两条规则给出不同答案。
- 多文件结构：每个技能是 SKILL.md 加若干专题 md 与 `agents/openai.yaml`（Codex 适配），不能只拷单个 SKILL.md 安装。
- 热度与来源：5228★ / 175 fork，2026-07 建仓，评估时（8-29）仍在推送；作者经营设计工程杂志 interfaces.dev，技能内容是其文章体系的可执行化，MIT。
- 触发面：`better-*` 会随界面工作自动触发，这是期望行为；但变更审查属于 `interface-review`（仅用户调用），安装 prompt 写明了这条边界。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 interfaces 技能家族装进本项目，要求：

1. 确保本项目可使用 interfaces 插件的 better-* 技能。
   - Claude Code：先 /plugin marketplace add jakubkrehel/skills，
     再 /plugin install interfaces@interfaces
   - 其他 agent：运行 npx skills add jakubkrehel/skills（skills.sh 安装器），
     或把 https://github.com/jakubkrehel/skills 仓库的 skills/ 目录整体复制到
     本项目 .agents/skills/（多文件技能，不能只拷单个 SKILL.md）

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Interface quality skills

- When generating or modifying UI, apply the better-* domain rules
  (typography, colors, layout, accessibility, UI, writing) for the area
  touched; use the exact values from the skills rather than
  familiar-looking equivalents.
- Do NOT run a full better-interface review on trivial or one-off changes;
  reviewing a concrete change is user-invoked via interface-review.
- These skills own interface quality only. Correctness, tests and security
  belong to the project's code review: name such a finding once, then move on.
- If the project has a DESIGN.md or design tokens, they override generic
  preferences from these skills.

3. 完成后列出你改动或新增的文件。
````

确认方式：让 agent 写一张带价格和倒计时的卡片，检查数字用了 `tabular-nums`、长文案有省略或截断处理；再让它给一段文字加下划线动效，观察它是否按技能规则把下划线做成独立元素而不是动画 `text-decoration`。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`，对应 plugin.json 的 version 字段）。上游无 releases 页，版本随 main 分支提交演进：插件方式安装的由 Claude Code 插件机制管理，`npx skills add` 安装的重跑同一命令即更新。评估基线提交：267330e1ad（2026-08-29）。

评估历史：1.6.3（2026-09-04）
