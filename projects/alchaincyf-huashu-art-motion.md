---
name: alchaincyf-huashu-art-motion
title: huashu-art-motion：把一次动画复刻沉淀成可复用的 agent 技能
summary: 让 coding agent 用 Canvas 代码画 35 种艺术风格并让画动起来。值得看的是它的验收与回流：确定性冷热双渲、带 GPU flush 的耗时、文字框景钩子，加上经验回写技能的闭环。
repo: https://github.com/alchaincyf/huashu-art-motion
description: 艺术动画skill：35种艺术风格、9种解说语法，用代码让画动起来。
stars: 1938
contributors: 1
forks: 216
language: JavaScript
languages:
  JavaScript: 92.6
  Python: 7.3
  HTML: 0.1
avatar: /projects/alchaincyf.png
license: MIT
tags: [agent-skill, motion-design, video, canvas, verification]
pinned_commit: f178bd7754a71d6d399473af1501634548efa6cb
evaluated_at: 2026-10-08
updated_at: 2026-10-08
related: []
---

huashu-art-motion 是花叔（alchaincyf）发布的一个 agent 技能。用 `npx skills add` 装进 Claude Code、Codex 或 Kimi Code 之后，agent 会用 Canvas 程序化绘制 35 种艺术风格的动画，从岩画、埃及壁画到梵高、包豪斯、8-bit 和新海诚，另外还有 Kurzgesagt、Vox、白板、3Blue1Brown 等 9 种解说视频语法。它起步于 2026-10-04 对 X 用户 Tak 一支 15 秒《Art History Speedrun》的复刻，两天后开源。这张卡的主张是，值得搬走的是围绕风格配方和场景代码的两套东西（配方和代码本身换个作者就能重写）。一套是把「画得对不对」拆成可度量数字的验收脚本，另一套是回流规则，每次制作的经验都写回技能本身。

## 它解决什么问题

让 agent 写动画，常见的失败有三种。第一种是做成「图片之间的转场」，每一幕是一张静止的画，只有切换在动。第二种是 agent 自己看了几轮都觉得好，交出去才发现闪烁、卡顿，还有叠字和半截字。第三种是一次做对的经验留在聊天记录里，下次换个会话从头踩坑。

这个仓库对三种失败各有一套机制。画面不动的问题交给拆解方法和「每幕至少一个主动作加两个母题循环」的硬要求，[SKILL.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/SKILL.md) 的「窄桥」一节把它写成照字面执行的规则。自己看不出的毛病由 `qa.py` 和独立审片 agent 来抓。经验流失交给回流规则，每做完一支片，新风格写配方卡，做对的事写进 [07-正面经验.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/07-%E6%AD%A3%E9%9D%A2%E7%BB%8F%E9%AA%8C.md)，新坑写进对应文档。

## 怎么解的

仓库分三层。顶层的 `SKILL.md` 以一张「他说的 → 做什么 → 读哪几篇」的路由表为主，把复刻、指定风格、口播配动画，以及长卷穿越片和解说片段等任务分到 `references/` 下 01 到 13 号方法文档，另有窄桥、验收、回流几条硬规则。`references/风格配方/` 是 35 张配方卡，各卡记管线、参数、母题动画和踩过的坑，总表 `INDEX.md` 再列出每种风格的签名转场、当前质量和短板。`scripts/engine/` 是一个可以整个复制进项目的动画工程。

引擎的核心是一个确定性函数，时间 t 进去，一帧画面出来。[engine.js](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/scripts/engine/engine.js) 开头一行注释写明了契约，「同一个 t 永远画出同一帧（随机数全部用种子）」。段落表 `eras.js` 里每段写占几个八分音符（128 BPM 下一个八分音符 0.234375 秒）或者直接写秒数，片长由段落表累加出来。转场期间新旧两段分别画进离屏缓冲 A、B，再交给 `TRANSITIONS[type]` 合成。拍点上的镜头冲击曲线形状固定为 `1 + a·(1 − k/20)^1.5`，幅度 a 默认 0.03，可按单个转场或整片调（解说片设成 0 关掉），k 是转场开始后按 60fps 折算的帧数。冲击只作用于场景层，角标不缩放，转场期间旧段也一起放大。

渲染走 [render.py](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/scripts/engine/render.py)：起本地 HTTP 服务，无头 Chromium 打开页面，逐帧调用 `window.renderFrame(i / fps)`，取 canvas 的 PNG 经 `image2pipe` 喂给 ffmpeg。解说语法另有一条 `--spec` 入口，读一份 JSON 出一段时长严格等于 `duration` 的片段，H.264 每秒一个关键帧（`-g fps -sc_threshold 0`），注释说明这是为了让下游剪辑管线按秒 seek 时不冻帧；加 `--alpha` 出带透明通道的 ProRes 4444。

