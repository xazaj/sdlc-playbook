---
name: harness-five-rules
title: 别再给 Agent 写嘱咐了：Harness Engineering 的五条实战规则
summary: 每次纠正 agent 都沉淀为一条确定性检查，别再往 AGENTS.md 里添行：Harness Engineering 五条落地规则。
date: 2026-11-13
source: https://github.com/xazaj/sdlc-playbook/blob/main/articles/harness-five-rules.md
tags: [harness-engineering, agents, lint, verification, agentic-coding]
related: []
---

![题图：左侧是标题与五条规则预览；右侧一张 AGENTS.md 虚线卡片（建议性 · 可能被忽略）经蓝色箭头「沉淀为确定性检查」，落到 lint · 类型 · 测试的实线卡片（确定性 · 必然执行）](/sdlc-playbook/articles/harness-five-rules/cover.svg)

你可能遇到过这种情况：Claude Code 或 Codex 又在组件里直接 `import axios`，没有用项目封装好的 `http` 客户端。这已经是你第三次纠正它。你叹口气，在 `CLAUDE.md` 里补了一行："所有网络请求必须使用 `@/lib/http`。"

过了一周，同样的问题又出现了。

一位 AI 编程专家在访谈里说过一句话，正好对应这个场景：

> 每次纠正你的 agent 时，都把它变成一个确定性检查，而不是在 agents.md 中再加一行。足够多地这样做。

这句话背后有一套正在成形的方法论，2026 年业界把它叫作 **Harness Engineering**（驾驭工程）。这个说法一般认为最早来自 Mitchell Hashimoto。今年 2 月 OpenAI 发文介绍 Codex 团队的做法，4 月 Thoughtworks 技术雷达和 Martin Fowler 网站先后跟进，这个词就传开了。它关注的问题是：**模型的输出是概率性的，怎样在它外面搭一套确定性的环境，让结果变得可信。**

下面分五条规则讲。每条都附有可以直接照做的办法。

---

## 先讲一个底层框架：引导和传感

Thoughtworks 的 Birgitta Böckeler 在 Martin Fowler 网站上发表了《Harness engineering for coding agent users》，给出了一个很好用的分类。

Agent 的外部控制手段分成两类。**Guides（引导）** 是前馈控制，在 agent 动手之前给它方向，例如规范文档、代码模板、skills。**Sensors（传感）** 是反馈控制，在 agent 动手之后检查结果，例如测试、lint、代码评审。

两类手段又各自分成两种执行方式。**Computational（计算型）** 由 CPU 执行，结果确定，速度快，比如类型检查、linter、结构测试。**Inferential（推理型）** 由 LLM 判断，比如 AI 评审或评估 agent。

![引导与传感 × 计算型与推理型的四象限：计算型引导是代码模板；推理型引导是 AGENTS.md、规范文档、skills，只是建议、可能被忽略；计算型传感是类型检查、linter、结构测试，每次执行、结果非黑即白；推理型传感是 AI 代码评审、评估 agent。蓝色箭头从推理型引导指向计算型传感：五条规则的方向](/sdlc-playbook/articles/harness-five-rules/guides-sensors.svg)

照这个框架看，在 `AGENTS.md` 里加一行，等于加了一条推理型引导：模型可能照做，也可能忘掉。写一条 lint 规则，等于加了一条计算型传感：每次都会执行，结果非黑即白。下面五条规则，基本都是在把控制手段往计算型传感这边挪。

---

## 规则一：先清理代码库，因为代码本身就是提示词

很多人以为 agent 主要听提示词的，其实它更多是在**模仿仓库里已有的代码**。

agentpatterns.ai 把这个现象叫作 **Pattern Replication Risk（模式复制风险）**。agent 检索上下文时，排序看的是相似度，不看代码质量。离当前任务最近的实现会最先被找到，哪怕上面写着 `// TODO: 待删除`，排名也不会降。你在提示词里要求"用新 API"，仓库里却有二十处旧调用，提示词通常会输。

更麻烦的是复利效应。agent 每生成一处旧写法，这段代码就会变成下一次检索的上下文，问题越积越多。这类债务被称为 **shadow tech debt（影子技术债）**。

所以第一步是给 agent 准备干净的参考样本：

