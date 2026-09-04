---
name: interfaces-review
title: interface-review 与 break（interfaces）
summary: 按变更范围审查界面（回归三态归类），把组件渲染到每种可达状态做压力测试。
category: verify
kind: skill
origin: external
provider: interfaces@interfaces（jakubkrehel/skills 自带 marketplace）
asset: interface-review / break
upstream: https://github.com/jakubkrehel/skills
release_source: plugin
pairs_with:
  - interfaces-better
agents:
  - Claude Code
  - Codex
evaluated_version: "1.6.3"
evaluated_at: "2026-09-04"
updated_at: "2026-09-04"
---

## 何时用

界面改动要落地之前用。`interface-review` 审查的是**这次变更**而不是整个代码库：解析范围（分支领先量优先于工作树、PR、指定区间），把改动文件扩展到受影响的界面（默认一跳，token 与共享原语两跳，至多五个消费方），读 diff 的删除侧找回归，每条发现标注 Introduced / Regression / Pre-existing 三态，只对前两态给出 Block / Approve 结论。`break` 则把单个组件渲染到一张临时页的每种可达状态（长文本、零项、加载、窄容器、禁用），一次看尽并标注哪里破了。

不适用：正确性、测试、安全属于项目代码审查；整个仓库的界面审计是 `better-interface` 的仓库级模式，不是变更审查；没有浏览器时 `break` 退化为把 URL 交给人工查看。

## 这一版怎么样（1.6.3）

- 范围纪律是它最值钱的部分：干净树上无变更时，它列出事实与可选项后停下等用户，绝不自作主张去审 `HEAD~1`；工作树检查排在 merge-base 之后，一行格式化改动不会遮蔽十二个提交的分支。
- 回归三态配合 `git blame` 对基线确认，老问题不算到这次变更头上；Pre-existing 最多报三条且不计入结论——防止变更审查顺手变成全库审计。
- 只读纪律：审 PR 用 `git fetch` 拿 ref，绝不 checkout，不碰作者打开着的工作树。
- `break` 的场景从组件实际接受的 props 推断，不套万能清单；「看一次」预算写死（build, look once, report），无浏览器时明确把人眼当观察者。
- 两个技能都设了 `disable-model-invocation`，只能用户调用，不会在后台偷偷触发。
- 依赖注意：`interface-review` 把严重度、条数上限与结论交给 `better-interface` 裁决，单装它而缺 `better-interface` 时会停下并指名缺什么。与 `registry/interfaces-better.md` 配套安装。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把界面变更审查技能装进本项目，要求：

1. 确保本项目可使用 interfaces 插件的 interface-review 与 break 技能
   （需要连同 better-interface，前者把裁决交给它）。
   - Claude Code：先 /plugin marketplace add jakubkrehel/skills，
     再 /plugin install interfaces@interfaces
   - 其他 agent：运行 npx skills add jakubkrehel/skills（skills.sh 安装器），
     或把 https://github.com/jakubkrehel/skills 仓库的 skills/ 目录整体复制到
     本项目 .agents/skills/（多文件技能，不能只拷单个 SKILL.md）

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Interface change review

- Before landing a UI change, run interface-review on it (user-invoked): it
  resolves the change scope, expands the blast radius, classifies findings as
  Introduced / Regression / Pre-existing, and ends with Block or Approve.
- Pre-existing findings are capped at three and never affect the verdict.
- Use break to render a single component in every reachable state on a
  throwaway page before calling it done.
- Do NOT use these for whole-repository audits (better-interface repository
  scope) or for correctness / test / security review (project code review).

3. 完成后列出你改动或新增的文件。
````

确认方式：删掉某个图标按钮的 `aria-label` 后跑 interface-review，检查它把这条标为 Regression 而非 Introduced 且结论为 Block；再在干净分支上直接调用它，检查它是停下来询问审什么，而不是自作主张去审最后一个提交。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`，对应 plugin.json 的 version 字段）。上游无 releases 页，版本随 main 分支提交演进：插件方式安装的由 Claude Code 插件机制管理，`npx skills add` 安装的重跑同一命令即更新。评估基线提交：267330e1ad（2026-08-29）。

评估历史：1.6.3（2026-09-04）
