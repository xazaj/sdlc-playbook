---
name: improve-animations
title: 动效审计与修复计划（improve-animations）
summary: Emil Kowalski 的动效顾问技能：按八类目录审计全库动效（缓动、时长、可中断性、性能、可访问性），产出带精确数值的自包含修复计划，不改源码。
category: design
kind: skill
invoke: install
origin: external
provider: emilkowalski
asset: improve-animations
upstream: https://github.com/emilkowalski/skills
license: MIT
pairs_with:
  - frontend-design
agents:
  - Claude Code
  - Codex
  - Cursor
release_source: git
evaluated_version: "d16ebe60"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

产品的动效被嫌「廉价、卡顿、黏糊」，或要系统性地审计全库动画与交互代码：错误的缓动让下拉迟钝、高频操作不该有动画、动画不可中断、缺 reduced-motion。判据是要「按杠杆排序的动效问题清单与修复路线图」，而不是评审一个 diff（那是上游同仓库的 review-animations）。

不适用：单个动效的即时调整（直接改更快）；没有动效预算认知的纯静态页面；性能问题独大时（它是审计入口，深挖性能要走专项）。与 frontend-design 是上下游关系：frontend-design 生成新界面，这个审计与修复存量界面的动效。

## 这一版怎么样（d16ebe60）

评估基于读过的 SKILL.md 全文（上游 42k stars，作者 Emil Kowalski 是 sonner/toast 作者与 Vercel 动效课讲师——动效领域个人权威性几乎最高）：

- 八类审计目录来自作者自己的动效哲学（AUDIT.md 承载精确数值规则）：目的与频率、缓动与时长、物理性与 transform-origin、可中断性、性能、可访问性、一致性与 token、错失的机会。频率地图的设计很独到——每天命中 100+ 次的交互（命令面板、快捷键）与一年一次的动效严重度不同。
- 与 shadcn/improve 同构的纪律：read-only 硬规则、计划为最弱执行者写（精确 cubic-bezier、精确时长、精确文件路径，绝不写「用上面讨论的缓动」）、发现表带 file:line 证据、stop-and-wait 让用户选择。
- 诚实边界写得好：「动效手感无法只从代码判断」时，计划里放 feel-check 步骤（慢放、逐帧、真机手势）而不是猜；「这里的动效已经是对的」是合法审计结论。

待验证（本卡未实测）：AUDIT.md 的数值规则在真实 React/Vue 混合库的适用性；execute 变体的 worktree 隔离执行。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话：

````text
请让 improve-animations（Emil Kowalski 的动效顾问技能）在本项目可用，按 1→5 顺序做完再继续别的事：

1. 【检测】检查两个级别：
   - 用户级：~/.claude/skills/improve-animations/
   - 项目级：.claude/skills/improve-animations/、.agents/skills/improve-animations/
   结论写清装没装、版本从哪个文件读到。上游无 release、SKILL.md 无
   version 字段，读不到安装记录就如实说，不要猜。

2. 【对版本】已安装时：查
   https://github.com/emilkowalski/skills/commits/main 最新 commit 与本地
   记录比较；读不到就如实说明；落后就更新后重新确认。

3. 【安装】未安装时：从上游取 skills/improve-animations/ 整目录（含
   AUDIT.md 与 PLAN-TEMPLATE.md，缺了它们审计就没了数值标准）放入
   .claude/skills/improve-animations/。会 npx 的环境可用
   npx skills add https://github.com/emilkowalski/skills --skill improve-animations
   （附注）。

4. 【加载确认】确认本会话可用（触发描述在技能列表里）。不可见时不要
   装作可用，告知激活方式（通常重开会话），停下等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## Motion advisor (improve-animations)

- Use improve-animations to audit and plan motion/animation work across
  the codebase; it is read-only and writes only under plans/.
- Do NOT use it to review a single animation diff (use direct review)
  or to implement fixes; it must decline direct-fix requests.
- Plans carry exact values (cubic-bezier, duration, spring config) from
  AUDIT.md; executors must not approximate them.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：对一个用了 `ease-in` 下拉与 `transition: all` 的仓库裸调用它。装对了它先扫动效表面（框架、动效库、token、频率地图），给按严重度分级的发现表——高频交互上的错误缓动是 HIGH、营销页长动画可能被判可接受——并等你选择，而不是直接改代码。

## 版本

上游以 git 管理（无 release），当前版本查询：<https://github.com/emilkowalski/skills/commits/main>。

评估历史：d16ebe60（2026-09-30）
