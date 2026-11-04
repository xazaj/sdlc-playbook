---
name: Balanov-uncut
title: uncut：837 行 Go 的无损 agent harness，截断变报错、半截答案不出 stdout
summary: 极简 agent harness 的反向样本：不压缩不截断，历史每次全量发送，provider 截断就退出码 3。脚本与 CI 的底座，不是省 token 的方案。
repo: https://github.com/Balanov/uncut
description: The lossless, headless coding agent harness. One 7 MB static binary, four tools, plain stdin/stdout, no silent cuts.
stars: 599
forks: 14
contributors: 1
language: Go
languages:
  Go: 69.7
  Python: 30.3
avatar: /projects/Balanov.png
license: MIT
tags: [agent-harness, minimalism, lossless, cli, go, ci]
pinned_commit: 0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063
evaluated_at: 2026-11-04
updated_at: 2026-11-04
related: []
---

uncut 是一个 headless coding agent harness：单个 7 MB Go 静态二进制，四个工具，纯 stdin/stdout，实现代码不含测试恰好 837 行，go.mod 里零第三方依赖——这两个数字我都本地克隆后数过。这张卡主张的读法：它的价值不在功能多寡，而在把「harness 会不会偷偷动我的上下文」从一个信任问题变成了可测试的契约。截断、压缩、静默转码，全被翻译成退出码和错误消息；契约本身还带一个不需要 API key 的证明脚本。想理解一个 agent loop 的最小完备形态，这 837 行是现成教材。

## 它解决什么问题

主流 coding agent 在 harness 层做上下文管理：压缩历史、截断工具输出、摘要旧对话。这买到长任务的续航，代价是模型实际看到的内容与用户以为的不一致，截断是静默的，半截答案被当成成功交付。管道和 CI 里这个代价最疼：脚本无法区分「完整结论」和「被砍了一半的结论」。

uncut 把立场写进名字：传输层一字不动，放不下就显式失败。作者在 [Show HN 草稿](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/docs/show-hn.md)里的说法是，把模型与 shell 之间这层做到小到可读、可预测到可自动化。它的目标场景因此是 shell 管道（`git diff | uncut "Review this diff"`）、CI 作业、容器、本地模型实验（直连 Ollama），以及被 fork 去当别人自动化里的 agent loop。

## 怎么解的

三层结构，一眼读完：

