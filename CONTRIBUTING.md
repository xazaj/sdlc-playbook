# 贡献指南

最有价值的贡献是判断而非资产。一份写清适用条件、代价和反模式的选型矩阵，比十个技能条目更有用。

## 仓库结构

```
stages/    决策入口。按 SDLC 阶段组织的选型矩阵，只放索引，不放实体资源
catalog/   本库自有资产。由 install.sh 挂载为可触发的技能
registry/  外部资产的登记卡。记录何时使用、如何安装、版本由谁管理；纯文档，不挂载
bin/       安装与更新检查脚本
library/   原料层。外部文章与蒸馏笔记，尚未启用
docs/      设计文档、实现计划与验证日志
```

三层结构为：原料（library）、资产（catalog 与 registry）、入口（stages）。规划中的流程是：外部文章先进入 `library/inbox/`，蒸馏为附来源的要点卡片；经验证有效后提炼为正式资产；最后由决策矩阵引用。原料层内容不直接进入 agent 上下文。缺少这道闸门，知识库会在数月内退化为剪藏堆。

本库的家目录固定为 `~/.sdlc`。仓库可以物理上位于任何位置，通过软链指向该路径即可。所有对 DECIDE.md 的引用统一使用此路径，任何文件中都不得出现具体机器的绝对路径，否则跨机器即失效。

## 贡献类型

| 类型 | 位置 | 适用情况 |
|---|---|---|
| 新增决策入口 | `stages/<阶段>/DECIDE.md` | 某类反复出现的选型问题尚未被覆盖 |
| 新增登记卡 | `registry/<name>.md` | 某个现成资产值得被决策矩阵指向 |
| 新增自有资产 | `catalog/` | 现成资产均不满足，必须自建 |

优先级自上而下。先判断现成资产是否够用，够用就写登记卡，不重复建设。

## 新增决策入口

在 `stages/<阶段>/` 下建立 `DECIDE.md`，七节结构缺一不可：

1. **要回答的问题**：以问句列出该阶段的实际选型问题。
2. **判断依据**：决定答案的几个维度，按权重排序，并说明哪一个权重最高。
3. **选型矩阵**：表格，列为方案、适用条件、代价、反模式。
4. **推荐路径**：信息不足时的默认选择，以及改变默认的信号。
5. **交给 agent 执行时的差异**：与人工操作相比结论不同之处。
6. **常见误判**：具体的错误做法及其后果。
7. **落地资产**：指向 `registry/` 或 `catalog/` 的具体条目。

反模式一列为必填。只说明何时使用、不说明何时不用的矩阵，读者无法排除选项，等于没有给出判断。

写完后在 `catalog/skills/sdlc/<名>/` 建立配套的路由技能，正文不超过 20 行。路由技能只负责指路，判断留在 DECIDE.md 中。技能名统一以 `sdlc-` 开头，README 中的卸载命令依赖这一约定。

## 新增条目

一个资产一个 markdown，放在 `registry/<name>.md`，构建时生成 `/entries/<name>/` 一个页面。所有形态共用同一个骨架，差异只在 frontmatter 的几个字段和安装 prompt 做的事上。**不要为每种形态各建一套模板**，那样改一条通用规则要改五处。

### 骨架

````markdown
---
name: <唯一标识，与文件名一致，用作 URL>
title: <条目页与列表上的标题>
summary: <一句话说明它是什么，进列表，四十字以内>
category: bootstrap | design | build | verify
kind: skill | design-md | component-library | doc | mcp
origin: marketplace | external | local
provider: <插件 id 或来源，自建可省>
asset: <上游资产名，自建可省>
upstream: <上游 URL，自建可省>
license: <外部文件整份进入用户项目时必填>
pairs_with: [<实测搭配过的条目 name>]
agents: [<已验证过的 agent>]
release_source: plugin | github-release | github-commit | npm | vendor | local
evaluated_version: "<本卡评估所基于的版本；design-md 填短 SHA>"
evaluated_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---

## 何时用
（什么判定结果会走到这里，以及什么情况下不应使用。适用与不适用都要写）

## 这一版怎么样（<evaluated_version>）
（针对该版本的评估：有没有坑、装进项目时要压住什么。随版本更新而重写）

## 安装 prompt
（一个围栏块，读者整块复制贴进目标项目的 agent 会话；后附一句确认方式）

## 版本
（上游由谁管理、到哪里查询；评估历史列表）
````

`name`、`title`、`summary`、`category`、`kind`、`origin`、`evaluated_version`、`evaluated_at` 是必填，缺任何一个构建会失败。正文缺「何时用」「安装 prompt」「版本」三节之一，或缺围栏块，构建同样会失败。

