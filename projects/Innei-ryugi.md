---
name: Innei-ryugi
title: Ryugi：agent 把选项画出来，人在页面上挑和批
summary: Superpowers 的分叉，给 coding agent 加本地可视化 artifacts：画板选稿、文档批注、验证对照，选择与批注自动流回原会话。
repo: https://github.com/Innei/ryugi
description: 'Ryugi (ryoo-ghee) — artifacts for coding agents: artboards of mockups, design docs, whiteboards, HTML benches and verify reports you comment on, with every comment sent back to the agent.'
stars: 448
forks: 21
contributors: 3
language: JavaScript
languages:
  JavaScript: 43.4
  Shell: 40.7
  Python: 12.4
  TypeScript: 1.9
  HTML: 1.0
avatar: /projects/Innei.png
license: Ryugi-1.0
tags: [claude-code, skills, artifacts, brainstorming, tdd, verification, agent-workflow]
pinned_commit: 2eb9fb6fdabbcca70b659b058e865ebb14ad2b23
evaluated_at: 2026-11-14
related: [superpowers-brainstorming, superpowers-tdd]
---

Ryugi（りゅうぎ，日语「流儀」，一家流派自己的做法）是 Innei 的 coding agent 技能包，从 [obra/superpowers](https://github.com/obra/superpowers) v7.0.0 分叉而来。2026 年 10 月 19 日建仓，评估当天 448 星，26 天发了 78 个版本。它在 superpowers 的头脑风暴与 TDD 技能之外加了一层本地可视化 artifacts：agent 把候选方案画在页面上，人在页面上挑方案、写批注，这些动作不经终端，自动流回发起页面的那个会话。这张卡主张：值得搬的是「审批面在页面、回流进会话」这个闭环和技能与 harness 解耦的写法；artifacts 应用本身闭源，只能当产品用。

## 它解决什么问题

让 agent 出三个方案，得到的是三段文字；让它出设计，得到一面没法用手指点的 Markdown 墙（[README](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/README.md) 开头就是这么写的）。人在文字里反驳文字，几个来回之后往往退回「你直接做吧」。

方案评审真正的载体是画面：几个候选摆在一起，圈出问题，选一个。终端给不了这个载体；Claude Code 自带的 artifacts 在托管侧，agent 会话收不到人的批注。Ryugi 把评审面搬进本地页面，再把页面上的每个动作送回会话。

## 怎么解的

整个包分三层。

`skills/` 是内容层，九个技能分四类：brainstorming 与 artifacts 管前期讨论和产出，executing-specs 与 verifying 管落地和验收，TDD 同 systematic-debugging 管纪律，using-git-worktrees 管工作区；interface-craft 是 UI 初稿与批评的领域技能，[docs/workflow.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/docs/workflow.md) 有一页地图。会话一开始，[using-ryugi](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/skills/using-ryugi/SKILL.md) 作为阶段路由器装进上下文，任务来了按阶段挂技能：要建东西走 brainstorming，规格批了走 executing-specs，报 bug 走 systematic-debugging。它还带一条铁律：说任何东西「完成」之前，先在本会话跑出证明它的命令并读完整输出。

第二层是每个 harness 一份薄适配。`.claude-plugin/plugin.json` 走 Claude Code 插件机制，`.pi/extensions/ryugi.ts` 是 pi 的扩展；README 为十余种 harness 各列了安装入口，antigravity 与 codex 也在其中。技能正文只写动作（invoke a skill、read a file），从不点名具体工具，这是同一份技能在各处原样跑的原因；[docs/porting-to-a-new-harness.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/docs/porting-to-a-new-harness.md) 教的是不变量加「抄最接近的参考实现」，并声明指南与代码冲突时以代码为准、去修指南。

第三层是回流。Claude Code 侧从会话启动（SessionStart）到提交与停止（UserPromptSubmit、Stop）挂了八类钩子（[hooks/hooks.json](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/hooks/hooks.json)）；pi 侧由扩展每秒轮询一次评论（[.pi/extensions/ryugi.ts](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/.pi/extensions/ryugi.ts) 里 `COMMENT_POLL_MS = 1000`），轮询逻辑在 [comment-watch.cjs](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/skills/artifacts/app/comment-watch.cjs)：按项目订阅文件登记的会话收集新批注，生成唤醒消息注入会话，agent 在批注下方回复并当场更新页面。artifacts 应用本体发布在 npm 的 `ryugi-artifacts`，闭源单文件打包，本地一个 server 管全机所有项目的产物。[AGENTS.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/AGENTS.md) 写了分发细节：启动器每天最多查一次版本，按版本装进 `~/.cache/ryugi/artifacts/`，离线时用缓存里最新的兼容版，执行前还校验 CLI 的协议版本。

## 设计亮点

**审批面在页面上，回流不经终端。** 人在页面上挑选、批注，最终下判定，这些动作经订阅文件与轮询回到原会话，不需要人在终端里转述。README 的说法是「In Claude Code it arrives on its own, with no message from you」。页面上有五种产物各管一种评审：artboard 把候选并排画出来选一个；document 把 agent 的问题嵌进文档，逐句批注；whiteboard 双方一起画；HTML 页面用真实滑杆调一个组件或一段动效，滑杆值在 agent 重写页面后保留；verify 把建成的界面放在已批准设计旁边，过或打回。

**技能是 harness 无关的，适配层只做翻译。** 技能写动作不写工具名，每个 harness 一层薄适配翻译成自家机制，内容层零改动。移植指南先讲不变量再给参考实现索引，把「接一个新 harness」这种高风险贡献也流程化了。

**审批之后是一条完整工作流。** brainstorming 在写码前触发，问题进 document、候选上 artboard；规格批准后 executing-specs 把规格切片，逐任务走红绿循环，用一份账本跨 compaction 记录每个判断，整分支再做一次全新评审，最后报告落地方式（默认 squash，永不 merge commit）。verifying 在说「完成」之前触发：命令能判的由 agent 判，逐条附运行证据；需要人眼的外观与动效放到已批准设计旁边，人过或打回（[skills/verifying/SKILL.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/skills/verifying/SKILL.md)）。这个分工与站内《验证工程》一文的主张同构：机器可验证的交给检查，人只判需要人的部分。

**Fork 纪律写成了文档。** git 历史重建、与上游零共享 commit；[UPSTREAM.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/UPSTREAM.md) 钉住 baseline（superpowers v7.0.0，`bb92a77`），给出 diff 移植的命令清单与路径映射，上游变化用 diff 移植，不走 merge。

**Skills Are Code。** [AGENTS.md](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/AGENTS.md) 要求技能文本的修改像改代码一样跑基线：改前跑一遍，改后跑一遍，前后对照留档；没有证据表明变好，就不许动调优过的内容（Red Flags 表、合理化清单这类）。

**集成验收是一句话。** 一个 harness 集成合不合格，开干净会话发「Let's make a react todo list」，brainstorming 在写码前启动、首条回复打开 artboard 才算过。手抄技能文件、做运行时垫片，或者按会话开启，在 AGENTS.md 里都不算集成。

## 借鉴清单

**能搬的：**

- 评论回流闭环：订阅文件加轮询加唤醒消息，把页面上的批注变成会话输入。「人在 UI 上审、agent 在终端干活」的场景都能套这个结构
- 技能正文只写动作、不写工具名的分层，配每个 harness 一层薄适配，以及移植指南「先不变量、再参考实现」的写法
- 会话开始装入阶段路由器的引导模式：技能触发收敛到一个入口，按任务阶段分发
- verify 的两半结构：命令可判的主张逐条附运行证据，判不了的如实列进 Not verified；人眼只看需要人眼的
- 集成验收产品化：一句固定的开场白，应得一个固定的首反应
- Fork 纪律：重建历史，UPSTREAM.md 钉 baseline commit，diff 移植命令开箱即用
- 技能文本当代码管：改动必须带前后基线对照

**不适用的：**

- artifacts 应用闭源（npm license UNLICENSED），画板连同 server 与 viewer 都拿不到源码，自托管改造与实现审计都做不到，只能作为产品依赖
- Ryugi License 1.0 对 [Schedule A](https://github.com/Innei/ryugi/blob/2eb9fb6fdabbcca70b659b058e865ebb14ad2b23/LICENSE) 点名的一批中国平台公司及其产品零授权，并禁止把技能抓进 marketplace；商业环境引入前先过法务，这是作者的个人立场条款
- 完整工作流默认要求 agent 环境里有 Node 与浏览器，纯服务器或无头环境只能装 artifacts-only 子集
- 26 天 78 个版本的节奏由作者全职投入支撑；团队 fork 之后要跟上游，得照抄 UPSTREAM.md 那套纪律，成本不小

## 局限

快照口径：448 stars、21 forks、3 位贡献者，v1.78.0，评估当天仍在发版。核心吸引力（画板与回流）建立在闭源二进制上：技能层可读，体验层是黑盒，仓库里能学的只有协议与启动器。与 superpowers 上游已无法 merge，上游修复要人工 diff 移植，分叉会随时间变宽。pi 扩展 1 秒轮询加八类钩子换来实时感，代价是常驻进程与高频小脚本，启动慢的 harness 要重新权衡。

## 相关

登记卡 [superpowers-brainstorming](/sdlc-playbook/entries/superpowers-brainstorming/) 与 [superpowers-tdd](/sdlc-playbook/entries/superpowers-tdd/) 是它的上游同源技能，本库此前已单独登记。站内文章《[验证工程：如何造出你从不用检查的 AI agent](/sdlc-playbook/articles/verification-engineering/)》的 maker 与 checker 分工、verify report 逐条附证据，与这里的 verifying 技能互证；《[别再给 Agent 写嘱咐了](/sdlc-playbook/articles/harness-five-rules/)》的「检查先于工作」同构。上游仓库 [obra/superpowers](https://github.com/obra/superpowers)。
