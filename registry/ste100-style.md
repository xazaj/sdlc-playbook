---
name: ste100-style
title: ASD-STE100 受控写作（八成版）
summary: 借航空维修手册的受控写作规范，让 agent 写出短句、一句一事、无歧义的操作与说明文档。
category: bootstrap
kind: doc
invoke: direct
origin: external
provider: ASD STEMG（欧洲航空航天与防务工业协会 简化技术英语维护组）
upstream: https://www.asd-ste100.org/
release_source: local
evaluated_version: "0.1.0"
evaluated_at: "2026-10-10"
updated_at: "2026-10-10"
---

## 何时用

文档的读者要照着做事，读错一句就会做错一步时用它：操作手册、安装与部署步骤、runbook、故障排查、API 与配置说明、规格说明、写给 agent 的 AGENTS.md 规则。四种动作都适用：从材料编写、优化已有文档、逐句润色、重排结构。

ASD-STE100 是为飞机维修手册制定的受控写作规范。它卡得极严：程序句不超过 20 个词，说明句不超过 25 个词，一句只写一个指令，只用词典批准的词，每个词只取一个意思。大模型熟悉这套规范，照着写出的文字干净、好懂。全文照搬会显得僵硬，所以本条只取其中约八成：管歧义和句子结构的规则全部保留，管词汇表和时态的规则放宽。

不适用：

- 需要说服或打动读者的文字：文章、博客、发布公告、营销文案。STE 会删掉论证里的转折与语气，读起来像说明书。
- 叙事与创作类文字。
- 「像不像 AI 写的」的问题。STE 管清晰，不管去味。文档要去 AI 腔，走 `sdlc-deai-zh` 或 sepia；两者可以先后用，先 STE 定内容，再去味。
- 需要正式符合 ASD-STE100 的文档，例如交付给航空、防务客户的维修手册。这个 prompt 只借用规范的写法，产出不等于合规；合规要按官方标准全文执行，并由人审核。
- 日常对话里的解释。贴一句「用 80% 的 ASD-STE100 风格解释这个问题」就够，不必用整段 prompt。

## 这一版怎么样（0.1.0）

规则依据：ASD-STE100 Issue 9（2025 年 1 月发布），共 53 条写作规则和约 900 个批准词。官方文本可在 asd-ste100.org 免费申请。本条引用的规则编号来自公开摘要，未逐条对照官方 PDF。

**保留的规则**（对应原标准，中文同样成立）：

- 一句只写一件事；程序里一步只写一个动作，两个动作必须同时做时例外。
- 程序用祈使句，说明用陈述句，两者不混写。
- 用主动语态。只有动作执行者未知时才用被动。
- 一个术语只表达一个意思，全篇不换说法。
- 不省略主语、动词和必要的限定词。
- 名词堆叠不超过三个词（如「用户 会话 缓存 失效 策略」要拆开）。
- 一段只讲一个主题，不超过六句。
- 安全与警告类内容放在相关步骤之前，以命令或条件开头。
- 复杂内容用竖排列表。

**放宽的规则**（即那两成）：

- 不使用 STE 批准词典。技术名称、产品名、代码标识符照常使用，原标准对技术名称同样允许。
- 不限制时态与 -ing 形式。这两条只对英文有意义。
- 说明性文字里，拆句会丢掉因果或转折关系时，允许保留一个「因为／所以／但是」复句。

**中文的句长换算是本库的约定，不是标准内容。** STE 按英文词数计算句长。本条按一个英文词约折合一个半到两个汉字，取程序句约 30 字、说明句约 40 字作为参考上限。这是软上限，超出时先检查是否一句写了两件事，而不是机械截断。

**官方对 AI 的立场。** STEMG 在 2026 年 6 月发布白皮书《ASD-STE100 Simplified Technical English and Artificial Intelligence》，要点有三：STEMG 不认可任何 AI 工具；AI 只能辅助作者，不能替代，责任在人；AI 的主要风险是事实不准、术语控制被破坏、内容来源难以追溯，在安全攸关场景尤其要注意。本条与 STEMG 没有关系，也未获其认可。

