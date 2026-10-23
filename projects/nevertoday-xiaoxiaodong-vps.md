---
name: nevertoday-xiaoxiaodong-vps
title: 小小东 VPS：把整台服务器的部署写成一份 agent 契约
summary: 16 天 696 星的自用 VPS 方案库：SKILL.md 当操作契约，秘密不进对话，阶段幂等，版本钉死带理由，自动更新带回滚，教程按实测规程验证。
repo: https://github.com/nevertoday/xiaoxiaodong-vps
description: 小小东 VPS：3x-ui、Xray、OpenClash、Shadowrocket、CLIProxyAPI 与自动升级部署蓝图
stars: 696
forks: 79
contributors: 1
language: MDX
languages:
  MDX: 45.4
  CSS: 24.6
  Python: 14.3
  JavaScript: 7.2
  Astro: 6.9
  Shell: 1.5
avatar: /projects/nevertoday.png
license: MIT
tags: [vps, agent-skills, deployment, proxy, claude-code, docs-as-code]
pinned_commit: e7e441631887de255c66d719b2ab10d6014e9284
evaluated_at: 2026-10-23
updated_at: 2026-10-23
related: []
---

小小东 VPS 是一套自用代理服务器方案：3x-ui 加 Xray 双节点、订阅中间层、CLIProxyAPI，外加双语图文教程站。696 星，建库 16 天，一个人维护。这张卡主张：值得搬的不是代理配置本身，而是它把运维方案写成 agent 技能的那套纪律：秘密不进对话、阶段幂等、版本钉死并写明理由、验收当交付门禁，还有一个拒绝表演的自动更新器。

## 它解决什么问题

自己搭代理服务器的传统路径，是照十几篇教程在终端里手工敲命令，错一步排查半天，秘密还会散落在 shell 历史里。这个仓库把部署折叠成三步：买服务器，把 [README](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/README.md) 里那段 prompt 发给 AI，导入订阅。执行单元是 `skills/xiaoxiaodong-vps/`：[SKILL.md](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/skills/xiaoxiaodong-vps/SKILL.md) 是给 agent 的操作契约，1403 行的 [xxd-vps.py](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/skills/xiaoxiaodong-vps/scripts/server/xxd-vps.py) 做全部变更，agent 负责问信息、转述输出、按排错文档修错。

## 怎么解的

部署分九个阶段：upload、init、base、cert、xui、sub、cliproxy、maint、verify。每个阶段可以重复执行；init 核对这台机器的公网 IP 是否就是用户给的，并拒绝覆盖不是本工具创建的 3x-ui。网络拓扑里只有 Nginx、Xray 和面板直接对公网监听，CLIProxyAPI、订阅服务、回落站点都只听 127.0.0.1。
教程站是 Astro 双语（中文、英文），8 步主线加 36 篇 howto 加 wiki 和 FAQ，每页底部有预填模板的 GitHub 反馈链接。验证规程写在 [site/TESTING.md](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/site/TESTING.md)：容器端到端照抄线上命令跑通过，AI 路线在 6 台真实服务器上完成过，真人新手测试的规程定好了但「维护者 2026-10-16 决定不做」，这句话原样留在文档里。
每个设计决策的理由单独成文，放在 [references/design.md](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/skills/xiaoxiaodong-vps/references/design.md)：Reality 节点的回落指向自己证书正常的站点而非借用大网站域名，订阅中间层只放行已知路径且不记录请求地址，AI 分流规则排在通用规则前面。出错对照 [references/troubleshooting.md](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/skills/xiaoxiaodong-vps/references/troubleshooting.md) 修复。

教程站是 Astro 双语（中文、英文），8 步主线加 35 篇 howto 加 wiki 和 FAQ，每页底部有预填模板的 GitHub 反馈链接。验证规程写在 [site/TESTING.md](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/site/TESTING.md)：容器端到端照抄线上命令跑通过，AI 路线在 6 台真实服务器上完成过，真人新手测试的规程定好了但「维护者 2026-10-16 决定不做」，这句话原样留在文档里。

## 设计亮点

**agent 管对话，脚本管变更。** SKILL.md 立了六条硬规则：只操作用户这次给的这台服务器，`~/.ssh/config` 里已有条目一律不动；秘密不进对话，密码让用户在终端里用 `!` 前缀自己输入，已经发在对话里的就写进 0700 临时文件用完即删；每台服务器独立生成凭据；证书申请失败就停，绝不改用自签名；版本钉死（3x-ui v3.8.5、Xray v26.7.28）；脚本报错修完原因后重跑同一阶段，不许手工绕过检查，也不许删机重装来「解决」普通问题。写操作全部落在脚本里，agent 没有直接改服务器的自由动作。

