# SDLC Playbook v2：可复制 prompt 的资产目录

- 日期：2026-09-03
- 状态：部分采纳（2026-09-03 评审）
- 关系：原拟取代 `2026-09-03-sdlc-knowledge-base-design.md`（v1）。评审后决定保留 v1 骨架，吸收本文的两个机制

> **评审结论**
>
> 采纳：第 4.1 节的 `evaluated_version` 与 `evaluated_at` 字段，第 4.3 节的安装 prompt 写法。两者已并入 `registry/` 登记卡格式，模板见 CONTRIBUTING.md。
>
> 暂缓：删除 `stages/`、路由技能与 `install.sh`（等 M0 触发实验完成且数据证明路由不可用）；每周 freshness 检查（等出现一次评估过期未被发现的实际事故）；GitHub Pages 站点（等条目数达到六个以上且有仓库以外的访问来源）。
>
> 暂缓理由：本文对 v1 的两点批评成立，但整体切换会在只有两个条目时先建站点与检查脚本，重复 v1 路线图刚纠正的过早工程化问题；M0 的自动触发实验尚未执行，不应在实验之前放弃路由层。

**摘要**：v1 以"agent 被自动路由进来做决策"为核心路线，评审发现它只在用户主动提出流程问题时触发，且决策结果不落地到项目。v2 改为面向人翻阅的资产目录：每个条目给出评估结论与一段可直接复制的安装 prompt，安装动作由目标项目中的 agent 执行。本文给出 v2 的定位、五项关键决策、目录结构、条目格式、新鲜度机制、迁移方案与边界。

## 1. 定位

v2 是供 vibe coder 翻阅的资产目录。每个条目回答三个问题：这是什么，当前评估的版本是否值得使用，复制哪段 prompt 就能装进自己的项目。

消费路径固定为三步：人来翻阅，找到条目，把 prompt 贴进自己项目的 agent 会话。安装动作由目标项目中的 agent 执行，本库不需要被安装到任何地方。

v1 的"agent 被自动路由进来做决策"路线予以放弃。原因见 v1 评审：它只在用户主动提出流程问题时触发，而 vibe coder 不问流程问题；决策结果也不落地到项目，跨会话没有记忆。v2 把判断压缩进每个分类页的"怎么选"一节，把落地交给 prompt。

## 2. 五项决策

| 问题 | 决策 | 理由 |
|---|---|---|
| 新鲜度由谁保证 | 机器发现，人工评估。定时脚本比对每个条目的 `evaluated_version` 与上游最新 release，不一致则开 issue；评估文字由维护者借助 agent 撰写 | 供他人使用的库必须可复现，不能依赖某个人记得去看。检测是确定性的，评估是判断，两者分开 |
| 判断是否保留 | 保留，压缩为每个分类 `README.md` 顶部的"怎么选"一节 | 他人翻阅目录时最缺的不是列表而是取舍。但它不再是独立入口，不配路由技能 |
| prompt 安装到哪一级 | 项目级。写进目标仓库的 `AGENTS.md`、`.claude/skills/`、`DESIGN.md` | 各项目需求不同，换机器随仓库走，协作者克隆即得。用户级安装只作为条目中的可选备注 |
| prompt 是否跨 agent | 跨。prompt 描述结果，不写具体命令；Claude Code 的快捷命令作为附注 | 他人可能使用 Codex、Cursor、pi。"把以下内容写入本项目 AGENTS.md"三家都能执行 |
| 条目分几类 | 首版三类：设计系统、开发工作流、skill | 覆盖用户提出的全部诉求。MCP、subagent、规则片段等待有真实条目后再加分类 |

## 3. 目录结构

