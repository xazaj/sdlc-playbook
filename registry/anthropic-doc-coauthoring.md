---
name: anthropic-doc-coauthoring
title: doc-coauthoring（example-skills）
summary: 三阶段协作写文档：收集上下文、逐节精炼、用一个无上下文的子代理当第一个读者。
category: define
kind: skill
origin: marketplace
provider: example-skills@anthropic-agent-skills
asset: example-skills:doc-coauthoring
upstream: https://github.com/anthropics/skills
release_source: plugin
pairs_with:
  - ears-syntax
agents:
  - Claude Code
evaluated_version: "53048666b05b"
evaluated_at: "2026-09-03"
updated_at: "2026-09-03"
---

## 何时用

`stages/15-define/DECIDE.md` 判定为产品级 PRD 且多涉众时，用它协作产出。三个阶段：**收集上下文**（元问题 + 随意倾倒 + 5-10 个编号澄清问题）、**逐节精炼**（每节先问澄清、头脑风暴 5-20 个选项、按编号裁剪、落稿、外科手术式修改）、**读者测试**（拿一份只含文档本身的子代理当第一个读者，问它预判的读者问题，查歧义、假设与矛盾）。

第三阶段是本机十一个需求类 agent 都没有的能力，专治「作者以为写清楚了」——作者与协作者共享语境，看不出盲区。

不适用：单人小改动（三阶段流程过重）；内容已谈妥只差排版；纯代码产出。

## 这一版怎么样（53048666b05b）

- 裁剪机制要求用户对取舍给一句理由（「删 6，读者已经知道」），agent 据此逐节学习作者偏好，后面的章节越写越准。
- 完成度到 80% 时强制全文复检：跨节流程一致性、冗余、矛盾、"slop"（套话）逐项过。
- 读者测试在 Claude Code 下全自动（子代理），无子代理的环境退化为手动流程——prompt 任何 agent 都能执行，全自动路径需要子代理能力。
- 触发词覆盖 PRD、design doc、decision doc、RFC；它会在合适的时机主动提议工作流，用户可拒绝转自由写作。
- 配 `registry/ears-syntax.md` 使用：条目句式由 EARS 约束，结构与过程由它管。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 doc-coauthoring 工作流装进本项目，要求：

1. 确保本项目能使用 example-skills 的 doc-coauthoring 技能。
   - Claude Code：运行 /plugin install example-skills@anthropic-agent-skills
   - 其他 agent：从 https://github.com/anthropics/skills/tree/main/example-skills/doc-coauthoring
     取 SKILL.md，放到本项目 .agents/skills/doc-coauthoring/SKILL.md

2. 在本项目 AGENTS.md（没有则创建）追加下面这一节。若已存在同名小节则整节替换，不要重复追加：

## Document co-authoring

- For substantial documents (PRDs, specs, decision docs, RFCs), offer
  the doc-coauthoring three-stage workflow: context gathering,
  section-by-section refinement, and reader testing with a context-free
  sub-agent as the first reader.
- Ask clarifying questions in numbered batches so they can be answered
  in shorthand.
- Do NOT force the workflow on quick notes, commit messages, or docs
  whose content is already agreed.

3. 完成后列出你改动或新增的文件。
````

确认方式：对 agent 说「帮我写一份 PRD」，观察它是否先问文档类型、读者与期望影响，而不是直接开写；草稿完成后是否用无上下文的子代理做读者测试。

## 版本

本库不记录上游当前版本号，只记录本卡评估所基于的版本（见 frontmatter 的 `evaluated_version`，为安装时的 commit 短 SHA）。上游当前版本由 Claude Code 的插件机制管理，本机实际版本按下面方式查询：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print(d['plugins'].get('example-skills@anthropic-agent-skills'))"
```

上游仓库：https://github.com/anthropics/skills

评估历史：53048666b05b（2026-09-03）
