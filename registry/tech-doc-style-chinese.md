---
name: tech-doc-style-chinese
title: 中文技术文档排版与术语规范
summary: 中文技术文档与产品文案的写作规范技能：直角引号、中英文留白、黑话禁用、API 状态词，附可进 CI 的 lint 脚本。
category: bootstrap
kind: skill
invoke: install
origin: external
provider: Fenng
asset: tech-doc-style-chinese
upstream: https://github.com/Fenng/Tech-Doc-Style-Chinese
license: MIT
pairs_with:
  - deai-zh
agents:
  - Claude Code
  - Codex
release_source: github-releases
evaluated_version: "0.3.2"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

项目产出面向读者的中文文档（文档首页、API 说明、操作手册、FAQ、界面文案），需要立排版与术语规矩：直角引号「」、中英文与数字之间加空格、一段一行、黑话禁用表、API 状态词不机械直译。判据是两条之一：排版术语问题靠人眼 review 已管不过来（PR 反复挑引号和空格），或要在 CI 里对 `.md` 做机械检查（自带零依赖 Python 检查器，error/warning/style 分级）。

它管「格式与术语」，不管「像不像 AI 写的」。排好了版但读者嫌 AI 腔的，走去味技能（sepia／sdlc-deai-zh），两者分层可同装，但须在 AGENTS.md 写明分工。不适用：英文文档（claude-prose-style 的域）；内部一次性笔记与代码注释；机器可读内容（代码字面量、JSON 键名、URL，上游规则自己排除）。

## 这一版怎么样（0.3.2）

评估基于 v0.3.2（2026-09-29 发布），实际读过 SKILL.md、references/terminology-and-typography.md 全文，并把仓库克隆下来跑了检查器与本库 49 个 `.md`：

- 检查器实测可用：对本库跑出 error=0、warning=2、style=605。两条 warning 都是语境词误报（「标示时点」的动词用法正确）；605 条 style 集中暴露一处真实问题——本库 `stages/` 与 `docs/` 大量混用 `"中文"` 与 `「中文」`。一次运行就把排版欠账量化了，这是多数写作技能给不了的验收手段。
- 规则设计克制：事实保真排在优先级第一（不增删事实、不确定表达不许改成确定）；黑话表分两级——「确认后才可用」（赋能、抓手、闭环）与「依赖语境不由检查器自动替换」（场景、生态、梳理），比一刀切禁词可用。
- 风险一：SKILL.md 的触发描述覆盖「撰写、改写、校对、审阅」全部中文文档任务，不写边界会与项目里其他写作类技能抢触发。风险二：style 级建议噪音大（本库 605 条里大部分是示例文本与设计文档的引号），进 CI 只把 error 设为阻塞、style 走白名单，否则第一次跑就会淹没团队。风险三：受控中文模块借鉴 STE 思路，上游自己声明不表示符合 ASD-STE100。

待验证（本卡未实测）：技能常驻后与 deai-zh 同装时的实际触发竞争；lint 脚本在 CI 的长期维护成本。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请让 tech-doc-style-chinese（中文技术文档规范技能）在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别的安装状态，只报告结论：
   - 用户级：~/.claude/skills/tech-doc-style-chinese/
   - 项目级：.claude/skills/tech-doc-style-chinese/、.agents/skills/tech-doc-style-chinese/
   结论写清：装了/没装；装了则版本号是多少、从哪个文件读到。上游不在
   SKILL.md 里写 version 字段，若目录里没有版本记录（如克隆时的 tag 或
   安装清单），如实说明读不到，不要猜。

2. 【对版本】已安装时：从
   https://github.com/Fenng/Tech-Doc-Style-Chinese/releases 查最新 tag，
   与第 1 步读到的本地版本比较。
   - 一致 → 不动它，说明判断依据。
   - 读不到本地版本 → 如实说明，不要猜。
   - 落后 → 升到最新，升级后重新确认。

3. 【安装】未安装时装最新 tag。把 SKILL.md、references/、scripts/
   三个部分都装进来（检查器在 scripts/ 里，漏掉会丢掉 CI 校验能力），
   放入 .claude/skills/tech-doc-style-chinese/。Claude Code 用户可改用
   npx skills add（附注即可，不是唯一路径）。

4. 【加载确认】确认技能本会话真的可用：它的触发描述应出现在你的可用
   技能里。新装技能在当前会话不可见时，不要装作可用，要告诉用户怎么让
   它生效（通常是重开会话），然后停下等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在
   同名小节则整节替换，不要重复追加：

## Chinese tech doc style (tech-doc-style-chinese)

- Use tech-doc-style-chinese for typography and terminology of
  reader-facing Chinese docs: corner quotes, CJK-Latin spacing,
  one-paragraph-one-line, jargon blocklist, API status wording.
- It does NOT de-AI prose; that stays with the de-AI skill (sepia or
  deai-zh). When both are installed, this skill owns format/terminology
  and the de-AI skill owns voice.
- The lint script reports error/warning/style levels; only `error`
  blocks CI. `style` findings are advisory and need a project
  allowlist, otherwise first run drowns the team.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：给 agent 一段含「赋能」「抓手」和「使用API获取数据」的中文文档片段，让它按规范处理。装对了会给出黑话的平实替换（赋能→提供）、在中英文间补空格（使用 API 获取数据），但不改动事实、数字与代码字面量；顺手重写整段、删掉限制条件或改掉数字的，都是没装对。

## 版本

本库不记录上游当前版本号，只记录评估时基于的那一版（见 frontmatter 的 `evaluated_version`）。上游当前版本由 GitHub Releases 管理，查询方式：<https://github.com/Fenng/Tech-Doc-Style-Chinese/releases>。

评估历史：0.3.2（2026-09-30）
