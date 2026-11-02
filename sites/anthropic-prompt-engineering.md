---
name: anthropic-prompt-engineering
title: Claude Prompt Engineering
url: https://platform.claude.com/docs/zh-CN/build-with-claude/prompt-engineering/overview
summary: Anthropic 官方的提示工程文档：什么时候该调 prompt，以及常用的结构和技巧。
category: agent-engineering
tags: [prompt-engineering, claude, docs]
stage: build
source: bookmark
evaluated_at: 2026-10-30
status: active
caveats:
  - 示例针对 Claude 模型，换模型要重新验证
  - 文档会随模型版本更新
featured: false
order: 50
---

## 为什么收

提示工程的中文资料很多，但官方文档的好处是边界清楚：它告诉你哪些技巧是通用的，哪些只是某个模型版本的脾气。

## 什么时候用

写 system prompt、工具说明、review 规则；prompt 行为不稳定，需要判断是结构问题还是模型问题。

## 注意

不要照着示例堆技巧。先明确任务、输入、输出和失败处理，再决定要不要加 few-shot 或思维链。换模型后重新跑一遍。
