---
name: mcp-docs
title: Model Context Protocol Docs
url: https://modelcontextprotocol.io/docs/getting-started/intro
summary: MCP 的官方协议文档：transport、tools、resources、prompts 和 SDK 的起点。
category: agent-engineering
tags: [mcp, protocol, docs]
stage: build
source: manual
evaluated_at: 2026-10-30
status: active
caveats:
  - 协议按版本演进，注意页面标注的 spec 版本
  - SDK 示例可能落后于协议
featured: false
order: 20
---

## 为什么收

MCP 已经成了 coding agent 接工具的事实标准。写 server、调 client、排查 schema 问题时，先看协议原文，比看二手教程快。

## 什么时候用

要写一个 MCP server 或 client；不确定 stdio 和 HTTP 怎么选；tool schema 被宿主拒绝时。

## 注意

MCP 的 spec 是有版本的，页面顶部会标日期。不同宿主的实现进度不一样，协议支持不等于宿主支持。
