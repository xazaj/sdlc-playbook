---
name: pbakaus-impeccable
title: Impeccable：方向交给骰子，验收交给像素差
summary: 一个技能 24 条命令、62 条确定性规则：方向由掷骰子指派，成品靠与方案图的逐区读数验收，模板感在编辑现场被点名。
repo: https://github.com/pbakaus/impeccable
description: The design vocabulary for your coding agent. Steer with polish and bolder, review with critique and audit, catch AI slop before it ships.
stars: 91819
forks: 5429
contributors: 57
language: Rust
languages:
  Rust: 76.2
  JavaScript: 21.2
  TypeScript: 1.8
  HTML: 0.3
  CSS: 0.3
avatar: /projects/pbakaus.png
license: Apache-2.0
tags: [ai-agents, design, frontend, rust, skill]
pinned_commit: 5adaee704634e9031ec8943721c4ffa1a3c22221
evaluated_at: 2026-10-28
updated_at: 2026-10-28
related: [ai-design-three-stages, frontend-design, design-constraint-loop]
---

Impeccable 是给编码 agent 的一副设计词汇：一条技能带 24 条命令，62 条确定性规则在编辑现场抓 AI 生成界面的典型痕迹，CLI 与浏览器扩展不需要模型也不需要 API key。这张卡关心它怎么处理两件更难的事。模型无法按要求随机，方向就由掷骰子指派；模型判断不了自己的还原是否成立，验收就改成截图与方案图之间的逐区读数。

## 它解决什么问题

让 agent 写界面已经不难，难的是让它每次别写成同一套。模型在同一批 SaaS 模板上训练，跳过约束就会收敛到同一组特征：Inter 走天下、蓝紫渐变、卡片套卡片、彩色底上的灰字、每个标题上方一枚圆角方形图标。这些特征可以列成清单，也可以逐条检测，但清单不解决方向问题——禁止项写进 prompt，模型只是在剩下的选项里再挑一次最安全的那个。

自评是第二个问题。让模型看自己的实现，它系统性地相信还原成功了。项目文档把这个现象写成构建流程存在的理由：模型会认为自己的 HTML、CSS、SVG 复刻达到了参照图，实际没有。

第三个问题是上下文混装。产品事实、跨屏视觉系统、这一屏的策略经常塞在同一份文件里。改一处动全身，而且先写下的视觉规则会变成需要辩护的立场。

## 怎么解的

三类真相分三个文件。[PRODUCT.md](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/PRODUCT.md) 记产品事实：受众、用途、约束、口吻、手上有什么证据。[DESIGN.md](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/DESIGN.md) 记跨屏的视觉决定：色板、字体、组件语言。surface brief 只放一条路由或一个产物的策略，加上六块、约一百五十词的方向合同。`impeccable context` 每会话跑一次，把三者连同原生平台指南读进来，输出一次性的指令，之后不再重复。

DESIGN.md 的写入时机是反直觉的。新世界在构建完成之后由专门的 documenter 从成品写回，不在动工之前，理由写在 [new-work.md](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/skill/reference/new-work.md) 第 5 节：先写规则，构建过程就会围着规则做辩护；从成品回写，文档描述的是实际存在的东西。

