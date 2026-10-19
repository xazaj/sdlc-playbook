---
name: personal-site-toolkit
title: 从 0 搭建个人网站：8 大类 60+ UI 设计必备清单
summary: 直接让 AI 从零做网站，产出平庸且同质；这份清单把「找参考」武器化——8 类逐项清点 70 个入口按用途排开，含改名与迁移线索。
date: 2026-10-19
source: https://x.com/pamelaaaaa1218/status/2111490939604681059
author: Pamela（@pamelaaaaa1218）
tags: [ui-design, design-resources, components, site-building]
related: [ui-skills, frontend-design, shadcn-improve]
---

让 AI 从零「给我做个个人网站」，产出大概率平庸：模型没有你的审美，只能交出它的默认样式。Pamela 在 X 上给出的工作流是把「生成」换成「整合」——先找到好看的网站，让 AI 抓取代码、截图与风格关键词，再拼装成自己的站。为了让「找好看的网站」这一步有的放矢，她整理了 8 大类资源：组件、动效与 3D、整站灵感、产品界面、局部微交互、配色与素材、AI 建站、设计 Skill。原文口径 60 多个，逐项清点是 70 个入口，其中 8 个带改名或迁移线索（Godly 转 Recent、Galileo AI 并入 Google Stitch、screenlane 并入 Page Flows 等）。本文按类重排这份清单，每个工具一行：定位是什么，怎么上手。

![原文头图](/sdlc-playbook/articles/personal-site-toolkit/cover.jpg)

## 先把内容理清楚，再让 AI 动手

原文的第一步不打开任何设计工具，而是把内容写清楚：个人介绍、项目案例、作品素材、服务内容，全部整理进一份飞书文档，再让 AI 通过飞书 CLI 读取。这个方法她学自「飞书绝活大会」上王大仙的分享。好处有两个：内容集中在一处，不必在多个页面间反复同步；文档同时充当资源库与链接源，后续改动直接改文档，把链接发给 AI 就能近乎实时地反映到网站上。

## 组件：选好部件再拼成网页

