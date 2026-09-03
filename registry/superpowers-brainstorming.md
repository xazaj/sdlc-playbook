---
name: superpowers-brainstorming
title: brainstorming（superpowers）
summary: 把模糊想法问成设计：先分级 spike/bounded/architectural，再按级澄清、提方案、过审批门。
category: define
kind: skill
origin: marketplace
provider: superpowers@superpowers-marketplace
asset: superpowers:brainstorming
upstream: https://github.com/obra/superpowers
release_source: plugin
pairs_with:
  - superpowers-writing-plans
agents:
  - Claude Code
evaluated_version: "6.3.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/15-define/DECIDE.md` 判定需求还处于想法阶段——说不清目的、约束或成功标准——之后，用它把想法问成设计。它先给请求分级：**spike**（求一个答案，产出是建议不是代码）、**bounded**（改仓库里已有的流程，聊天里给两三句短设计）、**architectural**（新系统、改接口，走完整流程落规格文件）。分级只升不降：中途发现隐藏复杂度必须停下重新分级。

architectural 路径的终点固定是 writing-plans：规格文件写完、自检过、经人审阅后交接。

不适用：需求已确定、只差落纸时直接写文档，不必重走提问；它的 HARD-GATE 要求任何实现动作前获得明确批准，机械改动与错字修正会被这道门挡住，安装 prompt 需写明豁免。

## 这一版怎么样（6.3.0）

- 三路径分级是它的核心价值：只有 architectural 落规格文件，spike 与 bounded 不产文档，避免「一刀切写 PRD」。
- 澄清提问强制一次一个，选项尽量给多选——与本库路由技能的提问纪律一致。
- 规格自检（占位符、自相矛盾、歧义、范围）与人审门分开：先自查修完，再交人审。
- 红旗清单点名了 agent 自我合理化的常见借口（「这个太简单不用设计」「spike 能跑就顺手把代码留下」），这是实际对抗跑偏的部分。
- 注意它的触发描述是「任何创造性工作之前必须使用」，装进项目会让所有小改动被迫走流程，下面的安装 prompt 用 AGENTS.md 边界压住这一点。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 brainstorming 工作流装进本项目，要求：

1. 确保本项目能使用 superpowers 的 brainstorming 技能。
   - Claude Code：运行 /plugin install superpowers@superpowers-marketplace
   - 其他 agent：从 https://github.com/obra/superpowers/tree/main/skills/brainstorming
     取 SKILL.md，放到本项目 .agents/skills/brainstorming/SKILL.md

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Requirements and design workflow

- For any new feature or behavior change, classify the request first:
  spike (answer a question), bounded (modify an existing flow), or
  architectural (new subsystem or interface change). Announce the
  classification before starting; upgrade on hidden complexity, never
  downgrade.
- Ask clarifying questions one at a time until purpose, constraints,
  and success criteria are clear.
- Present the design (2-3 approaches for architectural work) and get
  explicit approval before any implementation.
- Architectural work ends with a spec file and a handoff to the
  writing-plans skill.
- Do NOT trigger this workflow for mechanical edits, typo fixes, or
  changes whose scope is already agreed.

3. 完成后列出你改动或新增的文件。
````

确认方式：让 agent 处理「给设置页加一个主题开关」，观察它是否先宣布分级、问一两个澄清问题、给出短设计后停下等批准；再让它修一个错别字，观察它是否直接改。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'superpowers' in k])"
```

上游发布页：https://github.com/obra/superpowers/releases

评估历史：6.3.0（2026-09-03）
