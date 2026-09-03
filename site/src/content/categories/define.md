---
id: define
code: DEFINE
title: 需求与规格
tagline: 动手之前把要做的事写清楚的时刻：要做什么、写到多细、按什么句式、谁来审。规格是对齐的载体，也是交给 agent 长时间执行时唯一不随上下文丢失的锚点。
order: 2
accent: "#a3722e"
decision:
  headline: 规格写到多细，先看有几个人要对齐。
  intro: 涉众数量权重最高。只有自己看的需求，任何规格投入都收不回；多涉众或交给 agent 长时间执行时，规格是唯一不随上下文压缩而丢失的锚点。
  steps:
    - label: 一
      text: 澄清。想法未定型先用 brainstorming 追问目的、约束与成功标准；已有 URS/BRD 先拆出冲突与高风险决策点，不要直接开写。
    - label: 二
      text: 定形。按涉众数量选规格形态：口头确认、EARS 结构化条目、产品级 PRD、变更级规格，重的形态永远可以降级退回轻的。
    - label: 三
      text: 句式。凡会被验证或评审的条目用 EARS 五种句式写，把「系统应当支持导出」逼成「When 用户点击导出且选中行数大于 0，系统应在 3 秒内生成 CSV」。
    - label: 四
      text: 评审。要开工的规格过评审四件套（值不值得做、体验、工程、开发者体验），每个发现带置信度与证据，逐条批准。
  note: 交给 agent 执行时规格的价值被放大：上下文会被压缩和替换，写在文件里的规格是唯一不丢的锚点；EARS 句式可机检，评审因此从主观印象变成语法约束。
  signals:
    - when: 只有自己一个涉众且改动小
      then: 口头确认即可，不写规格
    - when: 输入是一大堆 URS/BRD
      then: 先摄入拆解出冲突，再动笔
    - when: 规格要交给 agent 长时间执行
      then: 变更级规格，条目用 EARS 句式
    - when: PRD 写完要开工
      then: 先 EARS 自检，再上评审四件套
  pitfalls: 常见误判：为三五条需求的小改动上 PRD 流程；需求里写实现而非行为；评审停留在「我觉得不清楚」没有可检验标准；把「要不要写规格」与「写到多细」混为一谈——前者是编码工作流的判定。
  sourceLabel: 完整判断依据 stages/15-define/DECIDE.md
  sourceHref: https://github.com/xazaj/sdlc-playbook/blob/main/stages/15-define/DECIDE.md
sections:
  - kind: skill
    title: 澄清、编写与评审技能
    code: SKILLS
    note: 谁来做：把想法问成设计、协作写 PRD、把规格转成实现计划、对写好的规格做多视角评审。
  - kind: doc
    title: 句式与生成规则
    code: RULES
    note: 写进 AGENTS.md 的约束，不安装任何依赖：EARS 句式让需求条目可验证、可机检。
moreSources: 本机尚有一批需求类 agent（摄入拆解、原子化、流程细节）与几个低热度外部仓库，先在真实使用中收敛，够稳定再登记。
---
