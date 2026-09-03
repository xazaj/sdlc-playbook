---
id: build
code: BUILD
title: 编码工作流
tagline: 功能开始动手写的时刻。一次改动应采用 TDD、SDD、直接实现，还是先做探针。装入项目的不仅是技能，还包括写入 AGENTS.md 的适用边界。
order: 4
accent: "#1e8c8a"
decision:
  headline: 首要问题：错误多久会被发现？
  intro: 三个判断轴按权重排序：正确性验证成本、需求确定性、改动范围。验证成本权重最高，流程投入只在验证成本高的地方才有回报。
  steps:
    - label: 快
      text: 错误立即暴露（UI 错位、脚本报错）——直接实现。
    - label: 慢
      text: 错误延迟暴露（金额算错、并发竞态、数据被静默写坏）——TDD。
  note: 由 agent 执行时，TDD 与 SDD 的价值均被放大：测试是 agent 唯一可靠的自检信号，规格是唯一不随上下文压缩而丢失的锚点。
  signals:
    - when: 不确定某个库或接口能否实现
      then: 先做探针
    - when: 改动涉及三个以上模块
      then: 先写规格（SDD）
    - when: 代码半年后仍会被修改
      then: TDD
    - when: 需求尚需与他人对齐
      then: SDD
  pitfalls: 常见误判：为 UI 布局编写 TDD；为一次性迁移脚本编写规格；让 agent 在没有测试的情况下重构；需求未清就先写测试。
  sourceLabel: 完整判断依据 stages/30-coding/DECIDE.md
  sourceHref: https://github.com/xazaj/sdlc-playbook/blob/main/stages/30-coding/DECIDE.md
sections: []
---
