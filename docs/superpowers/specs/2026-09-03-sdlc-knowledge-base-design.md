# SDLC Playbook 设计文档

> 面向 coding agent 的开发全链路决策手册

- 日期：2026-09-03
- 状态：待评审
- 作者：zhuaijun（与 Claude 共同设计）

**摘要**：本文提出一种面向 coding agent 的顾问式知识库。它按软件开发生命周期（SDLC）的时刻组织决策入口，由路由技能把 agent 引导到对应的选型矩阵，再把判定结果指向可安装的标准化资产。文中给出三层架构（原料、资产、入口）、八类产物规范、决策入口规范、蒸馏流水线、构建与分发方案、跨 agent 适配、质量闸门，以及按内容优先排序的路线图。

## 1. 背景与定位

本项目旨在建成一个面向多种 coding agent 的顾问式知识库，服务 Claude Code、Codex CLI、pi 等遵循 Agent Skills 开放标准的工具。

它与社区现有的技能聚合库有本质区别。后者（如 1200 余个技能的通用库、2810 个 skill 的聚合站）回答的是"库里有什么"，本项目回答的是"在某个具体时刻，应使用什么"。

典型使用场景：

- 初始化新项目时，查询应为该项目安装哪些规范、技能与模板；
- 设计阶段，查询应采用哪个设计系统、走什么设计流程；
- 编码阶段，查询应采用 SDD、TDD 还是其他流程；
- 读到有价值的 vibe coding 文章时，将其收录并逐步提炼为可复用资产。

定位可概括为一句话：agent 带着"此刻该怎么做"的问题进入，被路由到答案，并能把对应资产直接安装进目标项目的知识库。

## 2. 目标与非目标

### 2.1 目标

1. 提供按 SDLC 时刻组织的决策入口，使 agent 能自主找到并给出选型建议。
2. 提供可安装、可执行的标准化资产，涵盖技能、规则、知识、模板、subagent、命令、hooks 与 MCP 清单。
3. 支持跨 agent：Claude Code、Codex CLI、pi 三者同等支持。
4. 提供持续沉淀机制：外部文章、蒸馏笔记、正式资产三级递进，全程可溯源、可过期。
5. 作为公开 marketplace 发布，按可安装制品的标准处理版本、校验与供应链声明。

### 2.2 非目标

- 不做向量检索或 RAG。知识以可导航结构组织，依靠 description 路由与显式路径读取。
- 不做在线服务或托管后端。全部能力以本地 CLI 与静态仓库形式交付。
- 不替代 agent 自身的能力。本库只提供上下文与资产，不实现 agent 运行时。
- 首版不做 Web 文档站与图形界面。

## 3. 设计依据

以下事实构成本设计的约束，均来自 2026 年 9 月的调研。

1. **Agent Skills 已成为跨厂商开放标准。** Anthropic 于 2025 年 12 月 18 日开放规范；至 2026 年 3 月，OpenAI、Microsoft、JetBrains、Cursor、Gemini CLI、Block Goose 等 25 家以上产品已实现兼容。规范核心为：一个目录、一份 `SKILL.md`（YAML frontmatter 加正文）、三层渐进披露（advertise 约 100 token，load 建议低于 5000 token，reference 文件按需读取）。
2. **四层职责已定型。** `AGENTS.md` 承载常驻规则，30 余种 agent 可读，兼容性最广；`SKILL.md` 承载单个可重复任务；MCP 承载实时数据与受控动作；Plugin 承载分发。混用会造成上下文浪费与触发冲突。
3. **知识组织正从检索转向导航。** 相关研究（《Don't Retrieve, Navigate: Distilling Enterprise Knowledge into Navigable Agent Skills》）表明，把知识蒸馏为可导航的技能树，效果与成本均优于向量检索。
4. **目录约定是分裂的。** `~/.claude/skills`（Claude Code）、`~/.agents/skills`（通用）、`~/.pi/agent/skills`（pi）各不相同。symlink 是社区常用做法，但存在已知缺陷：pi issue #3405 记录了 `~/.pi/agent/skills` 软链到 `~/.agents/skills` 导致技能重复注册、配置与运行时状态不一致的问题。
5. **description 决定触发质量。** 它同时驱动自动激活与检索，需按搜索查询的形式书写，包含真实触发短语。
6. **供应链治理成为焦点。** GitHub 于 2026 年 4 月 16 日上线 `gh skill`，技能被当作可安装制品管理；SkillTester、ClawsBench 等评测基准与一批攻击面研究相继出现。版本钉扎与来源审查已是硬需求。
7. **设计系统有了 agent 专用格式。** `DESIGN.md` 以 YAML frontmatter 存 token，正文写意图与理由，配合 DTCG 三层 token 模型（primitive、semantic、component）。

