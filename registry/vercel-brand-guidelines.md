---
name: vercel-brand-guidelines
title: Vercel 报告站设计规范（design.md）
summary: Vercel 官方 Geist 品牌规范技能化：信息架构、排版角色、数据叙事、反装饰硬清单，用于生成有 Vercel 质感的报告页与决策页。
category: design
kind: design-md
invoke: install
origin: external
provider: Vercel
asset: vercel-brand-guidelines
upstream: https://vercel.com/geist
license: proprietary
pairs_with:
  - frontend-design
agents:
  - Claude Code
  - Codex
release_source: web
evaluated_version: "2026-07-22"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

要为报告、提案、基准对比、ROI 计算器、决策页这类「证据型页面」立一套完整的视觉与信息架构规范，且团队认可 Vercel 的克制美学（Geist 排版、单色优先、证据优先于装饰）时，直接取用这份官方规范而不必从零写约束文件。它是 design.md 形态的典型样本：frontmatter 存 token，正文写方法论。

不适用：非 Vercel 品牌的正式对外产品——规范里写死了 Vercel 字标与三角形 footer，取用方法论与 token 结构可以，品牌壳必须整体替换；强品牌表达或活泼消费产品（它的立场是「精确、冷静、克制」）；以及任何想照抄成自己官网的场合（版权属 Vercel，license 非开源）。

## 这一版怎么样（2026-07-22）

评估基于通读的规范全文（经 ui-skills 站 design.md 板块分发，官方源 vercel.com/geist；上游以网页分发、无 git 历史，`evaluated_version` 记 ui-skills 标注的更新日而非 commit——这是对 design.md 模板「钉 commit」的如实偏离）：

- 方法论密度是同类规范里最高一档：六层优先级（保事实 > 保宿主框架 > 保读者问题 > 保品牌识别 > 反模板构图 > 精修细节）；双速阅读（执行路径与审计路径）；每个证据型组织动作都要有一个「属于这份材料、不可移植」的组织性设计——这是反模板感的可执行判据。
- 反装饰是硬清单不是口号：渐变、辉光、玻璃拟态、网格背景、装饰性阴影全部点名拒绝；单色优先，颜色只在承载状态/动作/数据含义时出现；动效默认静止。
- 工程可用性完整：官方 CSS（vercel.com/geist/vercel-brand.css）按公开 API 引用、网络白名单、双主题隐式处理、计算器组件的状态模型约定。

风险：规范与 Vercel 品牌深度耦合，替换品牌项的工作量不小；385 行的约束对小页面偏重。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话：

````text
请把 Vercel 报告站设计规范（design.md）装进本项目，按 1→4 顺序做完再继续别的事：

1. 【取文件】打开 https://www.ui-skills.com/design-md/vercel ，复制页面
   上的 SKILL.md 全文（frontmatter + 正文）。官方源是
   https://vercel.com/geist（品牌资产与 CSS 的权威出处），核对两处
   内容是否一致，不一致以官方源为准并报告差异。

2. 【替换品牌】把文件中 Vercel 品牌专属项整体替换为本项目的：字标、
   footer 标识、document-meta 字段、品牌色。方法论与排版角色体系
   （display/title/heading/lede/body/label/caption）原样保留，token
   值映射到本项目品牌；不引入规范硬清单拒绝的装饰（渐变、辉光、
   玻璃拟态、装饰性阴影）。

3. 【落盘】写入本项目 .claude/skills/report-design/SKILL.md（或项目
   既有的约束文件目录，已有同类文件则整份更新）。若本项目使用其
   CSS 基座，按官方文档引用 vercel-brand.css 并保持公开 API 用法。

4. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## Report design guidelines (from Vercel design.md)

- Apply these guidelines to evidence-bearing pages: reports,
  proposals, benchmarks, calculators, decision pages.
- The Vercel brand shell (wordmark, triangle footer) must be replaced
  with project branding; the methodology and type roles carry over.
- Hard-reject list applies: decorative gradients, glows, glass
  effects, grid backgrounds, ornamental shadows; color only for
  state, action, or data meaning.

完成后：列出改动或新增的文件，说明品牌替换映射表（旧值→新值）。
````

确认方式：装完后让 agent 做一个对比报告页。符合规范的首屏直接呈现论点（不是横幅加铺垫）、表格吃满 12 列证据宽度、数字列右对齐配表头右对齐；出现居中英雄区、装饰渐变或无证据承载的颜色块，就是没装对。

## 版本

上游以网页分发（vercel.com/geist），无 git 历史可钉 commit；`evaluated_version` 记评估时 ui-skills 收录本标注的更新日期（2026-07-22）。内容版权归 Vercel，非开源许可——对外正式使用前自行确认边界。

评估历史：2026-07-22（2026-09-30）
