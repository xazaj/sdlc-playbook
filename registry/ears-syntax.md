---
name: ears-syntax
title: EARS 需求句式
summary: 五种句式把需求写成可验证的句子，评审从主观印象变成可机检的语法约束。
category: define
kind: doc
origin: external
provider: Alistair Mavin 等（Rolls-Royce，RE'09 论文）
upstream: https://en.wikipedia.org/wiki/Easy_Approach_to_Requirements_Syntax
release_source: local
evaluated_version: "0.1.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/15-define/DECIDE.md` 判定需求条目会被验证或评审之后，用它约束句式。五种形态覆盖绝大多数需求：

- **Ubiquitous（恒常）**：`The <system> shall <behavior>`，无触发条件，永远成立。
- **Event-driven（事件）**：`When <trigger>, the <system> shall <behavior>`。
- **State-driven（状态）**：`While <in state>, the <system> shall <behavior>`。
- **Optional（可选特性）**：`Where <feature is included>, the <system> shall <behavior>`。
- **Unwanted（不良行为）**：`If <trigger>, then the <system> shall <response>`，规定对故障、错误输入的处置。

它把「系统应当支持导出」逼成「When 用户点击导出且选中行数大于 0，系统应在 3 秒内生成 CSV」。对 agent，这套句式是可机检的：不符合任何一种形态的条目可以被自动拒收，评审因此有了客观标准。

不适用：三五条以内的琐碎需求不必套句式，为句式而句式；探针问题与内部备忘不进评审，也不需要。前提超过三个的复杂需求、无法表达为条件行为的架构约束，EARS 官方也承认不擅长——那些用决策表或状态机表达。

## 这一版怎么样（0.1.0）

句式定义核自 EARS 条目（来源见 frontmatter `upstream`）：Rolls-Royce 为航空发动机控制系统分析适航条例时提出，2009 年发表于 IEEE RE 大会，Airbus、NASA、Siemens 等采用，方法自发表以来未变，无版本漂移风险。

两点与 agent 时代直接相关：一，Amazon 的 Kiro IDE 已把 EARS 采为原生需求记法，理由是其受约束的自然语言人与 LLM 都能解析，能减少 agent 自行脑补的空间；二，它常与 user story 配合——story 承接涉众意图，EARS 写 story 内的验收标准，两层并不互斥。

本卡与 `claude-prose-style` 同型：不安装任何依赖，只往 AGENTS.md 写一段规则。规则文本由本库维护。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 EARS 需求句式约束装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Requirements syntax (EARS)

- Write every requirement that will be verified or reviewed in one of
  the five EARS forms:
  - Ubiquitous: "The <system> shall <behavior>."
  - Event-driven: "When <trigger>, the <system> shall <behavior>."
  - State-driven: "While <in state>, the <system> shall <behavior>."
  - Optional: "Where <feature is included>, the <system> shall <behavior>."
  - Unwanted: "If <trigger>, then the <system> shall <response>."
- Behavior clauses must be verifiable as written; put measurable bounds
  (time, count, precision) in the clause when the requirement will be
  tested.
- Requirements describe behavior, never implementation choices.
- When reviewing requirements, reject any entry that fits none of the
  five forms instead of debating whether it "reads clearly".
- Do NOT force EARS on throwaway notes, spike questions, or changes
  with only a handful of trivial requirements.

2. 完成后列出你改动或新增的文件。
````

确认方式：让 agent 评审一句「系统应当尽量快地支持导出」。装对了它应指出这句不符合五种形态中的任何一种，并改写为带触发条件与可度量边界的 Event-driven 形式。

## 版本

句式来源为公开论文与工业实践（见 frontmatter `upstream`），方法 2009 年以来未变。本卡的规则文本由本库撰写维护，随本库 git 版本走，无上游版本可跟踪。

评估历史：0.1.0（2026-09-03）
