# 本地多 Agent 协同开发：完整方案与裁剪方案

- 日期：2026-10-30
- 状态：设计稿
- 适用场景：本地同时运行 Claude Code、Codex、pi、omp 等 coding agent，以 Claude Code 为主 Agent 分派任务
- 目标：任务可管理、实时可分派、Agent 可沟通、主 Agent token 可控
- 结论：完整方案见 Part I；推荐先落地 Part III 的 v0 裁剪版，再按触发条件逐层加回

> 本文是独立设计稿，不属于 SDLC Playbook 的条目内容。文中的命令以本机 `--help` 为准；Beads、Kanzo、Claude Code、Codex 的 CLI 参数可能随版本变化。

---

## 阅读路径

- 只想做技术选型：读第 0、27、29 节
- 准备实现：读 Part I 的架构、数据模型、adapter，以及 Part III 的 v0
- 评估能做什么：读 Part II 的场景
- 评估风险：读第 28 节

---

## 0. 结论先行

### 0.1 一句话

> **主 Agent 不应成为消息总线。** 任务图交给 Beads，执行态交给 SQLite，worker 在独立 worktree 里跑，主 Agent 只看任务卡、结果信封和升级请求。

### 0.2 两个版本

| 维度 | 完整方案 B | 裁剪方案 v0 |
|---|---|---|
| 常驻进程 | orchestra daemon | 无 daemon；每个 run 一个 supervisor |
| 外部系统 | Beads + Kanzo + AgentBridge | 只有 Beads |
| 主 Agent 接口 | MCP 7 工具 | `orch` CLI 6 命令 |
| Adapter | Claude / Codex / pi / omp | Claude + Codex |
| 状态存储 | Beads + SQLite + Kanzo | Beads + SQLite |
| SQLite 表 | 5 张 | 2 张 |
| 状态机 | 8 状态 | 5 状态 |
| 事件层 | L0 / L1 / L2 | info / attention |
| Review | 可选 reviewer agent | 主 Agent 自己看 diff |
| Merge | merge queue | 主 Agent 串行 merge |
| 首次跑通 | 1–2 周 | 2–3 天 |
| 代码量 | 几千行 | 约 600–900 行 |

### 0.3 推荐路径

1. 先用 v0 跑通一个真实功能：2 个 worker、4 个任务、1 次合并。
2. 用 `ccusage` 量主 Agent 的实际 token，确认“信封模式”有效。
3. 只有当某个具体痛点出现时，才加 Kanzo、AgentBridge、reviewer、merge queue、daemon、pi/omp、多机。
4. 每加一层都必须对应一个已经发生的问题，而不是“以后可能会用”。

---

# Part I：完整方案 B

## 1. 问题与约束

### 1.1 要解决的问题

本地有多个异构 coding agent：

- Claude Code：MCP、channel、stream-json、subagents、后台会话
- Codex：`exec`、`app-server` JSON-RPC、`queue`
- pi：RPC、SDK、extensions
- omp：RPC、print、bundled subagents

它们各自有独立 harness、独立认证、独立上下文，不能直接共享对话。人工在两个终端之间复制粘贴，会带来四个问题：

1. 主 Agent 上下文被 worker 日志和中间过程灌满，token 成本快速上升。
2. 多个 agent 同时改一个工作区，文件冲突和覆盖。
3. 任务状态散落在终端 scrollback 和某个会话里，重启即丢。
4. 人无法快速知道“谁在做什么、做到哪、卡在哪”。

### 1.2 约束

- 本地优先，单机起步；多机是后续能力。
- 代码同步走 git，编排层只传消息和状态，不传代码文件。
- 不要求 agent 共享上下文；相反，要显式隔离。
- 不重新实现 coding loop；复用各 agent 自带的 harness。
- 主 Agent 的 token 是首要预算，worker 的 token 次之。
- 人类要能看见、能评论、能在必要时接管。

### 1.3 非目标

- 多租户托管服务。
- 通用 agent 编排框架。
- 强安全沙箱；需要时用容器/VM。
- 多个 agent 在同一个上下文里实时合写代码。
- 跨机器代码同步。

---

## 2. 设计原则

1. **控制面与数据面分离。** 控制面是任务、状态、事件；数据面是代码，走 git。
2. **单一真源。** 一个任务只能有一个权威状态，不能 Beads 和 Kanzo 双写。
3. **主 Agent 只看信封。** 结果只给 summary、files、checks、risks、artifact 路径；原始日志留磁盘。
4. **一任务一 worktree。** 文件隔离比消息总线更重要。
5. **确定性代码做确定性的事。** 调度、超时、重试、验收、合并由代码做，不让 LLM 做。
6. **事件分层。** 进度不进主 Agent；里程碑批量进；阻塞/决策立即进。
7. **先裁剪后扩展。** 没有痛点的层不加。

---

## 3. 角色与术语

| 术语 | 含义 |
|---|---|
| 主 Agent | Claude Code 交互式会话，负责规划、分派、裁决、终审 |
| Worker | 由编排层启动的 headless agent 进程，负责执行单个任务 |
| orchestra | 编排层，完整版是 daemon，裁剪版是 CLI + per-run supervisor |
| Bead | Beads 里的一个任务/议题，ID 形如 `bd-a1b2` |
| Run | 一次任务执行尝试，ID 形如 `r-01` |
| Worktree | 一个任务独占的 git worktree 和分支 |
| Envelope | 结果信封，主 Agent 看到的结构化摘要 |
| L0 / L1 / L2 | 进度 / 里程碑 / 升级，三级事件 |
| ready / claim | Beads 的无阻塞任务列表 / 原子领取 |

---

## 4. 完整方案架构

### 4.1 架构图

```
┌────────────────────────────────────────────────────────────┐
│ Claude Code 主 Agent（交互式 TUI）                          │
│ 只做：拆任务 / 分派 / 裁决 / 终审                           │
│ 工具：Bash(bd, git, rg) + MCP(orchestra) + 可选 AgentBridge │
└───────────────┬────────────────────────────────────────────┘
                │ MCP / stdio
┌───────────────▼────────────────────────────────────────────┐
│ orchestra daemon（Bun/TS，非 LLM）                          │
│                                                            │
│  Beads CLI adapter ── 任务图 / 依赖 / claim / close         │
│  SQLite ───────────── run / lease / event / budget / mirror │
│  Scheduler ────────── 依赖 DAG / 并发 / 超时 / 重试         │
│  Worktree manager ─── 一任务一 worktree / 一分支            │
│  Adapters ─────────── claude / codex / pi / omp             │
│  Verifier ─────────── 独立跑验收命令                        │
│  Merge queue ──────── 串行合并 / 冲突升级                    │
│  Event digest ─────── L0/L1/L2 分层                        │
│  Kanzo client ─────── 只读镜像到看板                        │
└───┬───────────────┬────────────────┬────────────────┬───────┘
    │               │                │                │
  Claude           Codex             pi               omp
  headless         exec/RPC          RPC              RPC
    │               │                │                │
    └────── 各自独立 git worktree + 独立上下文 ─────────┘

Kanzo（浏览器看板，:4242）← 只读镜像 ← orchestra
Beads（.beads/，Dolt）← 唯一任务真源
AgentBridge（可选）← 只用于 L2 升级 / 交叉 review
```

### 4.2 组件职责

