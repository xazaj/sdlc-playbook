---
name: design-constraint-loop
title: 设计约束回路
summary: 同类页面反复生成时，把人工纠正沉淀为约束文件、有界样式与机械检查，用基线盲比驱动更新。
category: design
kind: doc
invoke: direct
origin: local
upstream: https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md
release_source: local
evaluated_version: "0.1.0"
evaluated_at: "2026-09-12"
updated_at: "2026-09-17"
---

## 何时用

`stages/20-design/DECIDE.md` 判定走 AI 直接生成视觉（或组件库轻定制），且**同一类页面会反复生成**，例如报告与提案、benchmark 或微站，每次生成后都在重复纠正同类问题时用它。它把每次人工纠正沉淀为三类载体：约束文件里的可观察规则、样式表里有界的类与 token、生成后可跑的机械检查。

它管的是**跨次沉淀**，不是单次过程，也不是视觉方向：单次生成怎么发散、评审、做减法是 `ai-design-three-stages` 的事；视觉方向与 token 从哪来是 `gstack-design-consultation` 的事。三者叠加使用，互不替代。

不适用：只生成一次的界面（没有可沉淀的重复，过程约束足够）；长期演进的产品 UI（走组件库与 token 体系，见选型矩阵）；直接要 Vercel 观感的成品场景，上游 `design.md` 本身是公开 URL，任何能读 URL 的 agent 可直接加载，不必自建回路。但注意它没有 license 文本：URL 引用加载无争议，整份复制进项目属上游默许而非授权。

## 这一版怎么样（0.1.0）

来源是两篇 Vercel 博文：[How our agents build on-brand pages with design.md](https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md)（2026-08-31）与其前作 [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel)（2026-06-25）。本卡提炼其中可固化为项目约束的部分：

- **三分落地**：每条人工纠正落到能稳定执行它的最窄位置。判断类（层级、措辞、构图）进约束文件 prose；可复用的机械决策（字体、间距、表格、图表布局）进 stylesheet 并只文档化类名与 token：agent 只用登记过的名字，不读样式表实现，省下的上下文留给指导本身；能机械验证的失败（如表格不吃满可用宽度）落成生成后跑的检查。上游为同一条纠正同时落规则与检查的例子：规则进文件、检查进代码，这条失败以后不再复发。
- **六步构建法**：选一个反复出现的 artifact 而非「make it on-brand」这类宽目标 → 先存无约束 baseline（prompt、输入、配置、截图，再糙也留着）→ 把最近十次人工纠正改写成可观察规则 → 约束文件按 Scope / Reader and task / Observable decisions / Available primitives 四节组织 → 同输入、同模型、同视口与 baseline 做一次配对盲比 → 编码纠正而非手工修补本次输出。
- **证据回流**：collector 只收集不评判，judge 分组验证并保持候选 pending，人最终决定落点（规则、样式、检查、示例、或不改）。某类纠正计数不降说明修法错了。
- **给缺陷命名**：反复出现的生成式模式一旦有名字（capsule-badge、chart-in-dark-box），agent 识别与规避的可靠性远高于一段描述。上游实测口径：已知失败在加载约束文件后减少 57%，但博文自己给出两个 caveat（检查只能抓已见过且写下来的失败，六页样本太小），数字是作者自报，未独立验证。

**上游实例不登记为本库 design-md 资产**：`design.md` 与 `vercel-brand.css` 无公开 git 源（`github.com/vercel/geist` 为 404，上游靠 CSS 头注释里的内部 commit SHA 与文件 SHA-256 钉版本），且无 license 文本，不满足本库 `kind: design-md`「钉 commit 取 raw、license 必填」的登记前提。引用上游 URL 时应记录获取日期与 SHA-256 作为快照。

待验证（本卡未实测）：六步回路未在真实项目完整走一轮；与 `ai-design-three-stages`、`gstack-design-consultation` 同装时 DESIGN.md 的分节共存表现。

## 使用 prompt

复制整块，贴进任何 agent 的聊天窗口，当次会话生效，无需安装：

````text
【设计约束回路】会话级启用：直接粘贴，无需安装

本次会话中反复生成同类页面（报告、提案，benchmark 或微站）时，按以下规则走：

1. 同类页面的第一版先存基线：prompt、输入、配置、截图，再糙也留着。
2. 每次我纠正你，把纠正改写成可观察规则（「证据表格吃满可用宽度」，不是
   「更清爽」），追加进 DESIGN.md 的 Observable decisions；机械可复用的落成
   有界类名或 token 并登记到 Available primitives；能机械验证的落成生成后
   跑的检查。之后生成只用登记过的类名与 token，不读样式表实现。
3. 下一版与基线盲比，不凭记忆比。
4. 给反复出现的缺陷起短名（capsule-badge、chart-in-dark-box），列为默认禁止项。
5. 一次性界面不走这个回路。

执行要求：先复述你理解的三类落点（规则/类名与 token/检查）与适用边界，确认后开始。
````

## 固化 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把「设计约束回路」装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## Design constraint loop

- Applies only to recurring generated artifacts (reports, proposals,
  benchmarks, microsites). Never run this loop for one-off screens.
- Before the second generation of the same artifact kind, ensure the
  project has a constraint file: DESIGN.md carrying the sections
  Scope (which artifacts are governed, which are not), Reader and
  task (who opens it, what they must decide), Observable decisions,
  and Available primitives (registered class and token names).
  Append missing sections if the file already exists.
- Write every accepted human correction as an observable rule
  ("evidence tables span the full available width"), never as an
  adjective ("cleaner", "less cramped"). Land it in Observable
  decisions.
- Land each correction in the narrowest place that can enforce it:
  judgment stays in DESIGN.md prose; repeatable mechanics (type,
  spacing, tables, charts) become namespaced classes or tokens in a
  stylesheet, registered by name in Available primitives — generated
  pages use only registered names and never read the stylesheet
  implementation; mechanically checkable failures become a check run
  after generation.
- Keep a baseline: on first generation save the prompt, inputs,
  configuration, and screenshot. Judge later outputs against that
  baseline, not against memory.
- Give recurring generated-design defects short names (capsule-badge,
  chart-in-dark-box, hero-grid) and list them as rejected defaults.

2. 若本项目根目录尚无 DESIGN.md，创建它并写入上述四节骨架：Scope 先列
   当前已知的重复 artifact，一个都没有就写 "none yet"。已有 DESIGN.md
   则只追加缺失的小节，不要改动已有内容。

3. 完成后列出你改动或新增的文件。
````

确认方式：对同一类页面做第二次生成。装对了的标志有三点：agent 动手前先读 DESIGN.md 的 Observable decisions；页面样式只使用 Available primitives 里登记过的类名；收到新纠正时把它改写成一条可观察规则追加进文件，而不是只修本次输出。三点都发生即安装正确。

## 版本

本条目是对外部博文的方法论提炼，不是外部资产本身，版本由本库维护，`evaluated_version` 指本提炼稿的版本。上游博文若有修订，本库不会自动感知；若上游公开 design.md 的 git 源或补上 license，应回来重估是否改为登记 `kind: design-md` 资产本体。

评估历史：0.1.0（2026-09-12）