按钮、表单、导航、卡片这类小部件不必手写，先找现成的，再交给 AI 拼接成适配自己网站的样子。这一类里 shadcn 生态占了近三分之一，从单组件到整段区块都有。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [shadcn/ui](https://ui.shadcn.com/) | 基础组件 · 源码可改 | 挑组件按官方说明接入，再统一调颜色圆角 |
| [Aceternity UI](https://ui.aceternity.com/) | 立体卡片 · 光效背景 | 放首屏或重点区，先预览再接入换内容 |
| [Magic UI](https://magicui.design/) | 文字动画 · 数字滚动 | 给标题、数据、按钮加动效细节 |
| [React Bits](https://reactbits.dev/) | 文字动画 · 动态背景 | 选效果挑代码版本，让 AI 调文案与速度 |
| [Cult UI](https://cult-ui.com/) | 特色卡片 · 设备模型 | 用设备模型呈现 App 或网站作品 |
| [KokonutUI](https://kokonutui.com/) | 交互组件 · AI 界面 | 含聊天输入等 AI 产品界面参考 |
| [HyperUI](https://hyperui.dev/) | Tailwind 营销区块 | 导航、价格卡、FAQ，复制代码接入 |
| [Float UI](https://floatui.com/) | 响应式 · 多框架 | 按项目框架选 HTML、React、Vue 版本 |
| [Park UI](https://park-ui.com/) | Ark UI + Panda CSS | 建统一设计系统，接入前先查兼容 |
| [Tailwind UI](https://tailwindui.com/)（现 [Tailwind Plus](https://tailwindcss.com/plus)） | 官方区块 · 付费 | 成套设计直接替换文案使用 |
| [shadcn blocks](https://ui.shadcn.com/blocks) | 官方整段区块 | 登录页、侧边栏、后台布局整段取用 |
| [shadcnblocks.com](https://www.shadcnblocks.com/) | 第三方营销区块 | 首屏、功能、价格、评价拼落地页 |
| [21st.dev](https://21st.dev/) | 组件聚合 · AI 提示词 | 复制组件页提示词，补上页面与配色交给 AI |
| [Origin UI](https://originui.com/)（现 [coss ui](https://coss.com/ui)） | Base UI 基础组件 | 输入框、下拉、表格，记得补禁用报错态 |
| [Skiper UI](https://skiper-ui.com/) | 创意交互 · 图片揭示 | 悬停、拖动、滚动效果用来展示作品 |

接入前把安装说明交给 AI，检查与现有项目的兼容性——这类组件各自支持的开发环境并不一致。

## 动效与 3D：让页面里的元素动起来

想自己控制动画的节奏与顺序，或者加入可互动的 3D 内容，看这一类。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [Motion](https://motion.dev/) | 界面动画 · 布局过渡 | 按官方示例描述目标效果交给 AI 实现 |
| [GSAP](https://gsap.com/) | 时间轴 · 滚动联动 | 写清谁先动谁后动、何时触发 |
| [Anime.js](https://animejs.com/) | SVG 路径 · 精细编排 | 图标逐步绘制、标题依次出现 |
| [LottieFiles](https://lottiefiles.com/) | 矢量小动画素材 | 按 loading、success 场景挑，选播放器接入 |
| [Shadertoy](https://www.shadertoy.com/) | 着色器作品社区 | 挑背景效果，注意授权，调低强度 |
| [The Book of Shaders](https://thebookofshaders.com/) | 着色器原理教程 | 读懂渐变、噪声怎么画出来 |
| [Three.js Examples](https://threejs.org/examples) | 官方 3D 示例 | 找接近的示例，换模型背景相机 |
| [Spline](https://spline.design/) | 可视化 3D 编辑 | Remix 社区场景，导出 Viewer 嵌入网页 |
| [Rive](https://rive.app/) | 状态机交互动画 | 设计默认、悬停、点击状态再导出接入 |

![原文配图](/sdlc-playbook/articles/personal-site-toolkit/categories.jpg)

## 整站灵感：先看网站可以长什么样

找整体风格、内容结构与排版参考。选中案例后，最好点进实际网站完整看一遍。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [Godly](https://godly.website/)（现 [Recent](https://recent.design/)） | 创意网页案例 | 记下字体、配色、首屏布局再提要求 |
| [Land-book](https://land-book.com/) | 行业与风格筛选 | 定整体方向，缺区块去 Sections 找 |
| [Lapa Ninja](https://www.lapa.ninja/) | 落地页合集 | 同行业挑三例，对比标题配图按钮 |
| [One Page Love](https://onepagelove.com/) | 单页网站 | 抄内容顺序：我是谁、作品、服务、联系 |
| [SaaS Landing Page](https://saaslandingpage.com/) | 软件官网 | 拆出问题、用法、证明、下一步四段 |
| [httpster](https://httpster.net/) | 独立站大图 | 把偏好拆成具体要求，别说「高级一点」 |
| [Awwwards](https://www.awwwards.com/) | 获奖网站 | 打开实际网站体验完整滚动交互 |
| [CSS Design Awards](https://www.cssdesignawards.com/) | 视觉与交互评选 | 选一个细节，写清触发条件与变化 |
| [SiteInspire](https://www.siteinspire.com/) | 风格类型筛选 | 比较几个案例的文字大小与网格 |
| [Minimal Gallery](https://minimal.gallery/) | 字体层级 · 留白 | 标注标题大小、正文宽度、图片比例 |
| [MotionSites](https://motionsites.ai/) | AI 提示词预览 | 挑方案拿提示词，补品牌文案配色 |
| [Variant](https://variant.fun/) | 入口待确认 | 本次未能打开；多版探索先用 Google Stitch |

## 产品界面与流程：参考真实产品怎么用

网站里如果有注册、登录、搜索、订阅、付款，借鉴真实产品的处理方式。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [Mobbin](https://mobbin.com/) | 真实产品界面库 | 搜登录、订阅页，对比字段与信息顺序 |
| [Page Flows](https://pageflows.com/) | 操作录屏 · 步骤注释 | 看完写「入口、操作、反馈、下一步」 |
| [screenlane](https://screenlane.com/)（已并入 [Page Flows](https://pageflows.com/)） | 旧站入口 | 直接用 Page Flows 搜索对应任务 |
| [UI Sources](https://www.uisources.com/)（现 [ScreensDesign](https://screensdesign.com/)） | App 流程录屏 | 带着一个任务看，记下每步入口与反馈 |
| [Refero](https://refero.design/) | 网页与 App 界面 | 比较信息密集页的导航与层级安排 |

## 局部灵感与微交互：把小细节做好

一个按钮、一个菜单、一段加载动画，也可以单独找参考。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [CodePen](https://codepen.io/) | 在线预览代码实验 | Fork 一份改参数，再交给 AI 适配项目 |
| [Codrops](https://tympanus.net/codrops) | 交互教程与演示 | 让 AI 先做独立小样，合适再进网站 |
| [UI Movement](https://uimovement.com/)（更名后并入 [Page Flows](https://pageflows.com/)） | 动效灵感旧站 | 现在去 Page Flows 看录屏里的交互 |
| [Dribbble](https://dribbble.com/) | 设计作品 | 搜页面类型，标注构图配色；不一定有代码 |
| [Behance](https://www.behance.net/) | 完整设计项目 | 从品牌到页面看一套设计怎样展开 |

## 配色、图标与素材：把整站风格统一起来

主色、字体、图标、插画和照片放在一起考虑，做出来的网站更容易保持一致。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [CSS Gradient](https://cssgradient.io/) | 渐变生成器 | 调色标与角度，复制 CSS 指定用途 |
| [uiGradients](https://uigradients.com/) | 现成渐变组合 | 整屏预览挑组合，检查文字可读性 |
| [Coolors](https://coolors.co/) | 配色生成 · 图片取色 | 锁定 Logo 主色再生成其余搭配 |
| [Realtime Colors](https://realtimecolors.com/) | 示例页试搭 | 颜色字体上真页面看阅读感受 |
| [TweakCN](https://tweakcn.com/) | shadcn 主题编辑 | 可视化调主题，导出配置全站沿用 |
| [Hero Patterns](https://heropatterns.com/) | SVG 重复纹理 | 改成品牌色、调低透明度当背景 |
| [Hero Icons](https://heroicons.com/) | Tailwind 官方图标 | 定轮廓或实心，统一尺寸颜色对齐 |
| [Lucide](https://lucide.dev/) | 线性图标 | 全站统一粗细与颜色 |
| [Phosphor Icons](https://phosphoricons.com/) | 多字重图标 | 选定一种字重，整套里挑 |
| [unDraw](https://undraw.co/) | 场景插画 | 主色换成品牌色后下载 |
| [Storyset](https://storyset.com/) | 插画改色与动画 | 选画风改主色，可在线加动画 |
| [Pexels](https://www.pexels.com/) | 摄影图片与视频 | 用场景关键词搜，按色调挑素材 |
| [Unsplash](https://unsplash.com/) | 氛围摄影 | 先定首屏主图，再按同色调配图 |

## AI 生成界面与建站：先把第一版做出来

准备好用途、内容和参考材料后，用这些工具起步，再一轮轮修改。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [v0](https://v0.dev/) | Vercel 界面生成 | 描述加参考图生成首页，逐项调整后发布 |
| [Lovable](https://lovable.dev/) | 对话建站 | 聊天生成的品牌站，预览里补表单功能 |
| [Bolt.new](https://bolt.new/) | 浏览器开发 | 先出能运行版本，逐页点检再发布 |
| [Google Stitch](https://stitch.withgoogle.com/) | 方案探索与原型 | 比较不同方案，选中后连成原型 |
| [Figma Make](https://www.figma.com/make) | Figma AI 原型 | 把设计或需求变成可交互页面 |
| [Subframe](https://www.subframe.com/) | 画布 + 编码代理 | 画布调模块，代理把修改落进代码 |
| [Galileo AI](https://www.usegalileo.ai/)（转至 [Stitch](https://stitch.withgoogle.com/)） | 旧入口 | 与 Stitch 同一工具，按其流程使用 |

## 设计 Skill 与提示词：让 AI 按一套要求做事

Skill 是给 AI 编程助手的工作说明，写着设计原则、检查项与操作方法。这一类也收了查找 Skill 的目录和帮助表达需求的提示词资料。

| 工具 | 定位 | 怎么上手 |
|---|---|---|
| [UI Skills](https://www.ui-skills.com/skills) | Skill 目录 | 按字体、动画、布局等主题找，经 CLI 安装 |
| [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Anthropic 官方设计 Skill | 安装后写清用途、气质、必备内容 |
| [pbakaus 的设计 Skill](https://github.com/pbakaus) | Impeccable 设计审查 | 初稿后让 AI 审层级排版间距，按优先级改 |
| [z1han 提示词库](https://ai.z1han.com/prompt) | 提示词参考 | 借描述结构，内容全部换成自己的 |

## 不必一次用完

清单越长，越容易收藏了事。原文的收尾建议是把范围收窄到三样：一个建站工具、一个参考站、一套配色，先把第一页做出来，剩下的交给迭代。工具决定的是起步速度，参考决定下限，迭代决定上限。

![原文尾图](/sdlc-playbook/articles/personal-site-toolkit/closing.jpg)