| 组件 | 职责 | 不负责 |
|---|---|---|
| 主 Agent | 拆任务、分派、处理升级、终审 diff、决定合并 | 轮询、转发消息、读日志 |
| orchestra daemon | 调度、worktree、adapter、验收、合并、事件、预算、镜像 | 生成代码、做架构决策 |
| Beads | 任务图、依赖、优先级、claim、close、评论、记忆 | 执行进程管理 |
| SQLite | run、lease、PID、token、artifact、验收结果 | 任务语义 |
| Kanzo | 人类看板、评论 | 调度、状态权威 |
| AgentBridge | 空闲主 Agent 的 L2 push、Claude↔Codex 互审 | 任务总线 |
| Worker | 在 worktree 内完成单个任务 | 改其他任务、写 Beads |

### 4.3 七个核心决策

| # | 决策 | 理由 |
|---|---|---|
| 1 | Beads 是任务图/状态的唯一真源 | 依赖、原子 claim、跨机同步、长期记忆都已有 |
| 2 | SQLite 只存执行态 | run、lease、PID、token、artifact 不适合塞进 Beads |
| 3 | Kanzo 是只读投影 | 人类看板，不参与调度，不双写 |
| 4 | 主 Agent 用 Beads CLI，不挂 Beads MCP | Beads 官方：CLI 约 1–2k token，MCP schema 10–50k |
| 5 | 主 Agent 不挂 Kanzo MCP | daemon 直接连 Kanzo；主 Agent 零 Kanzo schema 成本 |
| 6 | 一任务一 worktree，一任务一 worker 进程 | 隔离文件冲突，任务结束即丢上下文 |
| 7 | AgentBridge 只做 L2/互审 | 它的消息会进主上下文，做总线会失控 |

### 4.4 单一真源

| 层 | 存什么 | 谁写 | 谁读 |
|---|---|---|---|
| Beads | 任务、依赖、优先级、claim、close、评论 | 只有 orchestra（主 Agent 通过 CLI 也可写） | 主 Agent、orchestra |
| orchestra SQLite | run、attempt、PID、lease、heartbeat、token、artifact、验收结果 | orchestra | orchestra |
| Kanzo | 看板卡片、人类评论 | orchestra 单向镜像 | 人类 |

**worker 不允许写 Beads。** 这避免 Dolt single-writer 冲突，也避免 worker 自己改任务状态。worker 只拿到 `task.md` 和 worktree。

---

## 5. 数据模型

### 5.1 SQLite 表

```sql
CREATE TABLE runs (
  run_id        TEXT PRIMARY KEY,
  bead_id       TEXT NOT NULL,
  agent         TEXT NOT NULL,
  state         TEXT NOT NULL,
  attempt       INTEGER NOT NULL DEFAULT 1,
  worktree      TEXT,
  branch        TEXT,
  base_sha      TEXT,
  pid           INTEGER,
  lease_until   INTEGER,
  heartbeat_at  INTEGER,
  started_at    INTEGER,
  ended_at      INTEGER,
  exit_code     INTEGER,
  tokens_in     INTEGER DEFAULT 0,
  tokens_out    INTEGER DEFAULT 0,
  usd           REAL DEFAULT 0,
  summary       TEXT,
  result_json   TEXT,
  checks_json   TEXT,
  error_code    TEXT,
  created_at    INTEGER NOT NULL
);

CREATE INDEX runs_by_bead ON runs(bead_id, created_at);

-- 同一 bead 同时只能有一个活跃 run
CREATE UNIQUE INDEX one_active_run
ON runs(bead_id)
WHERE state IN ('queued','starting','running','verifying','reviewing','merging');

CREATE TABLE events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id      TEXT,
  bead_id     TEXT,
  level       TEXT NOT NULL,        -- l0 | l1 | l2
  type        TEXT NOT NULL,
  payload     TEXT NOT NULL,        -- JSON
  created_at  INTEGER NOT NULL,
  delivered_at INTEGER
);

CREATE TABLE mirrors (
  bead_id         TEXT PRIMARY KEY,
  kanzo_project   TEXT,
  kanzo_task_id   INTEGER,
  last_synced_at  INTEGER,
  dirty           INTEGER DEFAULT 1
);

CREATE TABLE budgets (
  scope        TEXT NOT NULL,       -- run | agent | day
  key          TEXT NOT NULL,
  limit_value  REAL NOT NULL,
  used_value   REAL DEFAULT 0,
  window_start INTEGER NOT NULL,
  PRIMARY KEY (scope, key)
);

CREATE TABLE outbox (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  kind      TEXT NOT NULL,
  payload   TEXT NOT NULL,
  attempts  INTEGER DEFAULT 0,
  next_at   INTEGER NOT NULL
);
```

### 5.2 启动对账

daemon 启动时：

1. 读取所有 `running/verifying/merging` 的 run。
2. PID 不存在或进程不是自己的 → 标记 `failed`，保留 worktree。
3. lease 过期 → 回收。
4. `merging` 未完成 → 幂等重跑合并检查。
5. 与 `bd show --json` 对账：Beads 已 closed 但 run 未结束 → 标记 `done`。
6. 未镜像的 Kanzo 卡片 → 补同步。

---

## 6. 任务卡规范

任务存在 Beads 里，description 用 HTML 注释嵌一段机器可读 YAML：

```markdown
<!-- orchestra
agent: auto                 # auto | claude | codex | pi | omp
priority: P1
scope:
  - src/auth/**
  - tests/auth/**
context:
  - src/auth/session.ts
  - docs/auth.md#L20-L60
acceptance:
  - npm test -- auth
  - npm run lint
budget:
  usd: 2
  minutes: 30
max_diff_lines: 400
review: auto                # none | auto | codex | claude
-->
## Goal

实现 refresh token 轮换，旧 token 使用一次后失效。

## Done when

- 轮换逻辑覆盖正常路径和重放路径
- 新增测试通过
- 不修改 src/api/**

## Notes

不要新增依赖。
```

主 Agent 创建任务：

```bash
bd create "实现 refresh token 轮换" -p 1 -t task \
  -l "agent:auto,area:auth" \
  --description "$(cat task.md)"

bd dep add bd-child bd-parent
bd ready --json --limit 10 | jq -r '.[] | [.id,.priority,.title] | @tsv'
```

依赖由 `bd dep add` 或任务卡里的 `depends_on` 生成；orchestra 解析任务卡后补依赖。

---

## 7. 编排 daemon

### 7.1 状态机

```
created/open
   │ deps closed
   ▼
ready ──dispatch──▶ queued ──start──▶ running
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                     exit 0          needs input     crash/timeout
                         │              │              │
                         ▼              ▼              ▼
                     verifying        blocked        failed
                         │                             │
              ┌──────────┼──────────┐                  │ retry
              │          │          │                  ▼
           passed      failed    skipped            ready/blocked
              │          │
              ▼          ▼
          reviewing    failed
              │
       ┌──────┴──────┐
       │             │
    approved      changes
       │             │
       ▼             ▼
    merging       ready（带 review 意见）
       │
   ┌───┴────┐
   │        │
 merged   conflict
   │        │
   ▼        ▼
 done     blocked
```

Beads 状态只做粗粒度映射：

- `open` → ready / blocked / failed
- `in_progress` → queued / running / verifying / reviewing / merging
- `closed` → done

详细状态放 SQLite，不频繁写 Beads。

### 7.2 调度算法

每 5 秒或事件触发时：

1. `bd ready --json` 取无阻塞任务。
2. 过滤：
   - `human` 标签不自动派；
   - `agent:<name>` 指定 agent；
   - 依赖未闭合的跳过；
   - 已有活跃 run 的跳过。
3. 按优先级、创建时间、agent 并发余量排序。
4. 选择 agent：
   - 指定了就指定；
   - 否则按能力矩阵和成本策略：机械任务优先便宜 agent，复杂任务优先强 agent；
   - 都不可用则排队。
