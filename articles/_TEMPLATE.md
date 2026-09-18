---
name: 条目唯一标识与文件名一致用作URL
title: 文章标题
summary: 为什么值得读，一句话，六十字以内
date: 2026-01-01
source: https://example.com/original
author: 原文作者，可省
tags: []
related: []
---

<!--
本文件不会被构建（articles 下以 _ 开头的文件已排除），改完直接复制成
articles/<name>.md 使用。

必填字段：name title summary date source
related 填 registry/ 里的条目名，文章页右栏会互链；没有就留空数组。
排版按 DESIGN.md 的「文章」一节；页面随首批文章一起构建，不留空归档页。

收录三门槛（见 CONTRIBUTING.md「新增文章」）：
1. 蒸馏为默认，全译需声明：原文不进库，成稿是观点重述，可核对的数字、结论与引语
   保留并标明出处；整篇译文先确认上游许可，再在 frontmatter 标 translated: true。
2. 带来源与日期：source 指回原文，date 是蒸馏定稿日，任何时候可回溯。
3. summary 答得出「为什么留着它」；答不出就是剪藏，不收。

正文自由，一条约定：开头一段导语，说清这篇文章主张什么。
来源不写在正文里：文章页底部自动渲染来源卡（作者、原文链接），
译文在 frontmatter 标 translated: true，来源卡会多一枚「中文全译」标记；
正文中工具与佐证的链接就地内联，不使用边注栏，也不写来源节。
-->

导语一段。

正文。