## 4. 核心架构：三层模型

```
原料层 (library)  →  资产层 (catalog)  →  入口层 (stages)
   收录的文章           提炼成标准化           决策矩阵，
   与碎片               可安装产物            回答"此刻用什么"
```

三层的分工与边界：

| 层 | 内容 | 是否进入 agent 上下文 | 变更频率 |
|---|---|---|---|
| `library/` | 外部文章原文、摘录、蒸馏笔记 | 从不 | 高，随手收录 |
| `catalog/` | 八类标准化可安装产物 | 按需（skills 与 rules 会进入） | 中，需评审 |
| `stages/` | 按 SDLC 时刻组织的决策矩阵 | 按需（路由技能触发后读取） | 低，结构稳定 |

最关键的纪律是：`library/` 的内容永远不直接进入 agent 上下文，也不被 `stages/` 直接引用。只有经过提炼、进入 `catalog/` 的产物才可被消费。缺少这道闸门，知识库会在数月内退化为剪藏堆，触发准确率随之骤降。

## 5. 目录结构

```
SDLC/
├── AGENTS.md                      # 本仓库自身给 agent 的规则
├── CLAUDE.md                      # 软链至 AGENTS.md
├── README.md
│
├── stages/                        # 入口层：索引，不存放实体资源
│   ├── 00-bootstrap/              # 新项目初始化：装什么
│   │   ├── DECIDE.md              # 决策矩阵（人与 agent 的主入口）
│   │   ├── MANIFEST.yaml          # 关联的 catalog 条目与 profile，机器可读
│   │   └── decisions/             # 真实决策记录，阶段独有内容
│   ├── 10-requirements/           # 需求工程流程选型
│   ├── 20-design/                 # 设计系统与设计流程选型
│   ├── 30-coding/                 # 开发流程选型（SDD/TDD/其他）
│   ├── 40-testing/                # 测试策略选型
│   ├── 50-release/                # 发布流程与门禁选型
│   └── 60-operate/                # 运维与事故响应流程选型
│                                  # （各阶段目录结构同 00-bootstrap）
│
├── catalog/                       # 资产层：唯一真源，手写只在这里
│   ├── skills/<domain>/<name>/
│   │   ├── SKILL.md
│   │   ├── references/            # 按需读取的深层内容
│   │   ├── scripts/
│   │   └── assets/
│   ├── rules/<name>.md            # AGENTS.md 片段
│   ├── knowledge/<topic>/
│   │   ├── INDEX.md               # 导航入口
│   │   └── *.md                   # 知识分片
│   ├── templates/<name>/
│   ├── agents/<name>.md           # subagent 定义
│   ├── commands/<name>.md         # slash command
│   ├── hooks/<name>.json          # hooks 配置片段
│   └── mcp/<name>.json            # MCP server 清单
│
├── library/                       # 原料层
│   ├── inbox/                     # 未处理的原文与 URL
│   └── notes/<slug>.md            # 已蒸馏的要点卡片
│
├── profiles/<stack>.yaml          # 技术栈组合包，只引用 catalog 条目
│
├── schemas/                       # 八类产物 + profile + note + stage manifest 的 Schema
├── tools/
│   ├── build/                     # catalog → dist 构建
│   ├── adapters/                  # claude-code.ts / codex.ts / pi.ts
│   └── cli/                       # sdlc 命令实现
├── evals/                         # 触发准确率回归用例
├── .claude-plugin/marketplace.json # 构建产物，由 CI 同步提交，禁止手改
├── dist/                          # 构建产物，不手写，不入 main 分支
└── docs/
```

### 5.1 结构性约束

`catalog/`、`stages/`、`library/`、`profiles/` 之外的内容原则上均为生成物或工具代码。`dist/` 完全由构建生成，手改会被覆盖。

### 5.2 stages 是索引而非容器

`stages/` 下不存放任何实体资源，全部资源位于 `catalog/`。理由有二。

