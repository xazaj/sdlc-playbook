---
name: google-elephant-goldfish-model
title: elephant-goldfish-model：长记性的会话写设计，健忘的会话审设计
summary: 设计文档由长上下文主会话起草，交零上下文子代理按量规对抗评审；评审者的无知是被设计出来的，不是缺陷。
repo: https://github.com/google/elephant-goldfish-model
description: Open-source skills for designing and reviewing software with AI agents
stars: 11421
forks: 785
contributors: 28
language: Python
languages:
  Python: 68.8
  Astro: 15.2
  JavaScript: 11.6
  CSS: 2.8
  HTML: 1.7
avatar: /projects/google.png
license: Apache-2.0
tags: [spec-driven-development, adversarial-review, subagent, design-review, multi-harness]
pinned_commit: 113a3afc44e8f4f54722d7150d5701f65cc8ef7f
evaluated_at: 2026-11-04
updated_at: 2026-11-04
related: [gstack-plan-review, superpowers-writing-plans]
---

elephant-goldfish-model（EGM）是 Google 开源的一套设计-评审插件，发布在 google 组织下，Apache 2.0，README 标注 not an officially supported Google product。它属于 spec-driven development 一族，重心落在评审那头：设计文档由一个长上下文主会话（Elephant）起草，再交给一批零上下文的子代理（Goldfish）对抗评审。这张卡主张：七技能流水线可搬可不搬，真正该搬走的是「评审者的无知是被刻意设计的」这个前提，连同把前提做成可执行纪律的那批量规。反过来的判据也直说：改动只碰一个文件、方案没有第二个选法，这套东西全是开销，别碰。

## 它解决什么问题

[架构文档](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/docs/designs/architecture.md)列出对话式 AI 编码的四个失败模式：幻觉级联与上下文污染——同一个会话里，模型会验证自己先前编造的假设，而不是发现错误；过早实现——agent 默认直接在附近的文件里写代码，跳过架构选址和 YAGNI 检查；chat dump 疲劳——多页设计稿刷进聊天流，既毁掉上下文又毁掉可读性；文档漂移——设计文档随代码演进腐烂。四个问题里最根本的是第一个：LLM 不会在自己污染过的上下文里发现自己的错。EGM 的全部结构都可以读作对这一条的回应。

## 怎么解的

形态是纯 prompt 资产：7 个 skill、9 个评审 persona、5 份量规，无服务端、无遥测、无 MCP server（[privacy.md](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/docs/privacy.md)），以插件形式装进 Antigravity、Claude Code、Codex 等多种 harness。

主流程：`/egm-brainstorm` 多轮开放式提问锚定假设，用户确认后才放出六个镜头的 Goldfish 群去击落它，产出 `concepts_brief.md`；`/egm-draft` 逐节起草设计文档；`/egm-review` 跑五阶段评审；`/egm-resolve` 把评审 findings 交回人分诊；实现完成后 `/egm-drift-report` 定期对比文档与代码的漂移。

评审管线是五阶段（[egm-review/SKILL.md](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/skills/egm-review/SKILL.md)）：Stage 5 Zoom Out 审简单性、YAGNI、复用；Stage 6 Comprehension 让朴素读者复述文档；Stage 7 Critic 并行三个 reviewer（设计/结构/文风）做对抗评审；Stage 8 对新增内容再跑一次 Zoom Out；Stage 9 Implementation Readiness 审实现计划。文档先按 `## Detailed Implementation Plan` 标题切成 FeatureRange 与 DetailedRange 两段，五个阶段各认各的辖区：Zoom Out 两轮跑全文，Comprehension 复述两段，Critic 只审 FeatureRange，Implementation Readiness 只审 DetailedRange。synthesizer persona 负责扇出/扇入：并行拉起 reviewer（可对每个 reviewer 跑 A/B 两份实例提高召回），聚合去重，按 Blocker/Major/Nit 三级排序写报告。

## 设计亮点