5. 检查全局/单 agent 并发上限、日预算、单任务预算。
6. 创建 run + worktree + 任务包。
7. 调用 adapter 启动 worker。
8. 写 Beads `in_progress` + assignee，并打标签 `orch:run:<id>`。

重试策略：

- 同 agent 最多 2 次；
- 然后切 fallback agent（如 Codex → Claude）；
- 再失败 → `blocked`，L2 升级；
- 不自动重试“验收失败但 diff 为空”的情况。

### 7.3 Worktree 生命周期

```bash
git worktree add .worktrees/<bead-id> -b task/<bead-id> <base-sha>
```

- 每个任务一个 worktree，一个分支。
- worker 只在该目录工作。
- 任务完成/失败后保留 worktree 到人工确认；`orch gc` 清理已合并和超过 N 天的失败 worktree。
- 合并前 rebase 到目标分支；冲突 → `blocked`。
- 合并后删除 worktree，保留分支一段时间用于审计。

### 7.4 Worker adapter 契约

```ts
interface WorkerAdapter {
  name: "claude" | "codex" | "pi" | "omp";
  capabilities: {
    edit: boolean;
    shell: boolean;
    review: boolean;
    jsonSchema: boolean;
    steer: boolean;
    resume: boolean;
  };

  start(ctx: RunContext): Promise<WorkerHandle>;
  tell(handle: WorkerHandle, message: string, mode: "steer" | "followup"): Promise<void>;
  status(handle: WorkerHandle): Promise<WorkerStatus>;
  stop(handle: WorkerHandle, reason: string): Promise<void>;
  collect(handle: WorkerHandle): Promise<WorkerResult>;
}
```

`RunContext`：

```ts
type RunContext = {
  runId: string;
  beadId: string;
  worktree: string;
  taskFile: string;          // .orchestra/runs/<id>/task.md
  schemaFile: string;        // result.schema.json
  artifactsDir: string;
  logFile: string;
  baseSha: string;
  budget: { usd: number; minutes: number };
  env: Record<string, string>;
};
```

`WorkerResult`：

```json
{
  "status": "done | blocked | failed",
  "summary": "不超过 500 token",
  "files": ["src/auth/session.ts"],
  "checks": [{"cmd": "npm test -- auth", "ok": true}],
  "risks": ["并发刷新未覆盖"],
  "artifacts": [".orchestra/runs/<id>/diff.patch"],
  "usage": {"tokensIn": 0, "tokensOut": 0, "usd": 0}
}
```

adapter 统一负责：

- cwd 设为 worktree；
- 超时；
- 进程组 kill；
- stdout/stderr 落日志；
- 每 15 秒 heartbeat；
- 解析 usage；
- 校验结果 schema；
- 不把原始日志交给主 Agent。

### 7.5 四家 adapter

| Agent | 一次性任务 | 续接/注入 | 事件 |
|---|---|---|---|
| Claude | `claude -p --output-format stream-json --json-schema result.schema.json --max-budget-usd 2 --permission-mode acceptEdits` | `--resume <session>`；或 `--input-format stream-json` 长驻 | stream-json |
| Codex | `codex exec --json --output-schema result.schema.json -C <wt> "task"` | `codex exec resume <id>`；`codex queue --thread <id> --message`；或 app-server `turn/steer` | `--json` / app-server |
| pi | `pi --mode rpc --no-session --model <model>` | RPC `steer` / `follow_up` / `abort` | RPC JSONL |
| omp | `omp --mode rpc --no-session --model <model>` | RPC `steer` / `follow_up` / `abort` | RPC JSONL |

实现顺序建议：Claude → Codex → pi → omp。前两个覆盖大部分场景，pi/omp 后补。

---

## 8. MCP 工具面：7 个

只给主 Agent 这 7 个，schema 控制在 2k token 以内：

```text
orch_dispatch(bead_id, agent?, overrides?)
  → { run_id, state, agent, worktree }

orch_status(bead_ids?, cursor?, limit?)
  → { cursor, runs: [{bead_id, state, agent, elapsed, summary?}] }

orch_wait(cursor?, timeout_ms?, filter?)
  → { cursor, digest, escalations[] }

orch_result(bead_id, detail?)
  → detail=summary | diff | full
  → 默认 summary；diff 只给 stat + 关键 hunk；full 给 artifact 路径

orch_tell(bead_id, message, mode?)
  → mode=steer | followup

orch_cancel(bead_id, reason?)
  → ack

orch_merge(bead_id)
  → { state: "queued" | "merged" | "conflict" | "checks_failed" }
```

设计要点：

- `orch_wait` 默认 120 秒长轮询，最长 600 秒；超时返回 `no_events`，不消耗 token。
- `orch_wait` 返回 cursor；同一个 MCP 连接也可由 daemon 记录 last cursor。
- `orch_result` 默认只返回信封；要看 diff 才升级 detail。
- 所有返回有硬上限：summary ≤ 500 token，digest ≤ 600 token，escalation ≤ 300 token。
- 不提供 `get_logs`、`list_all_tasks`、`chat` 这类会放大上下文的工具。

---

## 9. 事件、实时沟通、升级

### 9.1 三层事件

| 层 | 例子 | 去向 |
|---|---|---|
| L0 | heartbeat、工具调用、中间输出、日志 | 只进 SQLite/日志，永不进主 Agent |
| L1 | run started、done、failed、retry、verify passed | 聚合成 digest，`orch_wait` 返回 |
| L2 | blocked、needs decision、merge conflict、budget exceeded | 立即返回，或 AgentBridge push |

### 9.2 digest 格式

```text
[L1] 3 events since #128
- bd-a1b2 done (codex, 12m, $0.84): refresh rotation + 3 tests
- bd-c3d4 failed (pi, 4m): typecheck error; retry 1/2 queued
[L2] bd-e5f6 blocked
  question: merge conflict in src/auth/session.ts
  options: [rebase onto main, ask codex to resolve, abort]
  recommendation: ask codex to resolve
```

超过 5 条只给计数和 `orch_status` 入口，不逐条列。

### 9.3 实时性

- 主 Agent 在编排回合内：`orch_wait` 长轮询，L2 几秒内返回。
- 主 Agent 空闲：默认不打扰；需要紧急升级时，用 AgentBridge channel push（实验性），只推 L2。
- worker 需要人工输入：adapter 发 `run.needs_input`，orchestra 先按任务卡策略自动回答；答不了才 L2。
- 不做 `sleep + status` 轮询。

---

## 10. 三个外部系统怎么接

### 10.1 Beads：执行账本

- `bd init`，`bd setup claude` 安装 hooks/AGENTS.md。
- 主 Agent 通过 Bash 调 `bd`，不要挂 Beads MCP。
- 用 `--json` + `jq` 只取需要的字段：

```bash
bd ready --json --limit 5 | jq -r '.[] | "\(.id)\t\(.priority)\t\(.title)"'
bd show <id> --json | jq '{id,status,assignee,description}'
bd update <id> --claim
bd close <id> --reason "merged <sha>"
```

- `bd prime` 只放 SessionStart hook，输出截到 1k token。
- orchestra 是唯一写 Beads 的进程；worker 不写。
- 只在状态迁移时写 Beads，不写 heartbeat。

### 10.2 Kanzo：人类看板，只读镜像

- `kanzo service install`，看板在 `http://localhost:4242`。
- orchestra 通过 Kanzo 的 HTTP MCP `/mcp` 或 stdio 连接，**主 Agent 不挂 Kanzo MCP**。
- 映射：
  - `open/ready` → `todo`
  - `running` → `doing`
  - `verifying/reviewing` → `review`
  - `done` → `done`
  - `blocked` → `todo` + tag `blocked`
