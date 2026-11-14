---
name: ChromeDevTools-chrome-devtools-mcp
title: chrome-devtools-mcp：把 DevTools 的手柄递给 agent
summary: 官方 Chrome DevTools 的 MCP 服务器加 CLI：63 个工具覆盖自动化、网络、性能洞察与堆快照；值得抄的是 token 优化七原则与页面自暴露工具的发现协议。
repo: https://github.com/ChromeDevTools/chrome-devtools-mcp
description: 'Chrome DevTools for coding agents'
stars: 56119
forks: 4652
contributors: 30
language: TypeScript
languages:
  TypeScript: 98.3
  JavaScript: 1.7
  HTML: 0.01
avatar: /projects/ChromeDevTools.png
license: Apache-2.0
tags: [mcp, chrome-devtools, browser-automation, debugging, performance]
pinned_commit: 8ba2ac945ebaf1adb92208c29f3a30e73a920956
evaluated_at: 2026-11-15
related: []
---

chrome-devtools-mcp 是 Chrome DevTools 官方团队出的 MCP 服务器加 CLI，让 coding agent 控制并检查一个活的 Chrome：自动化、网络请求、控制台，以及性能 trace 与堆快照，全部走 MCP 协议。2025 年 9 月建仓，评估当天 56,119 星、30 位贡献者、63 个工具，Apache-2.0。这张卡主张：市场上浏览器自动化的 MCP 服务器不少，这个项目值得细看的点在别处：它给 agent 工具立的那套约束（[设计原则](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/docs/design-principles.md)），和两个别人没走的方向：页面自己向 agent 暴露工具，以及 agent 与人在 DevTools 界面里协作。

## 它解决什么问题

agent 干前端的活需要浏览器证据：请求发了没有、控制台报了什么、LCP 是多少。已有的路各缺一半。Playwright、puppeteer 一类的自动化库动作可靠，但拿不到 DevTools 深层的观测；截图只给像素，不给机制。DevTools 本体有全部能力（trace、性能洞察、堆快照），只是那些手柄从来只对人手开放。

这个项目把手柄递给 agent，同时不撤人的：同一台 Chrome，agent 经 MCP 调工具，人随时可以在 DevTools 界面里接着看。

## 怎么解的

同一套工具两种皮：MCP 服务器给 agent 客户端，`chrome-devtools` CLI 给终端和脚本（[README](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/README.md)）。63 个工具按域排开（[工具参考](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/docs/tool-reference.md)）：交互（click、fill、drag）、页面管理、网络（含 mock_network 网络改写）、性能三件套（start/stop_trace 加 analyze_insight）、控制台与 CSS、13 件套的堆快照分析、扩展安装与管理、PWA 与 WebAuthn。`--slim` 可裁到只剩基础浏览器任务的小工具面。

底座分两半。自动化交给 puppeteer，动作自动等待结果；分析能力直接复用 DevTools 本体：devtools-frontend 以 git submodule 挂在 third_party 下，trace 与 insight 的解析代码就是 DevTools 自己的那份（[AGENTS.md](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/AGENTS.md) 规定 submodule 只许实验性改动）。构建走 GN 加 Ninja，Chromium 的构建系统。

包里还带八个技能：chrome-devtools 与 cli 两个通用的，a11y、cookie、LCP、内存泄漏四个排查向的，加 troubleshooting 与 inspect-in-devtools，随 npm 包分发，也打包成 Claude Code、Copilot、Gemini CLI 插件。

## 设计亮点

**Token 优化是第一原则。** 设计原则文档的原话：「LCP was 3.2s 好过 50k 行 JSON」，大块数据落到文件，返回路径。落地在 [src/McpResponse.ts](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/src/McpResponse.ts)：ConsoleFormatter、CssFormatter、collectRankedContexts 一组格式化器把原始协议输出蒸馏成语义摘要，CSS 还会内联解析自定义变量值。

