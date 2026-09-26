---
name: 条目唯一标识与文件名一致用作URL
title: 条目页与清单上的标题
summary: 一句话说明它是什么，进清单，四十字以内
category: bootstrap
kind: skill
invoke: install
origin: external
provider: 上游插件或来源，自建可省
asset: 上游资产名，自建可省
upstream: https://example.com/upstream
license: 外部文件整份进入用户项目时必填，否则可省
pairs_with: []
agents: []
release_source: plugin
evaluated_version: "0.0.0"
evaluated_at: "2026-01-01"
updated_at: "2026-01-01"
---

<!--
本文件不会被构建（registry 下以 _ 开头的文件已排除），改完直接复制成
registry/<name>.md 使用。

必填字段：name title summary category kind origin evaluated_version evaluated_at
category 取值：bootstrap 开局与约定 | define 需求与定义 | design 界面与设计 | build 编码工作流 | verify 验证与排错
kind 取值：skill 技能 | design-md | component-library 组件库 | doc 文档 | mcp
origin 取值：marketplace 插件市场 | external 其他外部 | local 自建
invoke 取值：direct 直接使用 | install 需要安装 | both 两者皆可

invoke 说的是用户怎么调用，kind 说的是资产是什么，两者正交。省略时按 kind
推导：doc → direct，其余 → install。它决定 prompt 小节的形态：

  invoke: direct   「## 使用 prompt」必填：贴进任何 agent 聊天窗口，当次会话
                   生效，零安装，规则自包含。
                   「## 固化 prompt」可选：把规则写进目标项目 AGENTS.md 长期生效。
  invoke: install  「## 安装 prompt」必填，按五步流程写：检测（用户级+项目级，
                   版本必须报告从哪个文件读到）→ 对版本（upstream 最新 vs 本地，
                   读不到就明说，不许猜）→ 安装/更新 → 加载确认（本会话不可见就
                   停下告知激活方式，不许装作可用）→ AGENTS.md 边界。
                   两道防幻觉闸门（报版本来源、不可见即停）不能省。
  invoke: both     「## 使用 prompt」与「## 安装 prompt」两节都要，使用在前。

按 kind 的差异：
  skill              evaluated_version 填上游发布版本；安装 prompt 确保技能可用并写 AGENTS.md 边界
  design-md          evaluated_version 填短 commit SHA；安装 prompt 从钉住 commit 的 raw 取文件；license 与 pairs_with 必填
  component-library  evaluated_version 填上游发布版本；安装 prompt 初始化依赖并覆盖默认主题
  doc                evaluated_version 填本库自己的版本号；prompt 不装依赖，至多写 AGENTS.md 规则
  mcp                evaluated_version 填上游发布版本；安装 prompt 配置 server 并写明何时允许调用

「何时用」「版本」两节与对应类型的 prompt 小节缺任何一节、或正文没有围栏块，
构建会失败并指名本文件。
正文只面向选型读者：引用 DECIDE.md 说「何时走到这里」可以；本库的
建设规划与收录过程不写进正文。
-->

## 何时用

什么判定结果会走到这里。**适用与不适用都要写**，不适用那半句不许省；清单上排除不掉的东西，全靠这一节。

## 这一版怎么样（0.0.0）

针对这一个版本的评估：有没有坑、装进项目时要压住什么。写你实际验证过的结论；没验证过的写成待验证，不要用上游 README 的宣传语充数。随版本更新而重写。

## 使用 prompt

direct / both 类条目必填。复制整块，贴进任何 agent 的聊天窗口，当次会话生效，无需安装。规则自包含，不依赖外部文件：

````text
【{资产名}】会话级启用：直接粘贴，无需安装

从本条消息起，你在本次会话中按以下规则工作：

1. [核心规则：什么时候启用、怎么执行，逐条可操作]
2. [输出/可验证性要求]
3. [不适用边界：明确写出哪些场景不要用这套规则]

执行要求：
- 先用两三行复述你理解的适用边界，确认后再开始。
- 本 prompt 只在会话内生效。
````

## 固化 prompt

direct 类条目可选：把规则长期落进目标项目时用。复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 [资产] 的约束装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## [Section Name]

- [写进目标项目的规则用英文]
- [必须写明适用边界，否则上游「任何功能都必须」一类的触发描述会失控]

2. 完成后列出你改动或新增的文件。
````

## 安装 prompt

install / both 类条目必填。复制整块，贴进目标项目的 agent 会话。按五步流程写，两道防幻觉闸门不能省：

````text
请让 [资产] 在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别的安装状态，只报告结论：
   - 用户级：[如 ~/.claude/plugins/ 登记文件、~/.claude/skills/<name>/]
   - 项目级：.agents/skills/<name>/、.claude/skills/<name>/、项目插件配置
   结论写清：装了/没装；装了则版本号是多少、从哪个文件读到。

2. 【对版本】已安装时：从 [upstream 发布页] 查最新版本，与第 1 步读到的
   本地版本比较。
   - 一致 → 不动它，说明判断依据。
   - 读不到本地版本 → 如实说明，不要猜。
   - 落后 → 升到最新，升级后重新读版本确认。

3. 【安装】未安装时装最新版。Claude Code 的快捷命令只作为附注，
   其他 agent 也要有可执行的路径。

4. 【加载确认】确认技能本会话真的可用：触发描述应出现在你的可用技能里。
   新装技能在当前会话不可见时，不要装作可用，要告诉用户怎么让它生效
   （通常是重开会话），然后停下等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## [Section Name]

- [英文规则，含适用边界]

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：[一个可操作的验证动作，以及看到什么算装对了。]

## 版本

本库不记录上游当前版本号，只记录评估时基于的那一版（见 frontmatter 的 `evaluated_version`）。上游当前版本由 [谁] 管理，查询方式：[怎么查]。

评估历史：0.0.0（2026-01-01）
