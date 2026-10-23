---
name: amontlabs-lcu
title: LCU：不重写 computer use，把它从 Codex 应用里拆出来
summary: 一个月 2131 星：官方运行时保持权威，适配器只接线；双层审批、fail-closed 沙箱垫片、按日期归档的验证记录，每处偏离原版都留案。
repo: https://github.com/amontlabs/lcu
description: Codex computer use, decoupled from the app, for usage inside any harness.
stars: 2131
forks: 140
contributors: 5
language: JavaScript
languages:
  JavaScript: 64.5
  Python: 27.2
  TypeScript: 4.1
  Shell: 2.0
  CSS: 0.9
  HTML: 0.7
  Dockerfile: 0.2
  Swift: 0.2
  PowerShell: 0.1
avatar: /projects/amontlabs.png
license: MIT
tags: [computer-use, claude-code, codex, mcp, adapters, desktop-automation]
pinned_commit: 99d0759a7610e38251037759a69fcdbef816a8c2
evaluated_at: 2026-10-23
updated_at: 2026-10-23
related: []
---

LCU 把 ChatGPT 桌面应用自带的 computer use 运行时暴露给任何 harness：Pi、Codex CLI、Claude Code 是维护级适配，Oh My Pi、Hermes、DeepSeek Harness 是实验级，不需要 Codex 登录。2131 星，建库一个月，v0.12.0。这张卡主张：值得学的是它「不重写」的纪律和验证文化，不是某个具体适配器。

## 它解决什么问题

