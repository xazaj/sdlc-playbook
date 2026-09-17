---
name: superpowers-tdd
title: TDD 工作流（superpowers）
summary: 在编写实现之前先写一个会失败的测试，以测试通过作为完成的唯一证据。
category: build
kind: skill
invoke: install
origin: marketplace
provider: superpowers@superpowers-marketplace
asset: superpowers:test-driven-development
upstream: https://github.com/obra/superpowers
release_source: plugin
agents:
  - Claude Code
evaluated_version: "6.3.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-17"
---

## 何时用

`stages/30-coding/DECIDE.md` 判定应走 TDD 之后，用它执行红绿重构循环。

它负责「怎么做」，不负责「要不要做」。决策仍由 DECIDE.md 承担，不跳过决策直接调用它。

不适用的场合同样明确：UI 布局、视觉细节与一次性脚本不要走它。那些地方错误立刻可见，测试先行的成本收不回来。安装 prompt 会把这条边界一并写进目标项目。

## 这一版怎么样（6.3.0）

- 红绿重构循环约束严格，会强制 agent 先看到测试失败再写实现。
- 它的触发描述是「实现任何功能前都用」。直接装进项目会让 agent 为 UI 布局和一次性脚本也写测试。下面的安装 prompt 通过在项目 AGENTS.md 中写明边界来抑制它。
- 同一插件中的 `brainstorming` 也会被强触发，与本工作流无关。安装时不要顺手启用整套插件的全部规则。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。按五步流程执行；两道防幻觉闸门不能省：版本号必须报告从哪个文件读到，技能本会话不可见时必须停下。

````text
请让 superpowers 的 test-driven-development 技能在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别的安装状态，只报告结论：
   - 用户级：Claude Code 查 ~/.claude/plugins/（installed_plugins.json）是否登记
     superpowers@superpowers-marketplace；其他 agent 查各自技能目录。
   - 项目级：.agents/skills/test-driven-development/、.claude/skills/。
   结论写清：装了/没装；装了则版本号是多少、从哪个文件读到。

2. 【对版本】已安装时：从 https://github.com/obra/superpowers/releases 查最新版本，
   与第 1 步读到的本地版本比较。一致则不动并说明依据；读不到本地版本则如实说明，
   不要猜；落后则用插件自身机制升级到最新，升级后重读版本确认。

3. 【安装】未安装时装最新版。Claude Code：/plugin install superpowers@superpowers-marketplace；
   其他 agent：从 https://github.com/obra/superpowers/tree/main/skills/test-driven-development
   取 SKILL.md 放到 .agents/skills/test-driven-development/SKILL.md。

4. 【加载确认】确认本会话真的能用它：技能触发描述应出现在你的可用技能里。
   新装的技能当前会话看不到时，不要装作可用，要告诉我要怎么让它生效
   （通常是重开会话），然后停下等我。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节整节替换：

## Development workflow

- Write a failing test before implementation when the change touches money,
  permissions, data migration, concurrency, or refactors existing behavior.
  Use the test-driven-development skill for the red-green-refactor loop.
- Do NOT require tests first for UI layout, visual details, or one-off scripts.
- If the change is exploratory and requirements are unclear, do a throwaway
  spike first, then decide the workflow.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：先在一个装过旧版本的环境贴这段 prompt，它应报告本地版本与来源、比对 releases 页、落后则升级；再让 agent 实现一个涉及金额计算的小函数，观察它是否先写测试；最后让它调整一个按钮的边距，观察它是否跳过测试。全程符合即安装正确。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'superpowers' in k])"
```

上游发布页：https://github.com/obra/superpowers/releases

评估历史：6.3.0（2026-09-03）
