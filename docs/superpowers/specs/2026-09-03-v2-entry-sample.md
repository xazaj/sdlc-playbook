# v2 条目样例

> 本文是 `workflows/tdd-superpowers.md` 按 v2 格式写出的样子，用于评审格式本身。
>
> 状态：已采纳并落地（2026-09-03）。"这一版怎么样"与"安装 prompt"两节已并入 `registry/superpowers-tdd.md`，`evaluated_*` 字段已进入登记卡 frontmatter。v2 的 `workflows/` 目录暂缓，本文保留作格式样例。

---

```yaml
---
name: tdd-superpowers
category: workflow
origin: external
upstream: https://github.com/obra/superpowers
release_source: github-release
evaluated_version: "6.3.0"
evaluated_at: "2026-09-03"
agents: [claude-code]
---
```

# TDD 工作流（superpowers）

## 一句话

让 agent 在写实现之前先写一个会失败的测试，以测试通过作为"完成"的唯一证据。

## 适合 / 不适合

**适合**

- 错误要很久才会暴露的逻辑：金额计算、权限判断、数据迁移、并发
- 重构既有代码，需要"行为不变"的证据
- 交给 agent 自主执行的改动，测试是它唯一可靠的自检信号

**不适合**

- UI 布局与视觉细节，断言 DOM 结构会导致每改一次样式就失败一次
- 一次性脚本
- 需求尚未想清的探索阶段，此时应先做 spike

## 这一版怎么样（6.3.0）

- 技能本体成熟，红绿重构循环约束严格，会强制 agent 先看到测试失败再写实现。
- **坑：它的触发描述是"实现任何功能前都用"。** 直接装进项目会让 agent 为 UI 布局和一次性脚本也写测试。下面的 prompt 会在项目 AGENTS.md 中写明边界来抑制它。
- 同一插件中的 `brainstorming` 也会被强触发，与本工作流无关。安装时不要顺手启用整套插件的全部规则。

## 安装 prompt

复制整块，贴进你项目中的 agent 会话：

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

Claude Code 用户可以直接执行第一步中的 `/plugin install`，其余步骤仍由 agent 完成。

## 装完之后

项目中会新增或改动：

- `AGENTS.md` 新增 "Development workflow" 一节
- Claude Code 用户：插件装在用户级，项目内不新增文件。其他 agent：`.agents/skills/test-driven-development/SKILL.md`

确认方式：让 agent 实现一个涉及金额计算的小函数，观察它是否先写测试；再让它调整一个按钮的边距，观察它是否跳过测试。两者都符合预期即安装正确。

## 版本与更新

- 上游版本由 Claude Code 的插件机制管理，本机实际版本查 `~/.claude/plugins/installed_plugins.json`
- 上游发布页：https://github.com/obra/superpowers/releases
- 本条目评估历史：6.3.0（2026-09-03）