- 只在里程碑同步，不逐条同步日志；每任务最多 60 秒一次。
- 人类在 Kanzo 的评论由 daemon 轮询，追加到 Beads 评论，并可通过 `orch_tell` 注入正在运行的 worker。
- 人类在 Kanzo 改状态不自动回写 Beads；如需回写，走显式 `orch` 命令，避免双写。
- Kanzo 挂了不影响调度，mirror 进 outbox 重试。
- **注意 Kanzo 是 AGPL-3.0**：内部用没问题；修改后作为网络服务对外提供时需评估开源义务。

### 10.3 AgentBridge：只做 L2 和互审

- 只用于：
  - 主 Agent 空闲时接收 L2 push；
  - Claude ↔ Codex 的实时交叉 review；
  - 额度接力（可选）。
- 不用于任务分派、状态同步、进度汇报。
- 消息必须带 `[IMPORTANT]/[STATUS]/[FYI]` 标记，`STATUS` 缓冲，`FYI` 丢弃。
- 没装 AgentBridge 也能跑，`orch_wait` 是默认通道。

---

## 11. 上下文包与 Token 预算

### 11.1 每个 worker 的上下文包

```
.orchestra/runs/<run-id>/
  task.md          # 任务卡，≤1.2k token
  repo.md          # 构建/测试/规范摘要，≤1k
  context.md       # 相关文件路径 + 行号 + 符号，≤4k
  result.schema.json
  worker.log       # 原始日志，只落盘
```

- 不把其他 agent 的对话放进去。
- 不把完整仓库打包；用 `rg`、AST、Serena 按需取。
- 大文件只给路径和行号，worker 自己读。

### 11.2 主 Agent 的 ingress 预算

| 事件 | 上限 | 频率 |
|---|---|---|
| 计划/任务图 | 3k token/feature | 一次 |
| L1 digest | 600 token | 每批 |
| L2 escalation | 300 token | 仅阻塞 |
| 任务结果信封 | 500 token/任务 | 每任务 |
| 终审 diff | 2k token/任务 | 仅关键任务 |
| `bd prime` | 1k token | 每会话一次 |

目标：一个 8 任务的功能，主 Agent 总 ingress ≤ 8–10k token，而不是 50k+ 的聊天中转。

### 11.3 具体省 token 手段

1. **Beads 用 CLI 不用 MCP**：省 10–50k schema。
2. **Kanzo 不挂主 Agent**：省 900 token/会话；只有 daemon 连。
3. **orch_\* 只有 7 个工具**：schema ≤2k。
4. **worker 原始日志不进主 Agent**：只给信封。
5. **便宜模型压缩**：worker 输出超过 2k token 时，先让 `omp --smol` 或 `pi --model haiku` 压成信封。
6. **模型路由**：摘要/分类走便宜模型；主 Agent 只在规划、裁决、终审用强模型。
7. **任务结束即销毁 worker**：不复用长上下文。
8. **去抖/批量**：L1 每 30 秒或每 3 条聚合一次。
9. **验收由代码跑**：主 Agent 不看测试日志，只看 `checks.ok`。
10. **review 只看 diff**：`git diff --stat` + 结构化 findings。

---

## 12. 验证、Review、合并

### 12.1 验证

worker 退出 0 后，orchestra 独立执行：

1. `git status --porcelain`：有改动；否则 `no_changes` 失败（除非任务标记 `no-code`）。
2. `git diff --name-only` 是否越出 `scope`；越界 → `scope_violation`。
3. `git diff --numstat` 是否超过 `max_diff_lines`。
4. 运行任务卡里的 `acceptance` 命令，超时/失败 → 把 tail 作为反馈，重试一次。
5. 运行项目级检查（lint/typecheck/test），可在配置里覆盖。
6. 结果写 `checks.json`。

### 12.2 Review

- `review: none`：跳过。
- `review: auto`：由另一个 agent 做结构化 review，只给 diff + acceptance，不给全仓库。
- review 输出：

```json
{
  "verdict": "approve | request_changes",
  "findings": [
    {"file": "src/auth/session.ts", "line": 42, "severity": "high", "issue": "...", "suggestion": "..."}
  ]
}
```

- 主 Agent 只看 `verdict + findings 数量 + 最高 severity`；要细节才 `orch_result(detail=diff)`。
- high severity → 自动创建修复任务或打回；low → 记录后合并。

### 12.3 合并

- 串行 merge queue，一次只合一个。
- rebase 到目标分支，跑验收 + 项目检查。
- `git merge --squash` 或 `--no-ff`，commit message 带 bead ID。
- 成功后 `bd close <id> --reason "merged <sha>"`，Kanzo 置 done。
- 冲突 → `blocked`，附冲突文件列表和两边 diff 路径，L2 升级。

---

## 13. 故障恢复、并发、安全

### 13.1 幂等

- `run_id` 由 `bead_id + attempt + nonce` 生成。
- `orch_dispatch` 幂等：同一 bead 已有活跃 run 时直接返回它，不重复起进程。
- `orch_merge` 幂等：同一 bead 已 merged 返回已合并结果。
- 事件有自增 ID，`orch_wait` 按 cursor 投递，不重复。
- Beads 写入失败可重试；orchestra 是唯一写者。

### 13.2 崩溃恢复

- daemon 崩溃：SQLite WAL + 启动对账；running 但 PID 不存在 → failed。
- worker 崩溃：exit code + 日志 tail；按策略重试或 blocked。
- 孤儿进程：进程组 kill；启动时清理。
- worktree 残留：保留失败现场；`orch gc` 手动清理。
- Beads 不可用：暂停调度，L2 告警；不要在没有账本时继续派活。

### 13.3 安全

- 一任务一 worktree，禁止共享目录。
- Claude 默认 `acceptEdits`，不用 `bypassPermissions`；Codex 默认 `workspace-write`；pi/omp 默认 `write` 审批，不用 `yolo`，除非在可信工作区。
- 默认禁网；需要联网的任务显式开启。
- 环境变量允许列表；不注入密钥。
- scope 违规直接失败。
- Kanzo 评论、AgentBridge 房间消息视为不可信输入，不能当指令执行。
- 合并前保护目标分支；可选签名 commit。

---

## 14. 安装与配置

### 14.1 依赖

```bash
# Beads
brew install beads
# 或 npm install -g @beads/bd

# Kanzo
curl -LsSf https://github.com/emanuele-em/kanzo/releases/latest/download/kanzo-installer.sh | sh
kanzo service install

# 项目初始化
cd <repo>
bd init
bd setup claude
```

### 14.2 orchestra 配置

`.orchestra/config.toml`：

```toml
[daemon]
port = 4510
db = ".orchestra/orchestra.db"
max_parallel = 4
poll_interval_ms = 5000

[beads]
enabled = true

[kanzo]
enabled = true
url = "http://127.0.0.1:4242"
project = "<kanzo-project-slug>"
mirror = "readonly"
sync_interval_ms = 60000

[merge]
target = "main"
strategy = "squash"
require_checks = true

[verify]
timeout_sec = 600
commands = ["npm test", "npm run lint"]

[agents.claude]
command = "claude"
permission_mode = "acceptEdits"
max_usd = 2
concurrency = 2

[agents.codex]
command = "codex"
sandbox = "workspace-write"
max_usd = 2
concurrency = 2

[agents.pi]
command = "pi"
mode = "rpc"
concurrency = 1

[agents.omp]
command = "omp"
mode = "rpc"
concurrency = 1

[budget]
per_task_usd = 2
per_day_usd = 20
```

