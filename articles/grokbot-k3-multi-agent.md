---
name: grokbot-k3-multi-agent
title: 把 Grokbot 变成 300 个 K3 agent 的多 agent 系统（完整指南）
summary: 单 bot 的天花板是形状：Grokbot 当路由器，四种拆活模式、共享记忆加统一交接，Kimi K3 一次跑最多 300 个并行 agent。
date: 2026-11-14
source: https://x.com/0xRicker/status/2112903221987397874
author: "@0xRicker"
translated: true
tags: [multi-agent, grokbot, kimi-k3, orchestration, router]
related: []
---

![题图：GROKBOT 面板前站着一台球形机器人，线连出 RESEARCH、ANALYZE、CODE 等任务标签，汇入粉色的 K3 层与一排小方块机器人（300 AGENTS）；底部五步条：SETUP、SPAWN、COORDINATE、EXECUTE、RESULTS](/sdlc-playbook/articles/grokbot-k3-multi-agent/cover.jpg)

一次回答一个 prompt 的单个 bot 只是聊天。给它一个路由器、四种拆活方式，再加一份共享记忆和背后 300 个 Kimi agent，它就成了一套系统。

> 订阅我的 Substack，第一时间拿到 AI alpha：
> [substack.com/@0xMortyx](https://substack.com/@0xMortyx)

你的 Grokbot 很聪明，但它也在单打独斗，单打独斗就是它的天花板。

让单个 bot 干点小事，它很出色。让它干真活，比如扫 80 家公司做市场分析、最后给一条推荐，你能眼看它撞墙：读过的转头就忘，后半程赶工，交回来的东西自信而单薄。模型没问题，问题出在形状上：一个 agent、一份上下文、一次过。

![示意图：GROKBOT（router）四条曲线分别接 FAN-OUT、CHAIN、DEBATE、SUPERVISOR 四个框，各自下方一列同色点阵；底栏写 KIMI K3 RUNTIME，up to 300 agents，shared memory · 1M context · one handoff format](/sdlc-playbook/articles/grokbot-k3-multi-agent/wall.jpg)

多 agent 系统修的就是形状。活不再由单个 agent 全包，它被拆给一组 agent，每个把自己那部分做好，共享所学，互相检查。这听起来像一大坨工程，以前也确实是。拆法对了，它主要是几条 prompt。

分工很简单：Grokbot 当路由器，读每个请求，决定活怎么拆；Kimi K3 当运行时，把 agent 拉起来，给它们共享记忆，并行跑，一次最多 300 个、跨 4,000 步。

> Grokbot 决定怎么拆活，Kimi K3 跑完每一份。路由器是一条 prompt，运行时是三百个 agent。

## 为什么一个 agent 会撞墙

每个 agent 都活在自己的上下文里。大活交给单个 agent，指令、读过的每一份材料，加上每个半成品想法和草稿，全得一次性塞进去。活越大，上下文越满，掉质量的是排在最后的那部分。

![对比图：同一个 80 家公司扫描，左边 1 AGENT 的高容器在约一半处溢出粉色虚线 limit（标着 company 27），右边 8 AGENTS 各一条窄容器，蓝色水位远低于 limit 线，各背 10 家公司加简报](/sdlc-playbook/articles/grokbot-k3-multi-agent/split.jpg)

左边，一个 agent 独扛整个扫描，到第 50 家公司上下文就用完了，之后每家都读得更糙。右边，同一份活拆成八路，每个 agent 背十家公司加一份共享简报，全都稳稳待在限额之内。总活量一样，结尾一点没丢。

拆分不只关乎空间，还关乎专注。只管对比定价页的 agent，把定价页对比得更好；如果它还得记着简报、格式和另外 70 家公司，就做不了那么好。多 agent 靠许多个专注的脑子，不靠一个更大的脑子。

## Grokbot 当路由器

第一个改变：别再让 Grokbot 直接回答请求。每个请求先过同一个问题：**这活是什么形状？** Grokbot 看一眼请求，把它送进四条道里的一条，每条道对应一种把活拆给 Kimi agent 的方式。

![路由示意图：请求「should we launch in Q1 or Q2?」进入 GROKBOT（router），分出 FAN-OUT（many items）、CHAIN（step by step）、DEBATE（judgment）、SUPERVISOR（long + risky）四条道；路由器读形状，不读主题](/sdlc-playbook/articles/grokbot-k3-multi-agent/router.jpg)

路由器不需要懂主题，它只需要回答关于形状的三个问题：**独立条目多不多？**扇出。**每步要不要吃上一步的产出？**链式。**是没有唯一正解的判断题？**辩论。**活长、乱、半路可能出岔？**监督。整条路由器就是一个 Grokbot prompt：

```python
grokbot · 路由 prompt
你是一个路由器，永远不要亲自干活。
对每个请求，选出唯一一种模式，交给 Kimi：

FAN-OUT     大量独立条目（扫 80 家公司）
CHAIN       每步依赖上一步（调研 → 起草 → 编辑）
DEBATE      判断题，没有唯一答案（要不要上线？）
SUPERVISOR  活长、乱、可能失败（造一个工具并测试）

输出：模式、一行理由、给 Kimi 的任务简报。
两个模式拿不准时，选更简单的那个。
```

## Kimi K3 跑的四种模式

现实里的多 agent 系统几乎都是这四种形状之一，或两个叠起来。学会这四个，几乎什么都能搭。每个形状是一份模板，在 **Kimi Agent Swarm** 里存一次，永远复用。

![模式库四宫格：FAN-OUT（brief 扇出到八个圆再汇入 merge，go wide）、CHAIN（research → analyze → draft → edit 串行，go deep）、DEBATE（agent A 正方对 agent B 反方，rebuttal 虚线，judge 拍板并给理由，argue it out）、SUPERVISOR（supervisor 派 w1–w4，w3 标红 retry，catch failures）](/sdlc-playbook/articles/grokbot-k3-multi-agent/patterns.jpg)

**01 · 扇出：往宽里走**

一份简报，许多个同构 agent，最后一次合并。每个 agent 领一个条目，做同样的活，按同样格式交回结果，最后一个 agent 把全部合并成一份产出。Kimi 的 **300 个并行 agent** 在这里最值钱：80 家公司、200 份文档，或 300 个股票代码，一个条目的时间内全部跑完。

**02 · 链式：往深里走**

agent 排成一条线，每个接上一个的产出：调研交给分析，分析交给起草，起草交给编辑。每个 agent 都是专才，只看它需要看的。质量依赖顺序时用它，比如一份报告，结论要从分析里得来，不能跟分析并排摆着。

**03 · 辩论：吵出来**

两个 agent 各站问题一边，第三个当裁判。听着像演戏，但它有效：单个 agent 倾向于同意自己的第一个想法，一个专职对手不会。拿它做决策：上还是等，买还是造，三个选项选哪个。裁判读完两边陈述，必须为自己的选择给出理由。

**04 · 监督：接住失败**

一个监督 agent 把任务分给工人，检查每份结果，把失败的连理由一起打回。长活、半路必坏的场景用它，比如造一个工具并测试。**Kimi K3** 在这里强两次：计划能跨几千步不断线；工人写的是 Fable 5 水平的真后端代码，一开始就少有任务带着伤回来。

## 给每个 agent 同一份记忆

互相看不见对方工作的 agent 会重复劳动，会自相矛盾，或者漏掉要点。解法是共享记忆：一个每个 agent 开工前读、完工后写的地方。在 Kimi 的一次运行里，这个地方就是运行自身的上下文。**1M token** 的容量，装得下一整次运行的简报、所有发现和所有决定。

![共享记忆看板：一排蓝色 agent 圆点指向三个空面板 FACTS、DECISIONS、OPEN QUESTIONS，右上标 KIMI K3 · 1M CONTEXT；后到的 agent 先读这块板，谁也不重复或推翻前面的工作](/sdlc-playbook/articles/grokbot-k3-multi-agent/memory.jpg)

记忆要有结构，否则会变成噪音。三节就够：**事实**（查证过的东西，带来源）、**决定**（做了什么选择、为什么）、**待解问题**（还不知道的东西）。每个 agent 的第一步是读全三节，最后一步是往其中一节里添东西。

## 约定同一种消息格式

agent 之间交接活的地方，就是系统散架的地方。一个交回一段文字，下一个等着收列表，合并时数据悄悄丢一半。解法很无聊但有效：每个 agent 每次都交回同一种形状。

```python
handoff.format · 每个 agent 都交回这个
{
  "agent":      "fanout-17",
  "task":       "pricing for company 17",
  "status":     "done" | "failed" | "partial",
  "result":     { ...the actual output... },
  "sources":    ["url", "url"],
  "confidence": 0.9,
  "memory":     { "facts": [...], "open": [...] }
}
```

两个字段干了大部分活。**status** 让监督 agent 不必逐份读结果就能看到失败；**confidence** 让合并环节能给结果加权，而不是把猜测和已验证的事实同等对待。这个格式写一次，贴进每份模式模板，交接从此不用再想。

## 把失败写进计划

300 个 agent 的一次运行里，总有几个会失败：页面加载不出来，两个来源互相矛盾，任务只回来一半。单个 agent 一失败，整个回答就毁了；多 agent 系统只重试坏掉的那一块。

![失败处理图：first pass 278 pass · 22 fail，retry with reason 19 pass · 3 fail，second retry 2 pass · 1 fail，最后 1 条标为 open 进记忆；附失败原因的重试几乎收清全部](/sdlc-playbook/articles/grokbot-k3-multi-agent/retry.jpg)

诀窍在重试本身。瞎重试会用同样的方式失败两次；带着原因的重试（「页面没有定价信息，试试文档站」）通常能成。重试两次仍失败的，进记忆的待解问题一节，在最终产出里标记出来，不悄悄瞎猜一个。

## 单 agent 对阵系统

同一个 Grokbot，升级前后各跑三类真实任务。单 agent 是 Grokbot 直接回答，系统是 Grokbot 路由给 Kimi K3。

![质量对比：小活（总结 3 篇帖子）灰 92% 对蓝 96%，中活（对比 20 个工具）灰 61% 对蓝 93%，大活（扫 80 家公司）灰 28% 对蓝 91%；活越大差距越大](/sdlc-playbook/articles/grokbot-k3-multi-agent/compare.jpg)

最后那个数字决定了这套东西实不实用。多 agent 系统比单次回答费 token，因为很多 agent 在读写。放在顶价档的模型上，这个成本决定你跑得起多勤。Kimi K3 编码同档、价格约低 5 倍，token 用得也省，系统就成了天天能跑的日常，不用留着特殊场合才舍得跑。

![三张卡片：300 AGENTS PER RUN、4,000 STEPS PER RUN、5x CHEAPER THAN TOP TIER](/sdlc-playbook/articles/grokbot-k3-multi-agent/cost.jpg)

## 六步搭起来

**第一步：装上路由器（Grokbot）**

把路由 prompt 贴进你的 Grokbot。从此它对每个请求只做分类，不再直接回答。

**第二步：存四个模式（Kimi K3）**

在 Kimi Agent Swarm 里给每个模式建一份模板：扇出、链式、辩论、监督。每份是一小段描述形状的 prompt。

**第三步：加共享记忆（Kimi K3）**

每份模板开头是「读记忆」，结尾是「写入事实、决定或待解问题」。

**第四步：贴上交接格式（Kimi K3）**

每份模板同样的七个字段。合并环节和监督 agent 靠它读所有 agent 的产出。

**第五步：接通交接（Grokbot → Kimi）**

路由器的输出（模式、理由加简报）成为对应 Kimi 模板的启动 prompt。

**第六步：各跑三条测试请求（两边）**

一条宽的、一条深的、一条判断题。检查每条都进了正确的道、每个 agent 都交回了格式。

整套系统就这些：一条路由 prompt，四份模板，一条记忆规则，一个格式。没有一行代码，全部可复用。下次遇到新类型的活，不用造新 agent，看看它是四种形状里的哪一种，送进那条道就行。

## 别再升级 bot 了，升级形状

多数人想让 bot 变强，路子是找更好的 prompt 或更好的模型。在撞墙之前这有用；过了墙，唯一有用的是改活的形状，把一个过载的 agent 换成许多个专注的。

- **先路由，再运行。** 第一个问题永远是活的形状，答案长什么样排在后面。
- **四个形状盖住几乎所有活。** 扇出、链式、辩论、监督；需要时两个叠着用。
- **共享记忆，统一交接。** 这两条规则把一群 agent 变成一套系统。
- **预料失败。** 带原因重试，仍失败的就标记出来，不要瞎猜。

> 今晚就给你的 Grokbot 装上一套系统

> 装好路由器，把四份模板存进 **Kimi Agent Swarm**，然后把它一直躲着的那件大活发给它。看 Grokbot 选形状，看 Kimi K3 跑起 300 个 agent。
