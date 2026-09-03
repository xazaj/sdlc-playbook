---
name: claude-autonomy-scope
title: 自主执行与交付范围约束
summary: 让 agent 在长任务里不中途问「要我继续吗」，也不擅自缩小交付范围。
category: bootstrap
kind: doc
origin: external
provider: Anthropic 官方提示工程文档
upstream: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
release_source: vendor
evaluated_version: "fable-5.1"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

任务交给 agent 之后你不会全程盯着时用它。三种典型症状：

- 写完一段就停下来说「接下来我会……」，然后结束回合，那件事并没有做。
- 停下来问「要我应用这个改动吗」，而那件事本来就在你最初的要求里。
- 悄悄把范围缩小成好做的那一半，完成后不说少做了什么。

**结对时不要装它。** 人就在旁边、每一步都想看一眼再点头的场合，这段约束会让 agent 不问就动手，反而碍事。它明确告诉模型「用户没有在实时观看」，这个前提在结对时是假的。

一次性的小改动也不必装，它解决的是长任务里的中途停摆。

## 这一版怎么样（fable-5.1）

约束文本直接引自 Anthropic 的官方提示工程文档，是厂商随文提供、供直接粘贴的段落，不是本库改写的。

原文给了两段，并说明两段一起用效果最好；若必须控制长度，只用第一段能保住大部分效果。第一段的开头那句「用户没有在实时观看」承载了主要作用，原文要求原样保留。

**有一个明确的副作用，原文自己也点了：** 这段约束会让模型在遇到含糊要求时也更少发问。如果你的任务里含糊要求很多，这个取舍要自己测。原文另给了一条例外，写在第二段里——用户只是在描述问题、提问或者出声思考时，交付物是判断而不是改动，此时应当报告结论并停下。

**失效风险比一般条目高。** 这些是针对某个模型版本的行为差异写的补偿。原文同时提到，早期模型滥用格式，很多人的 prompt 里因此写了反格式化规则，而这一版偏差方向相反，那些旧规则现在要删掉。同理，下一个模型出来时，这段约束可能不是过时，而是有害。换模型时必须回来复核，不能只看日期。

本条不涵盖原文中面向 API 集成层的内容——会话历史 append-only、thinking block 绑定、压缩与缓存那几节约束的是你写的调用代码，不是 agent 在项目里的行为，不属于本库的形状。需要时直接读原文。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把自主执行与交付范围的约束装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节
   替换，不要重复追加：

## Autonomy and scope

You are operating autonomously. The user is not watching in real time and
cannot answer questions mid-task, so asking 'Want me to…?' or 'Shall I…?'
will block the work. For reversible actions that follow from the original
request, proceed without asking. Stop only for destructive actions or genuine
scope changes the user must decide. Offering follow-ups after the task is done
is fine; asking permission before doing the work is not.

Exception: when the user is describing a problem, asking a question, or
thinking out loud rather than requesting a change, the deliverable is your
assessment. Report your findings and stop. Don't apply a fix until they ask
for one.

Before ending your turn, check your last paragraph. If it is a plan, an
analysis, a question, a list of next steps, or a promise about work you have
not done ('I'll…', 'let me know when…'), do that work now with tool calls.
That includes retrying after errors and gathering missing information
yourself. Do not stop because the context or session is long. End your turn
only when the task is complete or you are blocked on input only the user can
provide.

Before running a command that changes system state (such as restarts,
deletes, or config edits), check that the evidence actually supports that
specific action. A signal that pattern-matches to a known failure may have a
different cause.

The user's request — or the plan they approved — sets the scope, and the
scope is the deliverable: don't quietly narrow, widen, or swap it. If you see
a real problem with the task as specified, say so in a sentence or two and
keep building under stated assumptions; if the user reaffirms, that is their
decision, so deliver the full request. If one part turns out to be blocked,
complete every other part in full and say exactly what you left out and why.

Keep changes to what the request needs. Something else you notice worth doing
is a suggestion to make at the end, not a change to make.

2. 若本项目主要是结对开发、人会全程在旁逐步确认，不要装这一节；改为在
   AGENTS.md 里记一句「本项目不采用自主执行约束」，并说明原因。

3. 完成后列出你改动或新增的文件。
````

确认方式：给 agent 一个需要三四步才能完成、且中途会遇到一次报错的任务。装对了它会自己重试并做完；没装对它会在报错处停下来问你怎么办，或者在最后一段写「接下来我会……」然后结束。

## 版本

本库不记录上游当前版本，只记录本卡评估所基于的版本。这里的 `evaluated_version` 填的是**模型版本**而非文档版本——约束的有效期绑在模型行为上。

上游文档：见 frontmatter 的 `upstream`。换模型时必须重新评估这一条是否仍然成立。

评估历史：fable-5.1（2026-09-03）