技能正文只有 90 行，装的是原则、四种访客模式、24 条命令的索引和路由规则。每条命令的细节在 [reference/](https://github.com/pbakaus/impeccable/tree/5adaee704634e9031ec8943721c4ffa1a3c22221/skill/reference) 下的四十一个文件里，按需加载。构建脚本把这一份源文转换成 21 个 provider 配置的目录布局，生成出来的根目录照样入库，所以 main 分支直接可装。行为契约由 [tests/oracle](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/tests/oracle/README.md) 冻结：每个动词的 stdout、stderr、退出码和产物文件都录成 golden，逐字节比对，差异必须先在 DELTAS.md 里说明。

运行时是一个 Rust 工作区，技能目录里的启动器找到或下载一枚固定版本的二进制，没有 Node 依赖。62 条规则、构建阶段的门、决策页的本地服务都在这枚二进制里，crate 分工见 [ENGINE.md](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/docs/ENGINE.md)。

方向环节叫 roll。先列出七个来自受众世界的具体视觉系统，按共鸣排序，然后跑 `concept-seed`。骰子从这七个里指派一个必须实现的方向，再从上游目录里发几张挑战者卡。挑战者逐个裁定：赢、打平、还是放弃。放弃的也要交出一条它比指派方向更强的纪律，作为「提升」写进呈现稿。权限划得很清楚：re-roll 是用户的按钮，agent 自己只能因为具名的事实问题重掷，口味不算理由。另有一扇安静的门，类目标准做法，永远在页面上，永远不推荐。

掷骰子的键是 32 位十六进制，来自系统 CSPRNG，永不入库。入的是 16 位引用：SHA-256 加盐后取前 16 位，盐是 128 位随机数，存在本机 `~/.impeccable/seed-salt`。拿着遥测数据集也定位不到提交里的 brief；代价是这份引用只在本机可解析，换台机器就得拿原始键。实现见 [seed.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/common/src/seed.rs) 与 [concept_seed.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/context/src/concept_seed.rs)。

选了 comp-led，构建就变成磁盘上的状态机：comps、spec、plates、hero、sections、motion、responsive、review 八个阶段，每阶段用 `build-phase advance` 关门。门不是清单，是读数。comp-spec 在方案图上打坐标网格，逐区量出色块、字体、介质；font-match 从像素里量 cap height、字宽、字重，再去 Google Fonts 指纹库里排候选；plates 要求每个图像区域真的生成资产；hero 门要求首屏截图与方案图的综合分过 72%，并按区域打印「构建里 cap height 78px，方案里 103px」这样的差值；responsive 门是 65%。评分和证据一起落盘，comp-diff 写并排图、热力图、逐区配对裁剪和 report.json。最后交给一个全新上下文的 [finish reviewer](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/skill/agents/impeccable-finish-reviewer.md)，它没有浏览器，只看文件，只返回四个词之一：recapture、rebuild、fix、ship。

检测是另一条通道。62 条规则在 [registry.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/foundation/src/registry.rs) 里，slop 与 quality 各 31 条，从同一份实现经文本、静态 HTML、浏览器三个引擎执行，再编译成 wasm 供页内包与浏览器扩展使用。设计钩子在 UI 文件编辑后跑其中 12 条 immediate tier 规则，把发现直接送进 agent 的上下文，Stop 时再跑深一层。规则 id 可以逐条豁免，豁免记录带规则、文件范围与原因。下游 crate 能注册自己的规则包，id 带命名空间，不能覆盖内置规则。

检测与判断分层。README 自己说，检测跑干净只是证据，不是证明：它不替代在真实视口里看渲染结果。

## 设计亮点

**骰子是指派，不是建议。** 让模型「多给几个方向」得到的仍是同一族方向，因为它在做安全选择。把随机数生成交给系统 CSPRNG，把选择权拆成两半：方向由骰子定，re-roll 由用户按。agent 想自己重掷，必须指出指派方向在哪条产品事实或任务上不成立。这条把「换个方向」从情绪争论变成一次有门槛的操作，落在 new-work.md 与 [roll_selection.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/context/src/roll_selection.rs)。

**把「像不像」拆成能打印的读数。** 自评不可信，所以每个阶段关门时给出数字：整体分、结构分、颜色分、细节分、分带分，以及逐区的 missing、contradicted、drift。数字之外的东西仍交给评审：字体气质、材质、地面色温是必答行；没有方案图时按 OWN-WORLD 判，没有 OWN-WORLD 就明说没有裁决依据。读数能变成编辑指令，不能变成审美权威。门的值在 [build_phase.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/comp-verbs/src/build_phase.rs)，评分维度在 [comp_diff.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/comp-verbs/src/comp_diff.rs)。

**事实、世界、一屏三层，且视觉文件从成品回写。** 产品事实稳定，跨屏视觉系统次之，单屏策略最易变。三者分开，改一屏不动产品文件。DESIGN.md 在构建后写，避免文档先于现实。落在 PRODUCT.md、DESIGN.md 与 new-work 第 5 节。

**一份源，21 个出口，行为按字节冻结。** 每个 harness 维护一套 prompt 必然漂移。这里只有一份源文，转换器负责布局差异，生成物入库保证可装。行为不靠自觉，靠 oracle 的逐字节 golden。落在 [providers.js](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/scripts/lib/transformers/providers.js)、tests/oracle 与 ENGINE.md。

**机械项与判断项分开计分。** 62 条确定性规则不需要模型，不花 token，也不会因为上下文变长而失效；模型只做评审、取舍、写。误报就地豁免并写明原因，而不是关掉整条通道。落在 registry.rs、内联豁免与 [craft-floor.md](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/skill/reference/craft-floor.md)。

## 借鉴清单

**能搬的：**

- 把随机写进流程：先列候选、骰子指派、用户保留重掷，agent 重掷要有事实理由。任何「模型每次都给同一套」的生成任务都能用
- 验收门只认可测读数：参照图与成品按区域打分，读数随报告落盘，失败项打印具体差值
- 三层文件分家，视觉规范从成品回写，不在动工前写
- 一份源文加多目标转换，生成物入库，行为用逐字节 golden 冻结
- 决策做成一次点击：本地起一个页面，`--wait` 收答案，答案写成 JSON；聊天里的「你觉得呢」不算决策
- 规则带 id、可逐条豁免并记录原因；确定性检查与模型判断分开计分

**不适用的：**

- 整机太重。Rust 工作区、八阶段状态机、图像生成、Chrome 自动化，为的是产出视觉成品；文档站与后端服务用不上
- 62 条规则全部针对渲染后的前端界面，非 UI 项目零收益
- comp-led 路线自己写明小模型会在 hero 门卡死，要 frontier 模型、图像生成和可截图的环境
- 目录世界是上游的品味库，接 roll API 等于接它的审美；遥测默认开启，可关
- seed reference 只在本机可解析，跨机器协作用 brief 会丢可复现性
- 站点与服务在私有仓库，开源部分不含目录和 roll 服务

## 局限

快照口径：91.8k stars、5.4k forks、57 位贡献者，4.8.0，2025 年 11 月建仓。四十五个未关闭的 issue 与 PR，迭代速度快，引擎版本钉在技能目录里，跨版本行为以 oracle 为准。

设计判断仍是启发式。62 条规则抓的是可枚举的痕迹，抓不到排版气质；方向合同只有评审模型能核，没有机械检查。comp-led 的测量依赖截图与方案图同一视角，响应式和动态状态覆盖有限，65% 的门比首屏低一截。

star 数与真实使用量的关系无法从公开数据判断。项目自己的站点、目录和 roll 服务不在这个仓库里，想完整复刻得另建。

## 相关

站内登记卡《[AI 设计三阶段约束](/sdlc-playbook/entries/ai-design-three-stages/)》是同一条脉络的早期总结：种子串发散、独立评审收敛、做减法收尾。Impeccable 把这三步做成可执行的门。登记卡《[frontend-design](/sdlc-playbook/entries/frontend-design/)》是它的起点，README 明说从 Anthropic 那个技能开始。登记卡《[设计约束回路](/sdlc-playbook/entries/design-constraint-loop/)》处理同一问题的长期版本：把人工纠正沉淀成约束文件与机械检查。文章《[界面好不好，是可以判断的](/sdlc-playbook/articles/ui-review-principles/)》讨论的正是这套验收门的前提。

上游文档在 [impeccable.style/docs](https://impeccable.style/docs)，规则目录可用 `npx impeccable detect --list-rules` 打印。决策页的本地服务实现见 [serve_question.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/context/src/serve_question.rs)，钩子的编辑后通道见 [hook.rs](https://github.com/pbakaus/impeccable/blob/5adaee704634e9031ec8943721c4ffa1a3c22221/crates/hook/src/hook.rs)。
