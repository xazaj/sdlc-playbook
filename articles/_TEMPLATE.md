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
1. 蒸馏而非转载：原文不进库，成稿是观点重述，可核对的数字、结论与引语
   保留并标明出处，自己补的判断在「来源与边界」单独交代。
2. 带来源与日期：source 指回原文，date 是蒸馏定稿日，任何时候可回溯。
3. summary 答得出「为什么留着它」；答不出就是剪藏，不收。

正文自由，两条约定：
  开头一段导语，说清这篇文章主张什么；
  结尾一节「## 来源与边界」，写明哪些来自原文、哪些是本库补的判断。
旁注与出处用 <aside class="mnote">…</aside> 写在正文流里，会浮进右侧
边注栏；mnote 内部是纯 HTML，不是 markdown。
-->

导语一段。

正文。

## 来源与边界

- 来自原文的：……
- 本库补的判断：……
