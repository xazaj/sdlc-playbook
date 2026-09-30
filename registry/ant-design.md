---
name: ant-design
title: Ant Design 设计语言快照（design.md）
summary: Ant Group 企业级设计系统的完整 token 快照：26 色板、十级排版、间距圆角刻度与核心组件配方，映射进任意项目的 token 层即可用。
category: design
kind: design-md
invoke: install
origin: external
provider: Ant Group
asset: ant-design
upstream: https://ant.design/
license: proprietary
pairs_with:
  - frontend-design
agents:
  - Claude Code
  - Codex
release_source: web
evaluated_version: "2026-07-27"
evaluated_at: "2026-09-30"
updated_at: "2026-09-30"
---

## 何时用

项目选型落在「现成组件库」或「沿用既有规范」（判定见 `stages/20-design/DECIDE.md`）且基线取 Ant Design 时：它提供该设计系统完整的 token 数值（primary `#1677FF`、成功/警告/错误色、26 色 board、十级排版刻度、4px 间距基、组件级配方如按钮三态与表格头），装进 agent 的上下文后，生成或改写界面不再靠猜数值。中文 B 端与后台产品生态里它是事实标准，中文团队沟通成本最低。

不适用：非 Ant 基线的项目（token 数值只对 Ant 体系有意义——它是快照不是通用方法论，与 Vercel 那份的方法论定位不同）；要原创品牌表达的产品（企业级默认脸正是要避开的东西）；C 端消费产品。已有 antd 依赖的项目优先直接用组件库本身的 token 导出。

## 这一版怎么样（2026-07-27）

评估基于通读的 token 快照全文（经 ui-skills design.md 板块分发，官方源 ant.design；同前卡，无 git 历史，`evaluated_version` 记收录标注的更新日）：

- 数值完整度足够直接映射：颜色含表面/文本/描边的语义层（surface-container、on-surface-disabled 等不只是品牌色）；排版十级带字体栈、字号、字重、行高四元组；组件配方到状态级（button-primary 的 hover `#4096FF`、active `#0958D9`，menu 选中态 `#E6F4FF`）。
- 形态是数据不是文章——474 行 YAML，没有方法论。这对它是优点：与 Vercel 那份互补（那份管「怎么构图」，这份管「数值是多少」），装 token 层时正是需要的东西。
- 注意：快照是 alpha 版标注（`version: alpha`），与 antd 当前大版本可能有出入；数值以官方 ant.design token 文档为最终权威。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话：

````text
请把 Ant Design 的 token 快照装进本项目，按 1→4 顺序做完再继续别的事：

1. 【取文件】打开 https://www.ui-skills.com/design-md/ant-design ，复制
   页面上的 YAML token 全文。官方源是 https://ant.design/ ，发现数值
   与官方 token 文档冲突时以官方为准并报告差异。

2. 【映射】按本项目的技术栈把 token 落地：
   - Tailwind 项目：映射为 CSS 变量或 theme 扩展（色彩、圆角、间距、
     字号刻度），保留 Ant 的刻度命名；
   - 非 Tailwind 项目：落成 CSS custom properties 一层；
   - 已用 antd 的项目：与本地的 theme token 配置对账，只补缺口，
     不重复造层。

3. 【落盘】token 文件写入项目既有的样式目录；同时在约束文件里记一行
   数据来源与取用日期，后续对账有锚点。

4. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换：

## Design tokens (Ant Design baseline)

- Ant Design token values are the project baseline for colors,
  type scale, spacing, radius, and core component recipes.
- Numeric authority is the official ant.design token docs; this
  snapshot is an alpha-stage copy for agent context.
- Do NOT invent intermediate values; pick from the scale or raise
  the question.

完成后：列出改动或新增的文件，给出映射表（Ant token → 项目变量）。
````

确认方式：装完后让 agent 生成一个带主按钮与成功提示的后台表单页。符合规范的主按钮是 `#1677FF` 底 32px 高 `6px` 圆角 hover `#4096FF`，成功色 `#52C41A`；出现体系外颜色或自造间距值，就是没装对。

## 版本

上游以网页分发（ant.design），无 git 历史可钉 commit；`evaluated_version` 记评估时 ui-skills 收录本标注的更新日期（2026-07-27），快照自身标注 `version: alpha`。内容版权归 Ant Group。

评估历史：2026-07-27（2026-09-30）