**每个钉死的值都有理由链。** Xray 钉在 26.7.28，因为 26.9 起拒绝不带 ML-KEM 的 ClientHello，Shadowrocket 会连不上；升级门槛写死为测试机加真实客户端验证，再改版本号和校验值。sshd 配置文件用 `01-` 前缀命名，因为 sshd 只认第一次出现的值，云镜像自带的 `50-cloud-init.conf` 排在后面就不会生效，改完还要用 `sshd -T` 核对。`~/.ssh/config` 的 Host 段放文件最前面，同一条规则。微信直连规则排在倒数第二，理由是微信很多连接不查域名直接连 IP，腾讯海外 ASN 不在国内 IP 段里，掉进兜底规则走代理就会出现图片发不出去。

**自动更新器不表演。** [cliproxy-auto-update](https://github.com/nevertoday/xiaoxiaodong-vps/blob/e7e441631887de255c66d719b2ab10d6014e9284/skills/xiaoxiaodong-vps/scripts/server/files/cliproxy-auto-update) 的流程：查新版、SHA-256 校验、把新程序放在旧程序旁边、等一个空闲瞬间（重启会掐断所有在途请求，连续两次探测连接数为 0 才换，最多推迟 24 小时）、原子替换、健康检查、失败自动回滚且同一坏版本 24 小时内不再尝试。它明确拒绝双进程无缝切换，理由写在 design.md：两个进程同时刷新同一个账号的登录令牌，令牌一刷新旧的就作废，比断一秒风险大。日志不落任何 Key。

**教程按实测规程验证，没做的写出来。** TESTING.md 定义了新手实测规程：找没配过服务器的人，观察者只看不说，5 分钟没有进展才可以帮，记录表逐栏记卡点原话和「他在网站上找了哪里」，通过标准是下一个测试者在同样的地方不再卡住。已做的验证逐条记录，包括容器端到端（命令直接从线上页面提取）和 6 台真实服务器。真人新手测试决定不做，也原样写明，读者不会高估成熟度。

**README 的主界面是一段 prompt。** 用户复制的不是命令序列，是一段让 AI 下载项目、读 SKILL.md、严格按步骤执行的指令；「检查服务器」另配一段 prompt，约定先只检查、用户同意后再修。装机路径（`~/.claude/skills/`）收在折叠块里，两条路互不干扰。

## 借鉴清单

**能搬的：**

- 运维技能的契约写法：SKILL.md 立硬规则（秘密、边界、幂等、验收门禁），变更全部落在可重复执行的脚本里，agent 只做对话与转述
- 版本钉死写理由、升级写门槛（测试机加真实客户端），比「升级到最新」可维护
- 拒绝式安全默认：证书失败即停不自签，关闭密码登录前先确认密钥能登录
- 自动更新的空闲窗口、原子替换、回滚、坏版本隔离四件套，每一步的选择都附了为什么不选更花哨的方案
- 教程站实测规程模板：测试者画像、观察者规矩、记录表、通过标准，适合一切「照着文档做」类产品
- 把没做的验证明确写进文档

**不适用的：**

- 单人 16 天的新仓库，「生产环境验证过」全部出自作者自己的服务器，没有第三方复核，照搬前按此校准
- 搬瓦工与 DMIT 的购买链接是返佣链接（README 自己声明了），方案与特定商家和套餐耦合
- 主题是代理工具，各司法辖区规则不同，采用与分发前自行评估合规
- 钉版本绑死 3x-ui 与 Xray 的具体行为，上游一变就要人工跟，这正是它不给 3x-ui 自动升级的原因
- 十语言 README 加双语站点，对单人维护是持续的漂移面

## 局限

快照口径：696 stars、79 forks、1 位贡献者，64 次提交全部来自 coolxie20，建库 16 天，评估当天上游仍在提交。verify 的 34 项里「证书续期演练」在容器测试中 FAIL 过，作者标注为自建 CA 环境特有。「只看网站不问人就能配好」这个目标，目前验证到容器和作者自己的 6 台机器为止。

## 相关

站内项目卡《[claude-howto](/sdlc-playbook/projects/luongnv89-claude-howto/)》是同模式的另一面：教程附带自测技能，本文的仓库把整套部署本身写成技能。《[Ralph 循环](/sdlc-playbook/articles/ralph-loop/)》讨论无人值守执行的最小形态，这里的自动更新器是同一问题在「不许打断在途请求」约束下的解法。
