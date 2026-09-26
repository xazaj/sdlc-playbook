---
name: mcp-server-cloudflare
title: mcp-server-cloudflare：把 MCP 服务当产品族量产
summary: 十五个生产级 MCP 服务共用一套工厂与书面规范，服务只写差异部分；请求级无状态、能力接口封装与 LLM 评估层都能直接搬。
repo: https://github.com/cloudflare/mcp-server-cloudflare
stars: 4301
language: TypeScript
license: Apache-2.0
tags: [mcp, monorepo, typescript]
pinned_commit: 1d7a16b25db74ed44539cd5079e2db46b42f08db
evaluated_at: 2026-09-26
related: []
---
这个仓库表面上是一堆 MCP server，实际是一套多服务量产框架。十五个域服务跑在同一个工厂上，传输、鉴权、指标、错误上报全部共享，每个服务只剩三件事要写：工具、校验器、给模型的说明书。单个工具写得好不好是小事，值得搬走的是这套分层。

## 它解决什么问题

单个 MCP server 手搓并不难，难的是第二个。协议接入、OAuth、CORS、账号解析、指标上报，每个服务重复实现一遍，质量随人而 drift；工具怎么命名、参数怎么校验、错误怎么报，全靠各服务作者自觉。Cloudflare 一年里开出十几个域服务（观测、构建、浏览器渲染、DNS 分析……README 的服务表 [数下来是十五个](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/README.md)），这件事必须变成工厂加规范，否则维护成本随服务数线性上涨。

他们的答案分两层。代码层：`packages/mcp-common` 收敛所有基建，服务只声明差异。文字层：`implementation-guides/` 三份内部规范（[工具](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/implementation-guides/tools.md)、[校验器](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/implementation-guides/type-validators.md)、[评估](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/implementation-guides/evals.md)）把工具质量从口口相传变成可查的守则。

## 怎么解的

monorepo 三层。`apps/` 每个服务一个目录，内部固定三件套：入口 `<name>.app.ts` 只有二十来行，声明 scopes 与主机名；`<name>.context.ts` 放环境绑定与服务器指令；`tools/*.tools.ts` 是纯注册函数。`packages/` 放共享库。`implementation-guides/` 放规范。最小服务 [`demo-day`](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/apps/demo-day/src/demo-day.app.ts) 全部代码 53 行，含 Worker 导出——它同时是新服务的抄写起点。

运行时模型是请求级无状态：每个请求经 [`createCloudflareMcpHandler`](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/packages/mcp-common/src/server.ts) 用 SDK 工厂新建一个服务器实例，无协议会话，天然水平扩展。旧 `/sse` 端点不悄悄兼容，回 410 加迁移指引。配套纪律写进工具规范原文：每个工具显式收参，不依赖前一次调用或会话状态。

## 设计亮点

**注册上下文封死旁路。** 应用代码拿不到裸的 SDK server，只能用 `context.registerTool()` / `context.accountTool()`（[registration-context.ts](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/packages/mcp-common/src/registration-context.ts)）。工厂给每个回调包上指标计时与错误上报，共享可观测性在类型上就绕不过去。注释写得很直白：这是防止有人"accidentally bypass"。

**inputSchema 按凭据形态收窄。** 多账号场景的三级解析（[account-tool.ts](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/packages/mcp-common/src/account-tool.ts)）：token 只绑一个账号时，schema 里根本不出现 `account_id` 参数；多账号凭据才动态 `extend` 出这个参数让模型自己选。模型少填一个参数，就少一次填错的机会。

**校验器锚定上游类型。** 规范要求每个字段一个命名 Zod schema，并用 `z.ZodType<SDKType>` 链到 SDK 的参数类型——上游改了类型签名，编译期就炸，不留到运行期。字段 schema 跨工具复用，每个都 `.describe()`。

**错误分内外两层。** [`McpError`](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/packages/mcp-common/src/mcp-error.ts) 把 message（给模型）和 internalMessage（内部日志，含上游响应体前 500 字符）拆开；上游 4xx 保留状态码不上报 Sentry，5xx 映射 502 才上报。该吵的吵，不该吵的静默。

**给模型的输出按 token 优化。** [`fmt.asTSV`](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/packages/mcp-common/src/format.ts) 把表格数据转 TSV 返回，注释直言比 JSON 省 token。截图走 image content block，PDF 走 resource blob，网页正文带一段引导文本告诉模型拿它干什么。

**单元测试之上还有一层 LLM 评估。** `vitest-evals` 让真实模型连上工具跑任务，断言调了哪个工具、参数对不对，再对最终回答做事实性评分，多模型矩阵跑（[evals.md](https://github.com/cloudflare/mcp-server-cloudflare/blob/1d7a16b25db74ed44539cd5079e2db46b42f08db/implementation-guides/evals.md)）。测的是"模型能不能用对这套工具"——这层大多数团队没有。

## 借鉴清单

**能搬的：**

| 什么 | 怎么搬 |
|---|---|
| 工具不依赖会话、参数全显式 | 纯设计纪律，任何 MCP 服务立刻适用 |
| 字段级命名 schema + 锚定上游类型 | 有 SDK 的服务照抄 `z.ZodType<SDKType>` 写法 |
| 错误分内外两层、4xx 不上报 | 两个小函数的事，信噪比立竿见影 |
| 表格数据 TSV 化 | 一个 `@fast-csv/format` 依赖 |
| LLM 评估层 | `vitest-evals` 断言 toolCalls，工具多于五个就值得建 |

**不适用的：**

- monorepo 全家桶（pnpm + Turbo + changesets）。服务只有一个时，这是纯开销。
- Workers 绑定、Durable Object、Analytics Engine 指标。平台特权，不在 Cloudflare 上跑就搬不动。
- OAuth provider 与授权对话框。自建一套只为对标 Cloudflare 账号体系，不值。

## 局限

三处要警惕。规范是书面约定，没有 lint 强制——`implementation-guides` 里的守则新贡献者可以不读，代码也不会拦。工具 handler 里 try/catch 加 content 包装的样板每个工具重复一遍，二十个工具的文件读起来很闷。最重的一点：`mcp-common` 里 Cloudflare 平台耦合（绑定、OAuth、账号体系）与通用机制（错误分层、注册封装）混在同一层，想只搬通用那半，得自己剥。

还有个方向性事实：Cloudflare 自己在收摊。仓库里 radar 服务已标记废弃，README 把推荐位让给了统一的 Code Mode 服务（`mcp.cloudflare.com`，两个通用工具加代码执行覆盖全 API）。策划型工具与广覆盖通用工具的取舍他们两边都试了，值得在做同类决策时引用。

## 相关

- 站内文章[《生产级 Agent 背后的 12 个 MCP 模式》](/sdlc-playbook/articles/mcp-production-patterns/)——模式层面的论述，这个仓库是那些模式的一次全量落地。
