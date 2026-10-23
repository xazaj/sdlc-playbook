---
name: cloudflare-security-audit-skill
title: Cloudflare security-audit-skill：把安全审计写成多 agent 的宪法与账本
summary: 4.1 万星、1778 行的审计技能：六阶段工作流、覆盖账本、对抗式复核、预算先行；发现必须命名信任边界与真实后果，needs_validation 不给严重度。
repo: https://github.com/cloudflare/security-audit-skill
description: A coding-agent skill for multi-phase security audits with independently verified, machine-readable findings
stars: 41154
forks: 2567
contributors: 3
language: JavaScript
languages:
  JavaScript: 100.0
avatar: /projects/cloudflare.png
license: MIT
tags: [security, audit, agent-skills, multi-agent, schema]
pinned_commit: c1c8a8c1471069fb0e188eeaff69b8e8db6564a8
evaluated_at: 2026-10-23
updated_at: 2026-10-23
related: []
---

Cloudflare 开源的安全审计技能，41154 星，全部内容是 1778 行 markdown、一个 JSON schema、两个带测试的零依赖校验器。官方 README 写明它是 Cloudflare 漏洞发现 harness 的单仓库起点，harness 后来长成了多阶段舰队系统，这个仓库是它切出来的那一刀。这张卡主张：这是把多 agent 协作当宪法问题解的完整样本，权限、隔离、预算、证据标准、终态全部写死在提示词层，值得任何要编排多个 agent 做严肃工作的项目抄。

## 它解决什么问题

让 agent 做安全审计有几种常见死法：按清单报漏洞，偏离最佳实践就报警；发现自己的漏洞自己复核；报告是一段 prose，无法核验也无法去重；或者对着生产环境乱测。这个技能把整件事结构化：审计分六阶段跑，覆盖记进账本，候选由没有立场的第三方验证，输出过 schema 校验，预算不够就明说没跑成。

## 怎么解的

[SKILL.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md) 是宪法：运行模式、执行安全、写入隔离、预算、证据标准、六阶段总览、十条反模式。11 份领域手册按目标类型选用，AI 与 LLM、Web 协议与认证、客户端、供应链与发布、云与部署、RPC 与消息、资源耗尽、数据隔离、桌面与本地 IPC、内存安全与二进制。狩猎按 [HUNTING.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/HUNTING.md) 的固定九段提示词下发，`findings.json` 按 [report-schema.json](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/report-schema.json) 校验，两个校验器在流程固定点运行。

## 设计亮点

[SKILL.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md) 是宪法：运行模式、执行安全、写入隔离、预算、证据标准、六阶段总览、十条反模式。11 份手册按目标类型选用：核心攻击类目之外，十个领域各一份，AI 与 LLM、Web 协议与认证、客户端、供应链与发布、云与部署、RPC 与消息、资源耗尽、数据隔离、桌面与本地 IPC、内存安全与二进制。狩猎按 [HUNTING.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/HUNTING.md) 的固定九段提示词下发，`findings.json` 按 [report-schema.json](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/report-schema.json) 校验，两个校验器在流程固定点运行。

**候选必须有边界和后果。** 每个候选要能命名低信任主体、被越过的信任边界、受影响的资源、可观察的后果；缺最佳实践、猜部署行为、自己影响自己，都不算发现。severity 只授予 confirmed，锚点写死（critical 是未认证的代码执行、全库访问或接管任意账户），high 与 medium 的判别式一句话说清：是完全击穿显式控制，还是只削弱它。needs_validation 是被具体事实卡住的边界假设，没有严重度，也不许当成低信心的漏洞报。

**对抗式验证。** 验证者永远不是发现者，职责是推翻候选；第 5 阶段再用全新 agent 复核最终记录；报告 prose 与 findings.json 不许不一致。校验器在固定点强制跑：账本每次更新后、第 4 阶段写出后、第 5 阶段每次替换后。校验器零依赖，是对 schema 子集的手写解释器，不引第三方包。

**覆盖是账本，多轮可加。** 侦察先产出确定性的覆盖单元，狩猎按账本分派，coverage critic 专找缺口；单元同分按 coverage_id 字典序破，跑两次结果可复现。上一轮的账本与发现被读进本轮：同源未变的 confirmed 可以携带，但仍要过本轮独立验证；源码变了的必须重验；任何旧状态都不许压掉本轮单元。README 给了诚实的数字：单轮大约只找到重复运行总量的一半。

**预算先行。** 预算装不下最低配置（一轮侦察、critic 预留、至少一个验证者）就一个 agent 都不启动，记 run_status=incomplete 和确切原因；狩猎中预算见底就停止狩猎、按指纹顺序验证能验的，未验证的候选绝不进 findings.json。终态只有两种：全部产物写出且双校验器通过，或 incomplete 且报告披露缺口。不许停在阶段中间。

**写入隔离到文件描述符级。** parent 独占全部共享文件；每个 hunter 只写自己的 scratch/；产物由可信 parent 侧按 11 步竞态安全流程提升：持有目录描述符、逐级 no-follow、fstat 核链接数与字节上限、独占创建。同一段流程作为围栏块逐字复制进狩猎与验证两份提示词，两边规则一字不差。

## 借鉴清单

**能搬的：**

- 双模式授权边界：加载技能不等于授权全流程，含糊请求先问一句再动
- 证据标准三要素（主体、边界、后果）加 severity 锚点与判别式；待验证线索无严重度
- 覆盖账本加确定性破平，让多轮运行可比较、可续跑、可累积
- 对抗式验证与「prose 与 JSON 必须一致」的硬约束
- 预算当一等公民：先留 critic 与验证的份，装不下就不开跑并记 incomplete
- 零依赖校验器在流程固定点强制执行，schema 即契约

**不适用的：**

- 全流程为整库审计设计，日常 PR 的安全 review 用 guidance 模式就够，六阶段是杀鸡用牛刀
- 依赖宿主的 sub-agent 机制与 OS 级沙箱；沙箱凑不齐就只剩源码审计，这是设计使然，但采用前要知道自己的环境有什么
- 14 次提交、3 位贡献者，演进几乎全在 Dan Jones 一人手里；仓库是舰队 harness 的起点快照，不是那套系统本身
- 41154 星对着 143KB 的仓库体量，star 计的是 Cloudflare 品牌与博客热度，不是工程量，按此校准期望
- 报告三件套面向正式审计交付，小团队日常可能只要 findings.json

## 局限

快照口径：41154 stars、2567 forks、3 位贡献者（GitHub API 口径），14 次提交，最后提交 2026-09-14，评估时已一个多月未动。「单轮约一半」出自 Cloudflare 自己的测试运行，方法细节未随仓库发布。沙箱要求（断网、白名单环境、资源限额）在普通开发机上需要自己搭。

## 相关

站内项目卡《[mcp-server-cloudflare](/sdlc-playbook/projects/mcp-server-cloudflare/)》同出 Cloudflare。《[LCU](/sdlc-playbook/projects/amontlabs-lcu/)》的「模型够不着审批面板」与这里「验证者永远不是发现者」是同一原则的两个面。上游博客 [Build your own vulnerability harness](https://blog.cloudflare.com/build-your-own-vulnerability-harness) 讲它长成的那套系统。
