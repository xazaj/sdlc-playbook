---
name: agent-steps
title: Agent Steps
url: https://ui.xiod.dev/docs/components/agent-steps
summary: 展示 AI agent 执行步骤、状态和可折叠日志的 UI 组件。
category: design-frontend
tags: [agent-ui, components, react]
stage: design
source: bookmark
evaluated_at: 2026-10-30
status: active
caveats:
  - 组件依赖具体技术栈，接入前看文档
  - 状态和日志的语义要自己定义
featured: false
order: 20
---

## 为什么收

agent 产品的难点之一是“让用户知道现在在干什么”。Agent Steps 把步骤、状态和日志做成一个可读的组件，适合作为 agent UI 的起点。

## 什么时候用

做 agent 运行界面；需要展示多步任务进度；要把工具调用和日志收进一个可展开的区域。

## 注意

组件只解决呈现，不解决状态模型。先定义 step、status、log 的语义，再接 UI。
