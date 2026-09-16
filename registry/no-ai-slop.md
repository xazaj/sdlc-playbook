---
name: no-ai-slop
title: no-ai-slop（英文草稿去 slop）
summary: 英文草稿去 slop：单条目轻量，删 AI 模式并保留作者嗓音，detect 只点名不改写。
category: bootstrap
kind: skill
origin: external
provider: petergyang/no-ai-slop
asset: no-ai-slop
upstream: https://github.com/petergyang/no-ai-slop
license: MIT
pairs_with:
  - claude-prose-style
agents:
  - Claude Code
  - Codex
  - ChatGPT
release_source: github-releases
evaluated_version: "1.0.6"
evaluated_at: "2026-09-11"
updated_at: "2026-09-11"
---

## 何时用

`stages/10-bootstrap/DECIDE.md` 判定为「产出含对外发表的文字」且文字是**英文一般文章**——博客、营销文案、公告文案、个人随笔——时走这里。两种入口：edit（默认）在保留作者嗓音的前提下删 AI 模式并磨尖表达；detect 只做审计，逐条点名命中的模式、引用原句、给几个词的修法，不改一个字、不猜是不是 AI 写的。草稿作者不限于 agent，人写完想让 agent 收拾一遍同样适用——「编辑已有草稿、保留写的人的嗓音」是它与 sepia（agent 起草、按工程文档域去味）的分界线。另一个走这里的信号：只想装一个条目，不想引入 sepia 那种六条目整包。

不适用：工程域文档（发版说明、复盘、PR/issue 回复、工单、技术文章——sepia 的域规则更对口，且两者触发面都覆盖「让文字不那么像 AI」，同一项目二选一，不许同装）；中文写作（本技能的模式表与删词表全是英文，对中文无效）；英文的重写级去味与声音样本对齐（humanizer 更对口，同为英文技能，二选一）；对话、代码注释、提交信息、内部笔记（常驻文风约束管的，任何去 slop 技能都不该碰）。

## 这一版怎么样（1.0.6）

本卡通读了 v1.0.6 对应的 SKILL.md 与 eval.md 全文，核对了仓库结构与发布记录：

- 单条目（`skills/no-ai-slop/` 一个目录），edit/detect 双模式。规则具体可执行：17 条编辑原则（最小有效编辑、保留真实嗓音、可移植性测试、动词干活等）、三张删词表（26 个禁词、11 个常空副词、16 个常空短语，各带保留条件而非一刀切）、18 种模式每条配改写前后例句。
- 有自检闭环：edit 完成后对照 eval.md 的 26 项检查（原则 11、删词 1、模式 9、终读 5）逐项 pass/fail，失败回改再查；detect 的输出契约（点名、引文、短修法，不判分不猜作者）也写进了终读检查。
- detect 的设计有分寸：「AI 检测器是在猜，点名模式才是可核查的证据」——只列证据，把判断留给写的人。
- 维护活跃：v1.0.4（2026-07-27）到 v1.0.6（2026-08-01）五天三版，GitHub Actions 自动构建发布 plugin zip；8.2k stars，MIT。
- 分发面宽：`npx skills add`、README 安装 prompt、ChatGPT/Codex 插件（`.codex-plugin/`），对「任意 agent 都能装」的登记要求友好。

待验证（本卡未实测运行）：实际编辑质量、detect 的误报率、`npx skills add` 在 Claude Code 的落盘路径、与 sepia 同机时的触发竞争。

风险：description 覆盖「clearer, more direct … less AI-sounding」的一切写作请求，不写边界会与 sepia（若装）和常驻文风约束抢触发；规则是手艺规则，没有 sepia 那样指向研究的证据链，换底层模型后效果要复核。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 no-ai-slop（英文草稿去 slop 技能）装进本项目，要求：

1. 确保本项目能使用 no-ai-slop 技能（单条目：SKILL.md 加 eval.md，
   无其他依赖）。
   - Claude Code：附注——npx skills add petergyang/no-ai-slop
     --skill no-ai-slop --global --yes，或按上游 README 把安装
     prompt 贴给 agent 执行。
   - 其他 agent：把仓库 skills/no-ai-slop/ 整个目录放进本项目
     .agents/skills/（project scope 钉住版本），已存在则覆盖更新。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## No AI Slop (English prose de-slop)

- Use no-ai-slop only for English prose written for readers outside
  the team: blog posts, marketing copy, announcements, essays.
- Route by intent: edit (default) to sharpen a draft while preserving
  the writer's voice, detect to audit a draft without rewriting it.
- Do NOT install or trigger it alongside sepia; pick one de-AI skill
  per project by document type.
- Do NOT use it for Chinese writing; its pattern and word lists are
  English-only.
- Do NOT run it on conversation, code comments, commit messages, or
  internal working notes.

3. 完成后列出你改动或新增的文件。
````

确认方式：给 agent 一段含 "It's not X. It's Y." 与 "a testament to" 的英文，让它走 detect。装对了它会逐条列出模式名并引用原句，只给几个词的修法，全文一字不改；直接重写全文、或只回一句「有 AI 味」的，都是没装对。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 GitHub Releases（git tag）管理，无需本机查询命令，直接看发布页：

上游发布页：https://github.com/petergyang/no-ai-slop/releases

评估历史：1.0.6（2026-09-11）