拆解有专门的脚本和方法文档。[01-拆解.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/01-%E6%8B%86%E8%A7%A3.md) 要求先把参考片缩到 192×108 灰度算逐帧差，找出转场起点，再拟合节拍网格。原片的拟合结果是「起点 = 84 + 14.06·n 帧，残差小于 0.45 帧」，对应 128 BPM 的八分音符。之后再给每段做运动热图。文档记下了热图推翻第一印象的那次，作者原以为每段是一张画，实测每段有 2.5% 到 34% 的面积在动。

## 设计亮点

**确定性是引擎契约，并且被验收脚本逐段量。** 所有随机数走 `U.rng(seed)`（mulberry32），转场缓存按段 id 建键。[qa.py](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/scripts/qa.py) 对每段在同一时刻做一次冷渲、一次热渲，和正常取帧的结果逐像素比，任何差异都记成确定性失败。这样做的好处是渲染可以分段重渲再拼，也让后面所有「量帧差」的指标有意义，帧差里不会混进随机噪声。

**耗时要量到 GPU 画完为止。** `qa.py` 的取帧函数在停表前调用一次 `getImageData(0, 0, 1, 1)`，注释写明了原因，只量 JS 同步时间会报出假的 1ms，迁移测试时踩过。canvas 走 GPU 加速时，读一个像素会迫使之前的绘制全部完成；用浏览器量这类 canvas 的耗时，容易踩同一个坑。

**「卡」和「动」分开量。** 运动面积只看相邻帧变化超过 12 的像素占比，平均值好看也可能一卡一卡。`qa.py` 另报「静止帧对」比例，即相邻两帧几乎不变（低于 0.05%）的帧对占多少；还报「跳变」，即某对帧差超过中位数 6 倍且超过 3%。[07-正面经验.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/07-%E6%AD%A3%E9%9D%A2%E7%BB%8F%E9%AA%8C.md) 第 17 条给出的反例是克里姆特那段，首尾差 33%，48 对帧里有 14 对是静止的。

**文字框景检查靠包住 Canvas API 的方法实现。** `qa.py` 在页面加载前注入一段脚本，包住 `fillText`、`strokeText`、`drawImage`、`clip`、`clearRect` 等方法，把每串字经过当前变换矩阵后的屏幕外框记在它所在的画布上。字先画进离屏缓存、再被 `drawImage` 贴到主画布时，外框跟着变换过去；整张画布被清空或被不透明矩形盖满时，记录也清掉。这样不用做 OCR，就能报出半截字、叠字、字落进字幕带，并且只报持续 0.3 秒以上的，镜头摇过时几帧的半截字不算。脚本的 docstring 把五类盲区都列出来了，比如被照片挡住的字查不到、图形进字幕带要另跑 `subzone_gate.py`。

**验收工具也要被验收。** `qa.py` 曾经全绿，后来发现单段取帧走的是 `renderSolo`，转场代码一次都没执行，一个引用了不存在函数的转场整帧崩溃也没报。现在的版本对每个转场在 p = 0.25、0.5、0.75 各渲一帧做冒烟。经验条目第 25 条把这件事提炼成做法：每个检查项故意制造一次失败（删一个场景、写错一个转场、用一个缺字），确认它真的会红。引擎侧也配合这条原则，场景缺文件、语法错、没注册，或转场名找不到，都记进 `window.__bootErrors`，`render.py` 和 `qa.py` 拒绝启动，见 [scenes/index.js](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/scripts/engine/scenes/index.js)。

**机制和题材分开写。** [02-机制.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/02-%E6%9C%BA%E5%88%B6.md) 把原片拆成五层：固定的场景骨架、每幕一幅活的画、转场用下一个风格的签名语言、节拍网格逐段缩短、一条连续的叙事锚加结尾角色梗。文末一张表演示换题材怎么套，「一座城市的 100 年」里骨架换成同一个街角，转场换成胶片烧边、电视雪花、扫描线。配方卡记录的是具体参数，这一页记录的是可迁移的结构，两者分开，换题材时 agent 不会照搬某个时代的配色。

**规模化靠任务书、标杆实现，以及先让各组各写一套再收库。** 前 16 个时代分 4 组 agent 并行，每组 30 到 35 分钟一次交付。之后派 4 组 agent 做迁移测试，任务是「只读技能、做技能里没有的风格、交回反馈」，一共做了 20 种新风格，交回 60 多条带复现场景的问题。各组自己造的笔刷、渲染器和后期效果，再分别归并进 `lib/brush.js`、`render.js`、`post.js`。[08-风格作者规范.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/08-%E9%A3%8E%E6%A0%BC%E4%BD%9C%E8%80%85%E8%A7%84%E8%8C%83.md) 是给派出去的 agent 的任务书：接口、先读什么、八条硬要求、自检命令和交付物格式。规范里还写了无人值守时怎么处理「三方向硬门」，做法是照任务书执行，同时在交付说明里列出另外两个方向各一句，等人回来再挑。