其一，资产天然跨阶段。一个 code-review skill 同时属于 `30-coding` 与 `50-release`；一套设计系统的 knowledge 包在 `00-bootstrap`（决定是否安装）与 `20-design`（如何使用）都要被查阅。若按阶段物理存放，只能在重复存放（必然漂移）与强行单一归属（另一阶段找不到）之间二选一。

其二，`catalog/` 已按产物类型组织了一次目录，stages 再组织一次会形成双重目录树，同一份内容无法同时位于两处。

按阶段浏览的需求由构建产物 `dist/by-stage/` 的索引视图满足，真源不重复。

### 5.3 构建产物的落地方式

Claude Code 的 marketplace 机制要求仓库根目录存在 `.claude-plugin/marketplace.json`，因此该文件是唯一需要提交进 main 分支的生成物。它由 CI 在构建后自动同步提交，并在每次 CI 中校验其与 `catalog/` 一致，不一致即报错。其余 `dist/` 内容不进 main 分支，由 CI 发布到独立的 `release` 分支与 npm 包，避免生成物干扰主干评审。

## 6. 八类产物规范

所有产物均以 YAML frontmatter 声明元数据，由 `schemas/` 下对应的 JSON Schema 强制校验。

### 6.1 公共字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | 是 | 全库唯一的 kebab-case 标识 |
| `description` | 是 | 触发描述，按搜索查询书写，含真实触发短语 |
| `version` | 是 | 该条目独立的语义化版本 |
| `type` | 是 | skill / rule / knowledge / template / agent / command / hook / mcp |
| `stages` | 否 | 关联的 SDLC 阶段，用于入口层反向索引 |
| `stacks` | 否 | 适用技术栈标签 |
| `source` | 外部来源时必填 | 原始出处 URL |
| `license` | 外部来源时必填 | 原始许可证 |
| `derived_from` | 否 | 若由 library note 提炼而来，记录 note 的 slug |
| `updated_at` | 是 | 最后一次实质性更新的日期 |

### 6.2 各类型要点

- **skills**：遵循 Agent Skills 开放标准。`SKILL.md` 正文控制在 5000 token 以内，超出部分必须下沉到 `references/`。
- **rules**：AGENTS.md 片段。正文即将被拼接进目标项目 AGENTS.md 的内容，需可独立成段、无上下文依赖。额外字段 `section` 指定拼接位置。
- **knowledge**：必须有 `INDEX.md` 作为导航入口，列出分片及其适用场景。分片本身不带触发描述，只能被显式路径引用。
- **templates**：不进入上下文，仅被复制。需声明 `target_path`，即相对目标项目的落地路径。
- **agents / commands / hooks / mcp**：分别对应 Claude Code 的 subagent、slash command、hooks 与 MCP 配置。适配器负责转换为各 agent 的对应形式；无对应能力的 agent 在安装时跳过并明确告知。

## 7. 入口层规范

每个阶段目录包含三部分：`DECIDE.md`（决策矩阵，人与 agent 的主入口）、`MANIFEST.yaml`（机器可读的资产清单）、`decisions/`（真实决策记录）。

### 7.1 DECIDE.md

`DECIDE.md` 必须包含四个部分：

1. **本时刻要回答的问题**：以问句列出，例如"这个新项目该装哪些规范""开发流程走 SDD 还是 TDD"。
2. **选型矩阵**：表格形式，列出选项、适用条件、取舍代价，以及明确的反模式（什么情况下不选它）。
3. **推荐路径**：信息不足时的默认建议，以及触发改变默认的关键信号。
4. **落地资产**：指向 `catalog/` 中的具体条目与安装命令。

### 7.2 MANIFEST.yaml

每个阶段的资产清单，机器可读：

```yaml
stage: 20-design
entry_skill: sdlc-design
assets:
  knowledge: [design-systems/shadcn, design-systems/material-3]
  skills:    [design/design-review, design/token-audit]
  templates: [design-md-dtcg]
profiles:    [next-ts-tailwind]
```

它不能被 DECIDE.md 中的 markdown 链接替代，原因有三：CI 需要机器可读的结构来校验引用有效性；构建需要它生成 `dist/by-stage/` 反向索引；路由技能需要低成本地读取清单，而非解析整篇文档。

