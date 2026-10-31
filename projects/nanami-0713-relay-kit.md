---
name: nanami-0713-relay-kit
title: relay-kit：盲中继、一个配对码，免费层撑起手机到内网的 E2E 隧道
summary: 手机连通桌面内网服务的端到端加密中继：中继只见密文，一个 256-bit 码既当路由又当 PAKE 盐，Durable Object 休眠让免费额度够用。
repo: https://github.com/nanami-0713/relay-kit
description: 'Out-of-the-box E2E relay server (relay-e2e/v1) for Cloudflare Workers — one-command deploy. Reference agent & client included. Distilled from Alma with permission.'
stars: 33
forks: 6
contributors: 1
language: TypeScript
languages:
  TypeScript: 77.0
  JavaScript: 23.0
avatar: /projects/nanami-0713.png
license: MIT
tags: [e2e-encryption, cloudflare-workers, relay, pake, self-hosting]
pinned_commit: 25a142d6527bcab6b98366f3882f11366a3586fb
evaluated_at: 2026-10-31
updated_at: 2026-10-31
related: []
---

relay-kit 是一个自托管的端到端加密中继：手机在外网，桌面 agent 守在内网服务旁，Cloudflare Workers 上的中继把两者接起来，但永远只看到密文和路由令牌。协议 `relay-e2e/v1` 由 Alma（yetone 的 AI 助手应用）v0.4.213 的中继逆向蒸馏而来、经原作者许可，项目本身与服务无关——接到任何本地 HTTP/WS 端口都能用。这张卡主张的读法：它是一个一日龄的小仓库，但把「不可信中继上的安全隧道」这件事做得极克制——安全属性靠路径设计而非中继自觉，威胁模型把「做不到」和「明说不做」分得清清楚楚，工程决策的账算在注释里。

## 它解决什么问题

外网设备要用内网服务，缺一个公网会合点；把明文交给第三方隧道服务，等于把内网服务的全部流量托付出去。relay-kit 的答案是自己花两分钟部署一个中继到自己的 Cloudflare 账号（`wrangler deploy` 一条命令，无配置无数据库），并且让这个中继在密码学上无足轻重：解密只发生在两端，配对凭证是一个 256-bit 码——没有它，任何人（包括运行中继的人）都完不成握手。