- **为每类常见任务明确一条 golden path（黄金路径）**，比如一个标准的 API handler、一个标准的表单组件。把它放在 agent 最容易找到的位置。
- **删掉坏样本，而不是给它加注释。** 有位作者说得很直接：解决办法不是再加一份规则文件，而是把坏例子删掉。
- **重构前先写 characterization test（特征测试）**，把现有行为固定住，再让 agent 动手改。不然你没法判断它是在重构，还是在悄悄改业务逻辑。

这里有一个现实问题：老项目全部清理一遍可能要好几个月，等清理完，引入 agent 带来的效率提升也被消耗掉了。比较务实的做法是**让规则只覆盖新文件**，或者在迁移期间只约束很窄的范围。另外，针对遗留 Java 项目的指南也提醒过：在老系统里，一致性本身就是一种安全保障。如果一次只能清理一半，宁可先把旧约定写清楚，也别让 agent 东一处西一处地引入新写法。

---

## 规则二：少写 AGENTS.md，把纠错变成 Lint、类型和架构规则

这一条有研究支撑。

ICLR 2026 收录了 Gloaguen 等人的论文《Evaluating AGENTS.md》（arXiv:2602.11988）。他们在多个 agent 和模型上测试，发现**加上仓库级上下文文件后，任务成功率普遍下降，推理成本上升 20% 以上**。agent 确实会遵守文件里的指令，但这些指令让它多探索、多测试，任务反而变难了。上下文文件也没有起到代码地图的作用，agent 找到相关文件的步数并没有减少。作者的建议是：人写的上下文文件只保留最少、最关键的要求。

要注意，这是目前唯一的系统性研究，还没有独立复现。但它和很多人的使用体验是吻合的：`CLAUDE.md` 写到三百行，agent 并没有变得更听话。

那纠正过的内容应该放到哪里？开源项目 Plinth 给出了一个**纠正升级阶梯**：

| 同一问题第几次出现 | 处理方式 | 约束力 |
|---|---|---|
| 第 2 次 | `AGENTS.md` 加一行 | 只是建议，agent 可能忽略 |
| 第 3 次 | 写进 AI reviewer 的评审规则 | 只提示，不阻断 |
| 问题重要 | 写测试或 lint 规则，并**确认它在旧代码上会失败** | 阻断合并 |

可选的确定性手段，按可靠程度从高到低排列：类型系统（例如用 branded type 区分 `UserId` 和 `OrderId`）、自定义 lint 规则（ESLint、oxlint、ast-grep、semgrep）、架构测试、Git hook 和 CI。

OpenAI Codex 团队的做法值得参考。他们规定业务代码只能沿着 `Types → Config → Repo → Service → Runtime → UI` 单向依赖，由自定义 linter 强制执行。这些 linter 本身也是 Codex 写的。关键在于，**lint 的报错信息直接写明怎么修**：

```
✗ Direct axios import is forbidden.
  Use `http` from '@/lib/http' (adds auth headers + retry).
  See docs/http.md
```

这条信息只在 agent 违规时出现，平时不占上下文，出现时 agent 一定能看到。有人把这种做法叫作"按需投递的提示词"。

Factory 补充了两个细节：

- **新规则先设为 warning**，把误报调干净之后再升级为 error。
- `AGENTS.md` 里只写规则背后的原因和示例，每一条对应一个 RuleID，具体执行交给 linter。

两个常见的坑也要提前防住。第一，**agent 会想办法绕过检查**，比如加 `eslint-disable`、改成 `any`、删掉失败的测试。这些行为本身也要写规则拦截，并且禁止 agent 使用 `git commit --no-verify`。第二，**不是每次纠正都值得写成规则**，只有反复出现、在不同任务里都成立的问题才值得。否则规则会越积越碎，误报多了，人和 agent 都会开始想办法绕过它。

如果你用的是 Claude Code，可以试试 codemyrules 这个插件。它会扫描你的 `CLAUDE.md` 和 ADR，找出其中可以改写成 lint 规则的条目，生成规则和对应的测试，再把文档里已经被规则覆盖的部分删掉。

---

## 规则三：给 Agent 足够的工具，让它能自己运行、检查和验证

agent 写完代码说"完成了"，它是怎么知道的？很多时候它并不知道，只是推测应该没问题。

OpenAI 那篇文章里有个提法叫 **agent legibility**：代码库要优先让 agent 看得懂。他们为此做了几件事：

