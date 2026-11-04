---
name: phuryn-product-engineering
title: phuryn/product-engineering：把技能集的治理解成工程问题
summary: PM 视角的全流程技能集；真正值得搬的是它的治理：收据制规则、描述预算、异模型独立复核、源与拒绝双账本。
repo: https://github.com/phuryn/product-engineering
description: Agent skills for shipping real products with coding agents, from the first idea to paying users. No coding.
stars: 241
forks: 30
contributors: 1
language: Python
languages:
  Python: 71.2
  TypeScript: 20.7
  HTML: 5.3
  JavaScript: 2.8
avatar: /projects/phuryn.png
license: MIT
tags: [agent-skills, claude-code, codex, governance, release-review]
pinned_commit: 0e8b5a5fdd7155a5c440ade930c3e081eb387943
evaluated_at: 2026-11-04
related: []
---

Pawel Huryn（The Product Compass 专栏作者，ex-CPO）把「不写代码的人用 coding agent 把产品做到有人付费」打成 6 个 pack、44 个技能，MIT 开源，建仓一周 241 星，佐证是他自己用这套流程建的三个在线产品。这张卡的主张：方法论正文是合格但寻常的打包，可搬走的东西在仓库治理里——它的 [AGENTS.md](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/AGENTS.md) 把「技能集如何不腐化」当工程问题解：规则带收据、描述有预算、来源有账本、拒绝有记录、能写成测试的规则不写成散文。

## 它解决什么问题

两类问题叠在一个仓库里。

面向用户：PM、创始人用 agent 发货但不读代码，靠什么决策与把关。它的答案是一套流程——证据先于构建（agent 先调研替代品和市场再提案）、提案配可点击的原型、构建即实验（几天内带支付上线）、发布前过独立的复核与门槛、投产运维（法务页、邮件、监控、分析）也是流程的一部分。八步全流程在 [WALKTHROUGH.md](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/WALKTHROUGH.md) 逐步展开。

面向维护者：技能集合的几种死法它全都机制化了——技能描述挤爆上下文被宿主截断；规则读起来像常识，没人知道为什么存在；技能互相引用断链；上游同步与产品教训的收割靠记忆；被拒绝的请求隔月重来。多数技能仓库死在后半组问题上，这个仓库把每一项都变成了文件或脚本。

## 怎么解的

六个 pack 目录（product、ai-shipping、agent-teams、agent-harness、app-stack、work-humanizer），每个技能一个自包含的 `skills/<name>/SKILL.md`，`tools/validate.py` 管正文契约，`tools/check_sources.py` 管上游同步与教训收割，双 CI 把关。分发三路：Claude Code 插件市场（`.claude-plugin/marketplace.json`）、Codex 直接读同一市场、其余 agent 走 `npx skills`。技能一律不做成命令，因为 Codex 不加载插件命令（2026-10-27，Codex CLI 0.159.0 的收据）。

## 设计亮点

**描述是预算，不是文案。** 40 个自动触发技能的 description 常驻每个会话：[validate.py](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/tools/validate.py) 强制总量 ≤6000 字符、单个 ≤300，触发词放最前——因为 Claude Code 2.1.311 实测从尾部截断，Codex CLI 0.159.0 把最长的一条从词中间切断。token 数按实测取（5,576 字符花 2,423 token，约 2.8 字符/token），不许按字符数 ÷4 估。用户手动启动的技能用双开关（`disable-model-invocation` 加 `agents/openai.yaml` 的 `allow_implicit_invocation: false`）整个移出上下文，描述放宽到 1024 字符。

**规则带收据。** 每条从实践来的规则保留日期与事故经过（「2026-10-27，Codex CLI 0.159.0……」），README 称全部技能里约 700 条收据；新规则必须有一个观察到的失败才准入。平台行为全部带读取日期，厂商变了就改那一行，不许新旧并存。

