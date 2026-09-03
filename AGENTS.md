# SDLC Playbook —— 仓库规则

本仓库是 SDLC Playbook：给 coding agent 的开发全链路决策手册。设计文档在 `docs/superpowers/specs/`。

## 目录职责

- `stages/` —— 决策入口，只放 DECIDE.md 一类索引，**不放实体资源**
- `catalog/` —— 本库自有的资产，**会被 install.sh 挂载成真技能**
- `registry/` —— 外部资产的登记卡，**纯文档，绝不挂载**
- `bin/` —— 极少量脚本（安装、更新检查）
- `library/` —— 外部文章原料（尚未启用），**永不进入 agent context**
- `docs/` —— 设计文档、实现计划与验证日志

## 硬性约束

- **路径一律以 `~/.sdlc` 开头**，绝不写具体机器的绝对路径。这是跨机器可用的唯一保证。
- 新增或改名路由技能后跑 `./install.sh`。
- 不要把资源文件放进 `stages/` —— 资产跨阶段，按阶段物理存放会导致重复漂移。
- **当前处于 M0/M1，不写代码**（`install.sh` 除外）。工具等 M2，且必须能指向 `docs/验证日志.md` 里记录的具体痛点。

## 语言约定

- 代码标识符、代码注释、CLI 输出文案用英文
- `.md` 文档用中文

## 自有资产 vs 外部资产

本库是**编排层**：负责判断此刻该用什么，不重复造已有的轮子。

| 情况 | 放哪 | 记什么 |
|---|---|---|
| 现成资产够用（社区插件、gstack、官方技能） | `registry/<name>.md` 登记卡 | 何时用、安装方式、由谁管版本 |
| 现成的都不够用 | `catalog/` 自建条目 | 资产本身 |

**登记卡绝不放进 `catalog/skills/`。** `install.sh` 会把那里的东西软链成真技能，登记卡的 description 会直接和上游原技能抢触发。

**登记卡不复制上游版本号。** 三类资产各自已有版本机制：Claude Code plugin 由 `installed_plugins.json` 管，gstack 由自身的 update-check 管，本库由 git 管。在登记卡里抄一份版本号，只会漂移成假数据 —— 只记"版本由谁管、去哪查"。

`origin` 字段三态：`local`（自建）/ `marketplace`（Claude Code plugin 机制管理）/ `external`（其他外部来源）。

## 版本检查

`bin/check-update.sh` 只检查本库是否落后于远端，节流 4 小时，平时静默。

路由技能在用法第 0 步调用它 —— 只在真正用到本库时才检查，不装全局 hook，对其他项目零侵入。

外部资产的更新交给它们各自的机制，本库不代管。

## 新增一个决策入口

1. 建 `stages/<阶段>/DECIDE.md`，含七节：要回答的问题、判断依据、选型矩阵、推荐路径、交给 agent 执行时的差异、常见误判、落地资产
2. 建 `catalog/skills/sdlc/<名>/SKILL.md` 路由技能，正文保持在 20 行以内，只负责指向 DECIDE.md
3. description 写满真实中文触发短语，并确认不与已有技能抢同一批词
4. 跑 `./install.sh`，开新会话验证触发
