---
name: superpowers-writing-plans
title: writing-plans（superpowers）
summary: 把已批准的规格转成实现计划：任务级文件清单、接口签名、逐步 TDD 步骤，禁止占位符。
category: define
kind: skill
origin: marketplace
provider: superpowers@superpowers-marketplace
asset: superpowers:writing-plans
upstream: https://github.com/obra/superpowers
release_source: plugin
pairs_with:
  - superpowers-brainstorming
  - superpowers-tdd
agents:
  - Claude Code
evaluated_version: "6.3.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/15-define/DECIDE.md` 判定为变更级规格（跨模块改动、交给 agent 自主执行）且规格已获批准之后，用它把规格转成实现计划。计划按「执行者对代码库零上下文」的标准写：每个任务列出精确到行号的文件清单、consumes/produces 的接口签名、逐步 checkbox（写失败测试 → 跑确认失败 → 最小实现 → 跑通过 → 提交）。

它同时承接 `stages/30-coding/DECIDE.md` 判定 SDD 后的执行段：规格由 brainstorming 产出，计划由它产出，两者是同一链条。

不适用：没有规格直接写计划——它假设澄清已完成，跳过 brainstorming 直接调用它等于把最便宜的返工阶段删掉；已明确知道改哪几行的小修改；可行性未定的探索（先做探针，计划会把探针错误地固化）。

## 这一版怎么样（6.3.0）

- 「No Placeholders」是硬约束：TBD、"add appropriate error handling"、"Similar to Task N" 都被点名为计划失败。这正好堵住 agent 写计划最常见的偷懒方式——描述做什么而不给出内容。
- 任务边界按「评审者能否单独否决一项而批准相邻项」划分，而不是按代码层级切。
- 自检三步可操作：规格覆盖（每条规格能指到对应任务）、占位符扫描、跨任务类型一致性（Task 3 的 `clearLayers` 与 Task 7 的 `clearFullLayers` 不一致是 bug）。
- 交接给两个执行技能：subagent-driven（每任务一个新子代理，推荐）或 executing-plans（本会话内分批执行），都是 superpowers 自家资产，与 `registry/superpowers-tdd.md` 同链。
- 计划头部要求把规格的全局约束逐字抄进 Global Constraints 一节——上下文压缩后任务执行者仍能读到精确值。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 implementation planning 装进本项目，要求：

1. 确保本项目能使用 superpowers 的 writing-plans 技能。
   - Claude Code：运行 /plugin install superpowers@superpowers-marketplace
   - 其他 agent：从 https://github.com/obra/superpowers/tree/main/skills/writing-plans
     取 SKILL.md，放到本项目 .agents/skills/writing-plans/SKILL.md

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Implementation planning

- When an approved spec or agreed requirements exist for a multi-step
  change, write an implementation plan before touching code, using the
  writing-plans skill. Plans assume the executor has zero codebase
  context.
- Each task must list exact files (with line ranges for modifications),
  the interfaces it consumes and produces, and step-by-step TDD actions
  with actual test and implementation code.
- Placeholders are plan failures: "TBD", "add appropriate error
  handling", "write tests for the above", or "similar to Task N". Fix
  them before execution.
- Do NOT write a plan for single-file fixes or exploratory spikes.

3. 完成后列出你改动或新增的文件。
````

确认方式：给它一份两任务的小规格让它出计划，检查每个任务是否含接口签名与真实测试代码，并在计划里搜索不到 TBD、TODO 或「类似任务一」。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'superpowers' in k])"
```

上游发布页：https://github.com/obra/superpowers/releases

评估历史：6.3.0（2026-09-03）
