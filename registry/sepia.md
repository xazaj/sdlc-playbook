---
name: sepia
title: sepia（去 AI 味写作）
summary: 修文档的 AI 指纹：发版说明、复盘、PR 回复各按场合规则去味，写作前中后三个动词入口。
category: bootstrap
kind: skill
invoke: install
origin: marketplace
provider: sepia@sepia
asset: sepia:sepia
upstream: https://github.com/Nanako0129/sepia
pairs_with:
  - claude-prose-style
agents:
  - Claude Code
  - Codex
  - Grok Build
  - Antigravity
release_source: plugin
evaluated_version: "0.7.0"
evaluated_at: "2026-09-05"
updated_at: "2026-09-05"
---

## 何时用

`stages/10-bootstrap/DECIDE.md` 判定为「产出含对外发表的文档」之后，用它去 AI 指纹。适用对象：agent 起草、要给项目外的人读、且「被认出是 AI 写的」会造成实际损害的文档：release notes 与公告、postmortem、PR/issue 回复、工单、技术文章。判据是读者会认出 AI 指纹并因此减分：发版说明的营销腔、复盘的模板感，以及技术文章被平台打 AI 标；「文字难看」则归 `registry/claude-prose-style.md` 的常驻约束管。四个动词入口按伤情选：write（新写）、review（只诊断不改）、refactor（最小改动）、recreate（病入膏肓时全文重写）。已有人类点名某篇「AI 味重」时也走这里，先 review 后 refactor。

不适用：日常对话、代码注释、提交信息、只在团队内部传阅的工作笔记，一般输出的文风由常驻约束覆盖，没必要每个输出去味；小说与创作路由（含 hemingway/voice 堆叠）与工程仓库无关，装了也不许在这类项目触发。

## 这一版怎么样（0.7.0）

本卡核对了 v0.7.0 的发布物与仓库结构，README 的结构性声明与实物一致：

- 一个总路由 `skills/sepia` 加五个操作包装（write/review/refactor/recreate/hemingway）；专业文档规则按域拆在 `references/domains/`（dev-replies、postmortems、release-notes、tech-articles、tickets 各一份薄规则），中文校准单独成文件 `references/languages/zh.md`，对中文文档有实际意义。
- 规则有证据链：`research/` 消化了 12 篇以上研究（主线是 StoryScope：叙事结构特征单独就能以 93.2% macro-F1 检出 AI 小说，表面修辞改动几乎不移动检出率），每条规则能指回来源。校准原则「对齐人类分布，而不是反向做 AI」写在路由里，防止矫枉过正成新指纹；每篇只选 3–5 个动作、留松弛。
- 工程质量：behavioral-eval 与 version-consistency 两套 CI，plugin.json 版本与最新 release 一致（均 0.7.0，2026-09-04 发布）；MIT；Claude Code、Codex、Grok Build、Antigravity 四平台原生插件包。
- 操作包装依赖主技能，不支持单独安装，装就是整包，边界要靠 AGENTS.md 压住。

待验证（本卡未实测运行）：去味的实际质量、review 的 30 项 rubric 误报率、zh.md 中文校准的效果、与既有写作类技能的触发竞争。装进项目后先拿一篇旧 release note 跑 review 验证再投入使用。

风险：上游触发描述覆盖一切写作，不写边界会在所有写作任务上抢触发；voice 堆叠是实验性接口，不要当稳定能力依赖。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 sepia（去 AI 味写作技能）装进本项目，要求：

1. 确保本项目能使用 sepia 的全部六个条目（总路由加 write/review/
   refactor/recreate/hemingway 五个操作包装；包装依赖主技能，必须整包装，
   不支持单独装某一个）。
   - Claude Code：附注：/plugin marketplace add Nanako0129/sepia 后
     /plugin install sepia@sepia，scope 选 user。
   - 其他 agent：用 Skills CLI 安装该仓库，或把仓库 skills/ 目录下六个
     条目整体放进本项目 .agents/skills/（project scope 钉住版本）。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## De-AI writing (sepia)

- Use sepia for documents read outside the team where AI tells cause
  real damage: release notes, announcements, postmortems, PR/issue
  replies, tickets, and technical articles.
- Route by verb: write for new drafts, review to diagnose without
  editing, refactor for minimal in-place edits, recreate only when a
  full rewrite is explicitly agreed.
- Do NOT invoke sepia for conversation, code comments, commit
  messages, or internal working notes; the standing prose rules
  already cover general output.
- Do NOT use the fiction routes or experimental voice stacking in
  this repository; they are out of scope for engineering documents.

3. 完成后列出你改动或新增的文件。
````

确认方式：拿一篇旧的 release note 让 agent 走 review 入口。装对了它会输出按 rubric 的具体条目（营销膨胀、无信息量的填充句、场合错配的语气），并明确不改一个字；只会说「建议写得更自然」一类泛泛之谈的就是没装对。

## 版本

本库不记录上游当前版本号，只记录评估时基于的那一版（见 frontmatter 的 `evaluated_version`）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'sepia' in k])"
```

上游发布页：https://github.com/Nanako0129/sepia/releases

评估历史：0.7.0（2026-09-05）
