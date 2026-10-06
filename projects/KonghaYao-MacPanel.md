---
name: KonghaYao-MacPanel
title: MacPanel：把 Linux 服务器面板移植成 mac 本地平台
summary: 1Panel 的 macOS 移植：两天上百次提交跑通「mac mini 当服务器」，保留上游 module 路径只加适配层，把面板暴露成带 Bearer 认证的 MCP 端点——移植策略的解剖样本。
repo: https://github.com/KonghaYao/MacPanel
description: 🔥 MacPanel is a panel turn your mac mini to a server.
stars: 17
forks: 0
language: Go
languages:
  Go: 72.9
  Vue: 27.0
  Shell: 0.1
avatar: /projects/KonghaYao.png
license: GPL-3.0
tags: [macos, server-panel, mcp, porting]
pinned_commit: 45d211a473931f4746ea110cd8d5fe1999cc9b63
evaluated_at: 2026-10-06
updated_at: 2026-10-06
related: []
---

MacPanel 把开源 Linux 服务器管理面板 [1Panel](https://github.com/1Panel-dev/1Panel) 移植到 macOS：不再装成 Linux 面板，而是一个本地 `macpanel` 命令，把 mac mini 变成带 Web 面板的服务器。这张卡的主张不是「推荐采用」——创建仅两天、17 stars，离可用性验证还远——而是它是一个**极新的移植解剖样本**：fork 一个成熟 Linux 项目到 macOS，两天跑通全功能，还能看出「保留什么、改什么、加什么」的分层决策，以及面板 MCP 化的一个具体做法。

## 它解决什么问题

mac mini 当家用服务器是真实趋势，但生态是拼凑的：Docker Desktop 管容器、homebrew 管包、launchctl 管服务、各自一套 UI 或纯命令行。Linux 世界有 1Panel 这类成熟面板一站式管理，macOS 没有。MacPanel 的赌注是：与其从零写 macOS 面板，不如把 1Panel 整个搬过来，再补 macOS 特有的那一层（homebrew 包管理、Dock 式桌面、设备监控），并把面板能力暴露给 AI agent。

## 怎么解的

移植没有重写。[mcp_server.go](https://github.com/KonghaYao/MacPanel/blob/45d211a473931f4746ea110cd8d5fe1999cc9b63/agent/app/api/v2/mcp_server.go) 的 import 仍是 `github.com/1Panel-dev/1Panel/...`——上游 module 路径原封不动，MacPanel 的全部增量作为同层新文件加入：[homebrew.go](https://github.com/KonghaYao/MacPanel/blob/45d211a473931f4746ea110cd8d5fe1999cc9b63/agent/app/api/v2/homebrew.go) 提供 brew 状态与搜索、desktop.go 做 Dock 桌面、device/gpu 做设备监控，容器与数据库等原有 API 面向 Docker Desktop 适配。构建走 [build-macos.yml](https://github.com/KonghaYao/MacPanel/blob/45d211a473931f4746ea110cd8d5fe1999cc9b63/.github/workflows/build-macos.yml)：前端 build 后 `CGO_ENABLED=0 GOOS=darwin` 编出单二进制，经 GitHub Releases 用 mise 一行安装。两天内 100+ 提交，增量功能已经包括 MCP 端点、S3 浏览器（RustFS 连接）、compose 端口跟踪、可观测性 compose 栈（otel collector 配置进了仓库）。

## 设计亮点

**保留上游 module 路径，移植即增量。** 这是最省力的 fork 策略：不挪 import、不改包结构，macOS 适配全部以新增文件落在同一 API 层，上游更新时合并成本最小。代价是身份模糊——二进制叫 macpanel，依赖图上仍是 1Panel。

**面板自身暴露为 MCP 端点。** commit 记录 `expose MCP endpoint for agents with Bearer API key auth`：面板不只管 MCP 服务器列表，自己也是一个 MCP server，外部 agent 凭 API key 接入后可以直接操作容器、数据库、监控。「本地服务器 + agent 运维」的接口层就这样补上了，这是比面板 UI 本身更有前瞻性的一步。

**GPL 边界干净。** 上游 GPL-3.0，fork 整体保持 GPL-3.0，没有许可证漂移。

## 借鉴清单

**能搬的：**

- 「module 路径不动、增量文件平铺」的 fork 移植策略：移植大型项目时把改动压成纯增量，合并上游时受益
- 面板/服务暴露为 MCP 端点 + Bearer API key 的形态：任何本地服务想被 agent 操作，都可以照这个接口层设计
- mise 作为 GitHub Releases 后端的二进制分发：`mise use -g "github:owner/repo[bin=xxx]@latest"` 一行装完，免 Homebrew tap 的维护成本
- 可观测性 compose 栈（otel-collector 配置）进仓库：自托管服务的模板

**不适用的：**

- 直接当生产面板用：两天项目无验证，issue 区为空不代表没有坑
- 把「两天百次提交」当常态参考：上游 1Panel 的成熟度承担了 95% 的复杂度，这个速度不可平移到从零写的项目
- Intel mac 用户：README 写 universal binary，[构建流水线](https://github.com/KonghaYao/MacPanel/blob/45d211a473931f4746ea110cd8d5fe1999cc9b63/.github/workflows/build-macos.yml)实际只编 `GOARCH=arm64`，宣传与实现有出入

## 局限

评估当天快照：17 stars、0 fork、单人、两天历史。README 的 universal binary 宣称与 CI 实际产物不符（仅 arm64）。GPL-3.0 意味着基于它做产品会被传染，商用前要想清楚。它的价值在解剖台上，不在装机清单里。

## 相关

上游 [1Panel](https://github.com/1Panel-dev/1Panel)（飞致云的 Linux 面板，移植的基座）；站内《AI Native 时代的工作方式》讲了工具链作为隐藏线路的思路，MacPanel 的 MCP 端点正是这类基础设施的一块。
