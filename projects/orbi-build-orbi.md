---
name: orbi-build-orbi
title: Orbi：给 GitHub Issue 打个标签，换回已评审合并的 PR
summary: 把 GitHub Issue 当唯一状态存储的无人值守交付引擎：标签即状态机，失败即停，独立评审过门才合并，宪法管住 agent 与代码结构。给 agent 立规矩的全套样本。
repo: https://github.com/orbi-build/orbi
description: 'Open-source (AGPL-3.0), self-hostable lights-out software factory for the agent era: label a GitHub Issue, get an independently reviewed, merged PR and a tagged release.'
stars: 223
forks: 28
contributors: 8
language: Python
languages:
  Python: 99.6
  Shell: 0.3
  Dockerfile: 0.1
avatar: /projects/orbi-build.png
license: AGPL-3.0
tags: [ai-agents, software-factory, github, governance, python]
pinned_commit: b66c9860f4047428ac0a40cf03d9275b69cc3de8
evaluated_at: 2026-10-20
updated_at: 2026-10-20
related: []
---

Orbi 是一台跑在自己机器上的交付引擎。给 GitHub Issue 打上 `ai-ready` 标签，它在隔离 worktree 里实现、开 PR，另起一个会话独立评审并当场修复，过合并门才合并，要发布时再跑发布门打 tag。这张卡把它当样本读。它对 agent 交付给出的答案偏保守：状态全部外置给 GitHub，执行无常驻进程，失败立刻停给人，AI 永远碰不到保护分支。223 stars、8 位贡献者、v0.5.x，把它放进生产之前，先读局限一节。

## 它解决什么问题

让 agent 写代码已经不难，难的是把一次生成变成一次交付。从认领任务到合并发布，中间隔着开分支，跑测试，回应评审意见，每一步都要人盯，agent 产出越多盯得越累。CI 只管验证不管生成，Copilot 一类只管生成不管闭环。Orbi 补的是中间那段链路：人定义目标和验收标准，机器走完剩下的，全程在 GitHub 上留痕。它管自己叫 lights-out software factory（黑暗工厂），跑在用户机器上，用用户自己的 `gh` 凭据。

## 怎么解的

整个系统没有数据库、队列和守护进程，[CONSTITUTION.md](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/CONSTITUTION.md) 第 1 条把这几样明文划出范围。Issue 标签就是状态机，七个状态：`ai-ready`、`ai-in-progress`、`ai-pr-opened`、`ai-fix-needed`、`ai-merged`，外加 `ai-blocked` 与 `ai-awaiting-merge` 两个出口，完整链路写在 [workflow.mdx](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/docs/workflow.mdx)。PR 永远不带 Orbi 标签，只读不写状态；每个交付 PR 必须以 `Fixes #N` 指回 Issue。执行侧没有常驻进程，Linux 用 systemd、macOS 用 launchd 的用户定时器每 5 分钟触发一次 tick，一次 tick 走一步，单实例单槽串行，并发靠固定数量的 timer 实例抢 flock 槽位。

角色分四份。Implementer Pi 在从冻结的 origin/main SHA 切出的 worktree 里做完从规划到实现的工作，测试过了就提交，推送和开 PR 归 Runner。Reviewer Pi 是全新会话，对着精确的 base/head SHA 评审，发现的问题当场修、当场跑全量测试和覆盖率门槛，然后给出裁定；它的 prompt 带关联 Issue 的时间线和当前 PR 上可信的人类反馈，但排除 runner 自己的身份。Runner 管标签、可观测性和合并。Maintainer 开 Issue、做决策，永远不写交付代码。[AGENTS.md](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/AGENTS.md) 记着一次真实事故：维护者趁 run 活着亲手推了修复，run 以「agent 没在任务分支上提交」收场，票面记为失败。这张票后来立了规矩，想让某张票走人工，先摘掉 `ai-ready`。

run 的全部产物挂在同一个 run_id 下，日志与 GitHub 进度评论同源，一次 grep 能重建整条时间线。worktree 被当作远端分支的本地缓存，丢了不算故障，下一个 tick 从远端重建接着跑。

失败分两类。Pi 执行失败，验证失败，评审意见没修完，或 PR 落后 base，这些是可恢复的，回到同一个 run、分支和 PR 继续修，不开新 PR。评审轮次耗尽、远端分支被删这类机器不敢自行判断的场景，Issue 标 `ai-blocked`，自动循环停手，等人。

## 设计亮点

