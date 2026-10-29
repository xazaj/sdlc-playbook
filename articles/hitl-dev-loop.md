---
name: hitl-dev-loop
title: Claude 指挥 Codex：一个人的 Human-in-the-Loop 开发循环
summary: 独立开发者的实操路线：Claude Opus 当主 Agent 拆解派发，Codex 在独立 worktree 里执行验证，低成本 subagent 盯 issue/PR，人只提需求与验收。
date: 2026-10-29
source: https://x.com/lee04052822/status/2111618612158935467
author: lee04052822
tags: [agentic-coding, human-in-the-loop, multi-agent, workflow]
related: [claude-autonomy-scope, superpowers-writing-plans]
---

一位独立开发者把他持续开发个人产品的方法写成了长帖：Claude Opus 做主 Agent，负责理解需求、拆解任务、调度与审查；Codex 在独立 worktree 里改代码、跑验证；低成本的 subagent 盯 GitHub 的 issue 和 PR。人只做两件事——提需求，验收。他的主张是：持续开发的抓手不在模型多聪明，而在循环的结构——仓库文档先写清楚，改动先隔离验证，合并永远留在人手里。整套方法后来沉淀为开源脚本 [hitl-dev-loop](https://github.com/mu-zi-lee/hitl-dev-loop)。

![原文配图：工作流总览](/sdlc-playbook/articles/hitl-dev-loop/loop.jpg)

## 前情：一段引用

作者此前在给 yetone 的 magpie 做插件、提 PR，随后看到 yetone 分享自己如何做持续的 AI 开发。那段话他直接引了过来：「其实我没有任何的魔法，甚至还特别简陋，总觉得分享出来毫无意义。其实我就是用 Claude Code，然后用官方的 Opus 5.5 模型执行 loop 就可以了。我会并行执行图里的 3 个 loop，然后每晚抽一点时间铲铲屎（主要是 UI/UX……）」

作者自评：这个工作流也很正常——提出问题、解决问题、验证问题是否可行。值得写下来的是怎么把这个循环固定住。

## 仓库是地基

工作流成立的前提是初始结构足够好，代码有清晰的层级。他的做法：负责 UI 的放单独一个文件夹，负责功能逻辑的放另一个文件夹，互不掺杂。

然后用 Claude 的 initialization 做仓库初始化，让 AI 明确三件事：这个仓库是干什么的；层级结构是什么；后续要修改或加功能时该怎么操作。他的类比是：人与人协作需要写清楚在哪里贡献、要测试哪些东西，这些同样要让 AI 明确——所以这份文档不是一次性的初始化产物，而是随开发持续更新的上下文。

## Human-in-the-loop 的真实含义

作者没有无限的 token，也不把需求外包给外部用户。他自己就是软件的使用者：觉得不合适就提，AI 改完他再试。需求与验收收在一个人身上，这是他说的 human in the loop——由他提出需求并进行更改，而不是外界的人不断给他提问题。

## 写代码之前，先回答为什么做

他以自己的 [tangentry](https://github.com/mu-zi-lee/tangentry)（另有 [B 站演示](https://www.bilibili.com/video/BV13XJe6eEEo/)）为例：写代码之前做了很多工作。第一阶段只回答为什么要做这个软件。他常看视频又常忘讲了什么，想把字幕取下来记录，目标四件事：视频获取、字幕提取、翻译总结、记录笔记。

基础组件一律复用成熟项目：[yt-dlp](https://github.com/yt-dlp/yt-dlp) 取源、[Whisper](https://github.com/openai/whisper) 转录、[FFmpeg](https://ffmpeg.org) 处理音视频——已有可复用的资源就没必要再开发。接着质疑想法本身：视频总结工具已经很多，只做视频没有差异化，于是扩展到文章、PDF、博客、RSS，聚合进同一个平台。UI 设计阶段的关注点也不是好不好看，而是用户到底需要一个什么样的软件。

他的结论：动手之前不断追问这个功能、这个想法到底解决了什么问题；产品逻辑和使用体验自己思考，技术选型可以交给 AI 在后续进行。

## 循环怎么搭起来

思考主力用 Opus 5.5，再装一个 Codex 桌面端或 CLI，然后对 Claude 说：

> 根据任务需求，自行判断哪些工作适合交给 Codex CLI，并启动 Codex 执行。你负责拆解任务、分配工作、检查执行结果，必要时继续安排后续任务。

这一句话就搭起了 loop 的框架。循环可以在能持续运行的 server 里跑：作者在一台远程 Windows 虚拟机上专门跑 Claude 和 Codex，登录 GitHub，把 issue 和 PR 的链接扔给 Claude，让它持续监测——将相同类型的 issue 合并；PR 解决了某个 issue 就自动关联。执行时可以用 computer use 操作浏览器，规划交给 Codex；Codex 验证并返回结果后由人审查，没问题就推进下一个。任务侧维护一个列表（或栈），逐个勾选。

角色分层（模型为作者原帖所称）：

| 角色 | 模型 | 职责 |
|---|---|---|
| 主 Agent | Claude Opus 5.5 | 需求理解、拆解、调度、审查、与人沟通 |
| 执行 Agent | Codex 6.1 Sol / 6 Astra | 代码修改、功能实现、技术验证 |
| 维护 subagent | Sonnet 5.5 | 盯 issue/PR、分类关联、异常汇报 |

subagent 返回结果后告诉主 Agent 它看到了什么；需要代码合并时，由主 Agent 把任务交给 Codex。作者提醒这条分层的本意：平衡 token 消耗与这个仓库值不值得这样维护。

![作者让 AI 生成的结构图](/sdlc-playbook/articles/hitl-dev-loop/structure.jpg)

## 日常运转：语音提需求，worktree 里验证

他一边用 tangentry 一边记录不满，把想法用语音输入给 Claude Opus。后者自动搜索相关内容，把上下文和必要信息交给 Codex；这个进程自己反复检验，直到在新的 worktree 下测试成功，才更新应用。作者觉得不行，就让它在 worktree 里重新修改调整；符合想法之后，才合并进 main 分支。

判断标准很简单：每次它改完就试一下，可以就用，不可以就让它重新试。模型搭配的经验也随之而来：只要你前面用的模型够好，后面用 6.1 Sol 执行是没问题的。

## 方法沉淀成了脚本

原帖末尾附了一份可以直接扔给 Claude 的主 Agent 提示词，十个部分：理解项目、需求分析与质疑、优先复用成熟技术、Agent 分工与调度、标准开发循环、GitHub issue 与 PR 维护、任务队列、token 与上下文管理、交互方式、启动检查。

其中值得单列的是七步标准循环：分析 → 拆解 → 实施 → 验证 → 审查 → 人工验收 → 合并与记录。以及几条写死的安全线：未经明确授权，不自动合并 main、不推破坏性修改；「不要把自动测试通过视为产品体验已经合格」；同一问题连续失败时分析根因、标记阻塞，不为维持循环而无限重试；没有持续运行环境就明说持续监测尚未启用，不假装在后台运行。

配套仓库 [hitl-dev-loop](https://github.com/mu-zi-lee/hitl-dev-loop)（MIT）已把这套提示词做成可安装的 Claude Code 插件与技能，v0.2 起「可靠性由调度脚本保证，而不是靠提示词」：任务有持久化状态和锁；反馈送达有确认；「完成」由调度器独立判定并验证；集成和构建有绑定到 commit SHA 的门禁；每一步有超时、熔断和预算。README 还记录了在 codex-cli 0.162 实测踩过的坑：`codex exec` 经常只汇报一句进度就结束，调度循环自动续跑；Codex 沙箱写不了 worktree 的 git 索引，默认改为调度器提交；Agent 曾往主仓库 `.git/config` 写入 `core.worktree` 弄坏所有 git 命令，调度器每轮检查并复原。

## 他在哪一步都不撒手

整篇帖子的态度可以用提示词结尾那句加粗的话收束：**最终目标不是实现完全无人监督的自动编程，而是建立一个能不断接受反馈、自动完成大量重复开发任务、持续验证质量，同时由人掌握产品方向的开发系统。**循环转得再快，提出问题和决定合并的始终是同一个人。
