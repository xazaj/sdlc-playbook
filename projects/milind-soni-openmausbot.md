---
name: milind-soni-openmausbot
title: OpenMausBot：每个聊天窗口都是一个真 agent，闸门留在本地
summary: 开源 Grok Bot 替代：每个 bot 都是本机 CLI agent，harness 独占进程与事件流；loopback 信任、per-turn 令牌、审批卡把危险动作拦在明处。
repo: https://github.com/milind-soni/OpenMausBot
description: 'Open-source Grok Bot alternative with a virtual machine that bots can use'
stars: 9269
forks: 1269
contributors: 160
language: TypeScript
languages:
  TypeScript: 89.7
  JavaScript: 9.3
  MDX: 0.4
  CSS: 0.3
  Shell: 0.1
avatar: /projects/milind-soni.png
license: Apache-2.0
tags: [ai-agents, desktop-app, permissions, multi-agent, electron]
pinned_commit: 8c663d2b7647dcea04a2278dd0f794f591ae95e0
evaluated_at: 2026-10-31
updated_at: 2026-10-31
related: []
---

OpenMausBot 是开源的 Grok Bot 替代：一个 Telegram 式聊天应用，侧栏每个 bot 都是真的 agent——本机的 claude、codex 或 grok CLI 子进程——各有自己的模型、记忆、计算机和连接应用。这张卡主张的读法：它的产品形态是聊天软件，值得解剖的却是底座——一个本地优先的多 agent harness 怎么把「谁能在什么时候动什么」写成显式工程：loopback 信任的严格定义、按 turn 铸造吊销的能力令牌、留在人手里的审批闸门。

## 它解决什么问题

README 的动机一节点名：七周内四个闭源个人 agent 产品（Grok Bot、Meta Muse、OpenAI dots、Cue by Manus）相继发布，共同点是模型、计算机和数据都在厂商那一侧。OpenMausBot 保留 roster 形态开源重建：自带 agent（用你已有的 CLI 登录与订阅，不加新账号）、本地优先（harness 只绑 127.0.0.1，记录与密钥在 `~/.openmausbot`）、agent 有手（云 Linux 桌面、隔离本地 VM、或显式 opt-in 的宿主机，外加 Composio 的 500+ 应用）。风险动作——shell 命令、文件改动、提问——一律折成聊天里的审批卡，Allow 或 Deny 由人点。

## 怎么解的

两个进程。App（React）没有自有 transport，只发类型化 HTTP 命令、把一条 SSE 事件流折进状态；harness server 独占每个 agent 进程，把各供应商的原生协议（stream-JSON、JSON-RPC、ACP）归一成一条 canonical 运行时事件流，按线程落成 NDJSON。供应商接入是一个 driver 一个文件（[server/drivers/](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/server/drivers/claude.ts)），SPI 在 [server/contracts.ts](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/server/contracts.ts)，注册一行——未知 driver 降级为 unavailable，不拖垮其余实例。进程注册与事件扇入在 [server/harness/](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/server/harness/registry.ts)。

外围三件也走同一 harness：触发器（定时、webhook、应用事件）、给脚本和 CI 的 headless CLI（`team apply` + `run --export`，一个 JSON 文档加可分支的退出码）、给 Claude Desktop/Cursor 的 stdio MCP 服务。

## 设计亮点

**Loopback 信任不等于「来源 IP 是本机」。** [server/request-auth.ts](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/server/request-auth.ts) 把判定写全：Host 与 Origin 都得 loopback、不得携带任何代理头（`X-Forwarded-*`、`Forwarded`），且浏览器永远拿不到 loopback 信任——带 `Sec-Fetch-*` 的请求、带 Origin 的 WebSocket 握手一律不信，理由写在文件头注释里：「bot 打开的网页也是本机上的浏览器」。桌面端再叠一层每次启动轮换的私有 token；共享服务器上每个 bot 的 shell 也是 loopback caller，所以只放行 `SERVICE_ALLOW` 白名单——而且这段源码里内联写着已知未修风险与修复计划（bot shell 可冒充 Slack worker 的动作面），把 open risk 写在门口而不是藏在 issue 里。

**能力令牌按 turn 铸造、按 turn 吊销。** bot 的集成访问走 `/api/internal/*`，bearer 按 bot、线程、种类三要素铸造（threat model 第 3 节，[.oss-scanner/threat_model.md](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/.oss-scanner/threat_model.md)），只在当前活跃 turn 有效——turn 结束或新 turn 开始即吊销，一个 bot 借不到另一个 bot 的权限。整个信任模型（四类部署形态、逐条信任边界、「哪些是产品决策不是漏洞」）单独成文给自动扫描器与审计者读。

