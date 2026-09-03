---
id: design
code: DESIGN
title: 界面与设计
tagline: 决定界面长什么样、用什么零件的时刻。DESIGN.md 给方向，组件库出零件，技能负责把两者落到具体界面上。三段各选所需，通常不必全取。
order: 2
accent: "#c2603b"
decision:
  headline: 先定长相，再定零件，最后确认能搭配。
  intro: 存续周期权重最高。一次性界面不做任何设计系统投入，由 AI 直接生成；长期界面按下面四步决定。
  steps:
    - label: 一
      text: 视觉方向。已有品牌规范则整理成 DESIGN.md 沿用；没有则从本页选一份作为起点。
    - label: 二
      text: 零件。按技术栈与界面类型选组件库；多品牌或多主题先建 DTCG 三层 token。
    - label: 三
      text: 搭配。DESIGN.md 的 token 必须能映射到组件库的主题变量，条目中的「搭配」字段记录实测组合。
    - label: 四
      text: 执行。视觉方向尚未成形时用 design-consultation 产出完整方案；方向已定、开始写界面时用 frontend-design 执行。
  note: 由 agent 生成 UI 时，模板感来自缺少约束而非模型能力。一份显式的 DESIGN.md 比口头描述可靠；语义 token 层则把 agent 改动品牌色的范围限制在一处。
  signals:
    - when: 需要品牌辨识度
      then: 定制排版与色彩，不用默认主题
    - when: 产品已有设计规范
      then: 沿用，不另起炉灶
    - when: 界面将超过 20 屏
      then: 必须有 token 层
    - when: 设计师将参与
      then: 提前建立 token 体系
  pitfalls: 常见误判：为内部工具自建 token 体系；用 AI 生成会长期演进的产品视觉；以为装了组件库就有了设计系统；直接套用某公司的 DESIGN.md 而不替换品牌项。
  sourceLabel: 完整判断依据 stages/20-design/DECIDE.md
  sourceHref: https://github.com/xazaj/sdlc-playbook/blob/main/stages/20-design/DECIDE.md
sections:
  - kind: design-md
    title: 视觉方向
    code: DESIGN.md
    note: 决定界面长成什么样。prompt 从钉住 commit 的上游取文件，本库不收录内容。
  - kind: component-library
    title: 组件库与 token
    code: COMPONENT LIBRARIES
    note: 决定用什么零件。按技术栈与界面类型选。
  - kind: skill
    title: 方法与执行技能
    code: SKILLS
    note: 前两段决定用什么，这一段决定由谁来做。
moreSources: 第三方汇集的 design 文件集合不作为条目收录，集合中只有评估过的单份文件才进入上表。
---
