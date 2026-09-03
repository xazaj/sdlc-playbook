---
name: claude-prose-style
title: 文风与格式约束
summary: 去掉做作文风，并把旧的「禁止格式化」规则换成「何时该用格式」。
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

agent 要产出给人读的文字时用它：技术文档、说明、评审意见、提交信息、面向用户的界面文案。

**两种症状对应两半约束，可以只装其中一半。**

**文风那一半**：文字读起来用力过猛。该说「一个值得调整的参数」，它写成「一个值得拨动的旋钮」；该说「这一点仍然重要」，它写成「这一点撑得起自己的分量」。比喻替代了直陈，句子越写越长，段落越来越少。

**格式那一半**：你的 prompt 里还留着旧的反格式化规则。早期模型滥用加粗和 bullet，很多人为此写了「不要用列表」一类的禁令。这一版偏差方向相反，它本来就更少用加粗、更不倾向于用标题和列表，旧禁令叠上去会让输出变成一整块难读的散文。所以这一半的动作是删掉旧规则，不是加新规则。

纯代码产出、机器读的结构化输出不必装。

## 这一版怎么样（fable-5.1）

约束文本引自 Anthropic 官方提示工程文档，是厂商随文提供、供直接粘贴的段落。

原文对文风给了长短两版，并说明短版「Please remove all mannered prose」通常也管用。长版的作用在于先定义反面模式再举反例，模型据此判断的边界更稳。本条采用长版，短版留作应急。

**失效风险比一般条目高。** 这一条是针对某个模型版本的偏差写的补偿，方向性很强。原文自己就是拿早期模型举的例——上一代滥用格式，这一代反过来。下一代模型如果偏差再翻转，这段约束会从有用变成有害。换模型时必须回来复核，不能只看日期。

**格式那一半要先做减法再做加法。** 如果目标项目的 AGENTS.md 或系统提示里已经有「不要用 bullet」「不要加粗」一类的旧禁令，先删掉它们再装这一节，否则两套规则会互相打架。安装 prompt 里写了这一步。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把文风与格式的约束装进本项目，要求：

1. 先检查本项目 AGENTS.md 与任何系统提示文件里是否已有旧的反格式化规则
   （例如「不要使用列表」「不要加粗」「避免标题」一类的禁令）。若有，删掉
   它们——当前模型的偏差方向与这些禁令写就时相反，留着会让输出变成难读的
   整块散文。删掉了哪几条，完成后告诉我。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节
   替换，不要重复追加：

## Prose and formatting

Mannered prose substitutes metaphor and flourish for direct statement.
Instead of "a parameter worth varying," the mannered writer produces "a dial
worth turning." Instead of "this point still matters," they write "this point
earns its keep." The phrases exist to display the writer, not to convey the
idea, and readers can tell. That is why mannered prose irritates: it makes the
reader work harder so the writer can perform. It is also imprecise. Metaphors
drag in connotations the writer did not choose and cannot control. The fix is
to say what you mean. When a literal phrase is available, use it.

Use lists and bullet points when asked to, or when the content is multifaceted
enough that they help with clarity. If the person explicitly requests minimal
formatting, always format your responses without bullet points, headers,
lists, or bold emphasis, as requested. In conversational, personal, or
emotional exchanges, keep to plain prose.

3. 完成后列出你改动或新增的文件，并单独说明第 1 步删掉了哪些旧规则。
````

确认方式：让 agent 写一段解释某个技术取舍的文字。装对了它会直陈其事、该分段就分段、内容多面时才用列表；没装对的迹象是通篇比喻，或者明明是并列的四项却硬写成一整段。

## 版本

本库不记录上游当前版本，只记录本卡评估所基于的版本。这里的 `evaluated_version` 填的是**模型版本**而非文档版本——约束的有效期绑在模型行为上。

上游文档：见 frontmatter 的 `upstream`。换模型时必须重新评估这一条是否仍然成立，尤其要确认偏差方向有没有翻转。

评估历史：fable-5.1（2026-09-03）
