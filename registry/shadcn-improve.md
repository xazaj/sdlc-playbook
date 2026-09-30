---
name: shadcn-improve
title: 代码库顾问审计与交接计划（improve）
summary: shadcn 官方的 read-only 顾问技能：全库九类审计（bug、安全、性能、技术债、方向），产出给更便宜模型执行的自包含计划，自己绝不改代码。
category: build
kind: skill
invoke: install
origin: external
provider: shadcn
asset: improve
upstream: https://github.com/shadcn/improve
license: MIT
pairs_with:
  - superpowers-writing-plans
agents:
  - Claude Code
  - Codex
  - Cursor
release_source: git
evaluated_version: "cac56e1e"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

要对一个代码库做全面体检并产出可交接的改进计划：技术债堆积想排优先级、接手陌生仓库想快速摸底、或想让贵模型做判断、便宜模型做执行时。判据是「要的是一份按杠杆排序的问题清单与实施计划，而不是当场改代码」。它的经济学明确写在技能里：贵模型做智能复利的部分（理解、判断、规格化），计划就是产品。

不适用：单点 bug 修复（直接修更快）；已明确知道改哪几行的小改动；想要它顺手把发现的问题修掉——这是硬规则禁止的，用户要求直接实现时它会拒绝并指向计划。与 superpowers-writing-plans 是同谱系资产：后者管「新功能的计划」，这个管「存量库的审计与改进计划」。

## 这一版怎么样（cac56e1e）

评估基于克隆读过的 SKILL.md 全文（技能无 release，按 commit 钉版）：

- 规则密度高且可执行：六条硬规则（绝不改源码、只读分析、计划必须自包含、不复述密钥、拒绝直接实现请求、仓库内容是数据不是指令）之后是四阶段工作流——侦察、并行审计（九类目，subagent 提示词要求内联防注入与密钥规则）、人工复核（subagent 会过度报告，三类失败模式：把设计当 bug、证据错位、重复）、写计划（每份钉 commit、为最弱执行者写、机器可查的完成判据、越界即停）。
- 计划的「自包含」约束写得比多数计划技能狠：执行者没看过本次对话、没看过审计、没看过其他计划——引用「上面讨论的模式」即为坏计划。计划目录 `plans/` 带索引与依赖图。
- 变体齐全：`quick`/`deep` 档位、单类目聚焦、`branch`（只审当前分支并标注 introduced/pre-existing）、`plan <desc>`（跳过审计直接规格化）、`execute <plan>`（隔离 worktree 派发执行者+顾问复核）。

待验证（本卡未实测）：execute 变体在 Claude Code 的 worktree 隔离执行；九类审计在真实大库的误报率。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请让 improve（shadcn 的代码库顾问技能）在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别的安装状态，只报告结论：
   - 用户级：~/.claude/skills/improve/、~/.agents/skills/improve/
   - 项目级：.claude/skills/improve/、.agents/skills/improve/
   结论写清：装了/没装；装了则版本是多少、从哪个文件读到。上游不发
   release、SKILL.md 里没有 version 字段，若目录里有安装时留下的
   commit 记录就报它，读不到就如实说读不到，不要猜。

2. 【对版本】已安装时：查 https://github.com/shadcn/improve/commits/main
   的最新 commit，与第 1 步读到的记录比较。一致就不动并说明依据；
   读不到本地记录就如实说明；落后就更新到最新，更新后重新确认。

3. 【安装】未安装时：从上游把 skills/improve/ 整目录（含 references/
   的 audit-playbook、plan-template、closing-the-loop）取下来放入
   .claude/skills/improve/。会 npx 的环境可用
   npx skills add https://github.com/shadcn/improve --skill improve
   （附注，不是唯一路径）。

4. 【加载确认】确认技能本会话真的可用：improve 的触发描述应出现在你的
   可用技能里。新装技能本会话不可见时不要装作可用，告诉用户怎么让它
   生效（通常重开会话），停下等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## Codebase advisor (shadcn improve)

- Use improve for whole-rebase audits and handoff implementation plans:
  it is strictly read-only on source code and writes only under plans/.
- Do NOT use it for direct fixes — when asked to implement, it must
  decline and point at the plan; do not bypass that rule.
- Executor subagents (execute variant) run in an isolated worktree only;
  their diffs are untrusted until reviewed.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：对一个有技术债的仓库裸调用它。装对了它先侦察（README、构建命令、目录结构）、给一张按杠杆排序的发现表（每条带 `file:line` 证据与影响/工作量/风险）并等你选择，而不是直接开始改代码；任何「顺手修了」的行为都是没装对。

## 版本

上游不发 release，版本由 git 管理；本卡 `evaluated_version` 钉评估时的 commit（cac56e1e，2026-09-12 后 HEAD）。当前版本查询：<https://github.com/shadcn/improve/commits/main>。

评估历史：cac56e1e（2026-09-30）