**双向引用校验**：catalog 条目 frontmatter 的 `stages` 字段与各阶段 MANIFEST 的 `assets` 列表构成双向引用，CI 校验两侧一致，任一侧漏改即报错。这是防止索引与资产漂移的主要手段。

### 7.3 decisions/

存放真实项目中的选型记录，采用 ADR 形式：做了什么决定、当时的约束是什么、后来是否被推翻。这类内容不属于 catalog 的任何一类产物，且天然绑定单一阶段，因此放在阶段目录下。

它不进入 agent 上下文，作用是为 DECIDE.md 的选型矩阵提供经验证据。当某个决策在多个项目中反复得到同一结论时，该结论应被写回 DECIDE.md 的推荐路径。

`decisions/` 需要记录习惯的养成成本，因此不进 M0，于 M2 引入。

### 7.4 路由技能

每个 DECIDE.md 对应一个路由技能，由构建脚本自动生成到 `dist/`；另加一个不绑定阶段的兜底技能 `sdlc-search`，共 8 个：

| 路由技能 | 触发场景 |
|---|---|
| `sdlc-bootstrap` | 新建项目、初始化仓库、"该配点什么" |
| `sdlc-requirements` | 需求分析、PRD、URS 处理流程选型 |
| `sdlc-design` | 设计系统选择、设计流程、视觉规范 |
| `sdlc-coding-process` | 开发流程选型、SDD/TDD 决策 |
| `sdlc-testing` | 测试策略选型 |
| `sdlc-release` | 发布流程与门禁选型 |
| `sdlc-operate` | 运维、监控、事故响应流程选型 |
| `sdlc-search` | 跨阶段模糊查询兜底 |

路由技能本体必须极小（目标 1000 token 以内），只承担"知道去哪里读"的职责；真正内容由 DECIDE.md 作为第二层按需加载。这是渐进披露的直接应用。

## 8. 原料层：文章蒸馏流水线

```
inbox/ 收录原文或 URL
   ↓  distill 技能
notes/<slug>.md  （要点、适用条件、来源、日期、可信度）
   ↓  人工判断：被反复引用，或经实战验证有效
catalog/ 中的 rule / skill / knowledge （frontmatter 记录 derived_from）
```

`library/notes/<slug>.md` 的必备 frontmatter：

| 字段 | 说明 |
|---|---|
| `source` | 原文 URL |
| `captured_at` | 收录日期 |
| `stale_after` | 过期日期，默认为收录后 12 个月 |
| `confidence` | high / medium / low，标注证据强度 |
| `promoted_to` | 若已提炼为 catalog 条目，记录其 name |

CI 检查过期 note 并在报告中列出。AI 工程领域的实践半年即可能失效，没有过期机制的知识库是负资产。

升级为 catalog 条目不是自动的，必须经人工判断。判断标准：该 note 的结论在至少一个真实项目中被验证过，或被两个以上独立来源印证。

## 9. 构建与分发

### 9.1 构建流程

```
catalog/ + stages/ + profiles/
   ↓ tools/build
校验 (schema / description 冲突 / token 预算 / 链接有效性)
   ↓
dist/
├── .claude-plugin/marketplace.json   # Claude Code plugin marketplace
├── skills/                            # 标准 SKILL.md 集合（通用）
├── routes/                            # 由 DECIDE.md 生成的路由技能
├── by-stage/                          # 按阶段组织的索引视图，供浏览
├── manifest.json                      # 全量条目清单，含版本与校验和
└── index.json                         # 供 sdlc-search 使用的轻量索引
```

### 9.2 工具链

以 TypeScript 实现，通过 `npx` 分发。npm 包名为 `sdlc-playbook`（2026-09-03 已验证 npm 与 GitHub 均可用），可执行命令名为 `sdlc`，比包名短，便于日常输入。选择依据：`npx` 是当前跨 agent 场景下安装摩擦最低的形式，非 Node 用户也可零安装运行。

### 9.3 核心命令

| 命令 | 作用 |
|---|---|
| `sdlc build` | 构建 `dist/` |
| `sdlc check` | 运行全部质量闸门 |
| `sdlc install <profile\|entry>` | 安装资产到当前项目 |
| `sdlc list [--stage <s>] [--stack <s>]` | 列出可用资产 |
| `sdlc upgrade` | 依据 `.sdlc-lock.json` 升级已安装资产 |
| `sdlc distill <url\|file>` | 把原文收进 inbox 并生成 note 草稿 |

