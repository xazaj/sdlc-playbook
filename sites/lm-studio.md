---
name: lm-studio
title: LM Studio
url: https://lmstudio.ai/
summary: 本地模型的桌面客户端，带模型浏览、下载、聊天和本地 API。
category: local-infra
tags: [local-llm, desktop, runner]
stage: build
source: bookmark
evaluated_at: 2026-10-30
status: active
caveats:
  - 硬件要求高，尤其是大模型
  - 商用和再分发要看模型 license
featured: false
order: 20
---

## 为什么收

不是所有人都想用命令行管本地模型。LM Studio 把模型发现、下载、聊天和本地 server 放在一个 GUI 里，适合做本地模型的日常试验。

## 什么时候用

想用 GUI 比较本地模型；给非命令行用户演示；快速起一个本地 OpenAI 兼容端点。

## 注意

GUI 方便，但资源占用和后台进程要留意。模型 license 不因为下载方便就变宽松。
