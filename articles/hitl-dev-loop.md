---
name: hitl-dev-loop
title: Claude 指挥 Codex：一个人的 Human-in-the-Loop 开发循环
summary: 独立开发者的实操路线：Claude Opus 当主 Agent 拆解派发，Codex 在独立 worktree 里执行验证，低成本 subagent 盯 issue/PR，人只提需求与验收。
date: 2026-10-29
source: https://x.com/lee04052822/status/2111618612158935467
author: lee04052822
tags: [agentic-coding, human-in-the-loop, multi-agent, workflow]
related: [claude-autonomy-scope, superpowers-writing-plans]
---

一位独立开发者把他持续开发个人产品的方法写成了长帖：Claude Opus 做主 Agent，负责理解需求、拆解任务、调度与审查；Codex 在独立 worktree 里改代码、跑验证；低成本的 subagent 盯 GitHub 的 issue 和 PR。人只做两件事——提需求，验收。他的主张是：持续开发的抓手不在模型多聪明，而在循环的结构——仓库文档先写清楚，改动先隔离验证，合并永远留在人手里。帖末附了一份可以直接扔给 Claude 的完整主 Agent 提示词，整套方法后来又沉淀为开源脚本 [hitl-dev-loop](https://github.com/mu-zi-lee/hitl-dev-loop)。两者本文全部收录。

![原文配图：工作流总览](/sdlc-playbook/articles/hitl-dev-loop/loop.jpg)

## 前情：一段引用

作者此前在给 yetone 的 magpie 做插件、提 PR，随后看到 yetone 分享自己如何做持续的 AI 开发。那段话他直接引了过来：「其实我没有任何的魔法，甚至还特别简陋，总觉得分享出来毫无意义。其实我就是用 Claude Code，然后用官方的 Opus 5.5 模型执行 loop 就可以了。我会并行执行图里的 3 个 loop，然后每晚抽一点时间铲铲屎（主要是 UI/UX……）」

作者自评：这个工作流也很正常——提出问题、解决问题、验证问题是否可行。值得写下来的是怎么把这个循环固定住。

## 仓库是地基

工作流成立的前提是初始结构足够好，代码有清晰的层级。他的做法：负责 UI 的放单独一个文件夹，负责功能（Function）的放另一个文件夹下的代码里，互不掺杂。

然后用 Claude 的 initialization 做仓库初始化，让 AI 明确三件事：这个仓库到底是干什么的；它的层级结构是什么；后续要修改或提出新功能时，应该怎么操作。他的类比是：既然人与人合作时需要写清楚怎么贡献、在哪里贡献、需要测试哪些东西，这些同样要让 AI 明确——所以这份文档不是一次性的初始化产物，而是让 AI 持续更新的上下文。

## Human-in-the-loop 的真实含义

作者没有足够的无限量 token，也不把需求外包给外部用户。他自己就是软件的使用者：觉得不合适就提，AI 改完他再试。用他的话说，他用了类似「human in the loop」的方法——是他自己提出需求并进行更改，而不是外界的人一直给他提问题、要他优化哪些部分。

## 写代码之前，先回答为什么做

他以自己的 [tangentry](https://github.com/mu-zi-lee/tangentry)（另有 [B 站演示](https://www.bilibili.com/video/BV13XJe6eEEo/)）为例：写代码之前做了很多工作。第一阶段只回答为什么要做这个软件——只有一个明确的需求，才能思考下一步怎么进行。他常看视频又常忘讲了什么，想把字幕取下来记录，目标四件事：视频获取、字幕提取、翻译总结、记录笔记。

基础组件一律复用成熟项目：[yt-dlp](https://github.com/yt-dlp/yt-dlp) 取源、[Whisper](https://github.com/openai/whisper) 转录、[FFmpeg](https://ffmpeg.org) 处理音视频——已有可复用的资源就没必要再开发。接着质疑想法本身：视频总结工具已经很多，只做视频没有差异化，于是扩展到文章、PDF、博客、RSS，聚合进同一个平台。UI 设计阶段的关注点也不是好不好看，而是用户到底需要一个怎么样的软件。

他的分工原则：实验的产品逻辑和使用体验自己思考，一些技术交给 AI 在后续选型和开发。

## 循环怎么搭起来

思考主力用最高档的 Opus 5.5，再装一个 Codex 桌面端或 CLI，然后对 Claude 说：

> 根据任务需求，自行判断哪些工作适合交给 Codex CLI，并启动 Codex 执行。你负责拆解任务、分配工作、检查执行结果，必要时继续安排后续任务。

这一句话就搭起了类似 loop 的框架。循环可以启动一下就停，也可以放进专门能持续运行的 server 里跑：作者在一台远程 Windows 虚拟机上专门跑 Claude 和 Codex，这台主机就交给这两个 Agent。他在 Windows 上登录 GitHub，把 issue 和 PR 的链接都扔给 Claude，告诉它启动 loop，持续监测——具体任务两条：将相同类型的 issue 进行合并；如果有 PR 解决了 issue 的问题，就将其自动关联。

操作流程：可以用 computer use 操作浏览器；觉得可以开始实施时，把规划交给 Codex，让 Codex 来操作；等 Codex 验证并返回结果后交给人审查，没有问题就继续推进下一个问题。任务侧维护一个列表，一个个勾选，或者维护一个栈、堆之类的结构。

角色分层（模型为作者原帖所称）：

| 角色 | 模型 | 职责 |
|---|---|---|
| 主 Agent | Claude Opus 5.5 | 需求理解、拆解、调度、审查、与人沟通 |
| 执行 Agent | Codex 6.1 Sol / 6 Astra | 代码修改、功能实现、技术验证 |
| 维护 subagent | Sonnet 5.5 | 盯 issue/PR、分类关联、异常汇报 |

subagent 返回结果后，告诉主 Agent 它看到了什么；需要代码合并时，由主 Agent 把任务交给 Codex。结构图是作者按上述说法让 AI 生成的，他看了一下觉得大致差不多；真正的要点是这句话：平衡你的 token 消耗和这个仓库是否值得维护。

![作者让 AI 生成的结构图](/sdlc-playbook/articles/hitl-dev-loop/structure.jpg)

## 日常运转：语音提需求，worktree 里验证

他一边用 tangentry 一边记录不满，把想法用语音输入给 Claude Opus。后者自动搜索相关内容，把上下文和必要的东西交给 Codex；这个进程自己一直检验，直到在新的 worktree 下测试成功，才更新应用。作者觉得不行，就让它在 worktree 里重新修改调整；符合想法之后，才合并进 main 分支。

判断标准很简单：每次它改完就试一下，可以就用，不可以就让它重新试。模型搭配的经验也随之而来：只要你前面用的模型够好，后面用 6.1 Sol 执行是没问题的。用他的话说——反正这样做着很爽。

## 完整的主 Agent 提示词

原帖末尾写道：「如果你更懒的话，你可以直接把下面的提示词扔给 Claude，它大概就会按照我的这个方法来进行了。」十个部分：理解项目、需求分析与质疑、优先复用成熟技术、Agent 分工与调度、标准开发循环、GitHub issue 与 PR 维护、任务队列、token 与上下文管理、交互方式、启动检查。全文如下。

```markdown
# Claude 主 Agent：Human-in-the-Loop 持续开发工作流

你现在是本项目的主 Agent，负责产品分析、架构规划、任务拆解、Agent 调度、质量审查以及持续迭代。

你的主要职责不是亲自完成所有代码，而是作为整个开发流程的协调者，利用 Codex CLI、Subagent、Git Worktree、GitHub Issues 和 Pull Requests 组成一套由人类参与决策的持续开发系统。

我作为项目的使用者和需求提出者，负责体验软件、提出问题、评价结果和决定是否接受修改。

你的目标是减少我在重复开发、测试和项目维护上的人工操作，同时合理控制 Token 消耗，保证项目长期可维护。

## 一、首先理解项目

开始工作前，检查当前仓库，了解：

1. 项目为什么存在，主要解决什么问题。
2. 目标用户是谁，实际使用场景是什么。
3. 当前有哪些功能，哪些功能还没有完成。
4. 使用什么编程语言、框架和技术栈。
5. 仓库的目录层级及不同模块的职责。
6. 已有的依赖、第三方组件、测试和开发文档。
7. Git 状态、现有分支、Worktree，以及 GitHub Issues 和 PR。

优先阅读 README、AGENTS.md、CLAUDE.md、贡献指南和其他已有的项目文档。

如果项目尚未建立完整的开发规范，协助创建并维护必要文档，包括：

- 项目目标与核心需求。
- 代码架构、模块职责及目录规范。
- 功能开发与贡献流程。
- 测试、验证和验收要求。
- 技术选型及重要设计决策。
- 已知问题、待办事项和后续计划。

不要重复创建职责相同的文档。

这些文档不是一次性的初始化产物，而是需要随着项目开发持续维护的上下文。

## 二、需求分析与质疑

当我提出功能、想法或使用体验问题时，不要直接开始编写代码。

先理解我想解决的实际问题，而不是只关注我提出的实现方式。

你需要判断：

1. 这个需求真正解决了什么问题？
2. 是否已经存在相似功能或可复用的实现？
3. 是否有更简单、更合理的交互方式？
4. 会不会引入不必要的复杂度？
5. 与项目现有架构是否兼容？
6. 对其他功能有没有影响？
7. 怎样验证这个功能确实有用？

对于产品设计和 UI，优先关注使用流程、交互逻辑和实际体验，再考虑视觉表现。

如果发现我的想法存在明显问题，可以提出质疑和替代方案，但不要擅自改变核心产品方向。

对于已经足够明确的小型修改，不需要反复讨论，直接推进即可。

## 三、优先复用成熟技术

在计划自行实现某项技术能力之前，优先调查已有的成熟开源项目、库和组件。

例如，涉及音视频功能时，可以评估：

- yt-dlp：音视频来源获取。
- Whisper：语音转录和字幕生成。
- FFmpeg：音视频处理。

以上只是示例，应根据当前项目的具体需求选择技术。

评估复用方案时，应考虑许可证、维护情况、依赖兼容性、运行成本以及集成复杂度。

不要为了实现一个已有成熟解决方案的基础能力而重新造轮子。

产品逻辑、用户体验和差异化功能需要重点设计，成熟的基础设施则尽可能复用。

## 四、Agent 分工与任务调度

使用以下角色分工：

**主 Agent：Claude Opus**

负责需求理解、研究、架构设计、计划制定、任务调度、结果审查以及与我的沟通。

**执行 Agent：Codex CLI**

负责具体代码修改、功能实现、重构、测试、错误修复和必要的技术验证。

**维护 Subagent：较低成本的 Claude 模型**

负责 GitHub Issues 和 PR 的检查、分类、关联、进度追踪、重复问题识别，以及需要向主 Agent 汇报的异常。

实际使用时，根据环境中可用的模型、工具、权限和 Token 预算调整分工，不要假定所有模型或功能都一定可用。

根据任务需求，自行判断哪些工作适合交给 Codex CLI，并启动 Codex 执行。你负责拆解任务、分配工作、检查执行结果，必要时继续安排后续任务。

不要只是生成一段给 Codex 的提示词就停止；当执行环境支持时，应实际调度并跟踪任务直到得到可验证的结果。

## 五、标准开发循环

每次收到一个需求，按以下流程工作。

### Step 1：分析

确认需求目标，阅读相关代码，评估影响范围，并判断是否需要调研。

### Step 2：拆解

将任务拆成可以独立执行和验证的小任务。

为任务记录目标、涉及文件、实现约束、验收条件和进度状态。

### Step 3：实施

将适合编码的任务交给 Codex。

优先使用独立 Git Worktree 和任务分支，避免多个 Agent 同时修改相同工作区。

并行任务之间必须有明确的文件或模块边界。

### Step 4：验证

要求 Codex 根据修改内容运行必要的测试，包括适用的单元测试、集成测试、构建检查和静态分析。

测试失败时，分析原因并安排修复。

不得将未实际运行的测试描述为已经通过。

### Step 5：审查

Codex 完成后，由你审查：

- 是否真正解决了原始问题。
- 是否破坏了已有功能。
- 是否符合项目架构与编码规范。
- 是否引入多余依赖或重复代码。
- 是否有安全、性能或兼容性问题。
- 是否满足事先确定的验收条件。

必要时继续让 Codex 修改，直到通过可执行的验证。

### Step 6：人工验收

当自动验证完成后，向我汇报具体改动、测试结果和需要人工检查的交互。

我会实际使用软件，并通过文字、语音或者截图继续反馈。

如果我认为体验不合适，将新的反馈作为下一轮迭代输入。

不要把自动测试通过视为产品体验已经合格。

### Step 7：合并与记录

验收通过后，整理提交记录、更新相关文档，并准备合并。

未经我的明确授权，不要自动合并到 main、推送破坏性修改、删除重要数据或执行生产环境部署。

## 六、GitHub Issue 与 PR 持续维护

如果当前环境能够访问 GitHub，则安排维护 Subagent 负责：

1. 读取新出现或发生更新的 Issues 和 PR。
2. 识别描述同一问题的重复 Issue，提出合并或关闭建议。
3. 检查 PR 是否解决了已有 Issue，并建立合理的关联。
4. 检查 PR 的 CI 状态、代码冲突及审查意见。
5. 将需要编码解决的问题整理成任务。
6. 把需要主 Agent 决策的事项汇报给你。

可以自动进行有依据的分类、记录和非破坏性关联。

涉及关闭 Issue、合并 PR 或其他有风险的仓库操作时，遵循授权边界。

如果没有持续运行环境或定时调度能力，则在当前会话内完成一次检查，并明确说明持续监测尚未启用，不要假装已经在后台运行。

## 七、任务队列与循环推进

维护一个持久化的任务列表，记录：

- 待分析
- 待实施
- 实施中
- 待验证
- 待人工验收
- 已完成
- 暂时阻塞

每个任务应有唯一标识、优先级、关联 Issue 或 PR、工作分支和简要结果。

你可以使用项目已有的任务系统或结构化文档，不必为了任务队列额外引入复杂基础设施。

当一个任务完成自动验证后，可以继续推进其他已经明确授权、没有依赖冲突的任务。

当任务依赖我的产品判断、涉及关键架构选择或存在高风险时，停止该任务的自动推进并请求决策。

不要为了维持循环而无限重试。同一问题连续失败时，应分析根因、调整方案，必要时标记阻塞。

## 八、Token 与上下文管理

由于计算资源和 Token 并非无限，你需要主动优化使用方式。

遵守以下原则：

1. 简单任务使用成本较低的模型，复杂架构和关键决策使用能力更强的模型。
2. 尽量让 Subagent 只处理明确、独立的工作。
3. 只向 Codex 提供必要上下文、相关文件和验收标准。
4. 避免反复读取整个仓库或重复进行相同研究。
5. 将重要决策、当前任务状态和验证结果写入项目文档，减少对超长会话上下文的依赖。
6. 优先使用可复现的自动测试，而不是反复依靠模型主观判断。
7. 对低价值、重复或收益不明确的任务，避免无意义地消耗资源。

主 Agent 应将主要精力放在问题理解、规划、审查和决策上。

## 九、与我的交互方式

我可能不会使用标准的软件需求格式。

我可能直接说：

“这里不好看。”

“这个功能不太符合我的想法。”

“我想增加一个新的阅读方式。”

“这里好像有 Bug。”

你需要结合当前项目的上下文理解我的真实意图，并主动寻找相关实现。

如果需求明确，就自动进入开发流程；如果存在会显著影响结果的歧义，再向我询问关键问题。

我希望保持 Human-in-the-Loop：

**我负责提出需求、体验产品和最终决策；你负责组织分析、调度开发、验证结果以及持续维护。**

## 十、现在开始

先检查当前项目状态。

向我简要说明：

1. 当前仓库的架构和主要模块。
2. 已有的项目文档和开发规范。
3. 现有的测试及验证能力。
4. Claude、Codex、Subagent、Git Worktree 和 GitHub 工具中哪些实际可用。
5. 为建立上述工作流需要进行的最小改动。

优先复用项目已经存在的机制，避免大规模重构。

完成初始化后，后续所有开发需求都按照这套流程处理。

**最终目标不是实现完全无人监督的自动编程，而是建立一个能不断接受我的反馈、自动完成大量重复开发任务、持续验证质量，同时由我掌握产品方向的开发系统。**
```

七步标准循环（分析 → 拆解 → 实施 → 验证 → 审查 → 人工验收 → 合并与记录）和几条写死的安全线值得先指出来，读原文时对照：未经明确授权，不自动合并 main、不推破坏性修改、不删重要数据、不做生产部署；「不要把自动测试通过视为产品体验已经合格」；「不得将未实际运行的测试描述为已经通过」；同一问题连续失败时分析根因、标记阻塞，不为维持循环而无限重试；没有持续运行环境就明确说明持续监测尚未启用，不假装已经在后台运行。

## 提示词落成脚本：hitl-dev-loop

配套仓库 [hitl-dev-loop](https://github.com/mu-zi-lee/hitl-dev-loop)（MIT，Shell）把这套提示词做成了可安装的 Claude Code 插件与技能。v0.2 起有一句关键转向：**可靠性由调度脚本保证，而不是靠提示词**——任务有持久化状态和锁；反馈送达有确认；「完成」由调度器独立判定并验证；集成和构建都有绑定到 commit SHA 的门禁；每一步都有超时、熔断和预算。

仓库里有什么：

| 路径 | 说明 |
|---|---|
| `skills/hitl-dev-loop/SKILL.md` | Claude 遵循的流程：首次接入、需求分析、派发、审查、集成、授权边界、任务队列、Token 管理 |
| `skills/hitl-dev-loop/scripts/` | 调度脚本（兼容 macOS 自带的 bash 3.2） |
| `scripts/adapters/codex.sh` | Codex CLI 适配器（`exec --json --output-schema`），实现同样的接口即可接入其他编码 Agent |
| `templates/` | `AGENTS.md`、`CLAUDE.md`、`TASKS.md`、`DECISIONS.md`、共用规则、任务说明模板、报告 JSON Schema |
| `agents/repo-maintainer.md` | 低成本、只读的子 Agent：整理 GitHub Issue / PR，汇报需要决策的事项 |
| `PROTOCOL.md` | 与具体工具无关的协议：角色、产物、报告格式、状态机、完成规则、门禁、适配器接口 |
| `tests/` | 用模拟 Codex 的自动化测试（21 个场景），CI 在 ubuntu 和 macOS 上运行 |

工作原理，README 给了一张全景：

```text
你提需求/反馈 ──▶ Claude 分析、写任务说明 ──▶ dispatch.sh
                                              │
          ┌───────────────────────────────────┘
          ▼
   drive.sh（调度器）每一轮：
     送达反馈(pending→inflight) → 运行 Agent（超时/熔断/预算）
     → 读取结构化报告 → 报告 done？
         ├─ 没有真实改动 / 超出范围 → 反馈给 Agent，继续
         └─ 调度器提交 → 运行 AGENT_VERIFY_CMD（绑定 SHA）
               ├─ 失败 → 日志反馈给 Agent，继续（有上限）
               └─ 通过 → verified
          │
          ▼
   Claude 审查 diff → review.sh approve（绑定 SHA）
          ▼
   integrate.sh：在专用集成 worktree 合并 → 再验证 → 失败自动回滚
          ▼
   ship.sh：只构建已验证的集成 SHA → alert.sh 叫你验收
```

脚本一览：

| 脚本 | 作用 |
|---|---|
| `init.sh` | 每个仓库运行一次（可重复运行）：创建 `.agent-loop/`、共用规则、集成分支，检查 Agent 是否可用 |
| `new-task.sh <名称> [--scope 'glob'] [--network] [--base 引用]` | 创建 worktree、分支、任务状态和任务说明；默认**不开网络** |
| `dispatch.sh <名称> [--detach]` | 检查任务说明、Agent 可用性、并发上限、文件重叠，然后开始/继续运行 |
| `drive.sh <名称>` | 调度循环本身（dispatch 会调用） |
| `feedback.sh <名称> "文字"` | 给任务追加反馈；只有在一轮成功后才确认送达，失败会重发 |
| `verify.sh <名称>` | 调度器自己在任务 worktree 里运行 `AGENT_VERIFY_CMD`，结果绑定当前 commit |
| `review.sh <名称> approve\|changes "说明"` | 记录审查结论（绑定 SHA）；`changes` 会转成反馈 |
| `integrate.sh <名称>` | 门禁检查后在集成 worktree 合并，再验证，失败回滚；冲突时停下并说明 |
| `ship.sh` | 只构建/安装已验证的集成 SHA（运行 `AGENT_SHIP_CMD`） |
| `status.sh [--json\|--markdown\|--sync TASKS.md]` | 所有任务的状态、轮数、token、验证、审查、待送达反馈；能识别进程已死的「stalled」任务 |
| `report.sh <名称>` | 单个任务的 Markdown 报告（改动文件、Agent 报告、验证日志） |
| `conflicts.sh [名称]` | 检测任务之间的文件重叠，并用 `git merge-tree` 预测与集成分支的冲突 |
| `stop.sh <名称>` | 停止任务（整个进程树），保留已改内容和未送达的反馈 |
| `alert.sh "消息"` | 重复提示音直到你点停止（macOS 需在沙箱外运行；Linux 用 notify-send） |

行为开关集中在 `.agent-loop/config.sh`（自动加入 git 忽略）：

| 变量 | 默认 | 作用 |
|---|---|---|
| `AGENT_VERIFY_CMD` | 空 | 调度器独立运行的完整验证；不设置时任务停在 `needs-review` |
| `AGENT_SHIP_CMD` | 空 | 构建并安装产品以便验收（在集成 worktree 中运行，可用 `$SHIP_SHA`） |
| `AGENT_COMMITS` | `scheduler` | 由调度器提交（Agent 无法写 git 元数据）；设为 `agent` 则由 Agent 自己提交 |
| `DEFAULT_NETWORK` | `0` | 新任务的网络权限；单个任务用 `--network` 开启 |
| `MAX_PARALLEL` / `MAX_ROUNDS` | 3 / 15 | 并行任务数 / 每次运行的最大轮数 |
| `MAX_FAILS` / `MAX_VERIFY_FAILS` | 3 / 3 | 连续 Agent 失败 / 验证失败的熔断阈值 |
| `ROUND_TIMEOUT` / `VERIFY_TIMEOUT` | 3600 | 单轮 / 单次验证的超时（秒） |
| `TASK_TIME_BUDGET` / `TOKEN_BUDGET` | 0 | 每个任务的总时长 / token 预算，0 为不限 |
| `CODEX_BIN`、`CODEX_WRITABLE_DIRS`、`CODEX_EXTRA_ARGS` | 自动 | Codex 路径、额外可写目录（构建缓存）、额外参数 |
| `INTEGRATION_BRANCH` | `codex/integration` | 集成分支 |

README 单列了一节「内置的经验」，全部来自真实项目踩坑，部分与 Codex CLI 版本有关（codex-cli 0.162 实测，升级后值得重新验证）：

| 现象 | 对策 |
|---|---|
| `codex exec` 经常只汇报一句进度就结束 | 调度循环自动续跑，完成由调度器判定 |
| 只要 stdin 没关，`codex exec` 就会一直等输入；非交互 bash 里后台任务的 stdin 会被换成 `/dev/null` | 脚本显式处理两种情况 |
| 失败的启动也会先发出 `thread.started` | 同时看退出码和 `turn.failed`，只保存成功启动的会话 |
| 当时版本的 Codex goal 功能会因模型给自己设极小的 token 预算而卡住，`exec fork` 还会继承 | 不依赖它 |
| Codex 沙箱常常写不了 worktree 的 git 索引 | 默认改为调度器提交 |
| Agent 曾在主仓库的 `.git/config` 里写入 `core.worktree`，导致主目录里所有 git 命令都作用到另一个目录 | 调度器每轮之后检查并复原共享配置、提醒 Agent；`dispatch.sh` 遇到已被改坏的配置会拒绝启动；仓库根目录改由 `--git-common-dir` 推算，不受它影响 |
| 每改一点就跑全量测试会让任务跑一两个小时 | Agent 只跑相关测试，全量验证由调度器在提交后跑一次 |
| 同时跑太多 Agent 会让每个都变慢 | 并发上限 + 文件重叠检测 |
| 笼统的「暂时不可用」浪费轮次 | 让代码把状态码、内容类型、最终网址、脱敏片段显示出来 |
| macOS 沙箱里 `afplay` 执行成功但没有声音 | `alert.sh` 要在沙箱外运行 |

### 安装与使用

依赖：Claude Code、Codex CLI（或 Codex 桌面端自带的 CLI）、git ≥ 2.31、bash、python3（或 jq）；可选 `gh`（GitHub 维护）、git ≥ 2.38（冲突预测）。

作为插件安装（技能 + 子 Agent）：

```text
/plugin marketplace add mu-zi-lee/hitl-dev-loop
/plugin install hitl-dev-loop@hitl-dev-loop
```

或者只复制技能：

```bash
git clone https://github.com/mu-zi-lee/hitl-dev-loop
cp -r hitl-dev-loop/skills/hitl-dev-loop ~/.claude/skills/
cp hitl-dev-loop/PROTOCOL.md ~/.claude/skills/hitl-dev-loop/   # 复制安装时 PROTOCOL.md 放在技能旁边
cp hitl-dev-loop/agents/repo-maintainer.md ~/.claude/agents/   # 可选
```

装好后在项目里启动 Claude Code，直接说：

> 用 hitl-dev-loop 的方式开发这个项目。先检查项目状态，告诉我需要做哪些最小改动。

Claude 会先汇报情况，等人同意后再建立 `AGENTS.md`、`CLAUDE.md`、任务队列和决策记录，运行 `init.sh`，并在 `.agent-loop/config.sh` 里配置验证命令。之后只要描述问题（「这个页面太窄了」「打开是白屏」+ 截图），Claude 就写任务说明、派发、审查、集成，做完叫人来试。

也可以脱离对话手动用：

```bash
S=~/.claude/skills/hitl-dev-loop/scripts
$S/init.sh
echo "AGENT_VERIFY_CMD='make test'" >> .agent-loop/config.sh
$S/new-task.sh reader-fonts --scope 'src/reader/*'
$EDITOR .agent-loop/briefs/reader-fonts.md
$S/dispatch.sh reader-fonts --detach
$S/feedback.sh reader-fonts "正文在 1280px 宽度下溢出"
$S/status.sh
$S/report.sh reader-fonts
$S/review.sh reader-fonts approve
$S/integrate.sh reader-fonts
$S/ship.sh && $S/alert.sh "可以验收了"
```

开发与测试：`tests/run.sh` 跑全部 21 个场景（模拟 Codex，不需要网络和 API）；`shellcheck -S warning` 覆盖全部脚本。

## 他在哪一步都不撒手

回看整条链：仓库文档先行、需求先质疑再动工、改动锁在 worktree、验证绑定 commit、审查后人工验收、合并要明确授权——原帖与脚本说的是同一件事，也正是提示词结尾那句加粗的话：**最终目标不是实现完全无人监督的自动编程，而是建立一个能不断接受反馈、自动完成大量重复开发任务、持续验证质量，同时由人掌握产品方向的开发系统。**循环转得再快，提出问题和决定合并的始终是同一个人。
