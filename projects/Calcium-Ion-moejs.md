---
name: Calcium-Ion-moejs
title: moejs：纯 Go 的 JavaScript 插件沙箱运行时
summary: 一人写的纯 Go JS 引擎：每调用 6.9µs、每运行时 81KiB、test262 全过，靠真实生产负载做基准与差分测试——小型插件沙箱的完整工程示范。
repo: https://github.com/Calcium-Ion/moejs
description: A pure-Go JavaScript runtime built for running many small plugin sandboxes fast.
stars: 186
contributors: 1
forks: 4
language: Go
languages:
  Go: 96.5
  JavaScript: 3.2
  Python: 0.2
  Shell: 0.1
avatar: /projects/Calcium-Ion.png
license: Apache-2.0
tags: [javascript-engine, go, sandbox, plugins]
pinned_commit: 81508091e81452055003d1459f84c4323ca8303d
evaluated_at: 2026-10-06
updated_at: 2026-10-06
related: []
---

moejs 是一个纯 Go 的 JavaScript 运行时，为在 Go 程序里跑大量小插件沙箱而生：单次插件调用 6.9µs，新运行时 1.4µs，每个运行时带最大插件只占 81KiB 内存。作者 Calcium-Ion 是 LLM 网关 new-api 的作者，这个引擎从 new-api 的真实插件负载里长出来。这张卡的主张：它值得看的不是「又造了个轮子」，而是**怎么用生产负载做基准、用差分测试对齐参考实现、把每个引擎设计决策标注出处**——这套方法论任何性能敏感的项目都搬得走。

## 它解决什么问题

Go 服务要执行用户或运营方写的 JS 插件（LLM 网关的任务改写、请求构建是典型场景），安全模型是每个并发请求一个独立运行时。这个模型对引擎有三个硬指标：创建运行时要微秒级（V8 是 1153µs）、每实例内存要 KiB 级（V8 1544KiB）、中断要可靠（插件可能死循环）。纯 Go 现状里 Sobek 能用但慢一倍、内存大三倍；QuickJS 与 V8 走 cgo——交叉编译要 C 工具链、pprof 与 race detector 看不进引擎内部。moejs 用 `CGO_ENABLED=0` 构建、只依赖标准库，把三条指标同时压下来（[README 性能表](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/README.md)，计时在 Go 调用方一侧、含参数与结果的转换成本）。

## 怎么解的

引擎本体三条腿：[compiler/](https://github.com/Calcium-Ion/moejs/tree/81508091e81452055003d1459f84c4323ca8303d/compiler) 编译到寄存器字节码（V8 Ignition 式解释器 + Lua 式定宽指令编码），[bytecode/](https://github.com/Calcium-Ion/moejs/tree/81508091e81452055003d1459f84c4323ca8303d/bytecode) 带反汇编器，值布局是 QuickJS 式 16 字节加 NaN-boxing。插件先 `Compile` 成 Module，一次编译、池中所有运行时共享加载；每个运行时独立 globals，内置对象冻结后全局共享——隔离与省内存同时成立。

测试体系比引擎本身更有借鉴价值：[bench/](https://github.com/Calcium-Ion/moejs/tree/81508091e81452055003d1459f84c4323ca8303d/bench) 是独立 Go module（cgo 引擎只进 bench 不进主库），对 moejs、Sobek、QuickJS、V8 四引擎跑同一组负载；负载是 new-api 的 10 个任务插件加 269 条**真实录制的 API 调用**（[recordfixtures](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/bench/cmd/recordfixtures/scenarios.go) 录了 Sora、Kling、即梦、豆包等十家场景）；test262 跑过它实现的全部 79,385 个用例、0 失败（[RESULTS.md](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/bench/test262/RESULTS.md)）；对 Sobek 另有差分测试，同输入比两个引擎的输出。

## 设计亮点

**基准锚定生产负载，不锚定合成 benchmark。** 多数引擎项目跑 SunSpider 式合成集；moejs 把生产插件与录制调用当作一等公民测试资产（fixtures 单独脚本下载，许可证边界写明）。为什么重要：插件沙箱的瓶颈形态（薄函数、高频调用、值转换占比高）与计算密集脚本完全不同，合成基准测不出 6.9µs 与 14.3µs 的差距该信谁。

**值转换是惰性且无中间态的。** `FromGo` 把 map 一层一层转、转到插件真正读到的深度为止；结果侧 `Unmarshal` 直写调用方的 struct，中间不落 JSON 文本（[README 快速开始](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/README.md)的 `Plugin.Call` 是完整范式：池取 runtime、`context.AfterFunc` 挂中断、hook 复用）。

**中断与错误是运行时级契约。** 任意 goroutine 可对一个死循环中的插件调 `Interrupt`；JS throw、语法错误、中断、host 函数 panic 各有自己的 Go 错误类型；panic 之后 runtime 放回池里继续可用。host 函数还能返回 promise、稍后在 Go 侧 settle——异步边界没有回调胶水。

**每个设计决策标注出处。** [致谢清单](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/README.md)精确到机制：16 字节值布局与 shape transitions 学 QuickJS，隐藏类与内联缓存学 V8 且把原型有效性检查简化成一个计数器，parser 写法学 esbuild，冻结内置的 `lockdown()` 模型学 SES。造轮子造得可审计。

**PGO profile 随包出厂。** 根目录 [default.pgo](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/default.pgo) 从插件负载录制，README 连「Go 只自动应用 main 包目录的 profile」这个坑的绕法都给了。alpha 库连这个都做了，多数稳定库没做。

## 借鉴清单

**能搬的：**

- 真实负载录制做基准：把生产调用录成 fixture 回放（[scenarios_*.go](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/bench/cmd/recordfixtures/scenarios.go) 的组织方式），任何「性能数字要服人」的项目可用
- 差分测试：新实现对齐成熟参考实现时，同输入比输出，比「各自跑各自的测试」可信得多
- 依赖分层隔离：重型 cgo 依赖只进独立的 bench module，主库 `go.mod` 干净——下游构建不背基准工具链
- 借鉴谱系表：README 把「哪个机制学谁」写全，审查者可按来源检索；自述「代码独立写成」与逐条致谢并存，是衍生与抄袭的边界示范
- 惰性值转换 + 直写 struct 的 interop API 形状：跨语言边界的通用模式
- 未实现清单显式化：[TODO.md](https://github.com/Calcium-Ion/moejs/blob/81508091e81452055003d1459f84c4323ca8303d/TODO.md) 列全未实现项与已知错误结果

**不适用的：**

- 计算密集的长脚本：没有 JIT，纯解释器，这个场景该用 V8 系；它是为「大量薄函数调用」特化的
- 浏览器向插件：无 `Intl`、`Temporal`、timers、`FinalizationRegistry`，依赖这些的代码迁不过来
- 把「test262 全过」读成「覆盖全部 JS」：14,058 个未实现特性的用例被跳过，README 自己标了口径
- alpha 期 API 不稳定，直接进生产核心链路需自担变更成本

## 局限

单人项目、两周历史（2026-09-24 创建）、alpha 声明在前。驱动场景单一：new-api 的 `pkg/jsplugin` 决定了它要支持哪些 API，你的插件形态若不同，性能数字不能平移。79,385 通过、0 失败是「它跑的那部分」的口径，横向对比其他引擎的 test262 数字时要对齐分母。

## 相关

上游宿主与对照物：[new-api](https://github.com/QuantumNous/new-api)（插件宿主，负载来源）、[Sobek](https://github.com/grafana/sobek)（纯 Go 参照与差分对象）、[QuickJS](https://bellard.org/quickjs/)（值布局来源）。