**写码的会话不清自己的码。** 每次会部署的 push 前，一个从没见过构建过程的 reviewer 整轮读变更，直到某轮找不到「本次引入的 Medium 以上」且无任何年龄的 High/Critical。默认用 Grok——另一个模型家族——运行约束写死：只读、无 MCP server、关 memory。发布门槛同构：独立复核过不了就不发版，规则在 AGENTS.md 的 Releasing 一节，连同复核简报模板和后台运行脚本。

**源与拒绝双账本。** [sources.json](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/sources.json) 记录每个技能抄自哪个上游的哪个 commit，`check_sources.py` 列出上游此后的变更，移植或不移植都要留痕；产品仓库的教训用 `--harvest` 收割——收据：一次四天构建产出约 140 条教训，而技能副本字节未动，只盯副本会全漏。拒绝的请求进 [rejected.md](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/rejected.md)，带日期、理由、证据，提新请求先查它。产品装 pack 不带副本：副本把方法冻结在旧版，还会双重加载（2026-11-03 收据）。

**能写成测试的规则不写成散文。** 散文义务会腐化，代码路径不会——validate.py 强制：技能文件夹单独拷走可用；交叉引用只按技能名；每个技能必须有「How you can tell it worked」一节；泄密扫描读全部文件而非只有技能（收据：产品首页截图的手机聊天里露出一个私有产品名，复核轮抓住），图片再人工过目。小而准的一条：commit message 走 heredoc 不走 `-m`——反引号在 `-m` 里被命令替换无声吃掉。

## 借鉴清单

**能搬的：**

- 描述预算四件套：总量加单个上限、触发词前置、实测 token 数、手动触发技能移出上下文。任何多技能仓库当天能用
- 收据制规则：日期加事故，新规则需观察到的失败；平台事实带读取日期，变了就改那一行
- 源账本加拒绝账本加 harvest：上游同步留痕、产品教训定期收割、单一 master 原则（装 pack 不带副本）
- 独立复核的运行约束写成硬条件：另一模型家族、只读、无 MCP、关 memory，并与发布门槛绑定
- 正文契约进 CI：自包含、按名引用、每个技能声明「怎么算生效」、泄密扫描覆盖全部文件

**不适用的：**

- 方法论强绑定作者的技术栈：Next.js、Supabase、Clerk、Netlify，监控默认作者自家的 Staygreen（有披露）。流程骨架可搬，栈要整套换
- 八步流程对单人小项目偏重，作者自己给了跳步规则（一分钟能验的改动直接进构建）；照单全收会变成仪式
- 约 700 条收据、三个产品的教训，全部出自作者单人工作流。该复用的是机制，不是数字
- 语言占比（Python 71%）是校验脚本与示例的重量，正文全是 markdown，别按语言栈判断适用性
- 241 星一周达成，导流来自作者专栏；贡献者 1 人，热度不等于社区验证

## 局限

单人维护，全部平台事实（Claude Code、Codex 的行为）靠作者追新，过时风险集中在带日期的行上。app-stack 约半数内容是特定 SaaS 模板的部署细节，换栈即作废。与姊妹仓库 pm-skills 有五个技能双向重复，作者给了共存指引，保持单一来源仍靠用户手工。收据是自报口径：`sources.local.json` 与泄密名单故意不入库，仓库外无法独立复核。

## 相关

上游全文档：[README](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/README.md)（技能清单与安装）、[AGENTS.md](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/AGENTS.md)（治理宪法，本卡主要解剖对象）、[CASE-STUDIES.md](https://github.com/phuryn/product-engineering/blob/0e8b5a5fdd7155a5c440ade930c3e081eb387943/CASE-STUDIES.md)（三个佐证产品的解剖）。姊妹仓库 [phuryn/pm-skills](https://github.com/phuryn/pm-skills) 覆盖 discovery 与 go-to-market。方法论出处是 Product Compass 的 [Product Engineering for PMs](https://www.productcompass.pm/p/product-engineering-for-pms) 系列。
