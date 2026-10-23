---
name: DietrichGebert-ponytail
title: Ponytail：给 agent 立一条「少写代码」的阶梯，用基准测试发版
summary: 17 万星。本体是 30 行规则：六档阶梯选最小实现、永不砍安全与校验、回复自报没查什么；13 个平台目录全是加载器，规则改动要过配对基准才许发布。
repo: https://github.com/DietrichGebert/ponytail
description: Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote.
stars: 174483
forks: 9502
contributors: 128
language: JavaScript
languages:
  JavaScript: 49.6
  Python: 25.6
  TypeScript: 24.5
  PowerShell: 0.1
  Shell: 0.1
avatar: /projects/DietrichGebert.png
license: MIT
tags: [yagni, agent-skills, prompt-engineering, claude-code, benchmark]
pinned_commit: 09c434ab73ca43761c5d8b0c5d341926c2fba710
evaluated_at: 2026-10-23
updated_at: 2026-10-23
related: []
---

Ponytail 给 agent 立的规矩只有一句话：你是最懒的资深工程师，最好的代码是没写的那段。174483 星，建库四个月，v5.3.2。这张卡主张：这个仓库的主产品是 [skills/ponytail/SKILL.md](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/skills/ponytail/SKILL.md) 里那份 30 行上下的规则，其余两百个文件是分发层和证据层。值得搬两件事：把「少写」写成可执行的判定阶梯，把提示词当带回归基准的软件来发版。

## 它解决什么问题

agent 写代码的默认倾向是多给：没要的选项、防御性的抽象、为以后预留的层。人肉 review 拦不住这种膨胀，口头叮嘱「简单点」也没有判定标准。Ponytail 把资深工程师的懒变成一张有序清单，agent 每次动手前从上往下找到第一个完全够用的选项为止。

## 怎么解的

规则本体三处同源：SKILL.md 是全量版（含分级与会话控制），[AGENTS.md](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/AGENTS.md) 是紧凑版，13 个平台目录（cursor、windsurf、cline、kimi、kiro、qoder、grok、devin、codex、opencode、copilot 等）只是不同宿主的加载器，徽章称支持 20 个 agent。分发不靠手工同步：[scripts/check-rule-copies.js](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/scripts/check-rule-copies.js) 以 AGENTS.md 为规范本，逐字比对七个紧凑副本，SKILL.md 因更长只做金丝雀断言。

外围命令各管一段：`/ponytail-review` 读改动触及的代码而非只读 diff，`/ponytail-audit` 全仓库排优先级，`/ponytail-debt` 把散落的 shortcut 注释收成台账，band 在提示符上方常显本次任务的成本、token、代码复用率与测试结果。

## 设计亮点

**六档阶梯，跑在理解之后。** 顺序是：这功能需要存在吗，仓库里是否已有，标准库或平台是否自带，已装依赖能否胜任，能否一行写清，最后才是最小可用实现。README 特意写明梯子在读懂问题之后才跑：对解法懒，对读代码从不懒。收尾强制自报一两行：跳过了什么、没查什么、用户必须知道的风险。

**提示词当软件发版。** 每次规则改动先在配对运行里打赢当前版本才许合入；v5 发布跑了 [39 任务 × 5 轮 × 3 臂共 585 个无头会话](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/benchmarks/results/2026-10-07-agentic.md)，三臂交替同场，让模型漂移同等地命中每一组。统计按任务取中位数、跨任务几何平均、95% bootstrap 区间、符号检验。会话隔离在临时目录，关掉 CLAUDE.md 与自动记忆，禁用 shell，量的是 agent 写出什么而非调到通。

**基准文档自曝缺陷。** 早期 harness 把部分任务跑在 ponytail 仓库里，Claude Code 把仓库的近期提交信息喂给了模型，这处偏差在文档里点名并写明已修，现在的数字没有一个来自旧设置。基线数字（代码 -53%、成本 -26%、时间 -41%）与安全任务 30/30 通过并列摆放，README 同时声明规则从来不是「最少 token」，小是必要性的副产品。

**永不砍清单加债务台账。** 信任边界的校验、防数据丢失的错误处理、安全、无障碍、硬件校准、用户点名要的东西，明文列为不许动的部分；带已知限制的捷径必须留 `shortcut: <限制>, <何时升级>` 注释，`/ponytail-debt` 把它们收集成账，later 不许变成 never。新写的非平凡逻辑（分支、循环、解析器、钱、安全）必须留一个小测试，[README](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/README.md) 报的基准里 98% 的风险逻辑带测试，无技能组是 68%。

**单源多宿主。** 一个规范本、七份逐字校验的副本、一份金丝雀断言的全量本，替代了在 13 个平台各写一份的自由发挥。README 的安装指引按宿主分列，npm 与 GitHub 双渠道，并警告第三方拷贝可能夹带二进制。

## 借鉴清单

**能搬的：**

- 六档阶梯加永不砍清单的写法：把 YAGNI 从口号变成有先后、可判定的检查顺序
- 回复末尾强制自报「跳过了什么、没查什么、有什么风险」，一两行，用户可核对
- `shortcut:` 注释约定加债务收集命令，让显式技术债可盘点
- 提示词的回归门槛：改动必须在配对运行里跑赢当前版才合入
- 单源多平台分发：规范本定义清楚，副本逐字校验，较长的全量本做金丝雀

**不适用的：**

- 363 次提交里 133 次来自作者本人，规则演进由单人裁决，128 位贡献者多数是文档与适配修正
- 全部数字自报，无第三方复核，17 万星的项目尤其需要按此校准信任度
- 营销层厚：Trendshift 徽章、赞助商、waitlist、案例 logo，读这个仓库要会剥掉这层看规则与基准
- band 与 board 依赖 Claude Code 2.1.290+ 的扩展点，绑死单一宿主，其他平台只有纯文本规则

## 局限

快照口径：174483 stars、9502 forks、128 位贡献者，v5.3.2（2026-10-18），建库四个月，99 个 open issue。正确性与安全数字出自同一套自报基准；「更少的代码」在遗留仓库与强合规场景未必是目标函数，阶梯的第一档在那类仓库里应该慎用。FAQ 与文案的玩笑腔是它品牌的一部分，搬规则时不必搬腔调。

## 相关

站内项目卡《[LCU](/sdlc-playbook/projects/amontlabs-lcu/)》同构在「单源多宿主」上：一个分发规则副本，一个分发原厂运行时，都用校验脚本管住漂移。《[claude-howto](/sdlc-playbook/projects/luongnv89-claude-howto/)》教的是 harness 技能本身，Ponytail 是装进 harness 之后改写行为的那一层。