注意边界：协议串与 Alma 官方的 `alma-relay-e2e/v1` 不同，开箱不与官方 Alma 客户端线兼容（[PROTOCOL.md](https://github.com/nanami-0713/relay-kit/blob/25a142d6527bcab6b98366f3882f11366a3586fb/PROTOCOL.md) §7 写明了互操作要补什么）。

## 怎么解的

三个角色：桌面 agent 向中继建一条常驻出站 WebSocket 注册（`/agent?th=<tokenHash>`），手机用时连 `/c/<routingToken>/__alma_e2e__`，两者会合后跑三步握手，此后中继只转加密的 HTTP/WS 帧，agent 把帧代理到 `127.0.0.1:<port>`。

凭证是一条派生链：`code`（256-bit 随机数，只存两端）→ HKDF 派生 `routingToken`（手机连路由由键，中继日志只见它）→ SHA-256 得 `tokenHash`（agent 注册键）。**code 即一切凭证**——这是设计使然，不是疏忽。

握手是三步 PAKE 风格（[packages/core/src/e2e.ts](https://github.com/nanami-0713/relay-kit/blob/25a142d6527bcab6b98366f3882f11366a3586fb/packages/core/src/e2e.ts)，从 Alma 打包产物 Ng 类移植）：双方各出一次性 ECDH P-256 密钥对与 16 字节 nonce；transcript 把双方公钥与 nonce 绑进所有密钥派生（防降级/交叉协议），`code` 进 HKDF salt（无码的中间人算不出 confirm 值），confirm 比对走常量时间。握手后每帧 AES-GCM，IV 由严格递增计数器构成，方向密钥分离。仓库是 monorepo：`workers/relay` 是产品，`packages/core`（零依赖、纯 WebCrypto，Node ≥ 18/浏览器/Capacitor 同一套代码）与 agent/client 参考实现让它开箱能用，`test/fixtures/relay-server.mjs` 是协议相同的 Node 中继——测试夹具与单进程自托管两用。

## 设计亮点

**盲中继靠路径设计，不靠中继自觉。** [workers/relay/src/index.ts](https://github.com/nanami-0713/relay-kit/blob/25a142d6527bcab6b98366f3882f11366a3586fb/workers/relay/src/index.ts) 文件头写明「E2E is enforced by path design」——服务器连明文的代码路径都不存在。README 的威胁模型接着把另一面说全：中继仍可拒绝服务、可做流量分析（无 padding、无流量整形）、房间被枚举到也只能 DoS 不能解密——每条都标着「accepted by design」。最硬的一句诚实声明：握手是未经审计、未经形式化验证的自制 PAKE 风格方案，「需要认证加密就用经过认证的」。

**重放防护是接收端行为。** 协议 §2.3 的措辞值得整段抄：发送端递增只保证 nonce 不重复（GCM 下重用 IV 是灾难）；接收端必须拒绝计数器不增的帧并作废会话——WebSocket 有序交付下诚实对端不可能触发这个检查，**会触发的只有复制帧的中间盒**。客户端与 agent 双端都执行。

**免费额度先算账。** 中继用 WebSocket Hibernation API，源码注释把不这么做的账算给你看：普通 `ws.accept()` 会让常驻 agent 连接把 Durable Object 钉在内存——2 × 86,400s × 0.125GB = 每天 21.6k GB-s，免费额度只有 13k；休眠后安静的配对成本约等于零。代价是状态存放纪律：每 socket 状态放 attachment、早到帧放 storage，绝不进闭包——「闭包随 isolate 一起死」。

**存储滥用有硬顶。** 手机先到、agent 未上线时，握手帧缓存进 DO storage，上限 256 帧 / 64KiB。注释写明理由：三步握手总共不到 1KB，这是合法客户端 64 倍余量；不设顶的话，恶意客户端用 256 个 1MiB 帧就能在每个房间钉死约 256MB 存储——公共中继的滥用面用两个常数封死。

**测试三层，各打一个真相。** fixture 中继跑本地 e2e（不部署）；`test/workers.mjs` 在 CI 里用 miniflare 跑真 Worker——Durable Object、休眠、storage 都是运行时行为；live 测试打已部署实例，专测跨 isolate 驱逐的早到帧缓冲。断线语义（watchdog 收割半死隧道而不是挂死请求）、双 agent 抢占（新者胜、旧连接 4000 踢出且不自动重连）各有专测。

**规范与双实现强绑定。** [AGENTS.md](https://github.com/nanami-0713/relay-kit/blob/25a142d6527bcab6b98366f3882f11366a3586fb/AGENTS.md) 的硬规则：PROTOCOL.md 是规范，行为变更必须让规范与两个服务器实现（Worker + Node fixture）同改，「文档与代码不一致，两边都是 bug」。同一份 AGENTS.md 把部署路径写给 coding agent——包括验证方式：`curl <url>/` 返回 404 即存活，因为这个 Worker 只说 `/agent` 与 `/c/...`，根路径 404 就是健康信号。

**诊断把静默失败变成一句话。** 断线时两端把 close code 或藏在无声 1006 背后的 errno 分类成一行提示——`ECONNRESET` 是「中途被掐，重试通常恢复」，`1011` 是 agent 离线、`4404` 是无 agent 注册，每条带连接寿命、重试次数与下次退避；`onDiag` 回调给结构化消费。

## 借鉴清单

**能搬的：**

- 单码派生链：PSK → HKDF 路由令牌 → 哈希房间键，中继日志只见令牌，凭证管理收敛为「保好一个码」
- transcript 绑定 + code 作 HKDF salt 的三步握手骨架：让无凭证的中间人（含服务方）在数学上无法插入
- 「重放防护是接收端行为」的双端计数器检查：把检测点放在只有攻击者会触发的位置
- DO/Serverless 常驻连接的账算进注释：休眠 API 的 GB-s 帐与状态存放纪律（attachment/storage，禁闭包）
- 公开端点的资源硬顶思路：用「合法用量 N 倍余量」的两个常数封死存储滥用
- AGENTS.md 把部署步骤与验证信号写给 coding agent，规范与实现同改的硬规则
- 断线诊断分类表：errno/close code → 一行人话，附退避与寿命

**不适用的：**

- 未审计的自制 PAKE：安全敏感产品应换 OPAQUE/SRP 等已验证方案，README 自己也是这么建议的
- 一日龄、33 stars、单人项目：当作设计样本与协议文档读，别当成熟依赖引入
- 与官方 Alma 不线兼容，interop 要按 §7 自己补
- 无速率限制、无滥用控制出厂——多租户公开运营前要自己上 WAF
- 大陆网络 `*.workers.dev` SNI 被阻断，实际可用性依赖自定义域名或代理，这是部署现实门槛

## 局限

快照口径：33 stars、6 forks、1 位贡献者，仓库创建于评估前一天（2026-10-30），HEAD 当天仍在提交。0 个 open issue 说明的与其说是质量，不如说是还没人用。威胁模型明示的缺口（无 padding、可 DoS、可流量分析）是接受的边界而非待办。本卡结论全部来自 README、PROTOCOL.md 与三个核心源文件的静态阅读，未实际部署与抓包验证。

## 相关

站内《[OpenMausBot](/sdlc-playbook/projects/milind-soni-openmausbot/)》解决同一条「外网手机 ↔ 内网 agent」通道的另一极：厂商侧托管隧道加配对会话，relay-kit 则把中继做成密码学上无足轻重的自托管盲字节泵，对照着读最有趣。《[mcp-server-cloudflare](/sdlc-playbook/projects/mcp-server-cloudflare/)》是同在 Cloudflare Workers 上的另一类服务设计。