**Issue 是唯一状态机。** 状态进了第二个存储就有两处要看、会漂移。Orbi 把这条写死在宪法第 1 条：GitHub Issues、标签、评论和 PR 是唯一状态存储，PR 被明确禁止携带状态，状态只能从 PR 事件流向 Issue 标签，反向不许，需要数据库、队列或调度器的功能一律不做。想跟踪一个 PR？先给它开 Issue。这个约束把系统压到无守护进程也能工作，仓库自己就是台账。

**合并权与生成权分离。** agent 不能验收自己。规矩是 AI 永远不合并、不推保护分支，合并只由 Runner 执行，且只合评审裁定指名的那一个 head；合并门要求 head 包含最新 base、CI 已有结论、PR 可合并、远端 head 未动，每项只读一次，任何一项 pending 就推迟到下一 tick。这套判定在 workflow.mdx 的 merge 一节逐条展开，防竞态，也不丢证据。

**Fail fast，没有静默回退。** 命令出错就记下命令、退出码、stdout、stderr，然后抛出，没有兜底路径，没有把故障吞掉的重试，走不下去的 Issue 标 `ai-blocked` 停给人。对无人值守系统这比自愈重要。自愈失败的痕迹比失败本身难查得多。

**用宪法管住代码结构。** [runner.py](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/src/orbi/runner.py) 被宣布冻结，新行为一律进 sibling 模块；在某个域改满 50 行就必须把那个域抽成独立模块，抽出者禁止反向 import runner；全库只有一个 subprocess 接缝 `run_command`，测试都从这个接缝打桩；新模块过千行就得拆。覆盖率门槛是全库 95% 行与分支、改动行 100%。纯函数模块是标杆，宪法点名 [delivery_labels.py](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/src/orbi/delivery_labels.py) 当范例。

**验收委托给平台。** 测试过没过，看仓库自身 CI 在交付 commit 上的结论，本地不另跑一套。理由写在宪法第 4 条：本地跑道得背上所有语言的工具链，而且本地绿了证明不了仓库声明的检查。merge queue 和 required checks、分支保护这些 GitHub 已有能力一律不重造。

**治理文档分层且带优先级。** CONSTITUTION 管不变量，AGENTS.md 管交付怎么做，docs 管机制细节，冲突时宪法赢；agent 不得顺手修宪，改宪法的 PR 必须说明改了哪条、旧规为何不再成立。文档与代码打架时的规定动作是上报而不是二选一。AGENTS.md 里几乎每条规则都附了引发它的那次失败，Issue 号和日期俱全，包括那张因为写了沙箱够不到的路径、一天内烧掉两个完整周期的票。

## 借鉴清单

**能搬的：**

- 「标签即状态机」的建模：把流程状态外置到平台自带的对象上，省掉队列与数据库，也省掉第二个事实来源，任何 AI 参与的流程都适用
- 三层治理文档加优先级（不变量、操作契约、机制详解），裁决规则写明，每条规则记录引发它的失败，对 agent 协作仓库即插即用
- 合并门的写法：只认评审过的 head，各项检查只读一次，pending 一律推迟到下一 tick
- touch-and-extract：冻结最大的文件，按域抽取，唯一 subprocess 接缝，让巨型模块在正常迭代里被动瘦身
- 失败二分加「worktree 只是缓存」的语义，重试路径说得清楚，恢复就快

**不适用的：**

- 吞吐上限低。单槽串行是宪法级选择，多仓库并行交付得换架构，别在这上面硬拗
- 强绑定 GitHub、gh CLI 和 Pi 执行器，平台委托那套也默认你的 CI 就在 GitHub 上
- AGPL-3.0 会传染，拿它做产品先读它的双许可里 SUL 商业条款
- Python ≥ 3.14 的要求激进，老系统得靠 uv 现配一个
- 8 位贡献者的年轻项目，文档自洽但外部实测反馈少，采用前按此校准期望

## 局限

快照口径：223 stars、28 forks、8 位贡献者，v0.5.x，评估当天 main 仍在推进。macOS 支持官方自己标注未在真机验证过。文档量大而全，但全部出自项目自身的体系，第三方采用者的公开实测不多，31 个 open issue 里藏着什么要自己趟。

## 相关

站内《[2,000 还是 2,500 个 PR？真正值得学的是 agent 信任系统](/sdlc-playbook/articles/agent-trust-system/)》讲同一件事的另一端，并行度是信任系统最后拧大的旋钮，Orbi 选了低并行度高确定性。《[Ralph 循环](/sdlc-playbook/articles/ralph-loop/)》是一段 bash 版的无人值守回路，可作最小对照。上游文档站 [docs.orbi.build](https://docs.orbi.build/)，公开接口清单见 [public-contracts.mdx](https://github.com/orbi-build/orbi/blob/b66c9860f4047428ac0a40cf03d9275b69cc3de8/docs/public-contracts.mdx)。
