---
id: bootstrap
code: BOOTSTRAP
title: 开局与约定
tagline: 新项目怎么起步，给 agent 立什么规矩的时刻。约定写一次，后续每个任务都受它约束。
order: 1
accent: "#5d6ed3"
decision:
  headline: 立什么规矩，先看产出给谁读。
  intro: 读者距离权重最高。只有自己看的草稿，任何文字规矩都收不回成本；读者越远，规矩的回报越大。约定可叠加，出现信号再装，不预支。
  steps:
    - label: 一
      text: 下限。agent 会写给人读的文字就装文风与格式约束，写进 AGENTS.md 常驻生效；纯代码产出不立文字规矩。
    - label: 二
      text: 按需。产出含对外发表的文档（发版说明、复盘、公告、技术文章）再加 sepia，入口按动词选：新写 write、只诊断 review、最小改动 refactor、全文重写 recreate。产出以英文一般文章为主时默认 humanizer（单条目，25 条模式整段重写，可按声音样本对齐）；只要点名不改写的审计或最轻磨尖才用 no-ai-slop 的 detect/edit；中文走 sdlc-deai-zh。去味技能只装一个。
    - label: 三
      text: 自主性。存在长任务放手执行时加自主执行约束；结对为主的仓库不装，它的前提在结对时是假的。
  note: 约定必须落在文件里，口头规矩在上下文压缩后即丢失。文风约束管「平时说话的腔调」，sepia 管「这篇要发表的文档的指纹」，两者分层不互替。厂商约束绑模型版本，换模型必须复核。
  signals:
    - when: 发版说明被嫌营销腔、复盘像模板、文章被平台打 AI 标
      then: 装 sepia，先拿一篇旧文跑 review 定位伤情
    - when: 文字只是用力过猛、比喻连篇，读者并无「像 AI」的抱怨
      then: 文风约束那一半就够，不必上 sepia
    - when: 英文博客或文案被嫌 AI 腔
      then: 装 humanizer（单条目整段重写，模式分级）；只要审计不要改写，才用 no-ai-slop 的 detect
    - when: 中文文章被嫌 AI 腔，且事实与信息一个字不能动
      then: 用 sdlc-deai-zh 按白名单触发标记逐句改，未命中的句子逐字保留
    - when: agent 长任务中途停下问「要我继续吗」
      then: 装（或修）自主执行约束，而不是每次口头催
    - when: 换了底层模型
      then: 两条厂商约束回来复核，偏差方向可能翻转
  pitfalls: 常见误判：把「文字难看」与「像 AI」混为一谈；让 sepia 对所有写作任务默认触发；多个去味技能同时常驻互相抢触发；结对仓库照抄自主执行约束；装了厂商约束换模型后从不复核；开局一次立十条规矩。
  sourceLabel: 完整判断依据 stages/10-bootstrap/DECIDE.md
  sourceHref: https://github.com/xazaj/sdlc-playbook/blob/main/stages/10-bootstrap/DECIDE.md
sections:
  - kind: skill
    title: 执行技能
    code: SKILLS
    note: 按需调用的操作：对外文档去 AI 味——工程文档域走 sepia 的动词入口，英文重写走 humanizer，英文只要审计或轻磨走 no-ai-slop，中文走 sdlc-deai-zh；同装只装一个。
  - kind: doc
    title: 常驻规则
    code: RULES
    note: 写进 AGENTS.md 的约束，不安装任何依赖：文风下限与自主执行边界，每次产出都生效。
---
