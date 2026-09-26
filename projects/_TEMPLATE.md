---
name: 条目唯一标识与文件名一致用作URL
title: 项目卡标题
summary: 为什么值得看，一句话，六十字以内
repo: https://github.com/owner/repo
description: 上游仓库自述（About 栏那行英文）；上游没写就删掉此键，卡片用 summary 兜底
stars: 0
language: 主语言，可省
license: SPDX 标识，可省
tags: []
pinned_commit: 0000000000000000000000000000000000000000
evaluated_at: 2026-01-01
updated_at: 2026-01-01
related: []
---

<!--
本文件不会被构建（projects 下以 _ 开头的文件已排除），改完直接复制成
projects/<owner>-<repo>.md 使用。

必填字段：name title summary repo stars pinned_commit evaluated_at
pinned_commit 是 40 位完整 SHA：正文所有证据链接锚定它，卡片快照以它为口径。
related 填 registry/ 里的条目名，项目页右栏互链；没有就留空数组。

快照原则（与登记卡规则 2 同构）：stars、language、license 是评估当天的
事实，不追新、不更新。上游数据漂移由「数据截至」那行说明兜住。

正文契约（缺任一构建失败，见 site/src/lib/catalog.ts）：
1. 必需小节「## 它解决什么问题」「## 设计亮点」「## 借鉴清单」；
2. 正文至少一个 blob/<commit>/… 形式的 GitHub permalink；
3. 「## 借鉴清单」必须分「能搬的」与「不适用的」两半——不适用那半句
   不许省，排除不掉选项的介绍没有判断价值。

写法纪律：
- 结论只写实际读到的东西，每条关键断言给 permalink，读者一键核对；
  读不到的写明读不到，不猜。
- 篇幅向意外之处倾斜：读者不知道的部分写透，背景一笔带过。
- 中文成稿后按 sepia 技术文章路线润色（professional-pass + tech-articles，
  中文加 zh 校准），成品不留润色痕迹，正文也不写评估过程。
- 正文只面向读者：不写本库的建设规划（缺什么决策入口、打算补什么条目）
  与收录润色过程，这类事项放 docs/ 或 issue。
- 站内链接写 `/sdlc-playbook/…` 前缀（与 articles 正文图片同约定），
  不写根绝对路径，否则在 GitHub Pages 的 base 下 404。
-->

导语一段：它是什么，这张卡主张什么。

## 它解决什么问题

设计问题的上下文。不写公司介绍、融资历史与 star 数。

## 怎么解的

架构解剖：目录结构、分层、关键机制，每条带 permalink。

## 设计亮点

决策级而非功能级。每条按「决策 → 为什么 → 落在哪」组织，给文件证据。

## 借鉴清单

分两半，缺一不可。

**能搬的：**

- …

**不适用的：**

- …

## 局限

哪里过度设计，哪里是它的平台特权，搬走会碰什么。

## 相关

站内互链（条目、文章、决策入口）与外部佐证。
