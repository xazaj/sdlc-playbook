---
name: agent-memory-components
title: Agent 记忆的构成
summary: Anthropic 拆解 Claude 记忆的分层设计：笔记、做梦、wiki 与注入上下文，逐层给 CL-Bench 与宝可梦实测。
date: 2026-11-07
source: https://www.anthropic.com/research/components-of-agent-memory
author: Anthropic（Lance Martin 执笔）
translated: true
tags: [agent-memory, dreaming, context-engineering, continual-learning, anthropic]
related: []
---

![封面：浅蓝底上两个错开的半圆，一个绿色一个粉色，带网格纹理，隔着一个缺口相对](/sdlc-playbook/articles/agent-memory-components/cover.jpg)

克尔凯郭尔写过，生活只能倒着去理解，却必须正着去度过。给 AI agent 设计记忆的时候，我们也碰到了同样的两难。

人无时无刻不在编码记忆。[海马体](https://stanford.edu/~jlmcc/papers/McCMcNaughtonOReilly95.pdf)在其中起核心作用，它在当下捕获经历，记忆因此形成得快，马上可用。但只有[一部分经历](https://www.science.org/doi/10.1126/science.adk8261)会被巩固成长期知识。

这种巩固大部分发生在大脑离线的时候。睡眠中以及[安静休息](https://www.nature.com/articles/s41467-018-06213-1)时，海马体会重放近期的经历。研究认为，这一过程会逐步[把这些经历蒸馏、整合](https://www.nature.com/articles/s41593-019-0467-3)进新皮层，我们称为知识的东西，大部分存在那里。

Agent 记忆可以用类似的分工。Agent 把大量工作记录在日志或转录里。Letta 与 UC Berkeley 的研究者提出过 [sleep-time compute](https://arxiv.org/abs/2504.13171)，让模型利用交互之间的空闲时间重新整理已有上下文。同样的思路也能帮 agent 组织记忆：回顾日志，修正错误，产出新的笔记和表示。这个过程常被称作[「做梦」](https://platform.claude.com/docs/en/managed-agents/dreams)（[dreaming](https://research.google/blog/the-sleep-framework-a-new-way-for-llms-to-retain-knowledge-in-continual-learning/)，图 1）。

我们发现，做梦是给 Claude 建立有效记忆的一件好用的工具。这篇文章分享我们如今如何理解 agent 记忆，并过一遍我们用来探索它的几组评测（包括做梦的使用），看每个组成部分对记忆组织各有什么贡献。

![图 1：从一个会话到下一个会话的记忆层级。自下而上是转录（可检索的事件日志）、Claude 写的记忆笔记、wiki 一类的记忆表示，以及每个会话载入的注入上下文。「Dreaming」方框内，箭头从转录层指向上面各层，相邻上层之间双向连通](/sdlc-playbook/articles/agent-memory-components/fig1-hierarchy.png)

*Claude 可以用做梦来组织记忆：纠正错误，创建笔记，构建新的记忆表示，或者决定预先载入未来会话的内容。*

## 记忆笔记

所谓 agent 记忆，指 Claude 从经验中获得、并跨会话保留的知识，包括与用户的交互和被分派的任务，存成它之后能读到的上下文。它不含模型学习或管理上下文的其他方式，比如*权重*（训练中设定的内部参数）的变化、[*上下文内学习*](https://www.anthropic.com/research/in-context-learning-and-induction-heads)（单次对话内获得的知识），以及[*压缩*](https://platform.claude.com/docs/en/build-with-claude/compaction)（Claude 写的摘要，用来替换旧回合，好在新上下文窗口里继续工作）。

在人脑中，一段经历之前、之中或之后释放的化学信号，可以[给记忆打上](https://www.nature.com/articles/385533a0)「重要」的标记。离线期间，带标记的记忆比没标记的重放得更频繁。这个叫作*重放*（replay）的过程，帮助它们稳定下来，整合进长期记忆。

类似地，Claude 可以在会话日志里随手给显著事件打标，之后好找；也可以把它们[写进](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)记忆存储，比如一个记忆笔记文件夹（图 2）。可是，在还不知道接下来会发生什么的时候，Claude 怎么判断眼前的东西重不重要？

![图 2：同一记忆层级，高亮记忆笔记层。一条箭头从会话直接指向记忆笔记，即 Claude 写下的显著观察](/sdlc-playbook/articles/agent-memory-components/fig2-memory-notes.png)

*Claude 可以把笔记写进记忆。*

## 记忆可以是对未来所需的一种预测

记忆有时就是一种预测。agent 写下一条规则，就是在预测它描述的模式还会再次相关。比如，写下一条已验证的事实，是在预测未来会话里的 agent 会想直接依赖这条事实，不再复查。随着时间推移，Claude 做这类预测的能力已经强了很多。

看 [Continual Learning Bench（CL-Bench）1.0](https://continual-learning-bench.com/news/cl-bench-1-0/) 里的一道题。这个基准测量 agent 运用记忆处理长程任务的能力。这道题让 Claude 通过查数据库回答一组问题。Claude 每答完一题会被告知正确答案，可以写一条记忆来帮助回答后续问题。

记忆在这里可以撑起一个学习循环。Claude 答错一题，可以记下这次失败，提出出错原因的猜想，验证这些猜想，再把发现变成以后怎么答题的规则。

我们用 [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) 跑了这道 CL-Bench 1.0 任务。每个问题都在全新会话里开始，只有一个例外：它可以从一个跨会话持久的[记忆目录](https://platform.claude.com/docs/en/managed-agents/memory)里取文件。

不同模型搭学习循环的水平差得很远。Claude Sonnet 4.6 只走到「为答错的原因生成猜想」这一步，它的记忆目录里散落着一些文件，每份列着几条没验证过的猜测。

![图 3：左，CL-Bench 数据库任务的平均奖励柱状图，无状态基线对比记忆存储。Opus 5.5：0.655 对 0.838。Sonnet 5.5：0.644 对 0.833。Opus 5：0.564 对 0.828。Opus 4.7：0.383 对 0.700。Sonnet 5：0.306 对 0.610。Sonnet 4.6：0.330 对 0.364。右，同样这些模型在 30 道题上的滚动平均奖励折线，有无记忆各一条](/sdlc-playbook/articles/agent-memory-components/fig3-clbench.png)

*CL-Bench 数据库任务：各模型有无记忆的对比。*

Claude Opus 4.7 把笔记合并成一份参考文档，开始标注哪些事实查证过、哪些还没确认。Sonnet 5 则在评分器核查之后把每道答案标记为已确认，答错的会写一条更正。

第一个把循环闭合的是 Claude Opus 5。它的大多数条目包含一条规则（还注明它怎么知道这条规则成立）、早先问题的答案，以及对沿途发现的坑的明确警示（图 3）。

Claude Opus 5.5 和 Claude Sonnet 5.5 与 Opus 5 一样闭合了循环，用记忆沉淀经过验证的规则，指导之后的答题。带上记忆后两者的得分和 Opus 5 大致相当，不过它们不带记忆的基线成绩要略高一些。

## Claude 学会了判断什么值得记

我们还测了 Claude 玩《宝可梦 红》的能力，以此检验它对*该往记忆里存什么*的判断。这个游戏[要求 Claude 应付](https://www.youtube.com/watch?v=CXhYDOvgpuU)复杂的长程任务。每局开始时，我们给每个模型一个记忆文件夹，游玩过程中可读可写（图 4）。

我们对比了 Claude Sonnet 3.7 和 Claude Fable 5 各一局的记忆文件夹，取的都是游戏进行到约 10,000 步时的状态。一个关键差别是什么值得记。Sonnet 3.7 觉得一切可能都有用，不加区分地往记忆里写。它的记忆文件夹像一座遭遇档案库，打过的每场战斗、捡到的每件道具，以及见到的每个 NPC，往往各占一个文件。到最后，Sonnet 3.7 在 225 个文件夹里写了 413 个记忆文件，拿到一枚徽章（徽章标记玩家的游戏进度）。

相比之下，Fable 5 在两个文件夹里写了九个文件，外加一个名为 `global.md` 的顶层文件，拿到四枚徽章。

![图 4：同一比例下的两张记忆目录树图，面积表示记忆字符数。Sonnet 3.7 的那张又大又挤，413 个文件、977,930 字符，分布在 locations、main、battles 和几个「consolidated」文件夹里。Fable 5 的很小，10 个文件、43,406 字符，分布在 locations、gameplay 和 global.md](/sdlc-playbook/articles/agent-memory-components/fig4-treemap.png)

*玩宝可梦时 Sonnet 3.7 与 Fable 5 的记忆目录对比。*

Sonnet 3.7 的做法之所以成问题，主要是因为宝可梦的游戏状态一直在变，它的详细记录不断过期。结果就是，随着游戏推进，Claude 得把越来越多的时间和资源花在翻检记忆上，而不是玩游戏。比如在第 10,000 步附近，Sonnet 3.7 开了第四个「master」记忆文件夹。接下来 17 步里，它新建了六个文件，删掉九个，游戏本身一步没动。

Fable 5 的做法是把记忆用在游戏没有直接告诉它的东西上。Sonnet 3.7 写进记忆的那类信息，比如玩家有多少钱、在地图哪个位置，每一回合都能从屏幕上读出来，存下来是冗余。相比之下，关于策略、计划，以及经过检验的规则的记忆，只有 Claude 自己琢磨出来才存在，不写下来就会消失。

Fable 5 相应地组织了记忆。`global.md` 是一块仪表盘，放着当前目标、预先写好的道馆攻略计划（徽章在道馆挑战里赢得），以及它给自己定的记忆使用规则。`locations` 文件夹放特定路线的行进计划，`gameplay` 文件夹放基于游戏机制理解总结的策略。比如，连续七个精灵球都没能收服鲤鱼王（最容易抓的宝可梦之一）之后，Claude 写道：「If 3+ balls fail in a row, VARY the timing (insert extra 'wait' presses between menu steps) - the catch landed right after doing this.」（连续三球失败就改变节奏，在菜单步骤之间插入额外的等待按键。改了之后下一次就抓住了。）

记忆文件夹小得多，Fable 5 在游戏里却比 Sonnet 3.7 走得远得多。Opus 5.5 也是类似路数：维护一小撮记忆笔记，记录当前目标和下一步，边玩边改写，最后通关了。

## 引导 Claude 写记忆

我们发现，告诉 Claude 记忆是干什么用的，效果就好，但不要告诉它*怎么*用。CL-Bench 上我们只说了一句「有个记忆文件夹可以用」。这点泛泛的指引就足够 Opus 4.7 和 Opus 5 把记忆用起来，两者的成绩都有明显提升（图 3）。

我们也测了给模型规定该往记忆里写什么的做法，一次一条规则，对比各条规则下模型从记忆中的获益与无规则时的获益。把规则设成「只记录失败」后，Opus 5 和 Opus 4.7 都丢掉了记忆带来的大部分提升（图 5 右）。对更强的模型，放手让它自己判断显著性的效果好过预先定死规则，那些规则到头来还可能削弱表现。

![图 5：左，Sonnet 4.6 在 CL-Bench 数据库任务的平均奖励柱状图，基线 0.330，带记忆 0.364，带记忆加改进指令 0.641，参考线标出 Opus 4.7 带记忆的 0.700 和 Opus 5 带记忆的 0.828。右，「只记录失败」规则下记忆获益的变化，Opus 5 −0.234，Opus 4.7 −0.150，Sonnet 4.6 −0.020](/sdlc-playbook/articles/agent-memory-components/fig5-steering.png)

*左：Sonnet 4.6 在 CL-Bench 数据库任务上的成绩，比较有无引导记忆使用的提示。右：被告知「只记录失败」后，各模型从记忆中的获益变化了多少。*

我们还注意到，引导对老模型帮助最大。比如 Sonnet 4.6 经常不读记忆目录里的文件，也不去验证自己关于答错原因的猜想。

在这个例子里，提示 Claude 答题前先读记忆文件、然后明确验证猜想，它的基准分几乎翻倍（图 5 左）。Sonnet 5 自己就会这么做，不用提示，十次答题有九次先读记忆。Sonnet 4.6 做到这一点的次数不到一半。

对前沿的 Claude 模型，我们一般只给一条简单的指引：有人要求时，或明显值得记时，创建记忆笔记。判断交给 Claude 自己。

## 做梦能纠正记忆

Claude 按会话内判断的显著性写记忆，一条从一开始就错的笔记，或者随环境变化慢慢失真的笔记，可能在之后的会话里被 Claude 读到并且相信。

做梦给 Claude 提供了一种对照原始转录检验笔记的方式（图 6）。Claude 用 Managed Agents 玩宝可梦、挂载记忆目录时，我们看到了一个正面例子。

![图 6：带做梦的记忆层级，高亮从转录层指向记忆笔记层的箭头，表示做梦对照转录纠正笔记](/sdlc-playbook/articles/agent-memory-components/fig6-dreaming-corrects.png)

*做梦能纠正记忆里的错误。*

游戏里有一段，玩家要穿过月见山。这套洞穴的入口在地图西侧，出口在东侧。入口附近有个陷阱：一道单向悬崖，把玩家摔回走过的那条路，没有明显的爬回路径。Claude 拿宝可梦中心（山入口处的一栋建筑）当地标，所以它会不会走下悬崖，取决于它以为宝可梦中心在山的哪一侧。

有一个时刻，Claude 写下（写错了）宝可梦中心在东侧。它走出宝可梦中心时宣布「Mt Moon is behind me」，并把笔记更新为「Mt Moon DONE」。可月见山并不在它身后。几个动作之后，Claude 翻下悬崖，落回原来那条路（图 7）。导航工具没有显示这道落差，于是 Claude 得出结论「I overshot far west」，认为自己一直站在正确的一侧。其实没有。

![图 7：宝可梦地图的两个面板，agent 站在悬崖边。左为「Raw memory」，存储的笔记是错的，箭头显示 agent 奔向下一座城市。右为「Memory + dreaming」，离线整理纠正了笔记，箭头显示 agent 返回洞口](/sdlc-playbook/articles/agent-memory-components/fig7-pokemon-map.png)

*一条被纠正的记忆笔记改变了宝可梦里的结局。笔记未纠正时，Claude 说「Mt Moon is behind me」，奔向下一座城市，最后落回原路。笔记被做梦纠正后，它说「Now I need to find the Mt Moon cave entrance to re-enter」，回到洞里。*

接着我们测试做梦能不能帮 Claude 避开这个陷阱。我们对那个存着错误宝可梦中心位置的记忆文件夹跑了一次做梦：Claude 对照会话转录检查笔记，抓到了错误，重写了它。转录给了 Claude 一个可以校验记忆的基准事实。拿着纠正后的记忆笔记，Claude 直接回到月见山，最终抵达华蓝市。

在笔记未纠正的那一局，Claude 三次摔回早先那条路。第三次失败后，它像是放弃了，写道：「I'm going to stop rather than keep looping.」我们的设置会自动回复让它继续。它也就继续了，一路走回尼比市，山前的那座小镇，指望在那里治疗和补给。这一局结束了，Claude 始终没能抵达华蓝市。

![图 8：3,000 个累计动作内向华蓝市推进的折线图。「记忆加做梦」的一局在第 1,935 个动作抵达华蓝市。「原始记忆」的一局摔下悬崖、退回尼比市。无记忆的一局始终没有抵达华蓝市](/sdlc-playbook/articles/agent-memory-components/fig8-progress.png)

*做梦纠正记忆后，Claude 回到洞里，抵达下一座城市。笔记未纠正（Raw memory）的那一局始终过不了山，没有记忆的那一局也一样。*

## 做梦能构建新的记忆表示

有了做梦，Claude 能构建帮助检索记忆的表示（图 9）。它用的一种记忆表示叫 [*wiki*](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)，由 Claude 编写和维护的一组页面，汇集它对某个主题所知的一切，并链接到其他笔记。这些链接实际上给了 Claude 一张地图，用来筛记忆，在需要时高效定位。

![图 9：带做梦的记忆层级，高亮从转录层和记忆笔记层指向记忆表示层（如 wiki）的箭头](/sdlc-playbook/articles/agent-memory-components/fig9-representations.png)

*做梦能构建记忆表示。*

wiki 这样的表示能帮 Claude 穿行于不断膨胀的知识库。我们用一批内部文档检验了 wiki 作为记忆表示的收益，约 350,000 个文件、大约 420M token，来自我们五月收购的软件公司 Stainless。我们围绕这批文档出了一套 25 道题的评测集，给 Claude 一个检索工具去探索，同时指示它用做梦基于这些文件建 wiki。在 128 个会话里，我们提示 Opus 5 agent 探索文件，写或修正相互链接的 wiki 页，合并重复，并对照来源核查论断。

每个会话都接着先前会话的进度往下做，用一个共享日志协调。做梦规模从两个会话扩到 128 个，25 道题的得分从评分标准的 13% 涨到 48%（图 10）。

Claude 的 wiki 是渐进建起来的。建出初始 wiki 后，靠随后一轮轮做梦去增补、编辑，或者修剪。做梦的早期，Claude 的知识像个新员工，只靠 wiki 答题的能力有限。做的梦越多，知识地图越丰富，像个老员工。测试中我们发现，wiki 配上检索工具时对 Claude 帮助最大。两者都用时，随着 wiki 长大，Claude 的总分从 54% 升到 61%，而只用检索工具是 53%。只用 wiki 答题时，Claude 最好的成绩是 48%。检索加 wiki 还让每道题省下约 20,000 个 token。

![图 10：中，评分标准达成率随做梦 token 从 2M 增长到 128M 的折线。wiki 加检索工具从 54% 升到 61%，仅 wiki 从 13% 升到 48%，仅检索工具持平在 53%。左右，一个示例 wiki 的网络图，2 个会话后 103 页 766 条链接，128 个会话后 222 页 12,893 条链接](/sdlc-playbook/articles/agent-memory-components/fig10-wiki-growth.png)

*中：随着 Claude 逐个会话建 wiki，对公司文档语料 25 道题的得分。左右：同一示例 wiki 在两个会话后与 128 个会话后的样子；每个点是一页，线连接相互链接的页。*

我们想测哪类任务能从 wiki 获益。为此用了 [Harvey LAB](https://github.com/harveyai/harvey-labs) 基准，外加一批关于一次并购的文档。这个基准给 Claude 一组文档，要求它基于内容生成一份法律简报，然后按一列标准给简报打分。也许不如宝可梦那么有趣，但这些评测提供了多样的文档集，可以拿来建 wiki。

我们指示 Claude 从这些文档建 wiki，然后分别让它从 wiki 和从直接检索文件答题（关于并购的问题）或生成法律简报（LAB 基准）。一项测试就并购提了 24 个问题（图 11 左），其中过半需要 Claude 跨多份文档找信息，不少还要它动用判断或做算术。在这些题上（红线和橙线），Claude 查 wiki 时得 87%，只用检索是 73%。

![图 11：两张图，把评分标准与源文档连线。左为 wiki 收益更明显的任务：24 条标准中的大多数连到 10 份文档中的两份以上，9 条需要判断或算术。右为 wiki 收益不明显的任务：57 条标准中的大多数可在单份文档（通常是交易概要备忘录）中通过文本检索找到](/sdlc-playbook/articles/agent-memory-components/fig11-lab-tasks.png)

*每个面板左侧列出评分项，右侧列出满足各项所需的源文档。左：关于一次并购的 24 个问题，大多查公开申报文件即可作答，过半标准需要合并多份文档的信息。右：一个 LAB 任务，wiki 没带来明显收益，大多数标准从单份文档就能满足。*

另一些情形里 wiki 就没有那么有用了。一个 LAB 任务上（图 11 右），简报标准往往用文本检索就能从单份文档里取到，wiki 相比检索没有明显收益。另一个 LAB 任务上，wiki 长得比文档本身还大（图 12）。博尔赫斯有一段式的短篇《论科学中的精确性》，里面的制图师画了一张详尽到与帝国本身等大的地图；Claude 也做出了一个极其详尽的 wiki，实际上什么也没抽象掉。

![图 12：wiki 构建示意图。左侧圆圈是语料，10 份文档，115 KB 文本。箭头指向更大的圆圈，即由它建出的 wiki：68 页、255 条链接与 203 KB，是语料的 1.77 倍。wiki 的部分页面没有链接](/sdlc-playbook/articles/agent-memory-components/fig12-wiki-bloat.png)

*wiki 长得比原始文件还大。*

## 做梦能把笔记提升到记忆层级上层

做梦也能把笔记浮到记忆层级的顶层，agent harness 可以在每个会话开始时预先把它们载入 Claude 的上下文（图 13）。Claude 因此不需要去搜它们，甚至不需要知道有东西可搜。

把记忆提升进新会话（一种*上下文注入*）必须谨慎。注入的记忆消耗宝贵的 token，一条错误笔记可能被带进每个会话。载入笔记也不保证 Claude 会照着做：Claude Code 的[文档](https://code.claude.com/docs/en/memory)警告过，指令文件越长，遵守度越低。所以记忆层级的顶层必须保持相对小，做梦在这里的大量工作就是维持这一点，把部分细节下放到层级下层，留下链接。

[Claude Code 的自动记忆](https://code.claude.com/docs/en/memory)用同样的办法保持注入层精简，由 Claude 在会话中维护。Claude 不会把全部自动记忆装进每个会话的上下文窗口，只载入 `MEMORY.md` 的前 200 行或 25 KB。这个头部当作索引，告诉 Claude 它知道什么、到哪里找。

![图 13：带做梦的记忆层级，高亮从转录层和记忆表示层指向顶层注入上下文层的箭头，注入上下文进入下一个会话](/sdlc-playbook/articles/agent-memory-components/fig13-promotion.png)

*做梦能写到记忆层级顶层。注入上下文载入每个会话，其下各层在 Claude 需要时才读取或检索。*

## 做梦能让记忆围绕特定目标生长

做梦还能塑造记忆生长的方向。比如 [Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) 这类助手，记忆围绕它帮助的那个人组织时收益明显，做梦可以调成围绕特定目标构建记忆。

引导记忆生长的指令因任务而异，它们告诉 Claude 什么信息真正要紧。比如 LAB 基准里有个任务模拟公司收购，提供一组合同，简报按是否正确描述合同条款来评分。

我们从生成 wiki 的基础指令开始，不告诉 Claude *怎么*用 wiki。这个任务高度依赖合同条款。wiki 构建过程中，几个 agent 同时往一张共享的合同条款表里写（图 14 左）。

![图 14：两张示意图。前：四个 agent 写同一个共享页 provisions.md，一个 agent 的保存覆盖了另一个的行，57 条受评分事实留下 41 条。后：四个 agent 各写自己那份合同的页，条款逐字复制，57 条全部保留](/sdlc-playbook/articles/agent-memory-components/fig14-contract-facts.png)

*指令改变前后，多少条受评分的合同事实进了 wiki。左：几个 agent 往同一共享页写，57 条事实留下 41 条。右：每份合同一个 agent，各写各的页，条款逐字引用，57 条全部保留。*

结果是 wiki 缺了关键事实。给由这个 wiki 生成的简报评分时，57 条事实 Claude 只写进了 41 条（72%）。回头查哪里出了问题，我们发现共享表对合同条款的概括很差，有些条款干脆没有，因为 agent 互相覆盖了对方的工作。

合同条款是 wiki 里最重要的部分，但指令没有这么说。为了找到更好的指令，我们跑了一个循环：Claude 反思失败，提出对指令的修改，重建 wiki。这个循环让 Claude 自己发现遵循合同条款有多重要，并据此重写了建 wiki 的指令。

wiki 里每份合同有了自己的一页，由单个 agent 撰写，条款逐字引用，不再概括进共享表。给由改进后的 wiki 生成的简报评分，100% 的标准都能满足，此前是 72%。

## 做梦能补上单个会话留下的缺口

Claude 写记忆笔记时，看到的只有*那一个*会话的上下文。做梦可以跨很多会话检索，找出共同模式或纠正常见错误。

给 LAB 基准建 wiki 时（例子见图 14），Claude 有时会链接到尚未创建的页。第二轮做梦补上了许多这样的缺口。一个任务上（图 15），做梦发现 wiki 里有九条链接指向一个不存在的页，把它们改指到同一文档的现有页面，还新增了三页，包括一个索引，让 wiki 更完整。

![图 15：wiki 的两张网络图。第二轮之前：38 个条目、225 条链接，六个页面的九条链接指向不存在的「escrow-agreement」。之后：41 个条目、278 条链接，九条链接全部改指「buyer-form-escrow-agreement」，新增三个页面：index、instructions email、escalations](/sdlc-playbook/articles/agent-memory-components/fig15-wiki-links.png)

*第二轮做梦前后的 wiki。*

## 向后思考，向前看

如何给 agent 设计记忆系统，还有很多悬而未决的问题。一个是 Claude 应该在什么时候创建记忆。Claude 干活时可以往记忆存储里写（文件夹也好，文件、数据库也好），在源头捕获显著性，让重要细节立刻可用于后续回合或会话。但当下记笔记免不了把 Claude 的注意力从主任务上引开。反过来，做梦能把记忆创建推到后台，但做梦的产出 Claude 未必马上用得上。

另一个问题是怎么让记忆可靠地保持最新。Claude 可能做出错误预测，或者一开始就写错规则。环境变化时记忆也会失真、失效。做梦是纠正这些错误的一种方式（图 8），但它消耗算力。让 Claude 持续检查*全部*记忆未必现实，更重要的可能是让做梦聚焦在容易变化的信息上，或者仔细调做梦的节奏（比如按记忆的访问频率）。

把转录检索当作 Claude 记忆的地基也说得通。表示（比如 wiki）与检索结合（图 10）有时有效，但 Claude 需要花算力维护记忆表示，确保错误和幻觉不在里面累积。

尽管 Claude 对显著性的判断已经进步，没有哪个模型真的知道后续回合会发生什么。做梦给了 Claude 一个*回头*看的机会，用算力整理记忆、纠正错误，把表示维护好，让之后的会话更容易取用记忆。记忆系统会随 Claude 能力的增长而演进，设计 Claude 的记忆系统，我们要学的还有很多。

入门做梦与知识 wiki，见我们的 cookbook：[开始使用 dreaming](https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow) 与[知识 wiki](https://github.com/anthropics/claude-quickstarts/tree/main/managed-agents/knowledge-wiki)。

## 作者与致谢

### 致谢

由 Lance Martin 撰写，Caitlin Love、Tom Chivers、Rebecca Hiscott、Jake Eaton 与 Blake Wilson 提供编辑指导。感谢 Barry Zhang、Theodora Chu、Daliang Li、Mahesh Murag、Jake Noble、Ravi Trivedi、Tina Vachovsky、Brad Abrams、Henry de Valence、Jeremy Fox、Matt Bell、Allen Li、Chris Gorgolewski、Eugene Yan、Artur Renault、Wei Zhang 与 Kevin Chen 的讨论与贡献，感谢 David Hershey 的 Claude Plays Pokémon。插图由 Monika Tuchowska 绘制。
