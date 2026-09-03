# SDLC

面向 coding agent 的顾问式知识库，服务 Claude Code、Codex CLI、pi 等遵循 Agent Skills 标准的工具。

它回答的不是"库里有什么"，而是**"此刻我该用什么"**：初始化新项目时该装哪些规范、做设计时该用哪个设计系统、编码时该走 SDD 还是 TDD。

## 安装

**新机器：**

```bash
git clone <repo-url> ~/.sdlc
~/.sdlc/install.sh
```

**仓库已经在别的位置：**

```bash
ln -s /path/to/repo ~/.sdlc
~/.sdlc/install.sh
```

`install.sh` 幂等，新增或改名技能后重跑即可。技能会被当前会话直接发现，不必重开。

## 路径约定

所有 DECIDE.md 的引用统一走 `~/.sdlc`，所以仓库必须位于该路径，或有软链指过去。

这是目前唯一的跨机器约定，请不要打破它 —— 一旦有技能写了具体机器的绝对路径，换机器就废。

## 结构

```
stages/    决策入口：按 SDLC 时刻组织的选型矩阵（不放实体资源）
catalog/   资产层：可安装产物，唯一真源
library/   原料层：外部文章与蒸馏笔记（尚未启用）
docs/      设计文档与验证日志
```

## 当前状态

**M0 格式验证。** 两个阶段的决策入口 + 两个路由技能，除 `install.sh` 外零代码。

格式正在实地验证，痛点记在 `docs/验证日志.md`。工具要等 M2，且只解决日志里记录在案的问题。

设计文档：`docs/superpowers/specs/2026-09-03-sdlc-knowledge-base-design.md`