模型改写时会顺手补充原文没有的信息，或把含糊处猜成确定的说法，这正是白皮书说的事实风险。使用 prompt 里专门写了「不增删事实、含糊处标出来问」，验证时要检查这一条。

## 使用 prompt

复制整块，贴进任何 agent 的聊天窗口，把最后一行换成任务与文档，当次会话生效，无需安装：

````text
【STE100 八成版】会话级启用：直接粘贴，无需安装

按 80% 的 ASD-STE100 风格处理下面的文档。保留它管歧义和句子结构的规则，
放宽词汇表和时态规则：

1. 一句只写一件事。程序句约 30 字以内（英文 20 词），说明句约 40 字以内（英文 25 词）。
2. 步骤用祈使句，一步一个动作，编号排列；警告放在相关步骤之前。
3. 用主动语态，写明谁做什么。不省略主语和动词。
4. 一个术语只表达一个意思，全篇不换说法。名词堆叠不超过三个词。
5. 删除含糊的词（「适当」「一些」「尽量」「可能需要」），换成具体的条件、数值或对象。
6. 一段一个主题，不超过六句。
7. 不增删事实。原文含糊、无法确定的地方，不要猜，在文末列出来问我。
8. 技术名称、代码标识符照常使用；拆句会丢掉因果关系时，可以保留一个复句。

任务类型按我的说法执行：
- 编写：从我给的材料写成文档。
- 优化：消除歧义、补齐缺失的主语和条件，结构不动。
- 润色：只改句子，不动结构和内容。
- 重构：重排结构（拆段、改为步骤列表、调整顺序），内容不变。

输出：先给改好的文档，再列「待确认」清单（含糊处与你的理解）。

任务：[编写／优化／润色／重构]
文档：[粘贴文档或材料]
````

只想快速试一次，一句话也能用：「用 80% 的 ASD-STE100 风格[编写／优化／润色／重构]下面的文档，不增删事实，含糊处列出来问我。」

## 固化 prompt

把这套规则长期用于项目里的某类文档时用。复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 STE100 八成版写作规则装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## Controlled writing (80% ASD-STE100)

Apply these rules when writing or editing operational documents: install
and deploy steps, runbooks, troubleshooting guides, API and configuration
references, specifications, and agent rules. Do not apply them to articles,
announcements, marketing copy, or conversational replies.

- One sentence states one thing. Keep procedural sentences under about 20
  English words (about 30 Chinese characters) and descriptive sentences
  under about 25 words (about 40 characters).
- Write procedures in the imperative, one action per numbered step. Put
  warnings before the step they apply to.
- Use the active voice and name the actor. Do not drop subjects or verbs.
- Use one term for one meaning throughout a document. Do not stack more
  than three nouns.
- Replace vague words ("appropriate", "some", "as needed") with concrete
  conditions, values, or objects.
- Keep one topic per paragraph and at most six sentences.
- Technical names and code identifiers are allowed. A single compound
  sentence is allowed when splitting it would lose a causal relation.
- Do not add or remove facts. List unclear points for the user instead of
  guessing.

2. 完成后列出你改动或新增的文件。
````

确认方式：拿一段含糊的现有步骤说明让 agent 优化。装对了，输出是编号步骤、每步一个动作、警告在步骤之前，文末有「待确认」清单；没装对的迹象是句子仍然一句多事，或者 agent 把原文没写的参数自己补了上去。

## 版本

本库不记录上游当前版本，只记录评估时基于的那一版。规则文本由本库维护，`evaluated_version` 是本库的版本号。

上游标准由 ASD STEMG 维护，大约每三年发布一期，查询方式：asd-ste100.org。新一期发布时，回来核对保留与放宽的规则是否仍然对应。

评估历史：0.1.0（2026-10-10，基于 ASD-STE100 Issue 9）