- 把 **Chrome DevTools 接进 agent 运行时**，并提供 DOM 快照、截图、页面导航相关的 skills。Codex 可以自己复现 bug，然后修复、重启、再验证，一直循环。
- 让应用**在每个 git worktree 里都能独立启动**。每个任务配一套隔离的可观测性环境，日志、指标、调用链都可以用 LogQL 和 PromQL 查询。
- 这样一来，"启动要在 800ms 以内"这种要求就变成了 agent 能自己测量的指标。

Thoughtworks 技术雷达把这类工具叫作 **feedback sensors（反馈传感器）**，并强调一个时机要求：**检查要在编码过程中运行，commit 之前就要通过**，不能等到 CI 才发现问题。SSW 的指南解释了原因：没有这种 **backpressure（反压）** 时，人是唯一的验证者，验证成本随任务规模线性增长，你能放心委派给 agent 的任务大小也就被卡住了。

在 Claude Code 里，最简单的起步方式是加一个 Stop hook，让 agent 在宣布完成之前必须通过检查。Evil Martians 给出的配置是：

```json
{
  "hooks": {
    "Stop": [{ "hooks": [{ "type": "command",
      "command": "./node_modules/.bin/nano-staged --unstaged --quiet --bail || exit 2" }] }]
  }
}
```

命令以 `exit 2` 退出时，Claude 不能结束本轮，必须回去修。`--quiet` 用来节省 token，`--bail` 遇到第一个错误就停止。无人值守运行时还要加一层保护：在脚本里读取 stdin 中的 `stop_hook_active` 字段，如果已经是 `true` 就只报告不阻断，否则 agent 可能陷入死循环。

---

## 规则四：修复要拿证据，不能只看小作文

"已修复登录页的布局问题，所有测试均已通过，代码遵循了项目规范。"

这段话写得再清楚，也只是 agent 的**自述**。你是信它，还是自己打开浏览器检查一遍？

越来越多的团队把证据要求写进了流程。开源项目 Nixre 在 `AGENTS.md` 里规定：UI 改动要附截图，多步骤功能要附短视频，纯后端改动要贴真实的命令输出，无法采集证据时要明确说明。工具方面，ProofShot 可以录制浏览器会话、截图、收集报错，并打包成可以直接贴进 PR 的 `SUMMARY.md`。Argos 指出 GitHub 没有让 agent 往 PR 上传截图的 API，于是采用先把媒体文件放到分支上、开 PR 时再一起发布的办法。Argos 还有一个观察：一段录屏通常比五张截图更有说服力。

不过证据本身也要辨别。Clipy 在自己的文档里说得很坦白：录屏展示的是 agent 观察到的内容，Clipy 并不独立证明这个结论成立。用截图拼出来的演示应该如实标注，不能当成连续录屏。也有人提醒证据要精简，二十张截图堆在 PR 里，没人会认真看。

所以更稳妥的做法是：**证据尽量由 harness 生成，而不是由 agent 自己提供**。Playwright 的 trace、CI 产出的截图对比、视觉回归报告，这些都是流程自动产生的，agent 很难伪造。判断标准很简单：这份证据离 agent 的叙述越远，越可信。

---

## 规则五：把更多 Token 花在自动化测试和形式化验证上

用 agent 之后，写代码的成本几乎降到了零，验证变成了真正的瓶颈。token 预算也应该跟着调整：花在验证上的应该比花在生成上的多。

可以按强度分几个层次投入。

**第一层是普通测试，但要防止测试本身有问题。** SSW 提醒过，agent 自己写测试时，可能写出永远会通过的"偷懒测试"。对策是测试先于实现写好，或者用 **mutation testing（变异测试）** 检查测试的质量：故意往代码里注入错误，看测试能不能发现。发现不了，说明这组测试没有真正起作用。

**第二层是 property-based testing（基于属性的测试）。** 不再列举具体用例，而是描述必须始终成立的性质，比如"序列化再反序列化后结果不变"，然后让框架自动生成成千上万个输入去验证。这种活很费 token，但正适合交给 agent。

**第三层是形式化验证。** Martin Kleppmann 在 2025 年 12 月写过一篇预测：AI 会让形式化验证进入主流。他的原话大意是，比起让人去 review AI 写的代码，他更希望 AI 直接证明这段代码是正确的。学术界今年进展很快：Berkeley 的 Vero 让 agent 在 43 个多模块 Lean 4 项目上写实现并完成证明；AxDafny 用"生成、检查、修复"的循环自动产出 Dafny 代码和证明。

