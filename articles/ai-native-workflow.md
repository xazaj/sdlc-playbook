---
name: ai-native-workflow
title: AI Native 时代的工作方式：从信息到交付
summary: Infra 工程师一年实践的三条线：材料进仓库不进聊天窗口、Agent 改动全走 PR、规格与约束替人看细节、自测 Agent 分层验证——AI 放大执行，人的判断反而卡得更紧。
date: 2026-10-06
source: https://x.com/alswl/status/2107157509089935464
author: alswl
tags: [agentic-coding, knowledge-management, spec-driven, workflow]
related: [superpowers-writing-plans, superpowers-tdd]
---

作者在 2025 年终总结里写过：「写代码（Code Typing）会成为低效的工程方式，AI Native 应该成为默认选项。」话说出去容易，真每天这么干，问题就具体了：AI 写代码很快，那信息从哪来、方案谁来定、产出怎么验、人到底还管什么？这篇文章是他大半年实际跑下来的答案——关注点从「代码写得快」移到信息、研发、落地、工具链一整条链路。他的背景是 Infra、Kubernetes、PaaS，主力语言 Go，以下都来自一手实践。

认知演进有三个月刻度：2 月是「Code Typing is unnecessary」的兴奋，每天写到凌晨两点；5 月是「AI 放大执行，人负责判断」，并行 Agent 从两三个加到七八个；8 月把信息、研发、落地、工具链连成一条线。工作拆开是三条线：信息整理成方案并让人接受；方案变成产品（写码、验证、上线）；以及一条隐藏线路——优化工具链本身。文档、代码、会议、报告都只是形式，核心载体是**作品（Artifact）**。

![原文头图](/sdlc-playbook/articles/ai-native-workflow/cover.jpg)

## AI Native 加入了什么

他的定义：把 AIGC 的推理能力放进工作的每个方面——决策、内容产出、作品产出，以及支撑这套方式的环境和平台。不是单点工具，是工作方式。

![信息与目标进入 AI 工作区，分析生成检查后交人判断，作品反馈回到起点](/sdlc-playbook/articles/ai-native-workflow/loop.jpg)

循环里 AI 进到了分析、生成、检查每一环，转得更快；中间那道「人的判断」没有被拿掉，反而因为转得快，卡得更紧。

## 信息：材料进仓库，不留在聊天窗口

数据本身没有价值，连起来才是知识，连对了才是洞见——信息处理的目标不是存材料，是让它能被继续加工。他的做法：每天给自己提 10+ 个知识经营 PR。本地创作、会议、文档、IM 消息统一交给 Agent；Agent 开 worktree 改文件、提交、推分支、发 PR。人只做一件事：看 diff，决定合不合。

![从信息到洞见的加工链](/sdlc-playbook/articles/ai-native-workflow/insight.png)

两个仓库，两种参与度：

| 仓库 | 作用 | AI 参与度 |
|---|---|---|
| minds | AI 协作、文章与项目材料 | 90%+ |
| my-kms | 个人传统知识库、每日记录 | 5% |

![每日知识经营的工作流](/sdlc-playbook/articles/ai-native-workflow/flow.jpg)

