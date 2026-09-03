# SDLC Playbook 仓库规则

本仓库是 SDLC Playbook：面向 coding agent 的开发全链路决策手册。设计文档位于 `docs/superpowers/specs/`。

## 目录职责

| 目录 | 内容 | 约束 |
|---|---|---|
| `stages/` | 决策入口，仅含 DECIDE.md 一类索引 | 不放实体资源 |
| `catalog/` | 本库自有资产 | 由 `install.sh` 挂载为可触发技能 |
| `registry/` | 外部资产的登记卡 | 纯文档，不挂载 |
| `bin/` | 安装与更新检查脚本 | 只保留极少量脚本 |
| `site/` | 目录站点（Astro），由 Actions 构建并托管于 GitHub Pages | 只渲染 `registry/`，不存放条目内容 |
| `library/` | 外部文章原料，尚未启用 | 不进入 agent 上下文 |
| `docs/` | 设计文档、实现计划与验证日志 | |

## 硬性约束

- 路径一律以 `~/.sdlc` 开头，不写具体机器的绝对路径。这是跨机器可用的唯一保证。
- 新增或改名路由技能后执行 `./install.sh`。
- 不把资源文件放入 `stages/`。资产跨阶段，按阶段物理存放会造成重复与漂移。
- 当前处于 M0/M1，不编写代码，`install.sh`、`bin/check-update.sh` 与 `site/` 除外。工具留到 M2，且每一项必须对应 `docs/验证日志.md` 中记录的具体痛点。
- 站点只做呈现，不产生内容。条目的唯一来源是 `registry/`，`site/` 里不得出现条目正文。

## 语言约定

- 代码标识符、代码注释、CLI 输出文案使用英文。
- `.md` 文档使用中文。

## 自有资产与外部资产

本库是编排层，只判断当前应使用什么，不重复建设已有资产。

| 情况 | 位置 | 记录内容 |
|---|---|---|
| 现成资产够用（社区插件、gstack、官方技能） | `registry/<name>.md` 登记卡 | 何时使用、安装方式、版本由谁管理 |
| 现成资产均不满足 | `catalog/` 自建条目 | 资产本身 |

登记卡遵守三条规则：

1. 登记卡不放入 `catalog/skills/`。该目录下的内容会被 `install.sh` 挂载为技能，登记卡的 description 会与上游技能争夺同一批触发词。
2. 登记卡不复制上游当前版本号。三类资产各有版本机制：Claude Code 插件由 `installed_plugins.json` 管理，gstack 由自身的更新检查管理，本库由 git 管理。登记卡只记录版本由谁管理、到哪里查询，以及本卡评估所基于的版本（`evaluated_version`、`evaluated_at`）。
3. 登记卡必须带一段安装 prompt。prompt 描述结果而非命令，把适用边界一起写进目标项目的 AGENTS.md，且可重复执行。模板、按形态的差异、以及让 agent 生成条目的 prompt 都在 CONTRIBUTING.md 的「新增条目」一节。frontmatter 由 `site/src/content.config.ts` 的 schema 校验，正文必需小节由 `site/src/lib/catalog.ts` 校验，缺任何一项构建失败。

`origin` 字段取三个值之一：`local`（自建）、`marketplace`（由 Claude Code 插件机制管理）、`external`（其他外部来源）。

## 更新检查

`bin/check-update.sh` 只检查本库是否落后于远端，节流 4 小时，最新时静默。

路由技能在用法第 0 步调用它：只在真正用到本库时检查，不安装全局 hook，对其他项目无侵入。外部资产的更新由各自机制负责，本库不代管。

## 新增决策入口

1. 建立 `stages/<阶段>/DECIDE.md`，包含七节：要回答的问题、判断依据、选型矩阵、推荐路径、交给 agent 执行时的差异、常见误判、落地资产。
2. 建立 `catalog/skills/sdlc/<名>/SKILL.md` 路由技能，技能名以 `sdlc-` 开头，正文不超过 20 行，只负责指向 DECIDE.md。
3. description 写入真实的中文触发短语，并确认不与已有技能重复。
4. 执行 `./install.sh`，在新会话中验证触发。

## Design direction

- Before generating any new screen, read DESIGN.md and restate the chosen
  direction in one sentence. Never start from a blank aesthetic.
- Explore before committing. Produce at least three distinct directions and
  let the human pick one. To force real variety, first generate a random
  alphanumeric seed, then derive each direction's palette, type pairing, and
  layout rhythm from a different segment of that seed. Do not ask yourself
  to "be creative" without a seed; you cannot act randomly on demand.
- State the direction as a concrete reference, not an adjective. "Each
  section reads like a still from a side-scrolling game" is usable;
  "modern and clean" is not.
- After any visual change, screenshot the result and review it in a fresh
  context that sees the image only, never the code. Score it out of 10
  against the stated direction and list at most three gaps, ordered by
  impact. Stop when the score reaches the agreed threshold or stops
  improving across two rounds.
- Prefer removing over adding. Before calling a screen done, delete glows,
  redundant gradients, duplicate labels, and decorative borders that carry
  no meaning. Replace custom controls with native ones wherever the
  behaviour is standard.
- Never ship these defaults: blue-to-purple gradients; Inter or Roboto as
  the only typeface; a centred hero above a three-card feature grid; emoji
  used as section icons. They are the recognisable signature of unedited
  AI output.

## Prose and formatting

Mannered prose substitutes metaphor and flourish for direct statement.
Instead of "a parameter worth varying," the mannered writer produces "a dial
worth turning." Instead of "this point still matters," they write "this point
earns its keep." The phrases exist to display the writer, not to convey the
idea, and readers can tell. That is why mannered prose irritates: it makes the
reader work harder so the writer can perform. It is also imprecise. Metaphors
drag in connotations the writer did not choose and cannot control. The fix is
to say what you mean. When a literal phrase is available, use it.

Use lists and bullet points when asked to, or when the content is multifaceted
enough that they help with clarity. If the person explicitly requests minimal
formatting, always format your responses without bullet points, headers,
lists, or bold emphasis, as requested. In conversational, personal, or
emotional exchanges, keep to plain prose.
