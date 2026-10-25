---
name: kubai087-lumno-web
title: lumno-web：服务端先交完整帧，动效只是加上去的运动
summary: 单人维护的扩展官网源码：首页大部分是动画，纪律是服务端 HTML 永远是成品帧、脚本只加动效；闭式弹簧写 CSS 变量让滚动零重渲染，扩展截图按语言真实截取。
repo: https://github.com/kubai087/lumno-web
description: 'Source of lumno.kubai.design, the website of the Lumno browser extension: an Astro + React site in ten languages with animated product demos.'
stars: 32
forks: 2
contributors: 1
language: TypeScript
languages:
  TypeScript: 46.9
  Astro: 21.9
  CSS: 18.5
  JavaScript: 12.5
  Python: 0.2
avatar: /projects/kubai087.png
license: MIT
tags: [astro, animation, i18n, website, product-demo, motion]
pinned_commit: cdd06482dc9c902703af6f4e4b68e9bd8db72aa3
evaluated_at: 2026-10-25
updated_at: 2026-10-25
related: []
---

lumno-web 是 Lumno 浏览器扩展（Chrome、Edge、Firefox 的命令栏和新标签页）的官网源码，Astro 7 加 React 19 岛屿，十种语言全部预渲染成静态文件挂在 GitHub Pages 上。32 星，一个作者，452 次提交，评估当天还在推进。这张卡主张：README 说「首页大部分是动画」，值得搬的是它给动效立的纪律，而不是 Astro 加 React 的组合本身。

## 它解决什么问题

产品官网要演示交互类功能，惯用做法是放一段录屏 GIF 或一段 Lottie，录屏体积大、模糊、不可交互，Lottie 是矢量重演，和真实 UI 永远差一层。lumno-web 的答案是把扩展的真实界面在网页里重演出来：光标跟着输入走、落在真实结果上，新标签页的场景逐个演。动画是页面本身，不是页面上的视频。

## 怎么解的

动效规则写在 [README](https://github.com/kubai087/lumno-web/blob/cdd06482dc9c902703af6f4e4b68e9bd8db72aa3/README.md) 的「how the motion works」一节和 [AGENTS.md](https://github.com/kubai087/lumno-web/blob/cdd06482dc9c902703af6f4e4b68e9bd8db72aa3/AGENTS.md) 里：服务端 HTML 永远是一帧完整可读的成品；脚本只在上面加运动；reduced-motion 和无 JS 的访客拿到的是完整画面；首屏用不到 React 的页面一行 React 都不发。

首页动画由几组机制分担：[HeroSafariDemo.tsx](https://github.com/kubai087/lumno-web/blob/cdd06482dc9c902703af6f4e4b68e9bd8db72aa3/src/components/home/HeroSafariDemo.tsx)（1994 行）演三幕剧本，光标随输入移动、落在结果上；[hero-parallax.tsx](https://github.com/kubai087/lumno-web/blob/cdd06482dc9c902703af6f4e4b68e9bd8db72aa3/src/components/ui/hero-parallax.tsx) 用滚动驱动照片墙；[scene-runtime.ts](https://github.com/kubai087/lumno-web/blob/cdd06482dc9c902703af6f4e4b68e9bd8db72aa3/src/components/home/newtab/scene-runtime.ts)（197 行）给新标签页插图一套 Timeline 加 Scene 的播放内核。帮助中心 230 篇文章覆盖十语言，截图由 scripts/guide-screenshots 用无头浏览器截真实扩展，四种语言各自截，其余复用英文截图并如实注明。

## 设计亮点

**成品帧先行。** 每个动画组件的服务端标记就是它这一轮结束时该有的样子，scene-runtime 的注释把这条写成契约：插图先画出完整帧，脚本再往上加运动。后果具体：关掉 JS 或开了 reduced-motion，页面信息一点不少；动画失败退化成静态页，不是退化成白屏。

**开场门控不赌 load。** 首页剧本不挂在 window load 上，而是等字体就绪加连续 8 帧稳定才设 data-intro-ready，解除 CSS 动画的暂停；另设 3.6 秒兜底，检测失效也照常开场。JS 时间线与 CSS 时序通过 data-intro-pace 属性对齐，两边不会各跑各的。

**滚动零重渲染。** 照片墙的倾斜与漂移由滚动进度驱动：四个弹簧（刚度 300、阻尼 30、欠阻尼 ζ≈0.87）用闭式解算出任意时刻的精确值，写进舞台的 CSS 自定义属性，transform 全由 CSS 消费。滚动过程不触发一次 React 渲染；服务端标记自带起始值，首屏就是倾斜的墙。

**剧本演示会重测量。** 光标不是走固定坐标：随输入沿输入框移动，结果列表展开后再重新测量目标位置落上去。布局一变，syncMs 重测目标，光标落在真实位置。三幕剧本每幕时长写死在常量表里，节奏是设计出来的，不是碰出来的。

**动效有测试，截图按语言截真图。** 17 个 node:test 文件按首页区块点名：hero 剧本、视差墙、AI 意图演示、连续圆角、字体子集，各有各的测试；npm run build 先跑测试再出静态文件。帮助中心截图是脚本截的真实扩展，zh-CN、zh-TW、en、ja 各自截，其余语言如实复用英文图：扩展界面在那几种语言里本来就是英文。

## 借鉴清单

**能搬的：**

- 「服务端 HTML 是成品帧、脚本只加动效」的契约，及其退化语义：动画挂了退化成静态完整页
- 开场门控：字体就绪加稳定帧计数，带超时兜底；JS 时间线与 CSS 时序用一个 data 属性对齐
- 闭式解弹簧写 CSS 自定义属性：任意帧精确、可预渲染起始值、滚动不惊动框架
- 剧本演示的重测量约定：光标随布局变化重测目标，而不是播固定坐标
- 动效按区块配测试，构建先跑测试；素材用脚本截真实产品并按语言分区

**不适用的：**

- 1994 行的 HeroSafariDemo 是为单一产品剧本定制的，搬时间线与重测量约定就好，组件本身不可复用
- 十语言 230 篇帮助文章加四语言搜索评估是全职级维护面，内容量小的站不要照抄这个规模
- 演示取材的前提是有真实产品 UI 可截；纯文档站要先定义清楚演示的对象是什么
- React 19 加 motion 只服务需要剧本交互的岛，纯 Astro 静态站不必为此引入客户端框架
- 单人仓库，全部纪律靠作者一个人守，没有第二双手检验

## 局限

快照口径：32 stars、2 forks、1 位贡献者（git 两个提交身份），452 次提交跨约八个月，评估当天仍在提交。star 数与工程质量不成比例，这个仓库的参考价值在源码，不在热度。动效细节大量绑定 Chromium 与 Safari 的具体行为（安全区、Safari 的 SVG 清晰度），换浏览器要重新验证。

## 相关

站内文章《[用 agent 做动效与营销视频](/sdlc-playbook/articles/agent-motion-video/)》讲的是渲染成片的管线，本卡是同一诉求在网页里的解法；项目卡《[huashu-art-motion](/sdlc-playbook/projects/alchaincyf-huashu-art-motion/)》的确定性引擎与这里「任意帧可算」的闭式弹簧同一条根。上游姊妹仓库 [lumno-extension](https://github.com/kubai087/lumno-extension) 是被演示的产品本身。