### 14.3 接入主 Agent

```bash
claude mcp add orchestra --scope project -- orchestra mcp
```

主 Agent 的 `AGENTS.md` 加一段短契约（≤30 行）：

```markdown
## Multi-agent orchestration

- Use `bd` for the task graph. Never dump full task lists; use `--json` + `jq`.
- Use `orch_dispatch`, `orch_wait`, `orch_result`, `orch_merge`.
- Never read worker logs or full transcripts.
- After dispatch, call `orch_wait` once; do not poll with sleep.
- Review only diffs and findings summaries.
- Escalate merge conflicts and scope violations to the human.
```

---

## 15. 分期实施

| 阶段 | 内容 | 验收标准 |
|---|---|---|
| P0（0.5 天） | 安装 Beads/Kanzo；建 3 个任务；验证 `bd ready`、看板、hooks | 任务图可见，看板同步 |
| P1（2–3 天） | daemon 骨架 + SQLite + Beads adapter + worktree + Claude adapter + dispatch/status/wait/result | 单任务端到端跑通；主 Agent 只看到信封 |
| P2（2–3 天） | Codex adapter + verifier + merge queue + retry/timeout | 2 个任务并行；冲突能升级；失败能重试 |
| P3（2 天） | pi/omp adapter + `orch_tell` + L1/L2 事件 + digest | 4 个 agent 并行；主 Agent 无 L0 噪声 |
| P4（1–2 天） | Kanzo 镜像 + AgentBridge L2 + 恢复演练 + metrics | kill daemon 后恢复；无重复合并；主 token 达标 |

验收指标：

- 主 Agent 每个任务完成事件 ≤500 token。
- 8 任务功能主 ingress ≤10k token。
- 4 并发任务无文件冲突。
- 重复合并 = 0；重复派发 = 0。
- daemon 崩溃恢复 <30 秒。
- 预算超限 = 0（硬停）。
- 每个 merge 可追溯到 bead ID + run + diff + checks。

---

# Part II：这个方案能覆盖的场景

## 16. 场景总表

| # | 场景 | 关键能力 | 主 Agent 看到什么 |
|---|---|---|---|
| 1 | 一个功能，四个 Agent 并行 | 依赖 DAG + 并发调度 + worktree | 计划 + 信封 + digest |
| 2 | 交叉 review | reviewer adapter + diff | verdict + findings 计数 |
| 3 | 长任务/额度接力 | checkpoint + resume | 一条 L2 + 恢复摘要 |
| 4 | worker/daemon 崩溃 | 幂等 + 对账 | 一条失败/恢复摘要 |
| 5 | 人类看板介入 | Kanzo + 评论回传 | 人类评论/决策 |
| 6 | 多机协作 | Beads Dolt sync + claim | 跨机 claim/完成事件 |
| 7 | 规格驱动开发 | Spec Kit/OpenSpec + Beads | spec → 任务图 |
| 8 | 同题多解 | 多 run + diff 对比 | 两个信封 + 选择 |
| 9 | 只读审计 | no-code + findings | findings 摘要 |
| 10 | 多仓库 | 每仓一套 orchestra | 每仓独立状态 |

## 17. 场景详解

### 场景 1：一个功能，四个 Agent 并行实现

**流程：**

1. 主 Agent 把功能拆成 6 个 Beads 任务，写清依赖和验收。
2. `orch_dispatch` 派出 4 个 ready 任务：Claude 做 API、Codex 做测试、pi 做文档、omp 做重构。
3. 每个 worker 在自己的 worktree 和独立上下文中工作。
4. 主 Agent 调一次 `orch_wait`，收到 L1 digest；完成的看 `orch_result` 信封。
5. 主 Agent 调 `orch_merge`，串行合并。

**主 Agent 看到：** 计划 + 4 个 300 token 信封 + 1 条 digest + 终审 diff。
**主 Agent 看不到：** worker 的工具调用、测试日志、源码全文。
**收益：** 并行度上去，主上下文不随 worker 活动线性增长。

### 场景 2：交叉 Review，不把对话灌进主 Agent

**流程：**

1. Codex 完成任务，orchestra 自动派 Claude reviewer，只给 diff + 验收标准。
2. reviewer 返回结构化 findings。
3. 有 high severity → orchestra 自动创建一个修复任务，派回 Codex。
4. 全部通过 → 合并。
5. 主 Agent 只看到“approved / 2 findings / 1 high”。

**可选：** 需要实时讨论时，用 AgentBridge 让 Claude 和 Codex 直接对话；对话不 CC 主 Agent。

**收益：** review 的 token 花在 reviewer 身上，不花在主 Agent 身上。

### 场景 3：长任务、跨天、额度接力

**流程：**

1. 任务运行到一半，worker 到达额度/时间上限。
2. adapter 在回合边界停下，写 checkpoint 到 `.orchestra/runs/<id>/checkpoint.md`。
3. orchestra 标记 `paused`，记录 checkpoint 和 resume 命令。
4. 窗口刷新或人工恢复后，orchestra 用 `--resume`/`codex queue`/RPC 续接。
5. 如果一侧不可用，切换到另一侧 agent 继续。

**收益：** 任务状态在 Beads/SQLite，不在某个会话的上下文里；重启不丢。

### 场景 4：worker 崩溃 / daemon 崩溃

**流程：**

1. worker 进程退出非 0 → adapter 记录 exit code + 日志 tail。
2. orchestra 按策略重试，或换 agent。
3. daemon 崩溃 → 重启后对账，running 但 PID 不存在 → failed。
4. 已合并的 run 不会重复合并；已关闭的 bead 不会重复派发。

**收益：** 不需要人肉检查“跑到哪了”。

### 场景 5：人类看板介入

**流程：**

1. 人类打开 Kanzo，看到每个任务的 todo/doing/review/done。
2. 在卡片上评论：“用 bcrypt，不要 argon2”。
3. orchestra 轮询到评论，追加到 Beads，并通过 `orch_tell` 注入正在运行的 worker。
4. worker 调整实现；下一次 sync 更新卡片。

**收益：** 人类不需要读终端，也不需要直接和 agent 聊天。

### 场景 6：多机协作

**流程：**

1. Beads 用 Dolt remote 同步任务图；每台机器跑自己的 orchestra daemon。
2. 任务通过 `bd update --claim` 原子领取，避免两台机器抢同一个任务。
3. 代码通过 git 同步；orchestra 不传文件。
4. Kanzo 可共用一块板（注意同时写）；或每台机器一块，定期 sync。
5. AgentBridge 的 room 只用于跨机 L2/互审。

**注意：** 这是方案里最复杂的场景；需要 Dolt server 模式或严格的单写者约定，建议最后再做。

### 场景 7：规格驱动开发

**流程：**

1. 用 Spec Kit / OpenSpec 写 spec。
2. 主 Agent 把 spec 转成 Beads epic + 子任务 + 依赖。
3. orchestra 执行，Kanzo 展示进度。
4. 每个任务的结果、diff、checks 都能回溯到 spec。

**收益：** “为什么做”在 spec，“做什么”在 Beads，“做到哪”在 Kanzo，“怎么做的”在 run artifacts。

### 场景 8：同一问题多解对比

**流程：**

1. 同一个 bead 用 `variant:claude` / `variant:codex` 派两次，两个 worktree。
2. 两边都产出 diff 和测试结果。
3. 主 Agent 只比较 `checks + diff stat + findings`，选一个合并，另一个关闭。
4. 成本翻倍，但只用于高价值/高不确定任务。

**收益：** 用 token 换决策质量，而且不会污染主上下文。

