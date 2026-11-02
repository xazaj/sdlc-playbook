---
name: openrouter
title: OpenRouter
url: https://openrouter.ai/
summary: 用一个 API 接多家模型，适合原型、路由和模型对比。
category: models-credits
tags: [llm-api, router, models]
stage: build
source: bookmark
evaluated_at: 2026-10-30
status: active
caveats:
  - 有平台加价和条款，生产前核对
  - 数据策略和模型可用性会变
featured: false
order: 30
---

## 为什么收

原型阶段不想为每个 provider 接一套 SDK 和账单。OpenRouter 用一个 key 把模型选择、路由和对比放在一起，适合快速试。

## 什么时候用

同时试多家模型；做 fallback 或成本路由；不想先注册一堆 provider。

## 注意

统一接口的代价是中间层。延迟、加价、数据留存、模型版本都可能和直连不同。生产前至少直连一次做对照。