```
sdlc-playbook/
├── README.md                 # 是什么、三步用法、三个分类的入口
├── AGENTS.md                 # 本仓库维护规则：条目格式、新鲜度口径
├── CONTRIBUTING.md
├── LICENSE
│
├── design-systems/           # 分类一
│   ├── README.md             # 怎么选 + 条目表（name / 一句话 / 评估版本 / 评估日期）
│   ├── shadcn-ui.md
│   └── ...
├── workflows/                # 分类二
│   ├── README.md
│   ├── tdd-superpowers.md
│   └── ...
├── skills/                   # 分类三
│   ├── README.md
│   ├── frontend-design.md    # 外部 skill：登记 + 评估 + prompt
│   └── ...
│
├── assets/                   # 本库自建资产的实体，prompt 通过 raw URL 引用
│   └── skills/<name>/SKILL.md
│
├── bin/check-upstream.sh     # 比对 evaluated_version 与上游最新 release
├── .github/workflows/
│   └── freshness.yml         # 每周执行 check-upstream，不一致则开 issue
└── docs/                     # 设计文档、评审记录
```

约束：

- 条目页一律是分类目录下的单个 `.md`，不建子目录。自建资产的实体放在 `assets/`，条目页仍在分类目录。
- `assets/` 只放本库自己编写的内容，不 vendoring 上游内容。上游资产只登记、只指向。
- 不再有 `install.sh`、`check-update.sh`、`~/.sdlc` 路径约定、`catalog/`、`registry/`、`stages/`、`library/`。

## 4. 条目格式

### 4.1 frontmatter

```yaml
---
name: tdd-superpowers          # 全库唯一，kebab-case
category: workflow             # design-system | workflow | skill
origin: external               # external | local
upstream: https://github.com/obra/superpowers
release_source: github-release # github-release | github-tag | npm | manual
evaluated_version: "6.3.0"     # 本页评估基于的上游版本
evaluated_at: "2026-09-03"     # 评估日期
agents: [claude-code, codex, pi]   # prompt 实测可用的 agent
---
```

`evaluated_version` 与 `evaluated_at` 是新鲜度机制的全部依据。它们记录的是"本页评估基于哪一版"，而非"上游现在是哪一版"。前者永远为真，后者必然过期。v1 的"登记卡不抄版本号"原则针对的是后者，与此不冲突。

`release_source` 告诉 `check-upstream.sh` 到哪里取最新版本。`manual` 表示上游没有可机读的发布机制，脚本跳过并在 issue 中列为"需人工查看"。

### 4.2 正文六节

1. **一句话**：它解决什么问题。
2. **适合 / 不适合**：各不超过三条，"不适合"一栏必填。
3. **这一版怎么样**：针对 `evaluated_version` 的功能评估：新增了什么、有没有坑、与同类相比如何。本节随版本更新而重写。
4. **安装 prompt**：一个 fenced block，读者整块复制。描述结果，不写命令。Claude Code 的快捷命令放在 block 之后的附注中。
5. **装完之后**：目标项目中会新增哪些文件，如何确认安装正确。
6. **版本与更新**：上游由谁管理版本、到哪里查询、本条目评估过的历史版本列表。

### 4.3 安装 prompt 的写法

prompt 必须满足三点：

- **描述结果而非命令**，使任何 agent 都能执行。
- **把适用边界一起写进项目。** 安装 TDD 工作流时，AGENTS.md 中要同时写明"UI 布局与一次性脚本不强制"，否则上游 skill 的"任何功能都必须"会在项目中失控。这是 v1 评审中发现的最大冲突，v2 用 prompt 直接解决。
- **可重复执行。** 第二次贴同一段 prompt 不应产生重复内容，prompt 中要写明"若已存在则更新"。

### 4.4 设计系统分类的两类条目

设计系统分类下的条目分两类，回答的是两个不同的问题：

| kind | 回答的问题 | 典型条目 | 安装结果 |
|---|---|---|---|
| `design-md` | 界面长成什么样 | Vercel 公开的 DESIGN.md、第三方汇集的 design 文件、本库自写的约束文件 | 项目根目录的 `DESIGN.md`，以及 AGENTS.md 中"生成界面前先读它"的规则 |
| `component-library` | 用什么零件 | shadcn/ui、Ant Design、Radix + Tailwind、DTCG token 骨架 | 组件源码或依赖、主题变量、AGENTS.md 中"只从组件目录取件"的规则 |