## 10. 两种消费模式

### 10.1 查询模式

用户在任意项目中提出"这个新项目该配点什么""设计流程用哪个"，路由技能被 description 触发，读取本机 `~/.sdlc` 下的 DECIDE.md 给出建议。

- 库本体默认克隆到 `~/.sdlc`。
- 未安装本体时降级为读取 GitHub raw 内容，功能不变，但有网络依赖。
- 查询模式不向目标项目写入任何文件。

### 10.2 安装模式

`sdlc install` 按产物类型分派落地：

| 产物类型 | 落地方式 |
|---|---|
| rules | 拼接进目标项目 `AGENTS.md` 的指定 section |
| skills | 复制到 `.claude/skills/` 与 `.agents/skills/` |
| agents | 复制到 `.claude/agents/` |
| commands | 复制到 `.claude/commands/` |
| hooks | 合并进 `.claude/settings.json` |
| mcp | 合并进 MCP 配置文件 |
| templates | 按 `target_path` 复制到项目内 |
| knowledge | 复制到 `.sdlc/knowledge/`，由 skill 显式引用 |

一律使用复制而非 symlink。依据是 pi issue #3405 记录的软链导致技能重复注册与状态不一致的问题。复制虽有冗余，但行为可预测，且由 `.sdlc-lock.json` 保证可升级。

### 10.3 `.sdlc-lock.json`

安装后写入目标项目根目录，记录每个已安装条目的 name、version、来源校验和、落地路径与安装时间。它是升级、审计、版本钉扎的唯一依据。没有它，跨项目复用会退化为一次性拷贝。

## 11. 跨 agent 适配

`tools/adapters/` 下每个 agent 一个适配器，实现统一接口：解析目标 agent 的配置位置、转换产物形式、执行落地、回报不支持的产物类型。

| 能力 | Claude Code | Codex CLI | pi |
|---|---|---|---|
| skills | `.claude/skills/` | `.agents/skills/` | `.pi/skills/` |
| rules | `CLAUDE.md` / `AGENTS.md` | `AGENTS.md` | `AGENTS.md` |
| agents | 原生支持 | 降级为 skill | 降级为 skill |
| commands | 原生支持 | 降级为 skill | 降级为 skill |
| hooks | 原生支持 | 跳过并告知 | 跳过并告知 |
| mcp | 原生支持 | 原生支持 | 原生支持 |

新增一个 agent 只需新增一个适配器文件，不触及 catalog 与构建核心。

## 12. 质量闸门

`sdlc check` 与 CI 执行以下检查，任一失败则构建不产出 `dist/`：

1. **Schema 校验**：全部 frontmatter 必须通过对应的 JSON Schema。
2. **description 冲突检测**：提取每个条目 description 中的触发短语，检测多个条目争抢同一短语的情况并报错。这是社区大库最普遍的病症，直接导致误触发。
3. **token 预算**：`SKILL.md` 正文超过 5000 token 报错，强制内容下沉到 `references/`；路由技能超过 1000 token 报错。
4. **链接有效性**：catalog 内部交叉引用、stages 指向 catalog 的引用必须可解析；外部链接做可达性抽查。
5. **双向引用一致性**：catalog 条目 frontmatter 的 `stages` 字段与各阶段 `MANIFEST.yaml` 的 `assets` 列表必须互相覆盖，任一侧缺失即报错。
6. **触发 eval 回归**：`evals/` 下每个技能配置"应触发"与"不应触发"的 prompt 用例，CI 计算触发准确率，低于阈值报错。
7. **过期检查**：列出超过 `stale_after` 的 notes 与超过 12 个月未更新的 catalog 条目。
8. **供应链声明**：带 `source` 的条目必须同时有 `license`；`manifest.json` 输出全量条目的版本与校验和。

## 13. 版本与治理

- 每个 catalog 条目有独立 `version`，遵循语义化版本。破坏性变更（改名、删除、frontmatter 不兼容）必须升主版本。
- 仓库整体有独立版本，用于 npm 包与 marketplace 发布。
- 条目重命名通过 `.claude-plugin/marketplace.json` 的 renames 映射保证已有安装可自动迁移。
- `CHANGELOG.md` 按条目粒度记录变更。
- 外部来源的内容必须保留原始出处与许可证。无法确认许可证的内容只能进入 `library/notes/` 作为要点笔记，不得整段搬运进 catalog。

