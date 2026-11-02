---
name: robbin-grokbot-local-agent
title: grokbot-local-agent：Grok Bot 把重活交给同机 Pi，通知只当门铃、磁盘才是事实
summary: 云端 Bot 把耗轮次的话委派给同机 CLI agent：任务落盘为唯一事实来源，完成通知只带五个字段，丢了靠 pending 找回不重跑。
repo: https://github.com/robbin/grokbot-local-agent
description: Let Grok Bot hand heavy work to a local agent (Pi) on its own computer, and get woken by webhook when tasks finish.
stars: 74
forks: 9
contributors: 1
language: JavaScript
languages:
  JavaScript: 97.5
  Shell: 2.5
avatar: /projects/robbin.png
license: MIT
tags: [agent-delegation, pi, rpc, webhook, task-store, grok-bot]
pinned_commit: 2e48e05e031880d92b68b93845519122c6c3e808
evaluated_at: 2026-11-02
updated_at: 2026-11-02
related: []
---

grokbot-local-agent 是一套让 Grok Bot 委派重活的脚本：三段程序、一份技能、一份例行任务模板，把跑在同一台 Linux 云电脑上的 Pi（CLI coding agent，独立模型账号计费）变成 Bot 的第二双手。这张卡主张的读法：调起另一个 agent 本身不难——[pi-call.mjs](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-call.mjs) 54 行就做到了；这个项目真正解的是委派的可靠性问题——通知会丢、进程会死、多个 Bot 会共用一台机器，三件事全用文件系统加一个归属字段兜住，零第三方依赖。

## 它解决什么问题

对话式 Bot 的对话轮次是稀缺资源：批量文件处理、写代码、长文调研会吃掉大量轮次，而且长任务跑完时原对话可能早已结束，没人接收结果。直接丢一个后台命令，结果落在哪、进程死了怎么办、谁负责汇报，全都没有答案。

它的分工立场写在 [README](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/README.zh-CN.md) 里：Bot 管对话、调度、连接器（Gmail、X、GitHub）与核查；Pi 管批量处理、小脚本、调研与初稿；需要长期迭代的完整项目去 Cursor Cloud Agent 这类专门环境。作者特意注明这是工作流选择，不是本项目的安装依赖——边界感先于功能。

## 怎么解的

四个文件各管一段，Node 22+，无任何 npm 依赖：

- [bin/pi-call.mjs](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-call.mjs)（54 行）：一次性同步调用。spawn `pi --mode rpc`，stdin 喂 JSON 行、stdout 收 JSON 行，打印最终回复，支持命名会话续用。
- [bin/pi-task.mjs](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs)（1067 行）：核心。把调用包成任务，每个任务一个目录 `~/.pi/tasks/<id>/`，含 status.json（状态机）、events.jsonl（事件流）、result.md（最终回复）、prompt-N.txt（每轮提示词），子命令 run／reply／status／list／log／cancel／pending／ack。
- [skills/pi-agent/SKILL.md](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/skills/pi-agent/SKILL.md)：装进 Bot 的技能——何时委派、prompt 怎么写、怎么核查、权限边界在哪。
- [routines/pi-task-notify.md](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/routines/pi-task-notify.md)：webhook 例行任务模板，被唤醒后按 owner 分派处理。

流程：Bot 用 Shell 后台模式起 `pi-task run`，记下第一行 `TASK <ID>` → 任务完成时一个 detached 通知进程 POST 五字段 JSON 到 PI_NOTIFY_URL → webhook 唤醒例行任务 → 例行任务跑 `pending` 列出已终结未汇报的任务 → 核查（git diff／测试／工件）、汇报用户、`ack` 标记已报。

## 设计亮点

**通知是门铃，不是数据通道。** 完成通知只含 `{source, id, owner, state, exit_code}`，不含提示词也不含结果（[pi-task.mjs L330](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L330)）。README 把哲学说透：通知是帮助及时处理的机制，磁盘记录才是事实来源；通知丢了，下次唤醒后用 `pending` 找回未汇报的结果，不要因此重跑任务。通知进程本身 detached、fire-and-forget，投递结果（http 200 或 error）自己追加进 events.jsonl，失败不影响任务结果。至少一次投递加幂等消费，整个模式不到一百行。

**任务存储就是目录，崩溃恢复就是一次目录扫描。** 每个子命令入口先跑孤儿检查（[orphanCheck L233](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L233)，[main 里调用 L1042](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L1042)）：状态为 running 但 PID 已不存在的任务标成 interrupted——用 `process.kill(pid, 0)` 探活。宿主机重启、SIGKILL、进程被回收，全都收敛到同一条恢复路径，不需要守护进程定时巡检。status.json 用临时文件加 rename 原子写（[L155](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L155)）；events.jsonl 每条压成单行、截断到 500 字符（[L30](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L30)），日志永远不会写爆也不会写坏主流程。

**凭据卫生做在三处。** 第一处，通知密钥从环境变量传给 detached 的 `node -e` 通知进程，不进命令行参数——argv 对 ps 可见（[L339](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L339)）。第二处，Pi 子进程的环境里删掉 PI_NOTIFY_URL、PI_NOTIFY_SECRET 和 CLOUDFLARE_API_TOKEN（[L374](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L374)）——委派出去的 agent 默认看不到派活机器的凭据。第三处在技能文本：不读 `~/.pi/agent/auth.json`，模型登录必须用户本人在交互终端完成，Bot 不得代劳。

