---
name: superpowers-tdd
title: TDD 工作流（superpowers）
summary: 在编写实现之前先写一个会失败的测试，以测试通过作为完成的唯一证据。
category: build
kind: skill
origin: marketplace
provider: superpowers@superpowers-marketplace
asset: superpowers:test-driven-development
upstream: https://github.com/obra/superpowers
release_source: plugin
agents:
  - Claude Code
evaluated_version: "6.3.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/30-coding/DECIDE.md` 判定应走 TDD 之后，用它执行红绿重构循环。

它负责"怎么做"，不负责"要不要做"。决策仍由 DECIDE.md 承担，不跳过决策直接调用它。

## 这一版怎么样（6.3.0）

- 红绿重构循环约束严格，会强制 agent 先看到测试失败再写实现。
- 它的触发描述是"实现任何功能前都用"。直接装进项目会让 agent 为 UI 布局和一次性脚本也写测试。下面的安装 prompt 通过在项目 AGENTS.md 中写明边界来抑制它。
- 同一插件中的 `brainstorming` 也会被强触发，与本工作流无关。安装时不要顺手启用整套插件的全部规则。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 TDD 工作流装进本项目，要求：

1. 确保本项目能使用 superpowers 的 test-driven-development 技能。
   - Claude Code：运行 /plugin install superpowers@superpowers-marketplace
   - 其他 agent：从 https://github.com/obra/superpowers/tree/main/skills/test-driven-development
     取 SKILL.md，放到本项目 .agents/skills/test-driven-development/SKILL.md

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Development workflow

- Write a failing test before implementation when the change touches money,
  permissions, data migration, concurrency, or refactors existing behavior.
  Use the test-driven-development skill for the red-green-refactor loop.
- Do NOT require tests first for UI layout, visual details, or one-off scripts.
- If the change is exploratory and requirements are unclear, do a throwaway
  spike first, then decide the workflow.

3. 完成后列出你改动或新增的文件。
````

确认方式：让 agent 实现一个涉及金额计算的小函数，观察它是否先写测试；再让它调整一个按钮的边距，观察它是否跳过测试。两者都符合预期即安装正确。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'superpowers' in k])"
```

上游发布页：https://github.com/obra/superpowers/releases

评估历史：6.3.0（2026-09-03）
