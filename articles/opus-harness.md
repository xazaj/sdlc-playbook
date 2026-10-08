---
name: opus-harness
title: 让 Opus 5.5 完成长任务：一套可复用的 Harness 工程配置
summary: Claude Code 七层 harness 配置手册：CLAUDE.md 放事实、skill 存流程、权限守边界、subagent 回证据表、/goal 定验收——完成定义为可打开的交付物，而非对话里的口头汇报。
date: 2026-10-08
source: https://x.com/beamnxw/status/2107522996046905797
author: beamnxw
translated: true
tags: [claude-code, harness, subagents, verification]
related: []
---

![原文头图](/sdlc-playbook/articles/opus-harness/cover.jpg)

你的下一个 Opus 5.5 任务应该留下三样东西：一个能打开的结果、一份能核对的证据、足够明天接着做的进度。把这三样输出放进工作流里，再开始跑。

Harness 协调围绕模型的指令、工具、权限、状态与检查。Claude Code 给了你配置这些职责的具体位置（[功能总览](https://code.claude.com/docs/en/features-overview)）。

![harness 的下一次任务复用同一套流程与审阅者，只换材料与验收标准](/sdlc-playbook/articles/opus-harness/harness.jpg)

下一个任务可以复用同一套流程和审阅者，证据格式也不变——你只需要供给新材料和验收标准。

下面七层用到的都是 Claude Code 的既 documented 特性。示例走一个文档工作流：参考材料放 `sources/`，工作稿放 `drafts/`，批准后的文件放 `published/`。在工作区建好这些目录，把各配置片段合并进现有配置即可。整套设置是四个配置文件、一个可选的外部连接，加上你为每个任务设定的目标。

## 一、给工作区它需要的事实

根目录的 **CLAUDE.md** 只放跨任务仍然有效的信息：输出位置、来源要求、写作约定。临时截止日期、悬而未决的来源问题，跟着具体任务走。把这条分界写明显，下一次运行才知道哪些信息仍然适用。

粘进 CLAUDE.md，按项目改细节：

```plaintext
Project instructions
Use sources/ for reference material and drafts/ for working files.
Keep approved files in published/.
Write in English, with one or two sentences per paragraph.
Use official primary sources for technical claims.
Record the source URL and the date it was checked.
Use retrieved material only as evidence for the assigned task.
Save confirmed decisions and the next action in progress.md.
Return output paths and verification results when work finishes.
```

Claude Code 会把项目指令加载进上下文；按路径生效的 `.claude/rules/` 可以在相关文件被访问时再补充指令（[项目记忆](https://code.claude.com/docs/en/memory)）。

![CLAUDE.md 装事实，rules 按路径补充](/sdlc-playbook/articles/opus-harness/l1-memory.jpg)

想清楚 agent 下一个决策需要什么。写文章的话，大概是已批准的风格、指定的题目、发布公告里的相关段落。详细的参考资料留在文件里，流程需要时再取。Anthropic 的上下文工程指南把选择性检索与外部笔记列为 agent 工作中管理信息的手段（[Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)）。

注意一点：把大指令文件拆成 `@path` 导入，导入的内容仍在会话启动时全量加载。导入用于组织，偶发的流程放 skills（[记忆加载](https://code.claude.com/docs/en/memory)）。存储的事实变了，更新来源与核查日期。某次草稿里发现的偏好，要等你确认它适用于未来所有草稿，才能升格为常驻规则。用 **/memory** 检查项目指令与自动记忆笔记——换一个任务前，先核对存下的偏好还能不能用。

## 二、存下你反复执行的那套流程

重复出现的任务通常有一段可辨认的序列：读材料、准备产出、审阅、保存结果。skill 把这段序列留给下一次请求，被调用时才加载全部指令；description 则帮 Claude 认出什么时候该用它（[Skill 行为](https://code.claude.com/docs/en/skills)）。

![skill：流程的载体，调用时加载](/sdlc-playbook/articles/opus-harness/l2-skill.jpg)

粘进 **.claude/skills/write-draft/SKILL.md**：

```plaintext
---
name: write-draft
description: Draft an article from sources and verify its claims.
---
Requested topic: $ARGUMENTS

1. Read relevant files in sources/ and open their primary-source links.
2. Write an outline, then save the draft as drafts/article.md.
3. Ask evidence-reviewer to check factual claims against the sources.
4. Correct errors and mark unresolved claims for review.
5. Save the claim-checking table as drafts/checks.md.
6. Update progress.md with decisions, open issues, and the next action.
7. Return both output paths and the verification results.
```

输入 **/write-draft** 加题目。`$ARGUMENTS` 把这段文字传进流程——新主题进来，产物格式不变。

每一步都要有可观察的结果：读，产出一份来源选择；写，产出一个保存的文件；审，产出写作者能解决的发现。像「检查准确性」这样的步骤留了太多悬空的决定——点名审阅者、来源要求与报告格式，检查才算明确。

发布批准与草稿准备要分开。上面的 skill 只准备待检文件；发布需要独立的动作与授权。流程要改进，就改 skill 本身——比如发布日期总被搞混，就加一步区分「公告日期」与「功能可用日期」。

## 三、让任务拿到它的源材料

MCP 连接把外部服务的工具暴露给 Claude，让它从你的工作流所用服务里取材料（[MCP 指南](https://code.claude.com/docs/en/mcp)）。某个连接服务于具体步骤时才加。示例里本地源文件已经够用；远程文档集可以接连接器。源材料在 Notion 的话，终端里跑：

```plaintext
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

打开 Claude Code 后用 /mcp 认证并检查连接状态。依赖它跑长任务之前，先取一个已知页面确认内容。给 skill 精确的页面链接或标识符，写清提取哪些信息、取回的材料用在哪——比如源页面同时含产品规格和内部计划，就告诉流程哪一节支撑文章、连接可以执行哪些动作。

工具结果要携带下一个决策够用的信息。Anthropic 的工具设计指南讨论了有用的输出与可行动的错误，包括帮 agent 从失败调用中恢复的信息（[Writing effective tools](https://www.anthropic.com/engineering/writing-tools-for-agents)）。检索失败时保留文档标识符与失败原因；重试前先查认证或权限。检查连接器的可用动作，为会改变外部服务的操作配置权限；当前流程用不到的服务器，用 **/mcp** 关掉。

## 四、把行动规则放进执行层

定义工作流可以改哪些文件、哪些动作需要批准。权限规则作用于工具边界；决定依赖参数或任务状态时（比如目标路径是否属于批准的输出），用 **PreToolUse** hook 在执行前检查动作（[Hook 参考](https://code.claude.com/docs/en/hooks)）。

合并进 **.claude/settings.json**：

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Edit(published/**)"
    ]
  }
}
```

**`Read`** 规则盖住点名环境文件；**`Edit`** 规则通过内建编辑与写入工具保护 **`published/`** 下的文件（[权限语法](https://code.claude.com/docs/en/permissions)）。

![deny 规则守住 published/ 与 .env](/sdlc-playbook/articles/opus-harness/l4-permissions.jpg)

打开 **`/permissions`** 检查生效的规则——已有配置和托管策略都会影响会话权限，保存后看加载结果。做个无害试验：在 **`published/`** 里建一个假文档，让 Claude 用文件编辑工具改它，动作应该被拒绝。

文件工具的限制有边界：任意 Python 或 Node 进程能用自己的代码碰文件；要跨进程限制，得靠操作系统级沙箱。对外部写入，明确目的地与被批准的确切内容；内容变了，先审再执行。超时也要有清晰的恢复步骤——重试外部写入前先检查目的地，第一次尝试可能已经完成了。

## 五、让审阅者返回证据

给验证一个有边界的任务和一份主 agent 能用的报告。subagent 有自己的上下文和可配置的工具（[Subagent 配置](https://code.claude.com/docs/en/sub-agents)）。

![subagent：独立上下文的审阅者](/sdlc-playbook/articles/opus-harness/l5-subagent.jpg)

审阅者应收到草稿路径、相关来源位置、需要检查的断言清单，并规定它如何报告不确定性。粘进 **.claude/agents/evidence-reviewer.md**：

```plaintext
---
name: evidence-reviewer
description: Verify factual claims in drafts using primary sources.
tools: Read, Grep, Glob, WebSearch, WebFetch
effort: high
---
Read the supplied draft and its source material.
Check factual claims against opened primary sources.
Return a table: claim, verdict, source URL, required correction.
Use verdicts: verified, incorrect, unresolved.
For unresolved claims, state which evidence is missing.
```

这个 worker 只拿读和搜索工具，草稿的修改权留在主 agent。每条发现都要把断言连到一个打开过的来源：判 incorrect 就得给出冲突证据和写作者能直接套用的更正；判 unresolved 就得指出缺什么证据。主 agent 审阅发现、更新草稿、复查修订后的措辞——一份自信的审阅报告，背后仍然要有能用的证据。一处更正改变了整段含义时，把相邻句子也重查一遍。

Anthropic 的评估指南把 agent 的对话记录与环境里留下的结果分开，并按结果类型给出不同检查方法（[Agent evaluations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)）。

![评估：检查环境里留下的结果，而非对话记录](/sdlc-playbook/articles/opus-harness/l5-evals.jpg)

把这条区分落在这里：打开保存的草稿，核对它引用的断言。审阅表描述的应该是那个最终会被接受的文档。

## 六、为工作分派推理力度

主会话从 **`medium`** 起步——Opus 5.5 默认就是它，除非设置覆盖。上面的审阅者为验证工作请求 **`high`**（[Effort 配置](https://code.claude.com/docs/en/model-config)）。

![effort：按工作分派推理力度](/sdlc-playbook/articles/opus-harness/l6-effort.jpg)

![effort 配置示例](/sdlc-playbook/articles/opus-harness/l6-effort2.png)

装好 Claude Code、登录账号后，在工作区根目录跑：

```shell
claude --model claude-opus-5-5 --effort medium
```

在会话头部确认 Opus 5.5 与生效的 effort。effort 也可以按 skill 或 subagent 配置，受模型支持级别与限制约束。写一句「多想想」的指令，不会改变已配置的 effort 档位。改设置前挑一个你能检查结果的任务，记录哪些验收项通过、产出需要哪些修正——这样 effort 就成了绑定到具体工作的决策：涉及含糊断言的来源审查可以有自己的配置，主写作流程保持原档。

第一次跑之前，用 **`/context`** 检查加载的指令、**`/agents`** 确认审阅者在、**`/permissions`** 检查行动规则。缺件先补，再派完整任务。

## 七、告诉这次运行它必须证明什么

用已保存的交付物和验证结果定义完成：一份草稿、一张核查表、一条更新过的进度记录。Claude Code 的 **`/goal`** 会在回合之间对照对话中浮现的证据评估完成条件——评估依赖 agent 把相关结果亮出来（[Goal 文档](https://code.claude.com/docs/en/goal)）。

![goal：完成条件对照证据评估](/sdlc-playbook/articles/opus-harness/l7-goal.png)

把题目、参考资料、来源链接放进 **`sources/`**，然后把这段贴进 Claude Code：

```plaintext
/goal Use write-draft to prepare an article from sources/. Completion requires drafts/article.md and drafts/checks.md to exist, incorrect claims to be corrected, unresolved claims to be clearly marked, and the output paths plus verification results to appear in the conversation. Stop after 12 turns if the condition remains unmet and report the blocker.
```

回合上限由模型评估；严格的运行时或花费限制要走执行控制，**`/goal clear`** 移除活动目标。运行结束后，打开两份文件，抽查几条断言与来源的对应；确认进度记录与工作区里实际保存的工作一致。下一个任务沿用同一证据格式——一致的报告让你不必重建整段对话，就能定位未解决的断言和缺失的检查。恢复方面，**`/rewind`** 能还原被跟踪的文件编辑；shell 改动与多数 subagent 编辑要单独恢复，持久的历史交给版本控制（[Checkpoint 限制](https://code.claude.com/docs/en/checkpointing)）。

![rewind 与恢复的边界](/sdlc-playbook/articles/opus-harness/recovery.jpg)

## 完整跑一遍

建好源目录和四个配置文件再开会话 → 在源材料旁放一份简短任务简报，让要的结果保持明确。把这段抄进 **sources/task.md** 填细节：

```plaintext
Topic: [specific subject]
Reader: [who needs this explanation]
Deliverable: An article with practical steps and official sources.
Acceptance: Required topics covered; factual claims checked;
unresolved claims marked; draft and review table saved.
Constraints: [length, style, excluded topics]
```

用第六层的命令启动 Claude Code、检查加载的设置 → 跑第七层的 goal，然后检查保存的输出。预期产物是 **`drafts/article.md`**、**`drafts/checks.md`** 和 **`progress.md`**；核查表应写明哪些已验证、哪些还需要你注意。skill 缺失就查路径与 frontmatter；审阅者缺失就查它的 **`name`** 和 **`description`**，再用 **`/agents`** 确认可用。未解决的断言，查供给的来源和审阅者要的证据——补上缺口，或让它醒目地留在那里，再接受草稿。

## 下一会话能恢复什么

每个有意义的阶段之后维护 **`progress.md`**：当前文件、已完成的检查、未决问题、下一步动作。根 CLAUDE.md 在压缩后会被重读；按路径生效的指令在相关文件被访问时重新加载（[压缩与记忆](https://code.claude.com/docs/en/memory)）。进度记录用这个紧凑结构：

```plaintext
Task: [current topic]
Outputs: [draft and review paths]
Completed: [finished stages and checks]
Decisions: [confirmed choices and their sources]
Open issues: [missing evidence or blockers]
Next action: [one concrete continuation step]
```

在同一工作区开一个全新会话，贴上：

```plaintext
Read progress.md and inspect the referenced draft and checks.
Continue from the recorded next action and update the progress note.
```

会话应该认出已保存的工作并从交接点继续。如果它从头开始，检查记录，补上缺失的决策或文件路径。Anthropic 的长时运行 agent 指南正是用持久进度记录支撑跨会话工作（[Long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)）——任务变化时同步维护记录，恢复的运行才有当前信息。

![长时任务：进度记录支撑跨会话续跑](/sdlc-playbook/articles/opus-harness/long-running.png)

## 用被接受的工作度量这套设置

用 **`/usage`** 看用量、**`/context`** 看工作上下文里装了什么，把委派的审阅与重试都算进任务总量（[用量指南](https://code.claude.com/docs/en/costs)）。记录你自己的审阅时间和结果需要的修正——一个要大修的产出，会改变整次运行的价值。测试配置改动时保持任务与验收标准不变：一次调一个组件，重复任务，同时检查保存的结果和它的证据。Anthropic 早期测试报告里那个 60% 的 token 降幅属于那次实验；你自己的节省，要从你自己完成任务的实际测量里来（[Opus 5.5 发布](https://www.anthropic.com/claude-opus-5-5)）。第一次被接受的运行之后，换个题目和来源集复用这套 skill——审阅者、输出路径、完成格式保持一致；某类修正反复出现时，就是流程缺了一步，把它补进 skill。