## 14. 路线图

### 14.1 排序原则：内容先于工具

本项目最大的未知不是"工具怎么写"，而是"DECIDE.md 写成什么样才真正有用"。因此路线图按内容优先排序：先用真实内容验证格式，再按记录在案的痛点编写工具。

这条原则是对早期规划的修正。早期版本把 schema、构建器、CLI、CI 组成的工程底座放在第一个里程碑，后果是在 catalog 只有一个条目时就建起了全套生产线。schema 的作用恰恰是把格式固定下来，用它去强制一个尚未验证的格式，顺序是颠倒的。等到第五个 DECIDE.md 才发现结构不对时，schema 与其测试都要跟着返工。

工具由痛点驱动，不由规划提前产出。每个工具类里程碑必须能指向前序里程碑记录的具体痛点。

### 14.2 里程碑

| 里程碑 | 交付内容 | 完成判据 |
|---|---|---|
| **M0 格式验证** | `stages/30-coding/DECIDE.md` 完整选型矩阵（SDD / TDD / 直接实现）、配套路由技能 `sdlc-coding-process`、symlink 挂载到本机 agent | 在真实项目中提出编码流程问题时路由技能被正确触发，且给出的建议确实影响了决策 |
| **M1 格式定型** | 第二、三个阶段的 DECIDE.md，首批 2 至 3 个 catalog 条目，`docs/验证日志.md` 痛点清单 | 多个路由技能之间触发区分准确；条目字段与 DECIDE.md 结构在三个真实场景中不再变动 |
| **M2 最小工具** | 按 M1 痛点清单裁剪后的工具集：schema 与校验优先，构建与 CI 视需要 | 每一项工具都能指向 M1 记录的一条具体痛点 |
| **M3 安装与多 agent** | `sdlc install`、`.sdlc-lock.json`、claude-code / codex / pi 三个适配器 | 同一条目在三家 agent 上均能正确安装并被识别 |
| **M4 原料流水线** | `sdlc distill`、`library/notes` 规范、过期检查 | 从一篇真实文章走完 inbox、note、catalog 全流程 |
| **M5 发布** | `.claude-plugin/marketplace.json` 生成、npm 发布、eval 回归、使用文档 | 他人可通过一条命令完成安装 |

M0 与 M1 不编写任何代码。M2 之前的一切都是 markdown 与软链。

## 15. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 骨架建成但内容长期为空 | 公开库失去意义 | M2 强制要求至少一个完整选型矩阵作为首发样例，而非只有骨架 |
| library 污染 catalog | 触发准确率下降，上下文浪费 | 硬边界、人工升级判断、CI 检查 `derived_from` 溯源 |
| description 触发冲突 | 误触发，用户体验崩坏 | CI 冲突检测与 eval 回归 |
| 与社区大库同质化 | 无人使用 | 差异化在"决策入口"而非资产数量，stages 层是护城河 |
| 跨 agent 适配随上游变化失效 | 安装报错 | 适配器隔离，每个适配器配集成测试 |
| 知识过期 | 给出错误建议 | `stale_after` 机制与 CI 过期报告 |
| stages 索引与 catalog 资产漂移 | 决策入口指向不存在或过时的资产 | 双向引用校验在 CI 中强制，任一侧漏改即报错 |
| 过早工程化 | 为未验证的格式建生产线，格式一变工具全部返工 | 内容优先的里程碑排序；每个工具必须指向已记录的痛点 |
| 外部内容许可证不清 | 法律风险 | 无许可证内容只作要点笔记，不整段搬运 |

## 16. 参考资料

- Agent Skills 开放标准与渐进披露架构（Anthropic，2025-12-18 公开）
- 《Don't Retrieve, Navigate: Distilling Enterprise Knowledge into Navigable Agent Skills for QA and RAG》，arXiv 2604.14572
- 《Towards Secure Agent Skills: Architecture, Threat Taxonomy, and Security Analysis》，arXiv 2604.02837
- 《SkillTester: Benchmarking Utility and Security of Agent Skills》，arXiv 2603.28815
- pi issue #3405：`~/.pi/agent/skills` 软链导致技能重复注册
- Claude Code Plugin Marketplace 文档：https://code.claude.com/docs/en/plugin-marketplaces
- AGENTS.md 规范指南（2026）：https://www.morphllm.com/agents-md-guide
