---
name: 条目唯一标识与文件名一致用作URL
title: 条目页与清单上的标题
summary: 一句话说明它是什么，进清单，四十字以内
category: bootstrap
kind: skill
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
category 取值：bootstrap 开局与约定 | design 界面与设计 | build 编码工作流 | verify 验证与排错
kind 取值：skill 技能 | design-md | component-library 组件库 | doc 文档 | mcp
origin 取值：marketplace 插件市场 | external 其他外部 | local 自建

按 kind 的差异：
  skill              evaluated_version 填上游发布版本；prompt 确保技能可用并写 AGENTS.md 边界
  design-md          evaluated_version 填短 commit SHA；prompt 从钉住 commit 的 raw 取文件；license 与 pairs_with 必填
  component-library  evaluated_version 填上游发布版本；prompt 初始化依赖并覆盖默认主题
  doc                evaluated_version 填本库自己的版本号；prompt 只往 AGENTS.md 写规则，不装依赖
  mcp                evaluated_version 填上游发布版本；prompt 配置 server 并写明何时允许调用

下面四节缺任何一节、或正文没有围栏块，构建会失败并指名本文件。
-->

## 何时用

什么判定结果会走到这里。**适用与不适用都要写**，不适用那半句不许省——清单上排除不掉的东西，全靠这一节。

## 这一版怎么样（0.0.0）

针对这一个版本的评估：有没有坑、装进项目时要压住什么。写你实际验证过的结论；没验证过的写成待验证，不要用上游 README 的宣传语充数。随版本更新而重写。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 [资产] 装进本项目，要求：

1. [确保资产可用的结果描述。Claude Code 的快捷命令只作为附注，
   其他 agent 也要有可执行的路径。]

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## [Section Name]

- [写进目标项目的规则用英文]
- [必须写明适用边界，否则上游"任何功能都必须"一类的触发描述会失控]

3. 完成后列出你改动或新增的文件。
````

确认方式：[一个可操作的验证动作，以及看到什么算装对了。]

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游当前版本由 [谁] 管理，查询方式：[怎么查]。

评估历史：0.0.0（2026-01-01）
