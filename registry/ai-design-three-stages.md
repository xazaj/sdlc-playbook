---
name: ai-design-three-stages
title: AI 设计三阶段约束
summary: 用种子串打开方向、用评审子代理收敛、用做减法收尾，抑制 agent 生成界面时的模板感。
category: design
kind: doc
origin: local
upstream: https://www.lennysnewsletter.com/p/how-to-turn-your-ai-into-a-world
release_source: local
evaluated_version: "0.1.0"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

由 agent 生成界面，且产出反复落回同一种长相时用它：蓝紫渐变、Inter 或 Roboto、居中英雄区加三栏卡片网格。

它约束的是**过程**，不是长相。`DESIGN.md` 决定界面长成什么样，组件库决定用什么零件，这一条决定 agent 在每一次生成中怎么走：先发散、再由独立评审收敛、最后做减法。三者叠加使用，互不替代。

已经有明确视觉方向且只是照着实现时不必装它，那种情况下发散是浪费。一次性演示界面也不必，模板感在那里不构成成本。

## 这一版怎么样（0.1.0）

来源是 Anshu Chimala 发表在 Lenny's Newsletter 的文章。作者在 Apple 带过十二年的软件工程与设计团队，核心主张是多数人只用到模型创造力的百分之一——LLM 逐词预测的机制加上人类偏好训练，使它在每一步都倾向安全选择，而设计恰恰需要意外的选择。

文章按双钻模型分三阶段，本条目提炼的是其中可以固化为项目约束的部分：

- **发散阶段**用种子串制造真实的多样性。模型无法自发随机，让它先生成一串随机字母数字，再从串的不同片段派生调色板、字体搭配与版面节奏，才能得到互不雷同的方向。同时把「做个落地页」换成具体到刺眼的参照，例如「像素艺术风格，每一屏都像一帧游戏截图」。
- **收敛阶段**用独立的评审子代理。它在全新上下文中只看截图不看代码，因此不会为已有实现辩护。评审标准必须客观，并且要事先约定停止条件，否则会无限迭代。用便宜模型做实现、贵模型做评审是划算的分工。文章还提到 agent 天然回避图像、默认退回渐变与几何形状，接入图像与视频生成能补上这一块。
- **交付阶段**做减法。原文的说法是「AI 爱做加法，很少做减法」——删掉光晕、多余渐变、重复标签，把自定义控件换回系统原生控件，克制本身就是高级感的来源。

**可信度需要说明。** 文章后半部分在付费墙之后。上面三阶段的结构、种子串、雄心提示、评审子代理、图像与视频生成、做减法这六项来自可读部分，内容可靠。

第七项标题为「移除 AI 痕迹」，正文读不到。取原文尝试过 RSS 全文、archive.today、作者本人 Substack、Lenny 官方开放的 markdown 归档仓库与多轮检索，均未成功。

因此安装 prompt 里关于具体禁用项的那几条，是依据公开讨论中反复出现的共识特征补写的，不是原文转述；评审子代理的提问结构来自二手来源，未经原文核对。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把「AI 设计三阶段」的约束装进本项目，要求：

1. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节
   替换，不要重复追加：

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

2. 若本项目根目录尚无 DESIGN.md，创建它，并至少写下：本项目选定的视觉方向
   一句话、参照对象、明确禁止的做法、字体与色彩的数量上限。已有则不要覆盖。

3. 完成后列出你改动或新增的文件。
````

评审环节单独一段 prompt，交给一个全新上下文的子代理，只给它截图：

````text
你只看这张截图，不看代码，也不看此前的对话。请：

1. 用一句话说出这个界面想做的是什么美学方向。
2. 设想一家顶尖设计工作室会如何执行这个方向。
3. 列出当前实现与那个水准之间最大的三处差距，按影响排序。
4. 给出 1 到 10 分，说明它离工作室水准还有多远。

不要提出实现建议，不要评论代码，差距不要超过三条。
````

确认方式：让 agent 新增一个页面。它应当先复述 DESIGN.md 里的方向，给出三个彼此不同的候选而非一个，收尾时主动删掉装饰性元素。三点都发生即安装正确。

## 版本与更新

本条目是对外部文章的提炼，不是外部资产本身，因此版本由本库维护，`evaluated_version` 指本提炼稿的版本。原文若有修订，本库不会自动感知。

付费墙后的第七项内容一旦可读，需要回来补齐并修订安装 prompt 中依据共识补写的那几条。

评估历史：0.1.0（2026-09-03）