**付费能力默认不授权。** 语音和图片生成是可选能力。[defaults/media.json](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/defaults/media.json) 的公共默认是声音、图片都「未配置」，云调用、付费 API、音色训练、生图、上传参考图的策略全部是 `ask`。[capabilities.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/capabilities.md) 写明：没有回答不是同意；项目级配置只能收紧，不能授权；配置里只存环境变量名或文件引用，不存 Key 值。README 还补了一条，不能从检测到 Key 或工具推断允许消费。个人配置放在技能安装目录外（`~/.config/huashu/media.json`），重装技能不会冲掉。

## 借鉴清单

**能搬的：**

- 时间到帧的纯函数契约加冷热双渲比对，适用于任何 Remotion、HyperFrames 或自写 Canvas 的程序化视频管线
- 停表前读一个像素强制 GPU flush，任何用浏览器量绘制耗时的脚本都该这么做
- 运动面积、静止帧对、孤立跳变三个指标分开报，并且写明它们是经验阈值、不是规则；比单一的「平均帧差」更能抓到卡顿和闪烁
- 包住 Canvas 文字 API 记外框做框景检查，不依赖 OCR；盲区在 docstring 里逐条写明的做法也值得照抄
- 「验收工具也要被验收」：每个检查项故意制造一次失败，确认它会红
- 「机制文档」与「参数配方卡」分开写，配方总表给每种风格标出当前短板，下次再做这个风格时先补这块短板
- 迁移测试当需求文档：派只读技能的 agent 做没见过的题目，交回「帮上了什么、哪里卡住」
- 付费与云能力默认 `ask`，项目只能收紧不能授权，配置只存凭证引用；任何会花钱的技能都可以照这套设

**不适用的：**

- 35 个场景和 17 个库是为这个作者的审美和「少女加猫」固定构图长出来的，硬编码了 1920×1080 和具体坐标；做自己的片子，搬方法比搬场景代码划算
- 解说片段的口播管线（draft、render、verify 那层包装）作者说明未随仓库开源，`--spec` 契约是公开的，但端到端的口播配动画需要自己搭
- 讲解员语法和口播整片参考代码需要自备角色与音频素材；花叔的卡通形象、角色帧和示范视频里的同一形象明确不随 MIT 授权
- 语音克隆只接了火山引擎，macOS 以外的系统声音后端尚未实现
- 技能正文全是中文，英文环境的 agent 读起来要多一层翻译

## 局限

CI 只跑配置合并、权限收紧、图片桥接和发布清单这些契约测试（[tests.yml](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/.github/workflows/tests.yml)），渲染引擎和 `qa.py` 本身没有自动化测试；它们的正确性靠作者跑示范片和迁移测试保证。[compatibility.md](https://github.com/alchaincyf/huashu-art-motion/blob/f178bd7754a71d6d399473af1501634548efa6cb/references/compatibility.md) 如实写了验证范围：三家宿主的安装重装都通过，Codex 在线回归通过，Claude Code 和 Kimi 的在线回归因测试账户配额和权限返回 429、403，尚未补跑。

文档有轻微的漂移。`qa.py` 末尾的回流提醒指向 `references/11-进化协议.md`，钉住的 commit 里 11 号文档已经是「长卷穿越片」，没有这篇；`07-正面经验.md` 有两个第九节，33 到 36 号条目各重复了一次。这些不影响运行，但说明文档靠人工维护，引用会随重排失效。

整个仓库从首次提交到评估当天只有三天、一位贡献者，是一个人高强度迭代出来的。经验条目里大量证据来自同一个项目的同一批迁移测试，换一类题材（比如纯产品演示）时，哪些阈值还成立需要自己重新量。

## 相关

站内文章：[用 agent 做动效与营销视频：从一句提示词到一套代码工作室](/sdlc-playbook/articles/agent-motion-video/)，讲 `seek(t)` 确定性渲染、弹簧、配乐与自检回路的通用做法，这个仓库是其中「代码画一切、按时间取帧」路线的一份完整实现。

外部：起点作品是 Tak（[@cherry_mx_reds](https://x.com/cherry_mx_reds/status/2106095190285144331)）的《Art History Speedrun》；作者的另两个技能项目 [nuwa-skill](https://github.com/alchaincyf/nuwa-skill)（造技能）与 [darwin-skill](https://github.com/alchaincyf/darwin-skill)（让技能进化）在 README 里与本项目并列。