**隔离是硬前提，给不了就停，宁可不审。** egm-review 写死一条规则（[L28](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/skills/egm-review/SKILL.md#L28)）：harness 没有子代理工具就停下来告诉用户——a review in the same context is not a Goldfish review。仓库还配了 [test_claude_traces.py](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/tests/unit/test_claude_traces.py) 和 opencode 的 trace 校验器，检查宿主 transcript 来验证 reviewer 确实跑在隔离上下文里。多数项目把「无状态」写在口号里，这个仓库把它做成了可测属性。

**评审者的无知，在这里是特性。** [comprehension persona](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/agents/comprehension.md) 扮演刚入职的陌生读者，第一步是复述（L37）：用自己的话写出文档主张什么、现有系统如何工作，复述不出某节就报 Blocker。用「能否被无背景者正确转述」检验自包含性，比查未定义术语更狠——术语都定义了但逻辑不衔接的文档，查术语查不出来，复述查得出来。评审者拿到的输入只有设计文档加文档内引用的源材料，对话历史一律不给。

**量规全部落成可检查的判据。** [implementation-readiness-standard](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/resources/document_standards/implementation-readiness-standard.md) 的零决策规则（L12）：计划若留给实现者任何设计选择——选 schema、定 API 路径、挑依赖、定新边界情况的处理——直接判 fail。「设计完备」由此变成可检查的二元判据。zoom-out-standard 同路数：根因还是症状、YAGNI、必须搜代码库确认没有现成实现可复用。

**反谄媚条款写进 CRITICAL 级约束。** brainstorm 与 review 两个 SKILL 共享一整段执行约束：默认立场是压力测试，赞同必须自己挣；禁止把想法叫 great/brilliant/smart；先讲缺陷再讲优点；被反驳时禁止输出道歉，只准给修正后的技术逻辑。每一条都对应 LLM 的一个已知缺陷，是拿 prompt 定点修补模型行为。

**聚合语义诚实。** synthesizer 对超时/失败/空报告的 reviewer 有一条明确规则（[L40](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/agents/synthesizer.md#L40)）：重试一次，再失败就标 not run，绝不计成「零发现的 reviewer」。多代理聚合最常见的造假方式就是把没跑的当成跑了但什么都没发现，这里堵死了。

**对自己没证明的事不吹。** [FAQ](https://github.com/google/elephant-goldfish-model/blob/113a3afc44e8f4f54722d7150d5701f65cc8ef7f/docs/faq.md) 原话（L46）：走完 EGM 流程本身不构成生产力改进的证据；并建议只对「当前重要的」变更使用，小改动走常规流程。README 的使用建议也是同一个口径：需要设计决策的功能用它，明确的小 bug 修复不用。

## 借鉴清单

**能搬的：**

- 零上下文评审模式：任何能起子代理的 harness 都能复刻——persona 文件加量规加「只给文档与引用材料」，隔离由子代理机制天然保证
- 零决策规则：可直接抄进任何实现计划模板，把「设计是否完备」变成二元判据
- 复述测试：评审自包含性的最便宜手段，一个 prompt 就够
- 反谄媚条款：No glazing、critique first、禁道歉三件套可整体搬进任何评审 prompt
- 「not run 不等于零发现」的聚合语义：多路评审汇总时照抄
- 文档内链接自动收集为评审上下文、外部链接须人批准的输入纪律

**不适用的：**

- 流程重量：五阶段、每阶段 checkpoint、最多一次重审，token 与时间开销大；官方自己定位为按需使用的重型工具，小改动不用
- 对 harness 能力的依赖：完整形态需要主会话能嵌套 spawn 子代理（synthesizer 再拉 reviewer），弱 harness 降级为主会话直接派发，层数少一层，编排语义打折
- 零上下文的双刃剑：Goldfish 审的是文档自包含性，不是方案正确性；缺背景产生的误报要人来分诊，分诊成本随文档规模涨
- 效果证据：README 称数千 Google 工程师在用，无公开数据佐证，无法当采纳依据

## 局限

快照口径：11421 stars、785 forks、28 位贡献者，仓库 2026-09-13 创建，v0.1.0 发布于 2026-10-27，评估当天距最后推送一天——七周冲到万星，热度真实，项目年轻。语言条上 Python 占 68.8%，字节量大头是打包脚本与 20 个测试文件，运行资产全是 Markdown prompt。本卡结论来自全部 skill、persona、量规与架构文档的静态阅读，未在 Claude Code 里实测五阶段端到端流程。

## 相关

registry 的 [gstack-plan-review](/sdlc-playbook/entries/gstack-plan-review/) 同为计划评审资产，对照「单评审员深审」与「无知群审」两条路线；[superpowers-writing-plans](/sdlc-playbook/entries/superpowers-writing-plans/) 管上游——计划怎么写才能过这种评审。思想源头是 Dave Rensin 的[《Elephants, Goldfish, and the New Golden Age of Software Engineering》](https://medium.com/@drensin/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874)。