### 场景 9：只读审计 / review-only

**流程：**

1. 创建一个 `no-code` 任务，`review: none`。
2. worker 只输出 findings JSON，不改文件。
3. orchestra 跳过 diff/merge，直接归档结果。
4. 主 Agent 只读 findings 摘要。

**收益：** 安全审计、架构评审、依赖检查都能复用同一套调度。

### 场景 10：多仓库

**流程：**

1. 每个仓库一个 Beads 项目前缀、一个 orchestra daemon、一个 Kanzo project。
2. 跨仓库依赖用 Beads 的 external ref 或主 Agent 显式协调。
3. 每个仓库独立合并队列。

**建议：** 先单仓库跑稳，再做多仓库；跨仓依赖是最容易失控的地方。

## 18. 这个方案做不到或做不好的场景

| 场景 | 原因 | 替代 |
|---|---|---|
| 多个 Agent 共享同一段实时上下文 | 桥传消息不传上下文，这是设计目标 | 不需要；用任务卡和 diff |
| 人类接管正在运行的 TUI | worker 是 headless，没有前台终端 | Gas Town / CCB / claude-squad |
| 强隔离不可信代码 | worktree 不是安全边界 | 容器 / VM / devcontainer |
| 主 Agent 空闲时 100% 实时唤醒 | Claude Code 的 MCP 是请求-响应；channel 是实验性 | AgentBridge push，或 headless 主会话 |
| 2 个 Agent 的轻量任务 | 编排开销大于收益 | 直接用原生 subagent / AgentBridge |
| Windows 全功能 | Kanzo 主要 macOS/Linux；Beads 支持 Windows | WSL / Linux |
| 跨机代码同步 | orchestra 只做控制面 | git |

---

# Part III：裁剪方案 v0

## 19. 裁剪原则

1. **把“平台”降级为“脚手架”。** 不写 daemon，不写 IPC，不写调度循环。
2. **把“自动”降级为“主 Agent 显式调用”。** 主 Agent 用 `bd ready` 决定派什么，用 `orch dispatch` 派。
3. **把“三层存储”降级为“两层”。** Beads + SQLite；Kanzo 延后。
4. **把“四个 adapter”降级为“两个”。** Claude + Codex；pi/omp 等有需求再加。
5. **把“MCP”降级为“CLI”。** 主 Agent 已经用 Bash 调 `bd`，再调 `orch` 是同一套习惯。
6. **把“常驻 daemon”降级为“每个 run 一个 supervisor”。** 进程退出即结束，不需要全局生命周期。
7. **把“自动重试/自动合并”降级为“主 Agent 决策”。** 少状态机，少误操作。

## 20. 裁剪表

| 原组件 | v0 处理 | 替代 | 什么时候再加 |
|---|---|---|---|
| orchestra daemon | 砍 | 每个 run 一个 detached supervisor；主 Agent 用 `bd ready` 调度 | 需要跨会话自动调度、自动重试时 |
| MCP 7 工具 | 砍 | `orch` CLI 6 个命令 | 需要结构化权限、多客户端、工具发现时 |
| Kanzo + mirror + outbox | 砍 | `bd ready` / `bd list` / `watch` | 人类需要浏览器看板、评论时 |
| AgentBridge | 砍 | `orch wait` 长轮询 | 需要空闲主 Agent L2 push、实时互审时 |
| pi/omp adapter | 砍 | 先 Claude + Codex | 任务确实需要它们的模型/成本/能力时 |
| Reviewer agent | 砍 | 主 Agent 自己看 diff | 主 Agent review 成为瓶颈时 |
| Merge queue | 砍 | 主 Agent 串行 `git merge`，`orch cleanup` 收尾 | 同时合并 >2 个分支时 |
| 三级事件 L0/L1/L2 | 砍 | 两级：`info` / `attention` | 事件量大到需要聚合时 |
| budgets 表 / 日预算 | 砍 | `--max-budget-usd` + 超时 + 最大尝试次数 | 需要成本分摊、团队配额时 |
| SQLite 5 张表 | 砍 | 2 张：`runs`、`events` | 需要镜像/预算/outbox 时 |
| 8 状态状态机 | 砍 | 5 个：`queued/running/done/failed/blocked` | 需要 review/merge 状态时 |
| Adapter 插件接口 | 砍 | `switch (agent)` | 有 3 个以上 adapter 时 |
| Context pack / Serena | 砍 | `task.md` + `rg` + `git diff` | 上下文经常超预算时 |
| 多机同步 | 砍 | 单机、单写者 | 第二台机器真的加入时 |
| 自动重试 | 砍 | 主 Agent 看 `failed` 后决定重派或改任务 | 失败模式稳定、值得自动化时 |
| mid-task steer | 砍 | worker 一次性执行；需要输入就 blocked，主 Agent 重派 | 中途纠偏频繁时 |

## 21. v0 架构

```
┌────────────────────────────────────────────┐
│ Claude Code 主 Agent                       │
│  bd ready / bd dep add / bd show           │
│  orch dispatch --ready --max 4             │
│  orch wait / result / diff / cleanup       │
└───────────────┬────────────────────────────┘
                │ Bash（无 MCP）
┌───────────────▼────────────────────────────┐
│ orch CLI + SQLite（.orchestra/state.db）    │
│  - dispatch：建 worktree、写 task.md、起 supervisor │
│  - wait：读 SQLite，阻塞到有结果/超时        │
│  - result/diff/cleanup/kill/doctor          │
└───────────────┬────────────────────────────┘
                │ 每个 run 一个 detached 进程
┌───────────────▼────────────────────────────┐
│ orch-run <run-id>（supervisor）             │
│  1. 启动 claude -p 或 codex exec            │
│  2. 日志落盘                                │
│  3. 跑 acceptance                           │
│  4. 写 result.json、更新 SQLite             │
│  5. 退出                                    │
└───────────────┬────────────────────────────┘
                │
        .worktrees/<bead-id>/  ← 独立 worktree
```

没有常驻 daemon，没有调度循环，没有 IPC。`orch dispatch` 就是调度器，`orch-run` 就是执行器，`orch wait` 就是事件总线。

## 22. v0 数据模型：两张表

```sql
CREATE TABLE runs (
  run_id     TEXT PRIMARY KEY,
  bead_id    TEXT NOT NULL,
  agent      TEXT NOT NULL,
  state      TEXT NOT NULL,        -- queued|running|done|failed|blocked
  attempt    INTEGER DEFAULT 1,
  pid        INTEGER,
  worktree   TEXT,
  branch     TEXT,
  started_at INTEGER,
  ended_at   INTEGER,
  summary    TEXT,
  error      TEXT,
  checks_ok  INTEGER
);

CREATE INDEX runs_by_bead ON runs(bead_id, started_at);

CREATE TABLE events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id     TEXT,
  bead_id    TEXT,
  level      TEXT NOT NULL,        -- info|attention
  message    TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX events_unread ON events(level, id);
```

没有 budgets、mirrors、outbox、leases。lease 就是 `pid` + `started_at`；进度就是 `info` 事件；需要主 Agent 知道的才是 `attention`。

## 23. v0 命令与流程

### 23.1 命令

```bash
orch dispatch <bead-id> [--agent claude|codex]
orch dispatch --ready --max 4 [--agent auto]
orch wait [--timeout 120] [--json]
orch result <bead-id> [--detail summary|diff|full]
orch diff <bead-id>
orch kill <bead-id> [--reason ...]
orch cleanup <bead-id>          # 合并后 bd close + 删除 worktree
orch doctor [--fix]
```

### 23.2 一次完整流程

