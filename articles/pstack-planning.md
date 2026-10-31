---
name: pstack-planning
title: pstack 完全指南（第 2 部分）：调研、规划与架构
summary: pstack 作者的第二篇方法论：/how /why /recall /teach 建心智模型，原型与 /architect 用代码做规划，README 先行与 Diátaxis 定靶心。
date: 2026-10-31
source: https://x.com/poteto/status/2097732320606507506
author: lauren（@poteto）
tags: [agentic-coding, planning, architecture, skills, workflow]
related: [su-architecture-first, superpowers-writing-plans, gstack-plan-review]
---


## 指导一个比你更聪明的对象

2024 年的「旧时代」，改系统前要先读够代码、在脑海里建心智模型，视规模要花几小时到几个月。agent 消除了这道障碍——不懂代码也能让它改。但质量要保持高水准依然难，尤其当你不是领域专家、不知道该关注什么、该追问什么。

她观察到前沿模型仍常见两种失败模式：一是需求说明不充分或表述不清，模型无法完全理解你的真实意图；二是缺乏足够上下文，不知道该如何正确完成工作。两者相互关联，用好 agent 归根结底取决于你能否用高质量上下文充实它的上下文窗口。不做准备也能写出能跑的代码，但花功夫备足信息时，产出和质量都好得多。

前沿模型已经是非常出色的程序员，写代码的水平超过了你我。所以她的姿态是在「告诉它我想达成什么」与「给它自由度用我没想到的方式解题」之间找平衡——在一个不是你亲手写、人类大脑装不下完整心智模型的代码库上，指导一个比你更聪明的对象。

## 用你自己的话复述

她常用的技巧是「间接提示」：不直接下需求，而是引导 agent 用它自己的话把问题梳理出来。有人在 Slack 报问题时，她先让 agent 读完整个讨论串、在做任何事之前重述根本问题：

> /poteto-mode 阅读这个 Slack 讨论串。用你自己的话和通俗直白的语言，重述你认为底层的根本问题是什么

这样做的三个目的：迫使 agent 把嘈杂对话压缩成结构化的问题陈述；让她立即发现理解偏差——如果 agent 死盯某条误导性线索，可以在写代码之前纠正；以及避免她预先抛出可能错误、或限制发挥的假设，把 agent 引向歧途。

## 建立心智模型：/teach、/how、/why

