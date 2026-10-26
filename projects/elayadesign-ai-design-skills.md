---
name: elayadesign-ai-design-skills
title: ai-design-skills：把设计手艺写成可数的验收规则
summary: 1029 行、两个技能、7063 星。设计稿变动画演示的全部暗知识：PSNR 当保真阈值，Figma 导出十一坑各配算法，假时钟逐帧捕获；全部值参集中一处，fork 即定制。
repo: https://github.com/elayadesign/ai-design-skills
stars: 7063
forks: 505
contributors: 1
avatar: /projects/elayadesign.png
license: MIT
tags: [design, motion, claude-code, skills, figma, landing-page]
pinned_commit: a2735a3eaf092eaaffb6dc17df25de33ef3bd048
evaluated_at: 2026-10-26
updated_at: 2026-10-26
related: []
---

elayadesign/ai-design-skills 全部内容是两个 SKILL.md：[landing-page-design](https://github.com/elayadesign/ai-design-skills/blob/a2735a3eaf092eaaffb6dc17df25de33ef3bd048/skills/landing-page-design/SKILL.md) 管落地页从策略到视觉系统，[design-to-motion](https://github.com/elayadesign/ai-design-skills/blob/a2735a3eaf092eaaffb6dc17df25de33ef3bd048/skills/design-to-motion/SKILL.md) 把静态设计变成像素精确的动画演示。1029 行 markdown，没有一行代码，7063 星。这张卡主张：它是「手艺提示词化」的上限样本，值得搬的不是某条动效规则，而是把不可见的审美判断写成可数检查的写法。

## 它解决什么问题

让 agent 做设计类工作，输出平庸的根因不是模型不会，而是要求里全是形容词：「高级一点」「有质感」「动画自然」。这类词无法执行也无法验收。这个仓库的答案是把它全部换成数字与程序：保真度用 PSNR 阈值验收，动效时长与缓动用 token 表规定，循环用逐帧检查证明无缝。

## 怎么解的

design-to-motion 分三段：Part A 重建设计，Part B 动效系统，Part C 录制导出，A 的验收不过不许碰 B，B 的检查不过不许编码。开工前先定「语境」：showcase（整帧演示，出 MP4 与两种 GIF）还是 website（只动有视觉的区块，滚动触发一次），两种语境的触发、文本处理、交付物都不同。落地页技能同构：Part A 定策略与文案，Part B 是不可协商的视觉系统。

每个技能尾部一张「Make it yours」值参表：上升距离、入场模糊、卡片错峰、循环总长、MP4 参数，全部集中在此，改这一节整个技能跟着变。

## 设计亮点

**保真当验收指标。** [A7](https://github.com/elayadesign/ai-design-skills/blob/a2735a3eaf092eaaffb6dc17df25de33ef3bd048/skills/design-to-motion/SKILL.md) 要求渲染 2x 静帧与 Figma 参考帧算 PSNR：整帧 35dB 以上、每个容器 30dB 以上；文字重的容器先轻模糊再比，文字边缘不计数只看结构。规则还写了反方向的自制力：不追亚像素偏移，2x 测量分辨不出半像素误差，「修正」会过冲，修结构不修抗锯齿。

**图层导出的十一种坑各配算法。** A3 是一张表：导出图大于渲染框用居中公式算偏移；旋转加大模糊的色块用绝对边界导出、不达标才做 PSNR 偏移搜索；instance 子节点常返回 null 就导出父级；Figma 把描边轮廓化成填充形状，想画「线生长」没有中心线可用，自己从轮廓反推中心线再当 mask 用。每条坑都是实测出来的，各配解法而不是一句「注意兼容」。

**背景神圣。** A4：设计坐在照片或纹理上时，背景是设计的一部分，intro、循环、溶解、镜头都不许动它；做「只加载」变体也不许丢背景；复现不了就先告诉用户，不许悄悄换纯色。连 frosted 面板的技术前提都写了：backdrop-filter 元素必须是背景的兄弟节点，不能待在任何带 filter 或透明度的祖先里。

**故事先行。** B4 的立场是「加载完就静止的帧没做完」：每个视觉先写一句故事再动手，十二类视觉各配故事模板（列表接到新条目、图表被读、日历找到空档、提示词被敲入）；「观众两秒内看不出画面在动，说明故事太怯」；纯文字卡不配故事。文本原则只有三条例外：计数器、打字、提示值，打字还规定按字形步进、每 45 到 70 毫秒一个。

**确定性捕获，三个坑点名。** C1 禁止真录屏：假时钟逐帧步进，整毫秒序列平均恰好 1000/60（runFor 会漂移）；__start 与 __tick 必须在同一次 evaluate 里执行；无限循环效果走 JS 时钟不走 CSS keyframes，因为 seek 会重启它们。B9 配四项帧检查：容器外像素逐帧等于空帧（溢出）、首尾帧相等（接缝）、空拍帧等于起点帧（专抓没复位的 JS 状态）、溶解前最后一帧等于静帧（故事都回家了）。

**归属卫生。** 借了谁的规则、具体借了哪几条、后来重写了哪些段落，逐条写进 Credits 并附对方 MIT 许可原文；评估当天的 HEAD 提交本身就是一次补署名加重写重叠段落。7063 星的仓库对来源如此较真，是这套技能可信度的一部分。

## 借鉴清单

**能搬的：**

- 把形容词要求换成可数验收：PSNR 阈值、逐帧相等检查、静帧对比，「像不像」变成「过没过」
- 坑位表格化：把一类操作的已知失败模式写成「情况 + 对策」表，替代笼统的注意事项
- 确定性捕获三细节：整毫秒步进、状态切换与 seek 同帧执行、循环效果交给可 seek 的时钟
- 值参集中：技能全部可调项收拢成尾部一张表，fork 者改一处即定制
- 归属写清楚到条目级：借了什么、改了什么，附许可原文

**不适用的：**

- 1 位作者、5 次提交撑起 7063 星，仓库无代码无测试，规则对错全靠使用者回报，热度与可靠性无关
- landing-page-design 的触发描述覆盖「任何 web UI 工作」，无边界触发会与项目里其他设计类技能抢活
- 检查只有描述没有脚本：PSNR 与接缝检查写了做法但未附可运行实现，agent 是否真跑全凭自觉
- 视觉基线是英文世界的（Phosphor 图标、680px 标题上限、西文排版），中文场景的字号与留白要自行改写
- 三份交付物（X 用 MP4、站用 GIF、800×500 GIF）是社媒发帖工作流，不发帖的团队用不上全套

## 局限

快照口径：7063 stars、505 forks、1 位贡献者（5 次提交、两个提交身份），建库三个月，评估当天仍在提交。GitHub 语言统计为空，纯 markdown 仓库。技能长于「照 Figma 复刻」场景，没有源文件、只有一张截图时规则自己也承认图层分不干净，效果打折。

## 相关

站内文章《[用 agent 做动效与营销视频](/sdlc-playbook/articles/agent-motion-video/)》是同题的完整方法论，本仓库相当于其中路线 A 的一份成品规则集。项目卡《[lumno-web](/sdlc-playbook/projects/kubai087-lumno-web/)》是动效纪律在真实官网上的工程实现。上游引用的 [emilkowalski/skills](https://github.com/emilkowalski/skills) 是它承认的产品级动效规则来源。