**供应商错误是分类学，不是字符串。** [server/contracts.ts](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/server/contracts.ts) 定义了错误树：`TurnNotStartedError`（从未到达 prompt，可恢复）之下分 `TurnAuthenticationRefusedError`（登录失效）与 `TurnUsageLimitRefusedError`（用量限额，带 `resetsAt` 与 `scope: engine | model | credits`——账户级、单模型窗口、追加额度三种限额分开），`known` 标志把重复拒绝去重。harness 据此决定恢复还是降级，而不是解析错误消息猜。

**自动化面刻意收窄。** MCP v1 的文档先列「不能做什么」：不能批准请求、不能记住授权、不能删除、不能碰凭据与计算机生命周期——这些留在人的应用里（[docs/mcp-server.md](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/docs/mcp-server.md)）。webhook 接收器独占 8800 端口，只暴露 `/health` 与带密钥的 `/hooks/*`，够不到应用其余 API；bot 创建 webhook 时看不到自己的 secret，密钥只给人从卡片复制。定时任务上一轮没跑完就跳过本次触发，慢任务永远堆不出无上限队列。

**平台安全门 fail-closed，供应链校验进打包器。** Ubuntu Wayland 上宿主机控制整体禁用并主动清除历史 opt-in，直到 #345 的真座位安全门解决；Xorg 上 reviewed 的 Cua 运行时也要显式 opt-in。Linux 打包器只下载 tag 钉住的上游归档，校验大小、SHA-256、成员 allowlist 与内部可执行文件哈希，只打包 CLI 与光标主题 sidecar——装好的应用永不下载、永不自更新原生自动化代码，CycloneDX SBOM 与 MIT 出处记录随包分发（README 的 Desktop capability status 一节）。

## 借鉴清单

**能搬的：**

- loopback 判定的完整定义：代理头即不信任、`Sec-Fetch-*` 即浏览器、WS 握手看 Origin——任何本地服务都该抄这段，只认 IP 不够
- 把已知未修风险以「Open risk + Planned fix」注释写在使用现场的代码里，威胁模型单文供扫描器与审计读
- per-turn 能力令牌：bearer 绑定 bot+线程+turn，turn 结束吊销——多 agent 同居一个宿主时的最小权限隔离
- 「从未开始」与「中途失败」的错误树，配 `known` 去重与限额 `scope` 三分——驱动 CLI 供应商时的错误建模样本
- 自动化接口文档先写「不能做什么」：审批、删除、凭据、生命周期留在人侧
- 慢任务调度跳过策略：上一轮未完成不排队，防止无上限积压
- 原生二进制供应链动作：tag 钉住、多层哈希、成员 allowlist、装后不自更新

**不适用的：**

- 形态重：Electron + React 全家桶，只要一个 CLI 助手的场景用不上
- `enterprise/` 目录源可得但另有许可，商用前先读 [LICENSING.md](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/LICENSING.md)
- 云计算机绑定赞助商 Boat（试用期后付费），连接应用走 Composio 第三方账号——本地优先的闭环里仍嵌着两个外部服务
- 605 个 open issue、HEAD 当天仍在推进，实现细节的参考价值衰减快，搬设计别搬代码
- 工程纪律参差的一面：`.tmpexp/` 连同 `.bak` 调试残渣就在 main 上

## 局限

快照口径：9,269 stars、1,269 forks、160 位贡献者，评估当天仍在密集提交。README 自评「Early but real」，并自己列出毛边：API key 以明文存 `0600` 的 `config.json`（文档直说不加密）、Windows 安装包未签名（SmartScreen 会拦）、Ubuntu 整体 beta、Wayland 宿主机控制禁用中、hosted/移动端连通在建。评测未覆盖运行时行为，本卡结论全部来自源码与文档静态阅读。

## 相关

站内《[Claude 指挥 Codex：一个人的 Human-in-the-Loop 开发循环](/sdlc-playbook/articles/hitl-dev-loop/)》讲同一条闸门的另一端：循环里唯一的人是需求方与验收方。上游站点 [openmausbot.com](https://www.openmausbot.com)，桌面能力矩阵与 Wayland 安全门追踪见其 [Ubuntu 指南](https://github.com/milind-soni/OpenMausBot/blob/8c663d2b7647dcea04a2278dd0f794f591ae95e0/docs/linux-desktop.md)。