```bash
# 1. 主 Agent 建任务图
bd create "实现 refresh token 轮换" -p 1 -t task --description "$(cat task.md)"
bd dep add bd-child bd-parent

# 2. 一次性派出所有 ready 任务，最多 4 个
orch dispatch --ready --max 4
# 输出：
# dispatched bd-a1b2 -> codex (run r-01)
# dispatched bd-c3d4 -> claude (run r-02)
# skipped  bd-e5f6 (blocked by bd-a1b2)

# 3. 等待结果；阻塞期间不花 token
orch wait --timeout 120
# [done]    bd-a1b2 codex  12m  checks=ok  auth rotation + 3 tests
# [failed]  bd-c3d4 claude  4m  checks=lint  tail: ...
# [running] bd-e5f6 pi     3m

# 4. 看信封和 diff
orch result bd-a1b2
orch diff bd-a1b2

# 5. 主 Agent 自己合并，然后收尾
git merge --squash task/bd-a1b2
orch cleanup bd-a1b2      # bd close + 删除 worktree

# 6. 失败处理：改任务或重派
orch kill bd-c3d4
orch dispatch bd-c3d4 --agent claude   # attempt 2
```

### 23.3 关键行为

- **`orch dispatch --ready --max 4` 就是调度器**：读 `bd ready`、检查并发、建 worktree、起 supervisor。主 Agent 一次调用派出 4 个，不用循环。
- **`orch wait` 阻塞等待**：内部每 1 秒读一次 SQLite，有 `attention` 或任一 run 结束就返回；超时只返回一行统计。等待不消耗 token。
- **`done` 不等于 merged**：worker 和验收都通过才是 `done`；主 Agent 合并后 `orch cleanup` 才 `bd close`。避免未合并的代码被标完成。
- **失败不自动重试**：主 Agent 看到 `failed`，决定改任务、换 agent 或重派。少一个重试状态机。
- **不自动 close**：合并动作由主 Agent 或人控制，避免错误合并。

## 24. v0 不能砍的东西

这几项是方案的核心，砍了就会退化成“多开终端”：

1. **一任务一 worktree**：防止两个 agent 改同一个文件；这是比消息总线更重要的隔离。
2. **任务卡 + 结果信封**：worker 拿结构化目标，主 Agent 只拿 summary/files/checks/risks。
3. **独立验收**：orchestra 跑测试，不信 worker 自报。
4. **Beads 的依赖图和 claim**：这是选 Beads 的唯一理由；没有依赖就用 SQLite。
5. **SQLite run 账本 + 幂等**：防止重复派发、重复合并、崩溃后不知道跑到哪。
6. **`orch wait` 的阻塞等待**：不要 `sleep + status` 轮询。
7. **单一真源**：Beads 管任务，SQLite 管执行，不双写。

## 25. 什么时候再把东西加回来

| 触发条件 | 加什么 | 代价 |
|---|---|---|
| 人类需要浏览器看板、评论 | Kanzo 只读镜像 | +1 个 MCP client + 映射表 |
| 主 Agent 空闲时需要 L2 push | AgentBridge | 插件、channel、端口、消息过滤 |
| 任务确实需要 pi/omp | 第三个 adapter | +1 个 CLI/RPC 适配 |
| 主 Agent review 成为瓶颈 | reviewer agent | +1 个 worker 类型、findings schema |
| 同时合并 >2 个分支 | merge queue | 锁、rebase、冲突处理 |
| 需要跨会话自动调度/重试 | daemon | 常驻进程、IPC、恢复逻辑 |
| 需要结构化权限/多客户端 | MCP | schema、server 生命周期 |
| 上下文经常超预算 | Serena/context pack | 索引、选择策略 |
| 第二台机器加入 | Beads Dolt sync + claim | 网络、单写者约定 |

**原则：每加一层，都必须有一个已经发生的痛点，而不是“以后可能会用”。**

## 26. v0 的收益

| 维度 | 完整方案 | v0 |
|---|---|---|
| 常驻进程 | daemon + supervisor | 只有 per-run supervisor |
| 外部系统 | Beads + Kanzo + AgentBridge | Beads |
| MCP 工具 | 7 个 | 0 个（CLI） |
| Adapter | 4 个 | 2 个 |
| SQLite 表 | 5 张 | 2 张 |
| 状态 | 8 个 | 5 个 |
| 主 Agent 工具 schema | ~2k token/会话 | 0 |
| 代码量 | 几千行 | 约 600–900 行 |
| 首次跑通 | 1–2 周 | 2–3 天 |

Token 上最大的两个收益是：**没有 MCP schema，没有 Kanzo/AgentBridge 的消息噪声**。主 Agent 每次只看到 `orch wait` 的一行摘要和 `orch result` 的信封。

---

# 27. 选型对比

| 方案 | 任务图 | 实时分派 | 异构 Agent | 主 Agent token | 适用 |
|---|---|---|---|---|---|
| Claude Code 原生 subagents / `--bg` | 弱 | 中 | 仅 Claude 原生 | 中 | 全 Claude 团队 |
| AgentBridge | 无 | 强 | Claude/Codex | 高 | 只做交叉 review |
| MCP 直连（把 codex/pi 包成工具） | 无 | 弱（同步阻塞） | 强 | 高 | 短问答 |
| 完整方案 B | 强 | 强 | 强 | 低 | 4+ agent、长期 |
| v0 裁剪版 | 中 | 中 | Claude/Codex | 低 | 2–4 agent、先跑通 |
| Gas Town | 强 | 强 | Claude/Codex/Copilot/Gemini | 中高 | 想少写代码、接受工作流 |
| CAO / CCB / claude-squad | 中 | 中 | 视项目 | 中 | 人盯着、可见终端 |

补充：

- **Gas Town** 最接近完整方案：Mayor、Rig、Polecat、Hook、Convoy、Witness、Beads 都已内置，MIT。适合先试，不适合追求极致 token。
- **CAO**（AWS Labs，Apache-2.0）是 supervisor + tmux workers，支持 OMP/Claude/Codex。
- **CCB** 支持 16 种 CLI family（含 Pi/OMP），偏通信与可见工作区；任务图需另配。
- **claude-squad**（AGPL）是 tmux + worktree 的简单并行。

---

# 28. 风险与边界

## 28.1 主要风险

1. **四家 adapter 是维护大头**：CLI 参数变化会破坏适配。先做 Claude + Codex。
2. **Beads/Dolt 比 SQLite 重**：如果团队小、单机、无依赖图需求，可退化到 Kanzo + SQLite。
3. **Kanzo AGPL**：商业化前评估许可；或换 Vibe Kanban（Apache-2.0）。
4. **双状态对账**：Beads 和 SQLite 必须每次启动对账；不要人工改两边。
5. **headless 失去接管感**：保留 `orch logs`、`--resume`、失败 worktree，必要时人工接手。
6. **scope 约束是软约束**：靠 diff 检查，不靠操作系统沙箱。
7. **长轮询超时**：按 Claude Code 的 MCP 超时设置，默认 120 秒，不要一次等 10 分钟。
8. **provider 限流**：adapter 要处理 429/额度错误，不能把所有失败都当代码失败。

## 28.2 最小可行裁剪

如果不想一次做全：

- 只做 **Claude + Codex** 两个 adapter；
- 只做 **dispatch / wait / result / cleanup** 四个命令；
- Kanzo 先不接，人工看 Beads；
- AgentBridge 先不接，`orch wait` 足够；
- 验收只跑一条测试命令；
- 合并先手动，`orch cleanup` 后补。

这样 1–2 天能跑通，再逐层加。

