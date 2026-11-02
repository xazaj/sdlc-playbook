---
name: ollama
title: Ollama
url: https://ollama.com/
summary: 在本机跑开源模型的最短路径：一条命令拉模型，CLI 和 API 都能用。
category: local-infra
tags: [local-llm, runner, open-models]
stage: build
source: bookmark
evaluated_at: 2026-10-30
status: active
caveats:
  - 吃内存和显存，模型越大越明显
  - 模型许可证和商用限制各不相同
featured: false
order: 10
---

## 为什么收

有些任务不适合把代码发到云端：隐私、离线、成本、延迟。Ollama 把本地模型运行压到一条命令，适合先验证“本地够不够用”。

## 什么时候用

想在本地跑一个模型；做离线或隐私敏感的试验；给 agent 接一个本地 fallback。

## 注意

本地模型的能力和云端旗舰不是一个量级。先拿真实任务测，不要只看 benchmark。模型 license 也要看。
