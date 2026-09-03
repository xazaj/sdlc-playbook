---
name: su-architecture-first
title: 架构优先预检（su-architecture-first）
summary: 动手改代码前先定位真实目标、归属层与事实源，确定变更类型与验证证据。
category: build
kind: skill
origin: external
provider: doublesq97-ui
asset: su-architecture-first
upstream: https://github.com/doublesq97-ui/su-architecture-first
install_path: ~/.claude/skills/su-architecture-first
license: MIT
pairs_with:
  - superpowers-tdd
agents:
  - Codex
  - Claude Code
release_source: git
evaluated_version: "5af8727"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/30-coding/DECIDE.md` 的信号表命中以下任一条时，先跑它的预检，再回来选 TDD、SDD 或直接实现：同一问题反复出现；补丁与变通方案不断堆积；两个入口对同一事实说法不一致；不清楚该由哪一层负责；改动跨层或涉及数据、权限、迁移等高风险。

它回答「改什么、在哪层改、属于哪种变更类型、凭什么算改对了」。流程选型（怎么写）仍由 DECIDE.md 决定，两者不互替。判定走 TDD 时，它动手前定义的回归证据正好作为 `superpowers-tdd` 红绿循环的输入，因此登记为搭配使用。

不适用：目标与归属都明确的局部小改动——技能自身规定此类只走 quick pass，不必展开分析；任务级技术选型比较（SKILL.md 明文声明不替代）；也不要借它画全系统架构图，主文件禁止在决策不需要时扩大表示。

## 这一版怎么样（5af8727）

已通读 SKILL.md、README 与全部五个 references 后的结论：

- 自包含且克制。运行时核心是纯 Markdown 加相对链接，无脚本、无 MCP、无绝对路径、无厂商专属依赖；references（层模型、结构诊断、变更分类、回归设计、AI 工作台）按条件加载，主文件只写加载条件不塞正文。为 Codex 附带 `agents/openai.yaml` 接口配置，任何支持文件式技能的客户端用同一目录即可。
- 决策序列完整且可检查：真实目标 → 检查既有系统与事实源 → 归属层与根因 → 变更分类 → 动手前定义验收与回归证据。变更分 delete/refactor/implement/hide/copy/UI 六类，各带证据要求与依赖顺序；quick/full 两档深度按风险伸缩，并明确「预检不是新的审批环节」。
- 反 agent 模式的条款写得实：反复失败默认按结构问题处理直到证据反驳；加逻辑前先查可删项，删除永远需要证据且不得越出用户授权范围；「更强修复」测试要求让坏状态不可能发生，而不是靠提示词约束。
- 需要压住的点：触发面很宽——请求含「架构」必触发，反复失败、补丁堆积、归属不明、跨层高风险也会自动激活。直接装进项目后，agent 可能在明确的小改动上也展开结构分析。安装 prompt 通过 AGENTS.md 边界压住：小改动只走 quick pass。
- 上游没有 release 与 tag，版本只能靠 commit 锚定（见「版本」）。评估当日 main 仍有新提交，内容处于活跃变动期，结论随版本需要重看。
- 未在实际编码任务中端到端运行过。以上是文本级评估，运行行为待验证。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 su-architecture-first 技能装进本项目，要求：

1. 确保本项目可使用 su-architecture-first 技能：从
   https://github.com/doublesq97-ui/su-architecture-first 获取完整技能目录，
   SKILL.md、agents/、references/ 必须保持在一起，放入本项目 agent 可发现的
   技能目录（Codex 用 .agents/skills/su-architecture-first/，Claude Code 用
   .claude/skills/su-architecture-first/，其余 agent 用其等价目录）。若已存在
   同名技能目录则更新为最新内容，不要装第二份。

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则
   整节替换，不要重复追加：

## Architecture-first preflight

- Before any engineering change, run the smallest sufficient preflight:
  confirm the real goal, the owning layer, the source of truth, and the
  change class; define acceptance or regression evidence before mutating
  code.
- Quick pass for clear local changes; reserve the full pass for recurring
  failures, cross-layer changes, conflicting sources of truth, or high-risk
  work (data, permissions, migrations, user flows).
- This is a decision preflight. It does not replace task-specific
  technology comparison, and it must not expand into a full system map
  when the current decision does not require one.

3. 完成后列出你改动或新增的文件。
````

确认方式：先给 agent 一个反复出现、此前修过但仍复现的 bug，看它是否先产出「目标 → 相关结构 → 归属与根因 → 变更类型 → 下一步 → 验证」的推理链，并解释上一次修复为何没除根，然后再动手；再让它改一处明确的小文案，看它是否简短确认后直接实现。两者都符合即装对了。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`）。上游没有 release 与 tag，当前内容由 git 管理：`main` 分支即最新，查询用仓库的 commits 页或 `git ls-remote`。重新评估时以当时 main 的 HEAD commit 为锚点。

评估历史：5af8727（2026-09-03）