- [cmd/uncut/main.go](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/cmd/uncut/main.go)：flag 解析、stdin 并入 prompt（[readPrompt](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/cmd/uncut/main.go#L154-L170)）、AGENTS.md 全文注入系统提示、错误到退出码的映射。
- internal/harness 四个文件：[run.go](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/run.go) 的 agent loop 不到 80 行（调 provider、查 finish_reason、执行工具调用、循环或收束）；[provider.go](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/provider.go) 80 行实现 OpenAI-compatible Chat Completions 单协议；[tools.go](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go) 的四个工具与 workspace 路径检查；[session.go](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/session.go) 的 append-only JSONL 会话。
- [bench/proof.py](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/bench/proof.py)：284 行确定性证明脚本，起本地 loopback HTTP provider 驱动真实二进制。

没有的的东西同样是设计：无 TUI、无 MCP、无 subagent、无插件系统、无 telemetry、无自动重试、无上下文压缩。

## 设计亮点

**截断是失败语义，不是功能承诺。** [run.go L71-L73](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/run.go#L71-L73)：provider 返回 `finish_reason=length` 或 `max_tokens` 时直接返回错误，错误文案写着 no partial answer is accepted；[main.go L138-L144](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/cmd/uncut/main.go#L138-L144) 把它映射成退出码 3，stdout 零字节。步数耗尽是退出码 4。CI 里检查 `$?` 就能拦住半截答案，不需要解析输出。

**历史每次全量发送，且契约写给模型看。** 每步把完整消息历史深拷贝后整体发给 provider（[run.go L52-L55](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/run.go#L52-L55)），harness 不持有任何上下文预算状态。工具的 description 里明写 The result is never truncated（[tools.go L167](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go#L167)）——模型和用户读到的是同一条承诺，契约没有两套版本。

**非法字节拒绝，不猜转码。** 七个入口全部显式拒绝非 UTF-8：读文件（[tools.go L87-L89](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go#L87-L89)）、写文件、命令输出（[L154-L156](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go#L154-L156)，错误文案 refusing to replace bytes silently）、provider 响应、session 记录、AGENTS.md、stdin。这不是洁癖：[BENCHMARKS.md](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/BENCHMARKS.md) 记录了真实案例，Windows `findstr` 输出被拒后，模型自己换 `type` 重试成功。错误是信息，转码才丢信息。

**replace 单处精确匹配。** [tools.go L125-L128](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go#L125-L128)：old 出现次数不等于 1 就报错，绝不动手。模糊匹配导致的错改被结构性排除，代价是模型必须先读文件确认唯一性。

**会话每步落盘，坏记录宁可起不来。** 每条消息 append 后立即 Sync（[session.go L79-L84](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/session.go#L79-L84)），崩溃后 resume 从 JSONL 逐行重放；遇到残缺或非法记录直接报错 refusing to ignore a partial or invalid record（[L52-L55](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/session.go#L52-L55)），不悄悄丢弃以求能启动。

**契约自带证明，基准自带边界。** proof.py 校验的是 provider 实际收到的字节——442,400 字节文件与 213,018 字节命令输出全量到达、session 精确恢复、截断正确报错——而不是最终文本对不对。BENCHMARKS.md 全程限定：这些是本地观测不是排名，transport 测试不是模型质量测试；给 Pi 的对比数据旁边明说 Pi 提供的功能多得多。营销话术和可复现测量之间的界线划得少见地干净。

## 借鉴清单

**能搬的：**

- 截断即失败的退出码设计：把「输出可能不完整」从不可见事件变成脚本可判定的 `$?`，任何往管道里塞 LLM 的 CLI 都适用
- 把契约写进工具 description：模型与用户看同一份 never truncated 承诺，不存在只给人看的保证
- 非法字节显式拒绝而非静默转码：错误信息让调用方（包括模型自己）能纠正，替换字符才是丢数据
- replace 的单处匹配约束：零匹配或多匹配即失败，用结构排除错改，比在提示词里求模型小心可靠
- 每条消息 append 加 Sync 的会话持久化：崩溃恢复就是逐行重放，不需要快照机制
- loopback provider 的证明脚本模式：对自家传输契约写确定性验证，不需要 API key、不依赖任何模型
- 基准的自我限定写法：给出命令与原始 JSON，明说不测什么——可复现性本身就是卖点

**不适用的：**

- 全量发送的 token 经济：长会话每步重发完整历史，撞上下文上限就报错终止。依赖 compaction 续航的场景（长重构、大仓库）恰恰是它反对的那种用法，搬这套语义等于放弃续航换保真
- 无沙箱：README 自己声明 run_command 以当前用户权限执行，路径检查只约束文件工具、管不住 shell（[resolve](https://github.com/Balanov/uncut/blob/0beea8f7a25ba340512ed4f5ce3b80f6b8ffe063/internal/harness/tools.go#L61-L76) 挡不住 `cat /etc/passwd`）。不可信任务必须自己套容器
- 封闭四工具：没有 grep、glob，大代码库检索只能靠 shell 命令，输出全量进上下文，token 成本进一步放大
- 非流式、纯文本：长回复感知延迟高，不支持图片输入；无审批交互、无自动重试，生产管道里一次网络抖动就是整轮失败

## 局限

快照口径：599 stars、14 forks、1 位贡献者，仓库创建于 2026-11-01，评估距首个提交三天，版本 v0.1.1。二进制未代码签名，README 教了校验 SHA-256 与去除 macOS 隔离属性。口碑数据点只有一处：一家 API 网关（A2Agent）在 issue 里提出测试贡献，作者以不加运行时依赖、CI 不打真实网络为条件接受；尚无第三方评测。本卡结论来自全部源码与文档的静态阅读及 GitHub API 快照，proof.py 与二进制均未实际运行。

## 相关

站内《[harness 工程：让 AI 工作流不再散架](/sdlc-playbook/articles/harness-never-fall-apart/)》主张光谱的另一端：上下文该按需加载，灌满内存会稀释注意力。uncut 用行动反驳：与其猜模型需要什么，不如把「给全量」做成可验证契约，让 provider 的上限当裁判。两篇对照读，正好圈出上下文管理这条光谱的两端。《[orbi](/sdlc-playbook/projects/orbi-build-orbi/)》与它共享同一条纪律：事实来源落在磁盘（GitHub Issue 或 JSONL 会话），宁可显式失败，不做静默修复。
