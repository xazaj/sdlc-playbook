---
name: emanuele-em-kanzo
title: kanzo：一块看板两扇门，人与 agent 共享同一份状态
summary: 三天做到 0.2.1。4MB 单二进制同时是网页看板与 MCP 服务器：SQLite 加 change counter 让 agent 的写入即时上板，agent 侧十个工具、原子认领、900 token 清单，同步走私有 git 仓不用账号。
repo: https://github.com/emanuele-em/kanzo
description: Self-hosted kanban for humans and agents. One 4 MB binary, starts in 2 ms, zero setup.
stars: 108
forks: 7
contributors: 2
language: Rust
languages:
  Rust: 65.1
  JavaScript: 22.7
  HTML: 12.1
avatar: /projects/emanuele-em.png
license: AGPL-3.0
tags: [kanban, mcp, claude-code, rust, sqlite, local-first]
pinned_commit: f1aaf69582c50645de257f3da859fb6a03ddaa5e
evaluated_at: 2026-10-28
updated_at: 2026-10-28
related: []
---

kanzo 是一个自托管看板：同一个 4.1MB 的 Rust 二进制，在浏览器里是看板，对 coding agent 是 MCP 服务器。整块板就是 `~/kanzo` 一个文件夹，跨机器同步走你自己建的私有 git 仓库，没有账号没有服务端。108 星，建库三天，133 次提交，已经到 0.2.1。这张卡主张：它值得看的是对 agent 侧接口的克制，工具面、token、认领语义、人机边界，每一处都是收窄而不是放开。

## 它解决什么问题

人和 agent 协作的常见摆法是把任务塞进对话或 issue，agent 干完一轮人就丢了上下文；用 Jira 一类工具又重又贵还绑账号。kanzo 的答案是回到最小公分母：一块看板，人从浏览器操作，agent 从 MCP 操作，两边看到同一份 SQLite。对 agent 的指令退化成一句话：从 kanzo 取下一个任务并做完。

## 怎么解的

进程开两个门：网页在 `localhost:4242`，MCP 有 stdio（`kanzo mcp`，由 agent 启动）与 HTTP（`/mcp`）两条通道。[schema.sql](https://github.com/emanuele-em/kanzo/blob/f1aaf69582c50645de257f3da859fb6a03ddaa5e/src/schema.sql) 三张表：projects、tasks、comments，projects 表带唯一的 `repo` 字段，MCP 启动时从工作目录的 git remote 反查项目，agent 不用报自己在哪个项目。跨进程同步靠一张 meta 表的 change counter 配九个触发器，任何一张表的每次写都碰计数器，看板轮询它就知道 agent 动了牌。schema 注释立了规矩：v1 发布后永不修改，变更走编号迁移。

## 设计亮点

**给 agent 的接口按队列语义收窄。** [mcp.rs](https://github.com/emanuele-em/kanzo/blob/f1aaf69582c50645de257f3da859fb6a03ddaa5e/src/mcp.rs) 十个工具全是任务形状，核心是 `next_task` 的原子认领：取顶部 todo、移到 doing、返回任务详情，一步完成，多个 agent 抢同一块板不会拿到同一张卡。Backlog 列可选开启，agent 只从 todo 取，人的想法停在 Backlog 直到人把它挪进 todo：人机边界是结构实现的，不靠提示词自觉。

**token 当预算管。** 工具清单剥掉 rmcp 默认塞进每个输入 schema 的 `$schema` 行，整张清单约 900 token，每会话付一次；工具回复是 10 到 60 token 的纯文本，错误也写成 agent 能读的句子而不是结构化报错。tool router 只构建一次显式复用，注释点明宏的默认行为是每个请求重建。

**同步用 git 不用账号。** `kanzo sync` 把数据文件夹提交并推拉私库；[sync.rs](https://github.com/emanuele-em/kanzo/blob/f1aaf69582c50645de257f3da859fb6a03ddaa5e/src/sync.rs) 的独占锁只在 git 读出或替换数据库的瞬间持有，看板与 agent 运行中同步是安全的；两边都改过就问人要哪份。多台机器的 agent 同时干活的场景给了第二方案：一台机器 `0.0.0.0` 监听，其余机器的 agent 连它的 `/mcp`，配置注释同时写明这条路没有登录，只能跑在可信网络。

**工程取舍有测量。** [store.rs](https://github.com/emanuele-em/kanzo/blob/f1aaf69582c50645de257f3da859fb6a03ddaa5e/src/store.rs) 选了 TRUNCATE 回滚日志而不是常识性的 WAL，理由写在注释里：每次操作一个连接，WAL 要反复建立和拆除 `-wal`、`-shm` 文件，实测 TRUNCATE 每操作快三倍，写冲突靠 5 秒 busy timeout 排队。自更新复用系统自带的 `curl` 与 `sh`，二进制里因此不需要 HTTP 客户端。这类「为什么不是更时兴的那个」的注释，是 5400 行小代码库最好的文档。

## 借鉴清单

**能搬的：**

- change counter 加表级触发器做轮询信号：网页与 agent 两个进程共享状态的最小实现
- 队列语义的 agent 工具面：next_task 原子认领替代浏览挑选，并发抢板不撞卡
- 人机边界用结构实现：Backlog 列不在 agent 的取卡路径上，比写提示词规则可靠
- agent 侧 token 预算：工具清单去冗余行、短纯文本回复、router 复用，三项都有实测数
- git 当同步层：数据文件夹即仓库，锁只护替换瞬间，冲突交人裁决
- 把测量写进注释（WAL 与 TRUNCATE 的三倍差），让后来者不必重推

**不适用的：**

- 建库三天的 0.2.x，schema、API、行为随时会动，现在深度集成等于绑定作者的节奏
- 没有鉴权模型：`0.0.0.0` 方案只能跑可信网络，公网与多租户场景没有答案
- AGPL-3.0 传染，拿它做产品的一部分前先读条款
- 单机单板：团队级的指派、评审流、权限都没有，别当项目管理工具用
- 性能数字（2ms 启动、17ms 加载三千卡）出自作者自己的 M4，无第三方复核

## 局限

快照口径：108 stars、7 forks、2 位贡献者，v0.2.1，建库三天，评估前一天仍在发版。仓库小到 5407 行源码，全部设计出自一人之手，测试集中在 store 层（27 个），web 与 mcp 层无独立测试。

## 相关

站内项目卡《[ste-zh](/sdlc-playbook/projects/dualface-ste-zh/)》的汇报规范就是为这类看板场景磨出来的：卡片首句即状态。外部对照 [Orbi](https://github.com/orbi-build/orbi) 解的是同一问题：它把状态外置给 GitHub Issue 标签、执行无常驻进程，kanzo 选本地 SQLite 看板、常驻一个 2ms 进程，两个极端各有代价。
