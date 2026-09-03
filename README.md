# SDLC Playbook

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-M0%20validating-orange.svg)](#状态与路线图)
[![Agents](https://img.shields.io/badge/agents-Claude%20Code-black.svg)](#快速开始)

> 面向 coding agent 的开发全链路决策手册

## 简介

开发过程中反复出现一类选型问题：界面该用哪套设计系统，这次改动该先写测试还是直接改。这类问题没有通用答案，答案取决于当前项目的具体情况。

SDLC Playbook 把这些问题按开发阶段整理成选型矩阵，并安装为 Claude Code 技能。装好之后，在任意项目里提出这类问题，agent 会自动读取对应矩阵，追问几个判断依据，然后给出一个带理由的建议，并指向执行它的具体工具。

同一批内容也渲染成一个可查阅的站点：<https://aibrev.com/sdlc-playbook/>。不装技能也能直接翻，每个条目附一段可复制的安装 prompt。

装好后可以直接问的问题，例如：

- 这次改动要不要先写测试？
- 这个界面要不要用 shadcn？
- AI 生成的界面很有模板感怎么办？

## 快速开始

前置条件：已安装 [Claude Code](https://code.claude.com)，以及 git 与 bash。目前只支持 Claude Code，Codex CLI 与 pi 的适配见[路线图](#状态与路线图)。

安装：

```bash
git clone https://github.com/xazaj/sdlc-playbook.git ~/.sdlc
~/.sdlc/install.sh
```

安装脚本把本库的技能软链到 `~/.claude/skills/`，当前会话即可使用，无需重启。

试一下。在任意项目中打开 Claude Code，输入：

```
这次改动要不要先写测试？
```

预期行为：`sdlc-coding-process` 技能被触发，agent 追问改动的验证成本、范围和需求确定性，然后给出 TDD、SDD、直接实现或先做探针之一的建议。若未自动触发，可以直接输入 `/sdlc-coding-process` 调用。

仓库如果已经放在别处，建立软链后再执行安装脚本：

```bash
ln -s /path/to/repo ~/.sdlc
~/.sdlc/install.sh
```

## 现在能回答什么

| 阶段 | 回答的问题 | 触发用语示例 | 技能 |
|---|---|---|---|
| 设计 | 界面该用现成组件库、沿用已有规范、AI 直接生成，还是自建 token 体系 | 用哪个设计系统、要不要建 design token、UI 怎么做才不像模板 | `sdlc-design` |
| 编码 | 这次改动该走 TDD、SDD、直接实现，还是先做探针 | 要不要先写测试、开发流程怎么选、重构前要准备什么 | `sdlc-coding-process` |

其余阶段（项目初始化、需求、测试、发布、运维）在路线图中。

## 工作方式

每个阶段对应两个文件：一份选型矩阵 `DECIDE.md`，以及一个只负责指向它的路由技能。技能的 description 写满真实的中文提问方式，因此用户按平时的说法提问即可触发。

以编码阶段为例：

```
用户：这次改动要不要先写测试？

agent：
  1. 技能 sdlc-coding-process 被触发
  2. 读取 ~/.sdlc/stages/30-coding/DECIDE.md
  3. 确认三个判断依据：错误多久会暴露、改动范围多大、需求是否确定

  回答：这段是金额计算，错误要到对账时才会暴露，验证成本高，
        建议采用 TDD。执行使用 superpowers 的 test-driven-development，
        安装方式见 registry/superpowers-tdd.md。
```

矩阵的每一行都写明适用条件、代价和反模式，因此 agent 给出的是一个建议，而不是让用户自己挑的清单。建议指向的执行工具多数是现成的社区技能，本库只登记何时使用、如何安装，不复制它们。

## 与技能聚合库的区别

技能聚合库按类型分目录，读者自行查找与挑选，回答的是"我已知道需要什么，去哪里找"。本库回答的是"我不知道该用什么"：读者不翻目录，由 agent 带着当前问题被路由进入。

| 维度 | 技能聚合库 | SDLC Playbook |
|---|---|---|
| 入口 | 目录与列表 | 选型矩阵，外加一个按时刻分类的条目清单 |
| 用户动作 | 查找、挑选、安装 | 提问，由 agent 路由 |
| 价值来源 | 资产数量 | 判断质量 |
| 外部资产 | 收录副本 | 登记指针，不复制 |

## 更新与卸载

更新：

```bash
git -C ~/.sdlc pull
~/.sdlc/install.sh   # 仅当更新引入了新技能时需要
```

技能每次被触发时会静默检查本库是否落后于远端，最多每 4 小时检查一次。落后时 agent 会转告一行提示，不会自动更新。

卸载：

```bash
rm ~/.claude/skills/sdlc-*
rm -rf ~/.sdlc
```

## 状态与路线图

当前处于 M0（格式验证）：两个阶段的决策入口已可使用，正在真实使用中验证矩阵格式与自动触发的准确度。代码只有两个 shell 脚本，以及 `site/` 下用于渲染站点的静态工程。

| 里程碑 | 内容 |
|---|---|
| M0 格式验证 | 首批决策入口与路由技能，在真实使用中验证格式 |
| M1 格式定型 | 增加阶段，整理痛点清单 |
| M2 最小工具 | 按痛点裁剪的 schema 与校验 |
| M3 安装与多 agent | Codex CLI 与 pi 适配 |
| M4 原料流水线 | 外部文章的收录与蒸馏 |
| M5 发布 | npm 与 marketplace |

设计文档见 [`docs/superpowers/specs/`](docs/superpowers/specs/)，使用中的问题记录在 [`docs/验证日志.md`](docs/验证日志.md)。

## 贡献

欢迎新增决策入口与登记卡。仓库结构、格式约定与提交前检查见 [CONTRIBUTING.md](CONTRIBUTING.md)。

最有价值的贡献是判断而非资产。一份写清适用条件、代价和反模式的选型矩阵，比十个技能条目更有用。

## 许可

本仓库内容以 [MIT](LICENSE) 许可发布。`registry/` 中的登记卡是本库编写的指针，受 MIT 覆盖；卡片所指向的第三方资产各自遵循其上游许可，本库不再分发。详细边界见 [CONTRIBUTING.md](CONTRIBUTING.md#版权)。
