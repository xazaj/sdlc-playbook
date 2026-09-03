# SDLC Playbook

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-M0%20validating-orange.svg)](#当前状态)
[![Agents](https://img.shields.io/badge/agents-Claude%20Code-black.svg)](#安装)

> 给 coding agent 的开发全链路决策手册

初始化项目该装什么？设计该用哪套系统？编码该走 SDD 还是 TDD？

**每个阶段一份选型矩阵。** 你提问，agent 被路由进来，拿到判断，然后落地。

---

## 它长什么样

```
你：这次改动要不要先写测试？

Claude：
  ↓ sdlc-coding-process 技能被触发
  ↓ 读 ~/.sdlc/stages/30-coding/DECIDE.md
  ↓ 先问清三件事：错了多久会被发现？范围多大？需求确定吗？

  「这段是金额计算，错了要等对账才发现 —— 验证成本高。
    建议走 TDD。执行用 superpowers 的 test-driven-development，
    安装方式见 registry/superpowers-tdd.md。」
```

它不给你一份清单让你自己挑，它给一个判断。

## 它不是什么

**不是又一个技能库。**

那类库按类型分目录 + README 长列表，你去翻、去挑，解决的是"我知道我要什么，去哪找"。

这个库的入口是 `stages/`：你不翻目录，是 agent 带着你手上的问题被路由进来。解决的是**"我不知道该用什么"**。

它是**编排层**，不重复造轮子 —— 现成资产够用就在 `registry/` 登记一张卡（何时用、怎么装、谁管版本），只有现成的都不够用时才自建。

| | 技能聚合库 | SDLC Playbook |
|---|---|---|
| 入口 | 目录 + 列表 | 决策矩阵，按 SDLC 阶段 |
| 你的动作 | 翻、挑、装 | 提问，被路由 |
| 价值来源 | 资产数量 | 判断质量 |
| 外部资产 | 收进来 | 登记指针，不复制 |

## 安装

```bash
git clone https://github.com/xazaj/sdlc-playbook.git ~/.sdlc
~/.sdlc/install.sh
```

仓库想放在别处：

```bash
ln -s /path/to/repo ~/.sdlc
~/.sdlc/install.sh
```

`install.sh` 幂等，新增或改名技能后重跑即可。技能会被当前会话直接发现，不必重开。

目前支持 **Claude Code**；Codex CLI 与 pi 的适配在路线图上。

## 路径约定

家目录固定在 `~/.sdlc`（比产品名短，便于在每个技能文件里书写）。仓库物理上可以放在任何位置，软链指过去即可。

所有 DECIDE.md 的引用统一走这个路径。**任何文件里都不要写具体机器的绝对路径** —— 一旦写了，换机器就废。

## 结构

```
stages/    决策入口：按 SDLC 时刻组织的选型矩阵（只放索引，不放实体资源）
catalog/   本库自有的资产，会被 install.sh 挂载成真技能
registry/  外部资产的登记卡：何时用、怎么装、谁管版本（纯文档，不挂载）
bin/       安装与更新检查脚本
library/   原料层：外部文章与蒸馏笔记
docs/      设计文档与验证日志
```

三层心智模型：**原料（library）→ 资产（catalog / registry）→ 入口（stages）**。

外部文章丢进 `library/inbox/`，蒸馏成带来源的要点卡片，验证有效后才提炼成正式资产，最后被决策矩阵引用。原料永不直接进入 agent context —— 少了这道闸门，知识库几个月就退化成剪藏堆。

## 当前状态

**M0 格式验证。** 两个阶段的决策入口（`20-design`、`30-coding`）+ 两个路由技能，除两个 shell 脚本外零代码。

路线图刻意是**内容优先**的：

| 里程碑 | 内容 |
|---|---|
| M0 格式验证 | 首个 DECIDE.md + 路由技能，实地验证格式 |
| M1 格式定型 | 更多阶段，痛点清单 |
| M2 最小工具 | 按痛点裁剪的 schema 与校验 |
| M3 安装与多 agent | Codex / pi 适配 |
| M4 原料流水线 | 文章蒸馏 |
| M5 发布 | npm 与 marketplace |

**M0/M1 不写代码。** schema 的作用是把格式凝固下来 —— 在格式尚未验证时就写校验器，顺序是反的。工具由痛点召唤，每一项都必须能指向 `docs/验证日志.md` 里记录在案的具体问题。

设计文档：[`docs/superpowers/specs/`](docs/superpowers/specs/)

## 贡献

欢迎新增决策入口与登记卡。格式约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

最有价值的贡献不是加资产，而是**加判断** —— 一份写清了适用条件、代价和反模式的选型矩阵，比十个技能条目有用。

## 许可

本仓库内容以 [MIT](LICENSE) 发布。

**关于第三方资产的边界：**

- `registry/` 里的登记卡是本库编写的**指针**（何时用、怎么装、谁管版本），MIT 覆盖；卡片**指向**的那些资产各自遵循其上游许可，本库不重新分发它们。
- `library/notes/` 是对外部文章的**摘要与判断**，附来源链接，属本库内容；文章原文不进入本仓库（见 `.gitignore`）。
- 若将来在 `vendor/` 下落地第三方资产，会保留其原始 LICENSE 与出处声明。
