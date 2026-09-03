---
# 清单页的一个 tab。每个时刻一个文件；新增时刻需同步更新 content.config.ts 的 CATEGORY_IDS 与各文件 order。
# 本文件不会被构建（以 _ 开头的文件已排除），复制成 <id>.md 使用。
id: bootstrap
code: BOOTSTRAP
title: tab 上的名字
tagline: 一句话说明这个时刻在做什么，显示在判断依据的上方
order: 1
accent: "#5d6ed3"

# decision 整段可省。省了这个 tab 就只有条目表格，不显示判断依据。
decision:
  headline: 一句话说清这一类怎么选，陈述句，不用问句
  intro: 判断依据里权重最高的那一条，以及默认走法
  steps:
    - label: 一
      text: 第一步做什么。步骤是连续的一组，条数不限但别超过五条
    - label: 二
      text: 第二步做什么
  note: 交给 agent 执行时与人工的差异。可省
  signals:
    - when: 出现什么信号
      then: 就改走什么
    - when: 另一个信号
      then: 另一个走法
  pitfalls: 常见误判，一段话，分号分隔。可省
  sourceLabel: 完整判断依据 stages/<阶段>/DECIDE.md
  sourceHref: https://github.com/xazaj/sdlc-playbook/blob/main/stages/xx/DECIDE.md
---