这一层的坑也最深。MIT 有一篇学位论文用可验证奖励训练模型写 Dafny，通过率从 2.2% 提高到 58.1%，但作者同时发现**模型会钻规格写得太弱的空子**。AxDafny 的论文也发现，通过验证的代码仍然可能因为效率太低，在实际约束下跑不过。Kleppmann 自己也说，难点会转移到**规格（spec）怎么写对**上。

这其实说明了人在这套体系里的新位置：**你负责定义"什么算对"，agent 负责证明它做到了。**

![验证强度三级阶梯：01 普通测试（测试先于实现写好、mutation testing 防偷懒测试）、02 基于属性的测试（描述必须恒成立的性质、自动生成海量输入）、03 形式化验证（Lean 4 / Dafny 生成实现并完成证明），token 投入与验证强度逐级递增；人负责定义什么算对，agent 负责证明它做到了](/sdlc-playbook/articles/harness-five-rules/verification-ladder.svg)

---

## 从明天开始

不需要一次全部做完。按下面的顺序，一周就能看到效果：

1. 打开你的 `CLAUDE.md` 或 `AGENTS.md`，逐条问：这条能不能写成检查？能写的就改成 lint 规则或测试，然后删掉原文。目标是控制在几十行以内。
2. 配一个 Stop hook，把 typecheck、lint、test 串起来，记得加上防死循环的逻辑。
3. 挑一个 agent 最常模仿错的模块，删掉坏样本，留一份 golden path。
4. 以后每次纠正 agent，都让它补一条规则或测试，并要求它证明：这条检查在修复前的代码上会失败，在修复后的代码上会通过。
5. UI 相关的 PR 必须附带由流程自动生成的截图或 trace，不再只看 agent 写的总结。

这样坚持一段时间，你会发现自己花在纠正 agent 上的时间越来越少，花在设计约束上的时间越来越多。你每做一次纠正，都会变成以后所有 agent 都要遵守的约束。

---

## 参考资料

- [Gloaguen et al., Evaluating AGENTS.md (arXiv:2602.11988, ICLR 2026)](https://arxiv.org/abs/2602.11988)
- [Birgitta Böckeler, Harness engineering for coding agent users（martinfowler.com）](https://www.martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [Thoughtworks Technology Radar: Feedback sensors for coding agents](https://www.thoughtworks.com/en-ca/radar/techniques/feedback-sensors-for-coding-agents)
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering) ・ [二手摘要（zenml）](https://zenml.io/llmops-database/harness-engineering-building-software-where-humans-steer-and-agents-execute)
- [SSW: Utilize back pressure for agents](https://www.ssw.com.au/rules/utilize-back-pressure-for-agents)
- [Pattern Replication Risk（agentpatterns.ai）](https://agentpatterns.ai/patterns/anti-patterns/pattern-replication-risk/) ・ [AI Coding Agents on Legacy Codebases](https://tianpan.co/blog/2026-04-19-ai-coding-agents-brownfield-legacy-code)
- [Plinth PR #672：纠正升级阶梯](https://github.com/coolbress/plinth/pull/672)
- [Factory: Using Linters to Direct Agents](https://factory.com/news/using-linters-to-direct-agents)
- [codemyrules](https://github.com/clirimajeti/codemyrules)
- [Evil Martians: Stop writing rules in AGENTS.md](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead)
- [Nixre：agent 须附截图与视频](https://github.com/Akicou/Nixre/pull/24) ・ [ProofShot](https://github.com/AmElmo/proofshot) ・ [Argos: Agents, show your work](https://argos-ci.com/blog/agents-show-their-work) ・ [Clipy: AI Agent Proof of Work](https://clipy.online/blogs/ai-agent-proof-of-work/) ・ [Keep PR proof concise](https://github.com/jk05/agent-workbench/pull/7)
- [Martin Kleppmann: AI will make formal verification go mainstream](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html)
- [Vero（Berkeley RDI）](https://rdi.berkeley.edu/blog/vero) ・ [AxDafny（arXiv:2606.32007）](https://arxiv.org/abs/2606.32007)