---

# 29. 决策清单

开始前先回答：

1. 同时会跑几个 agent？2–4 → v0；5+ → 完整方案或 Gas Town。
2. 任务之间有依赖吗？有 → Beads；没有 → SQLite/Kanzo。
3. 人类需要浏览器看板吗？需要 → Kanzo；不需要 → `bd` CLI。
4. 主 Agent 空闲时需要被唤醒吗？需要 → AgentBridge；不需要 → `orch wait`。
5. 需要中途 steer 吗？需要 → RPC adapter；不需要 → 一次性执行 + 重派。
6. 需要自动 review 吗？需要 → reviewer agent；不需要 → 主 Agent 看 diff。
7. 需要合并队列吗？同时合并 >2 → 需要；否则手动。
8. 需要多机吗？需要 → Dolt sync + claim；否则单机。
9. 每天预算多少？先设单任务上限 + 超时，再考虑日预算。
10. 谁负责最终合并？主 Agent 还是人？明确后再设计 `orch cleanup`。

推荐默认答案：

- 2–4 个 agent
- 有依赖 → Beads
- 无看板 → v0
- 无空闲唤醒 → 不装 AgentBridge
- 一次性执行 → 不装 steer
- 主 Agent review → 不装 reviewer
- 手动 merge → 不装 merge queue
- 单机 → 不做多机
- 单任务预算 + 超时
- 人负责最终合并

---

# 30. 参考资料

## 30.1 任务与编排

- Beads：https://github.com/gastownhall/beads
- Kanzo：https://github.com/emanuele-em/kanzo
- Gas Town：https://github.com/gastownhall/gastown
- CLI Agent Orchestrator：https://github.com/awslabs/cli-agent-orchestrator
- CCB：https://github.com/SeemSeam/claude_codex_bridge
- claude-squad：https://github.com/smtg-ai/claude-squad
- Vibe Kanban：https://github.com/BloopAI/vibe-kanban
- Crystal/Nimbalyst：https://github.com/stravu/crystal
- Task Master：https://github.com/eyaltoledano/claude-task-master
- Backlog.md：https://github.com/MrLesk/Backlog.md
- Spec Kit：https://github.com/github/spec-kit
- OpenSpec：https://github.com/Fission-AI/OpenSpec

## 30.2 通信与运行时

- AgentBridge：https://github.com/raysonmeng/agent-bridge
- Agent Client Protocol：https://github.com/zed-industries/agent-client-protocol
- A2A：https://github.com/google-a2a/A2A
- AG-UI：https://github.com/ag-ui-protocol/ag-ui
- pi：https://github.com/badlogic/pi-mono
- omp：见本机 `omp --help`

## 30.3 上下文、路由、观测

- Serena：https://github.com/oraios/serena
- Repomix：https://github.com/yamadashy/repomix
- claude-code-router：https://github.com/musistudio/claude-code-router
- LiteLLM：https://github.com/BerriAI/litellm
- ccusage：https://github.com/ryoppippi/ccusage
- Langfuse：https://github.com/langfuse/langfuse
- OpenLLMetry：https://github.com/traceloop/openllmetry

## 30.4 基础设施

- 1mcp：https://github.com/1mcp-app/agent
- MetaMCP：https://github.com/metatool-ai/metamcp
- mcp-proxy：https://github.com/TBXark/mcp-proxy
- DBOS：https://github.com/dbos-inc/dbos-transact-ts
- Temporal：https://github.com/temporalio/temporal
- Restate：https://github.com/restatedev/restate
- BullMQ：https://github.com/taskforcesh/bullmq
- Inngest：https://github.com/inngest/inngest
- bors-ng：https://github.com/bors-ng/bors-ng
- git-branchless：https://github.com/arxanas/git-branchless
- jj：https://github.com/jj-vcs/jj

---

# 附录 A：任务卡模板

```markdown
<!-- orchestra
agent: auto
priority: P1
scope:
  - src/auth/**
  - tests/auth/**
context:
  - src/auth/session.ts
  - docs/auth.md#L20-L60
acceptance:
  - npm test -- auth
  - npm run lint
budget:
  usd: 2
  minutes: 30
max_diff_lines: 400
review: auto
-->
## Goal

<一句话说明要做什么、为什么>

## Done when

- <可验证的结果 1>
- <可验证的结果 2>
- <不允许改动的范围>

## Notes

<约束、已知坑、参考实现>
```

# 附录 B：结果信封 schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["status", "summary", "files", "checks"],
  "properties": {
    "status": {"enum": ["done", "blocked", "failed"]},
    "summary": {"type": "string", "maxLength": 2000},
    "files": {"type": "array", "items": {"type": "string"}},
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["cmd", "ok"],
        "properties": {
          "cmd": {"type": "string"},
          "ok": {"type": "boolean"},
          "tail": {"type": "string", "maxLength": 500}
        }
      }
    },
    "risks": {"type": "array", "items": {"type": "string"}},
    "artifacts": {"type": "array", "items": {"type": "string"}},
    "next": {"type": "string"}
  }
}
```

# 附录 C：主 Agent AGENTS.md 片段

```markdown
## Multi-agent orchestration

- Use `bd` for the task graph. Never dump full task lists; use `--json` + `jq`.
- Use `orch dispatch --ready --max N` to dispatch.
- Use `orch wait` once; do not poll with sleep.
- Use `orch result` and `orch diff`; never read worker logs or full transcripts.
- Review only diffs and findings summaries.
- Escalate merge conflicts, scope violations, and budget overruns to the human.
- Do not close a bead before the merge is complete.
```

# 附录 D：v0 配置示例

`.orchestra/config.json`：

```json
{
  "maxParallel": 4,
  "worktreeRoot": ".worktrees",
  "stateDb": ".orchestra/state.db",
  "verify": {
    "command": "npm test && npm run lint",
    "timeoutSec": 600
  },
  "agents": {
    "claude": {
      "command": "claude",
      "permissionMode": "acceptEdits",
      "maxUsd": 2,
      "timeoutSec": 1800
    },
    "codex": {
      "command": "codex",
      "sandbox": "workspace-write",
      "timeoutSec": 1800
    }
  }
}
```

# 附录 E：v0 验收清单

- [ ] `bd ready` 能列出无阻塞任务
- [ ] `orch dispatch <id>` 能创建 worktree 并启动 worker
- [ ] worker 退出后 `orch wait` 在 120 秒内返回
- [ ] `orch result` 只返回信封，不返回日志
- [ ] 验收失败时状态为 `failed`，并带 checks tail
- [ ] `orch diff` 能给出 diff stat 和 patch 路径
- [ ] `orch cleanup` 只在合并后关闭 bead
- [ ] kill worker 后 `orch doctor --fix` 能标记失败
- [ ] 同一 bead 不会同时有两个活跃 run
- [ ] 主 Agent 每个任务看到的 token ≤500
- [ ] 8 个任务的主 Agent 总 ingress ≤10k token
- [ ] 两个 worker 并行修改同一文件时，worktree 不冲突
- [ ] 合并后 `git log` 能追溯到 bead ID

---

## 31. 一句话总结

这个方案的关键不是“用了 Beads 和 Kanzo”，而是：

> **Beads 负责“该做什么、依赖谁”，SQLite 负责“谁在做、做到哪”，Kanzo 负责让人“看得见”，orchestra 负责“派活、验收、合并”，主 Agent 只负责“想清楚和拍板”。**

完整方案适合 4+ agent、长期、多机；v0 适合 2–4 agent、先跑通。先把 v0 跑出一个真实功能，再按痛点加层，而不是一次性把平台建完。
