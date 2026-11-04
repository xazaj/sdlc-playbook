---
name: boxery
title: boxery（给 coding agent 的 Linux VM 层）
summary: agent 自管 Linux VM（本地/远程/云沙箱）：凭据不进 VM，快照即 fork。
category: build
kind: mcp
invoke: install
origin: external
provider: modem-dev/boxery
asset: boxery-vm
upstream: https://github.com/modem-dev/boxery
license: MIT
pairs_with: []
agents:
  - Claude Code
  - Codex
  - Cursor
  - opencode
  - pi
release_source: npm
evaluated_version: "0.10.1"
evaluated_at: "2026-11-04"
---

## 何时用

agent 需要一台用完即扔的完整 Linux 机器时用它。四个判据：要装系统级依赖或跑不可信代码，而不想弄脏本机与本机上的密钥；要并行试多种修法（fork 运行中的 VM，留对的那个）；要做浏览器或桌面任务（Chrome、点击、截图，真实桌面可围观）；要常驻 agent 或长任务跑在服务器/云上，合上笔记本也不断。也覆盖 CI：GitHub Actions 每个任务落在重置过的池 VM 里。VM 里的 agent 同样能用：LLM 请求经宿主代理转发，真实 key 不进 VM。

不适用：要 macOS/Windows 客户机、GPU 直通或互不信任的多租户硬隔离（都是上游明确的 non-goal）；只需要轻量容器隔离（Docker 更省，容器够用就别上 VM）；宿主机是 Windows（上游只支持 macOS/Linux 宿主）；要把生产凭据托付给它——单人维护、上游自称实验软件，评估当天 34 个 open issue。

## 这一版怎么样（0.10.1）

本卡通读了 v0.10.1 的 README、ARCHITECTURE.md、docs/security.md 与仓库结构，未在本机跑通：

- 设计成熟度远超 star 数：v0.9 起默认零权限——VM 之间网络隔离、私有网段全屏蔽，LLM 访问、ssh-agent、env、文件全走 grant 且新授权需人工批准；凭据由宿主代理按请求注入，VM 只持有可撤销 token，revoke 下一个请求即生效。
- 快照、fork、池重置统一为一个磁盘镜像原语（镜像不含内存，避免捕获内存密钥）；上游实测 libvirt 新建 VM 约 13s、快照约 1s、fork 出 2 个约 17s。
- MCP server 与 pi 原生扩展从同一张工具表构建，配 parity 测试防两端漂移——pi 用户是它的一等公民。
- 风险集中且明确：2026-10-31 建仓，四天 5 个 tag，129/130 个 commits 出自一人；open issue 里有设计级缺口（#71 lease 围栏是协作式、#67 Lima on Linux 时 guest 可达宿主回环服务、#74 controller 仍是 Bash）；exe.dev、boat.dev、Cloud Hypervisor、OpenShell 四个 backend 均实验性；Lima 路径的网络隔离弱于 libvirt（文档自己承认）。

待验证（本卡未实测）：安装流程与 VM 生命周期实际耗时、macOS Lima 路径的隔离边界、pi 扩展的 fan-out 体验。

## 安装 prompt

复制整块，贴进目标项目的 agent 会话。prompt 描述结果而不写命令，任何 agent 都能执行：

````text
请把 boxery（给 coding agent 的 Linux VM 层）装进本机并接入本项目，按 1→5 顺序做完再继续别的事：

1. 【检测】只报告结论：
   - 用户级：全局 npm 包 boxery-vm 是否已安装、版本从哪里读到；
     ~/.boxery/ 是否有主机档案；宿主侧 ~/.config/boxery/ 是否已初始化。
   - 项目级：本项目所用 agent 的 MCP 配置里是否已注册 boxery。
   结论写清：装了/没装；装了则版本号是多少、从哪个文件或命令读到。

2. 【对版本】已安装时：从 npm registry 的 boxery-vm 包查最新版本，与
   第 1 步读到的本地版本比较。一致 → 不动它，说明依据；读不到本地
   版本 → 如实说明，不要猜；落后 → 升级后重新读版本确认。

3. 【安装】未安装时装最新版，完成一个最小可用部署：
   - 选一台 macOS 或 Linux 机器当宿主（本机即可），按上游
     docs/install.md 选 backend（macOS 默认 Lima，Linux 默认 libvirt），
     装齐依赖、初始化宿主、构建基础镜像（首次约 3 分钟；只要无桌面
     的 headless VM 可跳过）。
   - 注册宿主：本机即 boxery setup local；远程机器按 docs/hosts.md
     添加。任何 API key、token、ssh 私钥都不放进 VM。
   - 把 MCP server 接入本项目所用的每个 agent（附注：Claude Code、
     Codex、Cursor 等可 npx add-mcp boxery-vm；pi 可
     pi install npm:boxery-vm）。
   - 首次给 VM 授权时按提示请用户人工批准。

4. 【加载确认】确认本会话真的可用：vm_bash、vm_manage 等 vm_* 工具
   应出现在可用工具里；用 vm_manage 新建一个测试 VM，在 VM 里执行
   一条命令确认是 Linux，然后删除该 VM。新装 MCP 在当前会话不可见时，
   不要装作可用，告诉用户怎么让它生效（通常是重开会话），停下等确认。

5. 【边界】在本项目 AGENTS.md（没有则创建）追加下面这一节，同名小节
   整节替换，不要重复追加：

## Boxery VMs

- Use the vm_* tools whenever work installs system packages, runs
  untrusted code, or needs a disposable Linux environment: create,
  fork, snapshot and remove VMs instead of running it on this machine.
- Never place real credentials (API keys, tokens, ssh keys) inside a
  VM; request access through vm_grant and let the host proxy inject
  them per request.
- Do NOT spin up VMs for routine edits, builds or tests this machine
  already runs safely — that trades seconds for minutes.
- boxery is early-stage with a single maintainer: keep production
  credentials and untrusted multi-tenant workloads away from it.

完成后：列出改动或新增的文件，并给出第 1–4 步每步的结论。
````

确认方式：让 agent 新建一个 VM、在 VM 里跑一条命令回显 Linux 内核版本、fork 一份、把两个都删掉。全程本机 shell 没有装任何系统包，就是装对了。

## 版本

本库不记录上游当前版本号，只记录评估时基于的那一版（见 frontmatter 的 `evaluated_version`）。上游当前版本由 npm（boxery-vm 包）与 GitHub Releases 共同管理，直接看发布页：

- npm：https://www.npmjs.com/package/boxery-vm
- Releases：https://github.com/modem-dev/boxery/releases

评估历史：0.10.1（2026-11-04）
