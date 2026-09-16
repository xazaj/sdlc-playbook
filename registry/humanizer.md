---
name: humanizer
title: humanizer（英文去 AI 腔重写）
summary: 英文去 AI 腔：25 条 Wikipedia 来源模式按强度分级整段重写，缺事实先问不编造。
category: bootstrap
kind: skill
origin: external
provider: blader/humanizer
asset: humanizer
upstream: https://github.com/blader/humanizer
license: MIT
pairs_with:
  - claude-prose-style
agents:
  - Claude Code
  - Codex
  - ChatGPT
release_source: github-releases
evaluated_version: "3.0.0"
evaluated_at: "2026-09-16"
updated_at: "2026-09-16"
---

## 何时用

英文一般文章被嫌 AI 腔、要重写而不是轻磨时用它：博客、公告、随笔、文档散文。三个判据：读者会认出 AI 指纹并因此减分；改写强度要到「整段重写」这一档（轻磨或只审计走 no-ai-slop）；最好能给 2–3 段自己写的样本——它按样本的节奏、选词、标点乃至破折号习惯对齐声音。缺事实细节时它先问而不是编：姓名、数字、日期、引语必须来自原文或作者。

与 no-ai-slop 同占英文位，分工：humanizer 是 25 条模式分级（前 5 条单次命中即改，标 *weak alone* 的需多处共现，防误伤）加事实核查的整段重写；no-ai-slop 的 detect 只点名不改写、edit 轻量磨尖。同为单条目，二选一，不同装。

不适用：中文写作（走 sdlc-deai-zh）；发版说明、复盘、PR 回复、工单等工程域文档（sepia 的域规则更对口）；日常对话、代码注释、提交信息、内部笔记（任何去味技能都不该碰）；与其他去味技能同装。

## 这一版怎么样（3.0.0）

本卡通读了 v3.0.0 的 README 全文（25 模式表、完整改写示例、版本史），核对了仓库结构与发布记录：

- 证据链比同类强一级：模式表来源是 Wikipedia「Signs of AI writing」，由 WikiProject AI Cleanup 持续校订；3.0 重构明确按 Wikipedia 当前版本增删了模式（弃了假区间与同义词轮换，补了含糊关联）。每条模式带 before/after 例句与误伤防护。
- 机制健全：不造事实是硬规则（缺细节先问）；指向文件时只动散文，代码、数据、frontmatter、链接目标不动；输出展示过程（第一稿、自查、终稿）。
- 维护极活跃：1.0 到 3.0 二十余个版本，2.x 密集收紧误伤边界（#198、#206、#212、#247）；48.7k stars，MIT；分发面宽（skills CLI、Claude 插件市场、Claude Desktop ZIP、手工复制）。

待验证（本卡未实测运行）：实际改写质量、show-your-work 输出的噪音、与其他去味技能同机的触发竞争。

风险：3.0.0 是刚落地的大重构（35 条收 25 条，编号全变），行为相对 2.x 有变化，评估基于 README 与版本说明；上游触发描述覆盖一切「humanize」请求，不写边界会抢 sepia、no-ai-slop、deai-zh 的触发。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 humanizer（英文去 AI 腔技能）装进本项目，要求：

1. 确保本项目能使用 humanizer 技能（单条目：仓库根目录一个 SKILL.md，
   无其他依赖）。
   - Claude Code：附注——npx skills add blader/humanizer（--global 装到
     用户级，省略则装进当前项目）；也可 /plugin marketplace add
     blader/humanizer 后 /plugin install humanizer@humanizer。
   - 其他 agent：把仓库根目录的 SKILL.md 复制进本项目
     .agents/skills/humanizer/（project scope 钉住版本），已存在则
     覆盖更新。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## Humanizer (English de-AI rewrite)

- Use humanizer to rewrite English prose that reads AI-generated: it
  marks the 25 Wikipedia-sourced tells strongest-first, drafts a
  rewrite, and checks it against the original claims. Facts must come
  from the source or the writer; it asks instead of inventing.
- Give it a 2-3 paragraph writing sample when the rewrite should match
  a specific voice, including punctuation habits.
- Do NOT use it for Chinese text or engineering documents (release
  notes, postmortems, PR replies — sepia fits those), and do NOT
  install it alongside another de-AI skill; pick one per project.

3. 完成后列出你改动或新增的文件。
````

确认方式：给 agent 一段含 "It's not just X, it's Y"、"a testament to" 和一句一行式收尾的英文，让它 humanize。装对了它逐条点名命中的模式（最强优先），给出整段改写且事实与原文一致，缺细节会停下来问；不点模式直接重写、或改写里出现原文没有的细节，都是没装对。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 GitHub Releases（git tag）管理，无需本机查询命令，直接看发布页：

上游发布页：https://github.com/blader/humanizer/releases

评估历史：3.0.0（2026-09-16）
