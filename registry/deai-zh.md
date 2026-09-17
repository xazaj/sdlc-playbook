---
name: deai-zh
title: 去AI味（中文白名单改写）
summary: 中文成稿去 AI 味：白名单触发标记逐句改，未命中的句子逐字保留，信息不增不减。
category: bootstrap
kind: skill
invoke: both
origin: local
upstream: https://github.com/xazaj/sdlc-playbook
license: MIT
pairs_with:
  - claude-prose-style
agents:
  - Claude Code
  - Codex
  - ChatGPT
evaluated_version: "0.1.0"
evaluated_at: "2026-09-16"
updated_at: "2026-09-17"
---

## 何时用

一段现成的中文文字要去掉 AI 写作痕迹，且内容本身不能动：成稿去味、信息零增减。判据是两条同时成立：文字被嫌「像 AI 写的」，以及这段话的事实、数字、引语改错会有后果（对外发表的文章、正式说明，或替别人改稿）。规则是白名单式的：每条带触发标记，命中才改、最小改动，未命中的句子逐字保留，改写后每个实词要能指出原文出处。

不装技能、只想临时用一次：打开 [catalog/skills/prose/deai-zh/SKILL.md](https://github.com/xazaj/sdlc-playbook/blob/main/catalog/skills/prose/deai-zh/SKILL.md) 全选复制，贴进任意聊天窗口即可，正文自包含。

不适用：英文文本（no-ai-slop 的模式表全是英文，对中文无效）；发版说明、复盘、PR 回复、工单等工程域文档（sepia 的域规则更对口）；日常对话、代码注释、内部笔记（不需要去味）；「项目该装哪个去味技能」的选型问题（走 sdlc-bootstrap 路由）。与 sepia、no-ai-slop 按项目主流产出三选一，不同装。

## 这一版怎么样（0.1.0）

自建资产首次登记，评估基于本仓库内的初版规则全文：

- 规则有实测底盘：人类语料与 5 个模型、300 篇样本（117.9 万字）的对比，每条规则带频率与触发标记；另有一张「不作为改写理由」的负面清单（句长参差、被动句、句内排比等实测与人类无差异的特征），防止矫枉出新的 AI 味。信息守恒边界（不许增删事实、数字、引语、限定词与让步）写成了硬性约束并进验收清单，这是多数去味技能缺的一道闸。
- 正文自包含、无外部依赖：复制进聊天窗口即可用，也可装进项目技能目录。

待验证（本卡未实测）：真实改写质量与误报率、与 sepia 同机时的触发竞争。

风险：规则的频率数据绑在测量时的模型版本上，换模型要回来复核（正文自己声明了这一点）；部分规范参考 KKKKhazix/human-writing，已用自测数据重写并收窄范围。

## 使用 prompt

复制整块，贴进任何 agent 的聊天窗口，当次会话生效，无需安装：

````text
【去AI味（中文白名单改写）】会话级启用：直接粘贴，无需安装

1. 从 https://raw.githubusercontent.com/xazaj/sdlc-playbook/main/catalog/skills/prose/deai-zh/SKILL.md
   取全文，在本次会话中按它工作：只改命中白名单触发标记的句子，未命中的
   逐字保留；不增删事实、数字、引语、限定词与让步；改完列出命中规则的清单。

2. 英文文本与工程域文档（发版说明、复盘、PR 回复）不适用，不要对它们启用。

执行要求：先复述你理解的白名单边界与信息守恒约束，确认后再处理我发来的文字。
````

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把「去AI味」（中文白名单去味技能）装进本项目，要求：

1. 从 https://raw.githubusercontent.com/xazaj/sdlc-playbook/main/catalog/skills/prose/deai-zh/SKILL.md
   取全文，写入本项目 .agents/skills/deai-zh/SKILL.md（复制进项目即钉住
   这一份；已存在则整份覆盖更新）。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## Chinese de-AI rewrite (deai-zh)

- Use deai-zh to rewrite existing Chinese prose whose AI tells must go but
  whose facts must not change. It is a whitelist rewriter: only sentences
  matching a listed trigger are changed, everything else stays verbatim.
- Do NOT use it for English text or engineering documents (release notes,
  postmortems, PR replies — sepia's domain rules fit those better), and do
  NOT install it alongside sepia or no-ai-slop; pick one de-AI skill per
  project.

3. 完成后列出你改动或新增的文件。
````

确认方式：给 agent 一段含「不是……而是……」翻案腔和揭晓式破折号的中文，让它按规则去味。装对了它只改命中规则的句子，未命中的逐字保留，不补原文没有的细节；整段重写、顺手润色或凭空添加具体数字的，都是没装对。

## 版本

本库自建资产，版本由本库 git 管理；资产自身的 `version` 字段维护在 SKILL.md frontmatter 中，本卡只记录评估时基于的那一版。

资产位置：`catalog/skills/prose/deai-zh/`（上游即本仓库，安装走上面的 raw 地址）。

评估历史：0.1.0（2026-09-16）