两类正交，一个项目通常各选一个。因此仍归一个分类，用 frontmatter 的 `kind` 字段区分；分类页分两段渲染，先视觉方向后组件库，"怎么选"也按这个顺序写：先定长相，再定零件，最后确认两者能搭配。

`design-md` 类条目与组件库类相比有四点差异，条目格式据此扩展：

1. **版本以 commit 计。** 这类文件没有发布版本，`release_source` 取 `github-commit`，`evaluated_version` 记评估时该文件的短 SHA。`check-upstream.sh` 比对该路径的最新 commit。
2. **prompt 只指向，不复制。** prompt 让 agent 从钉住 commit 的 raw URL 取得文件写入项目，本库不收录文件内容。上游改动不影响已评估的版本，也不产生版权问题。无法联网的 agent 环境，由用户手工下载后交给 agent。
3. **`license` 必填。** 文件会被整份复制进用户项目，收录前必须确认上游许可。只收录发布方自己公开的或明确许可的文件；第三方"复刻某网站风格"的文件标注为风格参考，不得含品牌资产，许可不明的不收录。
4. **`pairs_with` 记录搭配。** 一份 DESIGN.md 的 token 需要映射到组件库的主题变量，条目记录实测搭配过的组件库，prompt 中包含映射步骤。

新增字段汇总：

```yaml
kind: design-md               # design-md | component-library
release_source: github-commit # 新增取值
license: MIT                  # design-md 必填
pairs_with: [shadcn-ui]       # 可选，实测搭配过的条目 name
```

第三方汇集的 design 文件集合不作为条目收录。集合里只有评估过的单份文件才成为条目，集合本身列在分类 README 末尾的"更多来源"中。本库的价值在评估，不在汇集。

## 5. 新鲜度机制

```
每周 freshness.yml
   ↓ bin/check-upstream.sh
逐条目读取 upstream 与 release_source，取上游最新版本
   ↓ 与 evaluated_version 比对
不一致 → 开 issue：「<name>: 上游 X.Y.Z，本页评估基于 A.B.C」
   ↓ 维护者借助 agent 重写"这一版怎么样"，更新 evaluated_*
```

补充规则：

- `evaluated_at` 超过 180 天的条目，即使版本未变，也列入 issue 作为"需复核"。上游没有发版不代表评估仍然正确。
- 分类 `README.md` 的条目表由手工维护，`check-upstream.sh` 顺带校验表中版本与 frontmatter 一致，不一致报错。
- 脚本只做比对，不做任何写入。评估文字永远由人负责。

## 6. 从 v1 迁移

| v1 | v2 去向 |
|---|---|
| `stages/20-design/DECIDE.md` | 压缩进 `design-systems/README.md` 的"怎么选" |
| `stages/30-coding/DECIDE.md` | 压缩进 `workflows/README.md` 的"怎么选" |
| `registry/superpowers-tdd.md` | 扩写为 `workflows/tdd-superpowers.md` |
| `registry/gstack-design-consultation.md` | 扩写为 `skills/gstack-design-consultation.md` |
| `catalog/skills/sdlc/*` 两个路由技能 | 删除。其判断已进入"怎么选"，其落地已进入 prompt |
| `install.sh`、`bin/check-update.sh` | 删除 |
| `library/`、`docs/superpowers/plans/deferred/` | 删除，git 历史保留 |
| `docs/验证日志.md` | 保留，改名为 `docs/v1-验证日志.md` |
| `AGENTS.md`、`CLAUDE.md`、`README.md`、`CONTRIBUTING.md` | 按 v2 重写 |

首批条目：三个分类各至少两条。其中设计系统分类需要补充新条目，v1 没有设计系统的实体登记。

## 7. 边界

- 不做 CLI、npm 包与 marketplace。分发形式就是 GitHub 仓库本身。
- 不手写文档站。站点由 Jekyll 从条目 md 自动生成并托管在 GitHub Pages，见 `2026-09-03-v2-site-plan.md`。
- 不做 agent 自动路由。判断给人看，落地靠 prompt。
- 不 vendoring 上游内容。