让 agent 以你能理解的方式重述想法，是与更强对象协作的重要一环，这正是 [/teach](https://github.com/cursor/plugins/blob/main/pstack/skills/teach/SKILL.md) 的灵感来源：帮助 agent 直观地向你解释事物。她用它确认 agent 做的事是否合理：

> /teach 给我讲讲你为什么用这种方式实现，而不是另一种方式。你做了哪些权衡，为什么？

/teach 底层调用 [/how](https://github.com/cursor/plugins/blob/main/pstack/skills/how/SKILL.md) 与 [/why](https://github.com/cursor/plugins/blob/main/pstack/skills/why/SKILL.md)。/how 追踪运行时机制——调用时 agent 会评估子系统复杂度，若横跨多个目录或服务，就在快速高效的模型上并行启动多个探索 agent：

> /how 虚拟化是如何实现的？

/why 调查代码背后的动机。代码能告诉你发生了什么，很少告诉你当初为什么那样写。运行 /why 时，pstack 并行查询多个来源的历史证据：Git 历史与 PR 评审评论、Linear 工单、Notion 设计文档、Slack 对话、Datadog 监控、Sentry 错误日志、代码血缘，以及数据仓库中的分析事件。

> /why 为什么我们还困在旧版本的 node.js 上？

她还发现 /teach 的调研对 agent 自身同样有益：即便是最新的前沿模型（也取决于运行框架质量），仍经常在没有数据支撑、没真正读过构建心智模型所需代码的情况下自信地下结论。向你讲解「打算做什么与为什么」的过程，最终也帮到了 agent 自己。

## 从历史中学习：/recall

许多项目跨越多次对话。她举自己修 Cursor 虚拟化 bug 与性能问题的例子：每次开新对话都得推倒重来，重新为 agent 建立它此前积累的上下文。由此她意识到，过去的对话记录是蕴含上下文的金矿。pstack 内置 [/recall](https://github.com/cursor/plugins/blob/main/pstack/skills/recall/SKILL.md)，从聊天历史提取近期上下文，让新启动的 agent 迅速恢复状态：

> /recall 我昨天在虚拟化方面所做的工作，然后阅读 Slack 上的这份 bug 报告

/teach、/recall、/how、/why 组合起来，让她脑海中对代码库的心智模型保持更新，并压缩成易理解和记忆的形式——对 agent 同样大有帮助。

## 逆向工作法：README 先行与 Diátaxis

理解了问题，怎么定义解决方案？多数运行框架的计划模式倾向于过度细化实现细节，其他方面交代不足。所以她在 pstack 里半开玩笑地说[「我不相信规划」](https://github.com/cursor/plugins/blob/main/pstack/README.md#why-are-there-no-planning-skills)——她确实做规划，但通过代码来做。

对创建供他人使用的共享代码或包这类工作，她推崇 README 驱动开发：先写 README，戴上「开发体验」的帽子，先向假想用户描述 API 用法，再逆向推导实现与架构。构建内部桌面应用客户端框架 Dune 时，她先为它写教程，体会用它构建应用的感觉——而要让 agent 写出优质易读的文档太费劲，她为此先「磨刀」做了 [/technical-writing](https://github.com/cursor/plugins/blob/main/pstack/skills/technical-writing/SKILL.md) 技能。

没有这个技能时，第一版 README 读起来极其痛苦：一篇文档同时充当教程、操作指南、架构解析和 API 参考手册，通篇是 AI slop 与矫揉造作的文风。/technical-writing 采用 [Diátaxis 框架](https://diataxis.fr/)，把文档分成四种模式：

| 模式 | 面向 | 形态 |
|---|---|---|
| 教程 Tutorial | 新手 | 在实践中学习，一系列步骤带出直观可见的成果 |
| 操作指南 How-to | 有经验的用户 | 解决特定实际问题的具体步骤 |
| 参考手册 Reference | 查阅 | 机制、API、配置的简练完整权威说明 |
| 概念解析 Explanation | 理解 | 高层次探讨背景脉络、设计抉择与权衡 |

它还会调用 [/unslop](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md) 生成可读性极佳的文档。以文档先行的方式写计划，给了 agent 一个具体的靶心和对照检验的依据，也让你更容易看清它究竟打算构建什么。

设计阶段多个技能会叠加放大。她给的原型提示词：

> (1) /recall 我过去 7 天修复虚拟化 bug 和性能问题的工作。使用 /how 和 /why 了解我们当前的虚拟化实现是如何工作的。
> (2) 然后使用 /poteto-mode 进行规划，并结合 /technical-writing 提出一套新的虚拟化引擎方案，彻底消除闪烁和抖动问题。我们先从编写一篇教程开始，说明我该如何使用这个新包为 React 应用实现虚拟化。
> (3) 写完计划后，用 /teach 给我讲解，并向我证明为什么这种新方案优于我们当前的引擎。

三段各有分工：第一段回顾过去与当前的上下文；第二段引导 agent 利用这些上下文（包括它修过的 bug）提出从根本上消除问题的新设计；第三段要求它证明新方案确实更优——这正是[验证技能](https://x.com/poteto/status/2094457600259842065)（第 1 部分主题）发挥关键作用的地方。技巧核心是引出丰富上下文，让 agent 站在与你相同的高度审视问题，而不是只盯着局部切片。

## 测量一百次，落刀只一次

规划阶段她最常见的两个错误：直接接受 agent 给出的第一个设计方案；在缺乏实证依据的情况下过度推敲计划。

以前人类写代码时围绕设计文档协作——高层架构、备选方案、权衡、实现说明，定稿前历经多轮迭代。有了 agent，繁文缛节可以省，但「第一个方案照单全收」是新病。pstack 用[原型设计剧本](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/prototype.md)把「三思而后行」发挥到极致。

剧本（playbook）不是独立技能，而是 /poteto-mode 内部的参考文件，按任务类型按需加载以省 token。截至 0.15.0 共 23 个，各含一套她执行特定任务的工作流，由 /poteto-mode 自动调用：

> /poteto-mode 为新的下拉菜单制作几个方案的原型
> /poteto-mode 修复这个 bug
> /poteto-mode 评估这项技能变更

原型设计是她最喜欢的剧本之一：围绕同一目标给出多种尝试方案，帮 agent 推理出最佳选择——不只视觉原型，新功能与 bug 修复同样适用。

> /poteto-mode 为〈功能需求〉制作几个方案的原型。使用 /control-app 并录制视频/截图，供我审阅和选择

（/control-app 是第 1 部分创建的验证技能。）视觉改动时，agent 在应用里或临时目录构建用完即弃的草稿实现；测 UI 交互时，把两三个变体放在一个简单切换器后面，再用 /control-app 驱动交互、为每个变体截图、测量实际耗时或布局表现。原型让 agent 能靠实证依据自己回答自己的疑问，不必停下来等她输入——**原型设计就是规划，只不过是用代码来做规划**。

## 为更大规模的改动设计架构

[/architect](https://github.com/cursor/plugins/blob/main/pstack/skills/architect/SKILL.md) 把设计过程组织为清晰的阶段：

1. **摸清问题根基。** agent 对受影响系统运行 /how 和 /why，对现有模块归属和约束建立准确的心智模型。
2. **绘制草图。** 进入「架构竞技场」：并行启动多个独立候选执行器（runner），通常横跨不同模型家族。每个执行器收到背景简报，起草完整设计方案包——调用方使用示例草图、核心类型定义、公共函数签名、简明设计理由。签名由希望调用点呈现的形态反推而来。每个执行器必须评估接口深度、检查在弱模型上的失败模式、对照设计危险信号目录排查。
3. **交叉评审与综合。** 一个使用不同于主 agent 模型的交叉评审 agent，对照严格评分标准评估各候选方案。
4. **对照草图实现。** 把草图中的占位函数体替换为真实逻辑；实现中发现某函数需要预期之外的参数或额外状态，就把出入暴露出来。
5. **设计出错时果断推翻。** 实现中发现草图有误，全部丢弃推倒重来。

> /architect 这项新的〈功能需求〉

核心目的是给 agent 一个自包含的小闭环：把来自不同模型家族的多个竞争性设计综合成最优方案，保持严谨，并且一旦实证证据表明架构有误，绝不害怕推翻。什么是「实证证据」？相同的变通写法（workaround）在毫不相干的调用点上反复出现，或类型定义需要依赖 `any`、强制类型转换这类逃生舱口——架构存在问题的信号。

最大的经验教训：用 /poteto-mode 原型和 /architect 通过代码规划，效果好得多。这也是她从不费神对抽象计划做对抗性评审的原因——agent 会凭空捏造理论风险、虚构复杂边缘情况，去防范根本不会发生的问题。计划还停在抽象阶段时不要过度推敲，让 agent 通过构建原型和验证工作，亲自解答悬而未决的问题。

## 真需要计划文档时

pstack 没有专门的规划技能，但附带[多阶段规划剧本](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md)。她通常在 agent 拿出令人满意的设计之后用它，生成战术层面的执行计划：

> /poteto-mode 将这个设计转化为一份计划

计划中每项任务围绕「证明与验证」组织，剧本明确告诉 agent：**光靠测试不足以算作充分验证，只有真正运行了代码并验证有效才算完成**。每份计划由自动化脚本校验结构与格式，获批后逐项执行，每个 PR 小巧、自包含、易审阅。体量很大的项目（要花她整整一周的），她偶尔把计划临时提交进仓库让其他 agent 知晓进展，完成后删掉——永久保留这些计划没有价值。

## 实战中的四个提示词

调查模糊的 bug：

> /poteto-mode 调查后台工作进程（worker）为什么会周期性因超时错误而失败。向我详细列出我们已知的情况、你使用了哪些数据，以及你认为最有可能的假设。

设计新的服务边界：

> /poteto-mode 我们需要为外部 webhook 添加速率限制。先对此执行 /architect，并通过原型回答所有悬而未决的问题。在继续推进之前先让我审阅。

跨多个 PR 的迁移：

> /poteto-mode 制定一份将我们整个 UI 库迁移到 StyleX 的计划。将迁移拆分为小而可验证的 PR。每个 PR 都必须包含视觉回归测试和实时验证步骤。我希望最终结果与原版 100% 一致——连原有的 bug 也要一模一样。

修 Slack 上报告的问题（她在问题频道最常见的回复）：

> # 讨论串中已经有充足的上下文
> /poteto-mode 动手吧
> /poteto-mode 用 /control-app 复现这个问题。如果能在 main 分支复现，就修复它并给我看一段视频作为证明

这些技能大多已被 /poteto-mode 自动调用，绝大多数时候输入 /poteto-mode 就可以去忙自己的事了。

## 规划的艺术

计划模式常被用来安慰自己，相信 agent 接下来会做正确的事。现实是，抽象的计划只带来正在取得进展的错觉：冗长繁复的计划让表面看起来卓有成效，其中很可能缺乏实质。pstack 提供的是把深入调查、实证依据和严格验证结合起来的工具——以这种方式规划，与 agent 一起做工程不再像赌博，而变得可预测、可重复。pstack 已上架 [Grok Bot 插件市场](https://x.ai/bot/plugin/9717366)，第 3 部分待续。