minds 用他自写的 [mind-forge](https://github.com/alswl/mind-forge) 管理：一个仓库装若干项目，每个项目分四个区——`sources/` 输入区只读，原始素材进来不改；`docs/` 文章区，长文切成章节碎片独立迭代；`outputs/` 构建产物由 `mf build` 生成不手工编辑；`prompts/` 与 `thinking/` 记录目标、约束与推理过程。意义在于材料、在写的东西、发布物分开：Agent 可以改 `docs/`，污染不了 `sources/`；review 看的是 `docs/` 的 diff。仓库根上一份 CLAUDE.md 写协作原则与红线，一份术语表统一专有名词，一批 skill 承担重复动作——约定写在仓库里，不每次对话重讲。

![mind-forge 的仓库与项目管理](/sdlc-playbook/articles/ai-native-workflow/mindforge.jpg)

![项目内四区结构：sources/docs/outputs/prompts](/sdlc-playbook/articles/ai-native-workflow/minds-structure.jpg)

my-kms 是持续多年的个人知识库（Obsidian），内容以人工写入为主。日常信息流：会议转写 → 摘要 → 当日记录 → 日报 → 方案、文章与分享。两个仓库都托管在本机自建的 Forgejo 上——私有数据不出机器，但仍有分支、PR、diff 与历史，Agent 的每次改动可 review、可回滚。

![本机 Forgejo 托管：私有但保留完整 git 工作流](/sdlc-playbook/articles/ai-native-workflow/forgejo.jpg)

**如何保持人味**：框架自己构思，结构自己把控；长内容先语音口述，AI 负责整理、汇总、润色、结构化；观点来自自己的输入；图尽量自己画。他给一位运营同学的答复是：我写框架，AI 生成，然后我给很多批注反馈——像大学导师给学生改论文。**人味不是靠 AI 模仿出来的，是因为框架和观点本来就是自己的。**

## AI Coding 的三个变化

**其一，Spec-driven 从个人选择变成团队要求。** 规格、边界、验收标准是研发的起点，强制使用 speckit、superpowers 或任何成熟的 spec 框架。

**其二，细节代码越来越少看，但不能不管。** 结构稳定的系统里，过去积累的 Code Review 经验要持续沉淀成约束。他放在公开的 [alswl/guides](https://github.com/alswl/guides)：每份指南只选一套技术栈、固定一种项目结构，规则写成祈使句——同时写给人和 AI Coding 工具看，所以每条都要短、可核对，不写「视情况而定」。用法是在项目 CLAUDE.md / AGENTS.md 里引用对应文件，让 Agent 照着写。

**其三，自测 Agent。** AI Coding 让需求交付密度爆发，测试资源跟不上同样的速度。他的方案是一条链路：**规格 → 分层验证 → 判决 → 回写验收**。规格既是开发起点也是断言来源；验证按成本从低到高分层，fail-fast：

| 层 | 回答什么 | 引擎 |
|---|---|---|
| smoke | 服务能起来吗？健康闸口通吗？ | 组合 |
| API | REST API 合约对吗？ | Hurl |
| CLI | 命令行的行为对吗？ | bash + Go (testify) |
| E2E | 前端关键交互还在吗？ | Playwright |

最后不是给一堆日志，而是给一个带运行证据的结论，回写到工作项的验收里。

![自测 Agent 的分层验证链路](/sdlc-playbook/articles/ai-native-workflow/selftest-1.jpg)

![判决与回写验收](/sdlc-playbook/articles/ai-native-workflow/selftest-2.jpg)

三个变化连成一条线：**规格定起点，约束替人看细节，分层验证给结论。** 代码越来越少需要人逐行盯；写什么、按什么写、怎么算做完，反而要写得更清楚。

## 工具链是那条隐藏线路

工程师本质上靠工具加强自己的效率与产出。他的清单：mind-forge（知识锻造 CLI）、[skm](https://github.com/alswl/skm)（local-first 的 Skill 管理器，跨电脑部署 SKILL）、一个好用的评审编辑器（他选 Vim）。常用 skills 一部分来自社区——speckit（spec 套件）、grilling（追问我）、humanizer（说人话）；一部分自己写——spec-report-html（把 spec 汇成一页纸）、session-retro（反思当前 session 改进本地 SKILL）、chat（基于 IRC 的 Agent 协作）、distill-memory（蒸馏本机 jsonl 记忆）、repo-analyzer（仓库快速分析）。

## 几个观点

**提效很快到瓶颈。** 执行密度上升后，新的卡点是决策密度——信息、判断、共识不可跳过。

**AI WoW Time 正在过去。** 新概念带来短期兴奋，持续价值看落地；真实业务、真实系统、真实用户，要真刀真枪。

**开会变得更重要。** AI 加速产出，分歧更快出现，共识形成的价值更高；决策、承诺、责任仍需要人。

**创作 = 创 + 作。** AI 善于「作」：生产、展开、润色；人负责「创」：问题、判断、表达。纯 AI 生产的内容大家会乏味——保留观点、经验与个人棱角。

从 2 月到 8 月变来变去的，其实是他对「人站在哪里」的理解。作者补了一句 update：文中的分享延迟一个月，他的最新实践已又进一步摸到 Stage 8 门槛——但这套一步步走过的路径，值得工程师亲自体验。
