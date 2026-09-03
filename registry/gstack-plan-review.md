---
name: gstack-plan-review
title: plan 评审四件套与 autoplan（gstack）
summary: 四个视角评审写好的规格：值不值得做、体验、工程可行、开发者体验；autoplan 串起来自动跑。
category: define
kind: skill
origin: external
provider: gstack
asset: plan-ceo-review / plan-design-review / plan-eng-review / plan-devex-review / autoplan
upstream: https://github.com/garrytan/gstack
release_source: vendor
pairs_with:
  - ears-syntax
  - superpowers-writing-plans
agents:
  - Claude Code
evaluated_version: "1.77.0.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/15-define/DECIDE.md` 判定规格要开工、投入值得评审之后用。四个技能各管一个视角，独立可用，共四千余行：

- `plan-ceo-review`：值不值得做。四种模式可选——扩张、选择性扩张、守住范围、收缩到本质。
- `plan-design-review`：体验上说不说得通。
- `plan-eng-review`：工程上可不可行。架构、依赖、代码质量、测试覆盖。
- `plan-devex-review`：开发者体验，API/CLI/SDK 设计。

`autoplan` 把四个按序自动跑完，自动采纳推荐项，只在品味决策（接近的方案、边界范围、跨模型分歧）处停下来要人批准。

不适用：一次性脚本与三五条需求的小改动，评审成本收不回；没有书面规格时评审无从谈起，先走澄清与编写；规格本身还不稳定时反复全量评审只会产生噪音。

## 这一版怎么样（1.77.0.0）

- 评审不是清单式挑错。工程版要求每个发现带置信度（1-10）与证据：引用触发该发现的 `file:line` 原文，引不出证据的发现强制降置信并压进附录——专治评审报告里「看起来专业但全是猜测」的条目。
- STOP 门：每个发现单独过一次决策，未获批准不得改计划文件。评审的产出是「逐条批准过的修订」，不是一份被动阅读的报告。
- 测试覆盖画成 ASCII 覆盖图，代码路径与用户流程并列（双击提交、中途离开、空列表、慢网络），回归测试列为铁律不经提问。
- ceo 版把「think bigger」做成四档可选，扩张是决策而非口号；eng 版对架构发现要求描述一个真实的生产故障场景。
- 依赖注意：安装 gstack 会装入整套技能，无关技能的规则（如 `/browse` 接管浏览器操作）不要写进目标项目，安装 prompt 只圈定评审四件套。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请为本项目接入规格与计划评审，要求：

1. 确保可以使用 gstack 的 plan-ceo-review、plan-design-review、
   plan-eng-review、plan-devex-review 与 autoplan 技能。
   若尚未安装 gstack，按 https://github.com/garrytan/gstack 的说明安装
   （Claude Code：克隆到 ~/.claude/skills/gstack 后运行 ./setup）。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Plan and spec review

- Before implementing a spec that crosses module boundaries or will run
  long unattended, run a review pass: plan-eng-review for feasibility,
  plan-ceo-review for worth-doing, plan-design-review and
  plan-devex-review when UX or DX is at stake. autoplan runs all four
  sequentially with auto-decisions and surfaces taste calls for
  approval.
- Review findings must carry a confidence score and quote the exact
  lines that motivate them; findings without quotable evidence are
  demoted, not deleted.
- Do NOT run full reviews on one-off scripts or changes with only a
  handful of requirements.

3. 完成后列出你改动或新增的文件。
````

确认方式：给 agent 一份内含明显矛盾（两节对同一接口描述不一致）的规格，跑 plan-eng-review。装对了它应逐条给出带置信度与引用的发现，并在修订前逐条停下来等你批准，而不是直接吐出一份改好的版本。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。

上游当前版本由 gstack 自身管理，三处可查：本机版本在 `~/.claude/skills/gstack/VERSION`，更新检查记录在 `~/.gstack/last-update-check`，升级用 `gstack-upgrade` 技能。

评估历史：1.77.0.0（2026-09-03）