**小而确定的积木。** 给 agent 的是 click、fill 与 drag 这类可组合的小工具，配渐进复杂度：默认参数简单，高级用法走可选参数，不做一键魔法按钮。报错按「自愈」标准写：带上下文，带可能的修法。

**页面即工具提供者。** [第三方开发者工具协议](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/docs/third-party-developer-tools.md)让网页应用自己向 agent 暴露工具：页面监听 `devtoolstooldiscovery` 事件，`respondWith` 注册一组工具，导航后自动发现。组件树、路由，和 store 里存的什么，这类静态分析和 DOM 反推都拿不到的内部状态，由应用亲口告诉 agent。

**人机在 DevTools 里碰头。** [inspect-in-devtools 技能](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8ba2ac945ebaf1adb92208c29f3a30e73a920956/skills/inspect-in-devtools/SKILL.md)把协作面放进 DevTools 界面本身：agent 替人打开 DevTools、定位到某个元素或网络请求；读人在 DevTools 里当前选中的是什么；DevTools 评论线程里的提问，agent 取回、作答、修复、resolve。人评审与 agent 修复发生在同一块屏幕上。

**隐私默认值如实披露。** README 的 Disclaimers 一节写明：浏览器实例的内容对 MCP 客户端全量可见；用量统计默认开启（`--no-usage-statistics` 或设 CI 环境变量关闭）；性能工具会把 trace URL 发给 Google CrUX API 换真实用户体验数据（`--no-performance-crux` 关）。默认值可以不认同，披露本身值得照抄。

## 借鉴清单

**能搬的：**

- 设计原则那七条，尤其「语义摘要优先于原始 JSON、重资产返回文件路径与引用」，任何给 agent 造工具的人可以直接抄成自己的设计准则
- 页面自暴露工具的发现协议：`devtoolstooldiscovery` 事件加 `respondWith(ToolGroup)`，应用把自己的私有调试面交给 agent，比从 DOM 反推干净一个量级
- 技能与工具同包分发，并把「技能描述的是特定版本的工具，升级时要一起更新」写成明文告诫
- `--slim` 裁剪工具面：按任务收窄 agent 可见的工具集，控制上下文占用与误用面
- 测试纪律：mock 优先于真浏览器（puppeteer 上游已经测过浏览器行为），`sinon.createStubInstance` 集中管理 mock
- AGENTS.md 的 TypeScript 铁律（禁 `any`、禁 `as`、禁 `!`、禁 `@ts-ignore`）与「submodule 只许实验不许改」的边界写法

**不适用的：**

- GN 加 Ninja 的构建链是 Chromium 仓库的家当，普通项目跟着上纯属增加负担
- devtools-frontend submodule 的深度复用（分析代码直接用 DevTools 源码）只有官方仓库玩得起；fork 一份要扛住 submodule 漂移
- 遥测默认开启、性能数据出网 CrUX 是 Google 的产品取舍，自研工具的默认值应当反过来：默认关，显式开
- 官方支持只覆盖 Chrome 与 Chrome for Testing；Firefox、Safari 的调试需求不在它的承诺里

## 局限

快照口径：56,119 stars、4,652 forks、30 位贡献者、63 个工具，评估当天仍在合入功能（CSS 变量内联解析、工具运行期页面报错收集）。工具面大，agent 的上下文占用与误用风险随之增长，`--slim` 是它自己给出的止血带。默认遥测与 CrUX 出网在合规环境里要先关。Chromium 系之外不保证。

## 相关

站内文章《[别再给 Agent 写嘱咐了](/sdlc-playbook/articles/harness-five-rules/)》引的 OpenAI Codex 团队做法（把 Chrome DevTools 接进 agent 运行时、让 agent 自己复现和验证），就是这个项目服务的那类场景；《[验证工程](/sdlc-playbook/articles/verification-engineering/)》主张的「证据由 harness 生成、命令能判的交给命令」，在这里落成 trace 文件与堆快照工具。项目卡 [mcp-server-cloudflare](/sdlc-playbook/projects/mcp-server-cloudflare/) 是同为 MCP 服务器形态的对照。