### 按形态的差异

| kind | 版本怎么填 | 安装 prompt 做什么 | 额外必填 |
|---|---|---|---|
| `skill` | 上游发布版本 | 确保技能在项目中可用，并把适用边界写进 AGENTS.md | — |
| `design-md` | 短 commit SHA | 从钉住 commit 的 raw 地址取文件写入项目，替换品牌项，映射 token | `license`、`pairs_with` |
| `component-library` | 上游发布版本 | 初始化依赖，覆盖默认主题，把用法约束写进 AGENTS.md | — |
| `doc` | 本库自己的版本号 | 只往 AGENTS.md 写一段规则，不安装任何依赖 | — |
| `mcp` | 上游发布版本 | 配置 MCP server，并写明何时允许 agent 调用 | — |

### 三条规则

1. **登记卡不放入 `catalog/skills/`。** 该目录会被 `install.sh` 挂载为技能，登记卡的 description 会与上游技能争夺同一批触发词。
2. **登记卡不复制上游当前版本号。** Claude Code 插件由 `installed_plugins.json` 管理，gstack 有自己的更新检查，本库由 git 管理。复制的版本号从当天起就开始漂移为错误数据。`evaluated_version` 记录的是「本卡评估基于哪一版」，这是永远为真的事实。
3. **安装 prompt 描述结果而非命令。** 必须满足三点：任何 agent 都能执行，Claude Code 的快捷命令只作为附注；把适用边界一起写进目标项目的 AGENTS.md，否则上游技能「任何功能都必须」一类的触发描述会在项目中失控；可重复执行，第二次贴同一段不产生重复内容，因此要写明「若已存在则更新」。prompt 中将写入目标项目文件的片段（如 AGENTS.md 小节）用英文，其余说明用中文。

### 让 agent 生成条目

复制整块，贴进本仓库的 agent 会话，把方括号里的内容换成实际资产。它描述结果而不写命令，可重复执行：

````text
请为本仓库新增一个条目，资产是 [资产名称与上游地址]。要求：

1. 先读 CONTRIBUTING.md 的「新增条目」一节与 site/src/content.config.ts
   的 schema，以它们为准，不要凭记忆填字段。

2. 在 registry/<name>.md 新建文件，frontmatter 按骨架填全必填字段，
   kind 按「按形态的差异」表选择并补齐该形态的额外必填项。
   evaluated_version 填你实际查证过的版本；查不到就停下来问我，不要猜。
   evaluated_at 填今天。

3. 正文四节齐全。「何时用」必须同时写出适用与不适用，不适用那半句不许省。
   「这一版怎么样」写你实际验证过的结论，没验证过的写成待验证，不要用
   上游 README 的宣传语充数。「安装 prompt」是一个围栏块，描述结果而非
   命令，把适用边界一并写进目标项目的 AGENTS.md，且第二次执行不产生重复
   内容。后附一句可操作的确认方式。

4. 若文件已存在则按上述要求更新它，不要新建第二个。

5. 运行 cd site && npm run build，确保构建通过；失败就按报错修到通过。

6. 完成后列出你改动或新增的文件，并说明哪些字段是你查证的、哪些是我需要
   自己确认的。
````

生成之后必须人工过一遍两件事：`evaluated_version` 是否真的对应你评估过的那一版，以及安装 prompt 是否真的能重复执行。这两条模型最容易糊弄过去，而它们恰好是本库的全部价值所在。

## description 的写法

description 同时驱动自动触发与检索，应按搜索查询的形式书写，而非标题。

写入用户实际会说的话。不写"设计系统选型指南"，而写"用哪个设计系统、要不要用 shadcn、UI 怎么做才不像模板"。

新增前先查看已有技能的 description，不与它们争夺同一批触发短语。触发词重叠是技能库最常见的退化方式。

## 提交前检查

```bash
./install.sh          # 重新挂载，确认无报错
./bin/check-update.sh # 确认脚本可运行
```

M2 之后将由 `sdlc check` 执行 schema 与触发冲突校验，目前依靠人工检查。

## 版权

- 不提交外部文章原文，`library/inbox/` 已列入 `.gitignore`。可提交自己撰写的摘要卡片（`library/notes/`），须附来源链接与日期。
- 不整段搬运他人内容进入 `catalog/`。要么写登记卡指向原处，要么用自己的话重写并注明出处。
- 提交即表示同意贡献内容以 MIT 许可发布。

## 语言

- 代码标识符、代码注释、CLI 输出使用英文。
- `.md` 文档使用中文。
