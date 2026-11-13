---
name: cursor-plugins-pstack
title: pstack：把资深工程师的判断纪律写成 57 个技能，对抗性发现必须被一次真实运行证实才准进报告
summary: Cursor 一线工程师的 agent 工作流技能集：24 条原则逐条技能化、模式路由串起 23 个 playbook、并行对抗审查只留被运行证实的发现，目标是写得更少但更好。
repo: https://github.com/cursor/plugins
description: Cursor plugin specification and official plugins
stars: 16189
forks: 1708
contributors: 30
language: TypeScript
languages:
  TypeScript: 89.1
  JavaScript: 3.8
  TLA: 3.1
  Mermaid: 2.2
  Shell: 1.9
avatar: /projects/cursor.png
tags: [agent-skills, code-quality, adversarial-review, principles, routing, multi-model]
pinned_commit: 24621dbcc59e205a7faadb0e06d540f91712b5cc
evaluated_at: 2026-11-13
updated_at: 2026-11-13
related: [superpowers-tdd, no-ai-slop]
---

pstack 是 [Lauren Tan](https://x.com/poteto)（网名 poteto，Cursor 工程师、React Core Team 成员）发布在 cursor/plugins 官方插件仓库里的 agent 工作流技能集：57 个技能、23 个 playbook、24 条工程原则，全部是 Markdown 提示词资产，没有 hooks、没有 MCP、没有一行需要构建的代码。这张卡主张的读法：它表面是「又一套 Cursor 技能」，实际是三个更可迁移的问题的答案——怎么让审查发现不被模型幻觉污染、怎么让工程原则不沦为读过即忘的装饰、怎么让一套深度绑定某个 harness 的资产保持可移植。

## 它解决什么问题

作者在 [README](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/README.md) 开头把靶子立得很清楚：「AI 写了太多 slop 代码。我同意。我不想像二十个 slop 艺术家组成的团队那样交付。吞吐不是质量」（L5-L7），并把目标定为「写得更少、但质量更高的代码」（[L7](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/README.md#L7)）。

slop 的根源不是模型不会写好代码，而是 agent 缺少三样东西：审查环节没有防幻觉机制（模型会自信地报告不存在的问题）；工程原则写在系统提示里没有问责机制（读过即忘，不改变任何决策）；单兵 agent 赶工时没有分工纪律（最贵的判断力花在最便宜的步骤上）。pstack 的 57 个技能就是围绕这三个缺口组织的。

## 怎么解的

**一个模式路由器串起全部。** 入口是 [`poteto-mode`](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md)：接到任务后匹配 23 个 [playbook](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/README.md#L53)（bug fix、perf、hillclimb、feature、refactoring、prototype、babysit、shipping、overnight run……）之一，把 playbook 步骤逐字复制进 todo list，再按步骤把活路由给其他技能。技能间互引靠相对路径 `../<name>/SKILL.md`（[SKILL.md L11](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md#L11)），不依赖 harness 的技能广播。

**24 条原则，每条一个独立技能。** 分六组（核心/架构/验证/委派/元），从 Laziness Protocol（偏向删除与最小变更）到 Prove It Works（对真实产物验证，拒绝代理指标与自述）。完整的分组表在 [README](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/README.md#L228)，路由层在 [poteto-mode 的 Principles 节](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md#L39)内联索引、按名引用。

**模型按角色分工。** 默认代码委派给 Grok、最难改动与判断给 Opus，[`setup-pstack`](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/setup-pstack/SKILL.md) 探测可用模型后写一份 always-applied 规则文件覆盖默认值；每个技能的 spawn 处都带「拒绝 slug → 同族最近档 → 降级说明」的兜底链。

**委派有专门的子代理人格。** [`poteto-agent`](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/agents/poteto-agent.md) 是委派子代理的 brief：开工前必须先全文读完 poteto-mode（含原则索引），并明确警告「换成 generalPurpose 会跳过这次阅读并发生 drift」（[L5](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/agents/poteto-agent.md#L5)）。

## 设计亮点

**对抗性发现必须被运行证实。** [`interrogate`](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/interrogate/SKILL.md) 是全库最值得抄的机制：多个对抗者并行尝试击穿一个 diff 或设计，每个发现必须附带「确切命令、它打印的输出、意图要求的输出」，给对抗者的 brief 写死了三句——「用对真实代码的一次运行证明每个发现」「**你没运行过的一律不写**」「没有发现是合法结果」（[L19](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/interrogate/SKILL.md#L19)）。主线程对每条发现按命令重跑复核，输出不显示失败或失败不违背意图的就丢弃，同根因合并（Verify 节）。风格、命名、结构类意见被这个门槛天然过滤——它们无法被一次运行证明。这是对 LLM 审查幻觉的结构性解法，而不是「请仔细一点」式的祈祷。

**原则引用要问责。** poteto-mode 规定：回复中引用某条原则时，必须说明它塑造了哪个决策、具体改变了什么选择，且「只能引用本次会话真的读过叶子 SKILL.md 的原则」（[Non-negotiables 开头](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md#L13)）。同一思路在姊妹插件 dyl-stack 的 The Algorithm 里更狠：引用该原则「必须点名你质疑了哪个需求、删了什么，两点都没有等于没跑」（[principle-the-algorithm](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/dyl-stack/skills/principle-the-algorithm/SKILL.md)）。原则技能化 + 引用问责，把「写在提示里的价值观」变成「每次引用都要出示票据的规则」。

**流程触发的粒度是「时刻」而不是「命令」。** 路由表里的触发器多是工作流时刻：有争议的设计 → 交 interrogate（[L25](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md#L25)）；commit 前 → deslop 清 slop；review 前 → no-comments 剥掉注释再审（[L29-L30](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/poteto-mode/SKILL.md#L29)）。剥注释审查由只读子代理 [Comment Sicko](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/no-comments/SKILL.md) 执行——注释会替代码辩护、掩盖代码本身的问题；被接受的「约束性注释」不还原文，而是要求改成类型、断言或脚本编码。

**流程性技能敢写「不做」的边界。** [`tdd`](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/tdd/SKILL.md) 的触发条件收得很窄（只对有便宜本地测试路径的 bug），并明确「宁可没有测试也不要坏测试」，坏测试的定义逐条列出（主要在测 mock、编码实现细节、依赖时序、为小改动要重型基建、证完即删）（[L26](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/tdd/SKILL.md#L26)）。大多数 TDD 材料不敢写这条，因为「不写测试」听起来像逃课；这里把它写成纪律的一部分——防止 agent 为凑流程制造测试垃圾。

**官方适配层示范了 harness 互操作的正确姿势。** pstack 的技能正文全部使用 Cursor 词汇（Task 工具、模型 slug、`~/.cursor/` 路径），但仓库附带一张 [Claude Code 映射表](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/docs/harness/claude-code.md)：「每会话读一次，把技能里的 Cursor 名按表映射；表里没有的字段丢弃并说明」（[L3](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/docs/harness/claude-code.md#L3)），覆盖工具名、子代理字段、模型 slug、路径四张表。Cursor-only 功能（Automations、Bugbot、云代理）统一输出一行 `Skipped in Claude Code: <step>. <reason>.` 继续执行，不停不问（[L60](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/docs/harness/claude-code.md#L60)）。上游资产一字不改、适配全在一张表里——这个模式让技能集可以跟着上游更新而不产生合并冲突。

## 借鉴清单

**能搬的：**

- 「发现必须被一次真实运行证实」的审查协议：对抗者并行、每条发现带命令与输出、主线程重跑复核、未运行的不写、没有发现是合法结果。不依赖 Cursor，任何能并行起子进程的 harness 都能落地。
- 原则引用问责制：原则拆成独立小文件、路由层内联索引、引用时必须说明改变了哪个决策。搬走的是「出示票据」的机制，不是那 24 条原则本身。
- 「时刻触发」的路由表写法：commit 前、review 前、有争议设计时、宣布完成前——比「/命令」更贴近工作流真实节点。
- 官方 harness 映射表模式：技能正文写死一套词汇、适配靠一张每会话读一次的映射表、专属功能走跳过行。任何想跨 harness 分发的技能集都值得照抄。
- 「宁可没有测试也不要坏测试」的负面清单：把不做的条件写得比做的条件更具体。
- 子代理 brief 要求先读模式全文再干活，并明确写出「换 generalPurpose 会 drift」的警告。

**不适用的：**

- 模型角色路由的原生形态：默认 slug（grok/opus）与 `~/.cursor/rules/*.mdc` always-applied 机制都是 Cursor 专属，其他 harness 要换成各自的模型配置与常驻上下文机制。
- Bugbot 三角互查、Cursor Automations（benny 自动化包）、云代理隔离、`/loop` 无人值守循环：都是 Cursor 平台特权，技能里已有跳过行，搬不走也不用搬。
- 作者个人风格层：全小写英文文风、`/bro`（大白话复述）、poteto 口吻的 README——技术上能搬，但那是人格不是机制，搬走只会违和。

## 局限

- 深度绑定 Cursor 的 Task 工具语义（subagent_type、run_in_background、readonly、environment: cloud）。离开 Cursor 后 fan-out 类技能（arena、swarm、interrogate、why）需要适配层才能保真，直接搬只剩顺序降级。
- 版本迭代快（评估时 0.15.36），技能间互引路径约定随版本可能变化，跟随上游要整包更新而不是挑文件拷贝。
- 仓库根只有 README 里一句 "License: MIT"，没有 LICENSE 文件；fork 或再分发前需要先让上游补齐。
- 体积是真实成本：57 个技能全部挂载约 8KB 常驻上下文；多数技能带 `disable-model-invocation: true`（只显式触发）缓解了误触发，但没有缓解登记成本，裁剪要靠自己删目录。
- 语言条里 3.1% 的 TLA 来自 [statechart](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/pstack/skills/statechart/SKILL.md) 技能自带的 TLA+ 测试语料——形式化验证是全库最重的单件，没有相应问题时是纯负担。

## 相关

站内登记卡《[superpowers-tdd](/sdlc-playbook/entries/superpowers-tdd/)》是另一套 TDD 纪律文本，可与 pstack 的 `tdd` 技能对照「何时宁可不写测试」的边界划分；《[no-ai-slop](/sdlc-playbook/entries/no-ai-slop/)》处理同一类 slop 问题的写作面，与 pstack 的 `deslop`（代码面）、`unslop`（文字面）互为补充。作者方法论的中文蒸馏见站内文章《[pstack 完全指南（第 2 部分）：调研、规划与架构](/sdlc-playbook/articles/pstack-planning/)》。同仓库的 thermos 插件（深度审查 rubric）与 advisor 插件（强模型检查点咨询）未单独出卡，分析见仓库 [README](https://github.com/cursor/plugins/blob/24621dbcc59e205a7faadb0e06d540f91712b5cc/README.md)。