桌面控制能力被锁在官方应用里，想用就得走 Codex 的界面和账号体系；自己另实现一套桌面自动化，就要追各家 toolkit 的输入差异、审批和生命周期。LCU 走第三条路：运行时、初始化指令、工具 schema 全部用本地已装官方应用里的原版，它只做安装、选择、接线和生命周期管理。[AGENTS.md](https://github.com/amontlabs/lcu/blob/99d0759a7610e38251037759a69fcdbef816a8c2/AGENTS.md) 第一段把这条立成规矩：不新增第二套无障碍、输入、截图、浏览器、JavaScript 或 MCP 实现。

## 怎么解的

[adapters/](https://github.com/amontlabs/lcu/blob/99d0759a7610e38251037759a69fcdbef816a8c2/adapters/client.mjs) 按 harness 分发，共享一个基于官方 MCP SDK 的 client：host 必须把原版初始化指令和工具描述放进模型上下文，结果与错误原样转发，host 专用工具（`turn_ended` 等）不暴露给模型。原版 CUA MCP server 对指令、执行、审批策略、生命周期保持权威。

Linux 上垫了一个 fail-closed 的沙箱垫片：模型写的 JS 内核照旧进真沙箱，只有正向识别过的桌面服务 worker 出沙箱，识别不了的命令一律拒绝。发布按平台出瘦档案，每个带 `.sha256`；Claude Code 走 plugin marketplace，插件本体只是从 release 拉取安装的引导器。

## 设计亮点

**原实现保持权威，偏离必留案。** [STANDALONE-ADAPTATIONS.md](https://github.com/amontlabs/lcu/blob/99d0759a7610e38251037759a69fcdbef816a8c2/docs/STANDALONE-ADAPTATIONS.md) 用一张三列表格管理全部偏离：适配了什么、LCU 的行为、边界在哪，每行挂验证记录和移除条件。指令只通过原版 MCP server 到达模型，不复制 OpenAI 文档，setup 甚至会删掉旧版本注册的 skill。想评估「这个项目到底改了原版多少」，读这一张表就够。

**版本选择不设白名单。** 不用应用版本或组件哈希白名单挑选本地安装；按平台身份、架构、签名、必需文件与目录结构选，报告观察到的版本，`tested-versions.json` 只提示不拦截。白名单从写下那天就开始漂移成错误数据，这个设计把漂移面挪到结构识别上，结构变了本来就该重新看。

**审批两层，模型够不着。** harness 决定 agent 能不能调 LCU 的工具，LCU 按应用决定 agent 能不能碰它，任何权限模式下第二层都在。授权走 Claude Code 原生问题卡，[README](https://github.com/amontlabs/lcu/blob/99d0759a7610e38251037759a69fcdbef816a8c2/README.md) 原话：the model cannot see, press or fake the pane。always-allow 的增删要 Touch ID，承载 agent 的应用自身永不授权，Terminal 一类应用直接拒绝。cross-turn 开关的说明也不揽权：这是防误操作的护栏，不是安全边界，能碰你账户的进程都能改掉它。

**fail-closed 的沙箱垫片。** 原版 Linux 运行时的 seccomp 连 X11 socket 都禁，桌面服务在沙箱里必死。LCU 不关沙箱，而是把 `CODEX_CLI_PATH` 指向自己的垫片：内核命令原样交给真沙箱；worker 命令要同时通过父进程、Node 路径、脚本属主与位置、可信服务表四道识别才出沙箱；其余一切 `sandbox` 调用 exit 70 拒绝。垫片文件缺失就回到原版行为，也就是回到失败，不静默放行。

**验证按日期归档，结论钉在版本上。** `docs/verification/` 下 86 份带日期的记录，[PARITY-STATUS.md](https://github.com/amontlabs/lcu/blob/99d0759a7610e38251037759a69fcdbef816a8c2/docs/PARITY-STATUS.md) 的矩阵每格注明 harness 版本与 fixture。同用例转发验证给出 PNG 与 WAV 的 SHA-256 证明字节未动，并区分「保存到了本地文件」与「到达了模型供应商」两种事实。文档自己写明：fixture 与直连 MCP 的结果只适用于所引案例，不建立任何 harness 里的真实模型行为；历史结果只对记录时的版本成立。

## 借鉴清单

**能搬的：**

- 「不重写，只接线」的集成纪律：原实现权威写进 AGENTS.md，全部偏离记三列表格（适配、行为、边界），附验证与移除条件
- 版本选择用结构身份不用版本白名单，观察到的版本只报告不拦截
- fail-closed 垫片模式：无法分类的命令一律拒绝，组件缺失回退到会失败的原始行为
- 验证记录带日期、版本、fixture 的 SHA 与适用边界；「保存成功」和「送达模型」分开断言
- 双层审批：harness 管工具调用，被集成方管目标对象，用户确认面板对模型不可见
- 把「这不是安全边界」主动写进文档，而不是等用户误信

**不适用的：**

- 强依赖 ChatGPT 桌面应用的本地安装与内部结构（native host、asar、XPC 接缝），上游一改版就碎；一个月 488 次提交里大量在追这个
- 488 次提交里 483 次来自同一作者的两个账号，全部验证记录自证，没有第三方复核
- computer use 的攻击面天然大：输入注入、屏幕读取。「任何 harness 都能用」的设计先想清楚审批模型再搬
- Windows 是候选、Intel Mac 与 Wayland 不支持，跨平台能力要读 PARITY-STATUS 的边界列再下结论
- 每平台瘦档案加引导器安装适合带原生二进制的工具，纯 JS 库直接走 npm

## 局限

快照口径：2131 stars、140 forks、5 位贡献者，v0.12.0（2026-10-21），建库 31 天。macOS 的验证出自维护者自己的一次性 guest 会话与 fixture；真实模型完成 GUI 任务的证据集中在 Linux GTK fixture 一类。文档大量篇幅在解释「什么没验证」，这既是诚实也是这个项目现状的注脚。

## 相关

站内《[agent 信任系统](/sdlc-playbook/articles/agent-trust-system/)》讨论并行度与信任的取舍，LCU 的双层审批是同一问题在桌面控制上的解。项目卡《[小小东 VPS](/sdlc-playbook/projects/nevertoday-xiaoxiaodong-vps/)》《[claude-howto](/sdlc-playbook/projects/luongnv89-claude-howto/)》与它同属 harness 生态：一个把运维写成技能，一个把课程配上考试，LCU 把原厂能力接到任意宿主。