**所有权是路由纪律，且作者不夸大它。** `run --owner` 记录派活的 Bot；`pending`／`list`／`ack` 支持按 owner 过滤；ack 对不匹配的 owner 直接拒绝（[L943](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-task.mjs#L943)）。命令参考里有一句少见的老实话：ownership is routing discipline, not an operating-system security boundary。例行任务模板对应三分支：自己的任务核查汇报 ack；别人的任务用 SendToAgent 转发给其 owner；无主任务只提醒用户，不代查不代 ack。

**RPC 客户端的坑都踩过并且写进了注释。** JSON 行只按 LF 切分——U+2028/U+2029 在 JSON 字符串内合法，按 Unicode 行终止符切会切碎合法消息（[pi-call.mjs](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/bin/pi-call.mjs) 有原注释）。`extension_ui_request` 一律自动回 cancelled：非交互客户端不能假装有人在场点确认。超时与取消是升级序列：先发 abort RPC 给 5 秒宽限，收尾时关 stdin、3 秒后 SIGTERM、8 秒后 SIGKILL；进程收到第二个信号立即退出。退出码 0／1／2／124／130 沿用 timeout(1) 惯例。

**技能文本把核查写成纪律。** SKILL.md 的原话：an assistant reply is a claim, not evidence——委派方必须亲自看 diff、测试或工件，才能把结论当事实汇报给用户。重试上限一两次，超过就接管并向用户解释限制，不许静默循环。另有一句语言政策值得抄：英文技能指令不强制英文回复，Bot 用用户偏好语言交流——指令语言与输出语言解耦。

**Telegram 旁观器单向到拒绝接收。** [tools/pi-telegram-monitor/monitor.js](https://github.com/robbin/grokbot-local-agent/blob/2e48e05e031880d92b68b93845519122c6c3e808/tools/pi-telegram-monitor/monitor.js) 只调 sendMessage 和 editMessageText，不读更新、不接受任何指令——读通道就是注入通道，干脆不存在。发送前过一遍 redact() 正则组：bot token、sk- 前缀、ghp_ 等 GitHub 令牌、Bearer/Basic、JWT、32 位以上 hex、40 位以上 base64，全部替换成 [REDACTED]；思考内容与工具输出正文不推送。

## 借鉴清单

**能搬的：**

- 门铃通知模式：异步任务的完成通知只带定位符不带内容，磁盘记录是唯一事实来源，`pending` 找回兜住投递丢失——任何「长任务加回调」的场景都适用
- 文件任务库的完整形态：status.json 原子写加 events.jsonl 单行截断加 result.md 加 prompt-N.txt，一个目录四个文件做到可追踪、可审计、可续话（`reply` 沿用原会话与原 owner）
- 孤儿检查放在子命令入口：每次操作顺手把「记录在跑、进程已死」标成 interrupted，免掉守护进程
- spawn 子 agent 前删净环境里的通知密钥与平台令牌：委派出去的进程默认不带委派方凭据；密钥传子进程走环境不走 argv
- 委派技能的三段结构：分工（什么委派什么留）、核查纪律（回复是主张不是证据）、升级序列（abort→SIGTERM→SIGKILL，二次信号立即退出）
- 三受众文档分层：README 给人读、SKILL.md 给派活 agent、routine 模板给收通知 agent，各写各的不混装
- 单向旁观通道：要给人看进度就做成只发不收，发送前跑密钥遮蔽

**不适用的：**

- 深绑 Grok Bot 生态：owner 路由、SendToAgent、routine、宿主安全输入都是 xAI Bot 平台的概念，换 harness 要重写接线层——好在脚本本体通用，任何能起后台进程的 agent 都能驱动 pi-task
- 所有权不是安全边界，作者自己写明：同机多 Bot 共存时防的是误认领，不是恶意 Bot；真隔离要靠操作系统级沙箱
- 工具白名单不是沙箱：`--no-write` 只是少给几个工具，SKILL.md 原话 these are tool settings, not hard isolation，cwd 也不是沙箱
- 单人两周龄仓库（74 stars、1 位贡献者）：当设计样本读，别当维护依赖引
- Telegram 旁观器是平台特权件：多数环境没有「宿主安全输入」可存放 token，照抄会把密钥落进文件

## 局限

快照口径：74 stars、9 forks、1 位贡献者，仓库创建于 2026-10-18，评估时距最后提交一周。默认模型 deepseek/deepseek-flash 硬编码在脚本里，换模型要靠 `--model` 逐次覆盖。通知投递没有重试队列——门铃哲学下这是自洽的取舍，但通知持续丢失时只能等下一次任意唤醒。本卡结论来自全部源码与文档的静态阅读，未在 Grok Bot 环境里实测端到端流程。

## 相关

站内《[OpenMausBot](/sdlc-playbook/projects/milind-soni-openmausbot/)》是同一条链路的另一端：开源的 Grok Bot 替代 harness，自己独占进程与事件流；grokbot-local-agent 则假定 Bot 已存在，只解决 Bot 如何把手伸向第二个 agent。《[orbi](/sdlc-playbook/projects/orbi-build-orbi/)》同样把事实来源放在外部存储（GitHub Issue 当状态机），对照两套「状态在别处、通知只是加速」的设计。
