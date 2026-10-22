---
name: luongnv89-claude-howto
title: claude-howto：一门按代码库纪律维护的 Claude Code 课程
summary: 4.3 万星的 Claude Code 教程仓库，值钱的是维护机制不是内容：编号目录当课程表，出题技能防编题，文档过五道质检关，CHANGELOG 专记事实勘误。
repo: https://github.com/luongnv89/claude-howto
description: 'A visual, example-driven guide to Claude Code — from basic concepts to advanced agents, with copy-paste templates that bring immediate value.'
stars: 42696
forks: 5356
contributors: 25
language: Python
languages:
  Python: 65.6
  Shell: 13.9
  CSS: 6.6
  Jinja: 5.9
  JavaScript: 4.8
  HTML: 3.2
avatar: /projects/luongnv89.png
license: MIT
tags: [claude-code, tutorial, docs-as-code, learning-path, documentation]
pinned_commit: 188f468893231cbe4525f45e657d554746232072
evaluated_at: 2026-10-22
updated_at: 2026-10-22
related: []
---

claude-howto 教人用 Claude Code：十个编号模块，每课配可复制的模板和 Mermaid 图，42696 星。这张卡主张：抄它的维护机制，别抄它的内容策略。机制里最值钱的三件事：把考试做成了防编题的技能，给文档立了五道 pre-commit 关，CHANGELOG 专门记录事实勘误。

## 它解决什么问题

Claude Code 的官方文档是特性参考：每个开关在哪都查得到，怎么组合没人讲。斜杠命令、记忆、技能、子代理、MCP、hooks、插件各自成章，读者全读一遍要很久，读完还是不知道先学哪个。这个仓库把同一堆特性重排成课程：十个模块按依赖、复杂度、使用频率排序，每个 30 分钟到 3 小时，全程 11-13 小时；先做 8 项自测定级，再从对应里程碑进入。每课的产出是能直接 cp 进项目的模板。

## 怎么解的

十个编号目录 `01-slash-commands` 到 `10-cli`，序号就是学习顺序。每个模块一份 README 加模板文件。根级四份导航文档分工：[LEARNING-ROADMAP.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/LEARNING-ROADMAP.md) 定分级路线，[CATALOG.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/CATALOG.md) 列 126 个内置特性加 44 个示例，QUICK_REFERENCE 做速查，STYLE_GUIDE 规定课文结构。

仓库自带两个技能，放在 `.claude/skills/`。[self-assessment](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/.claude/skills/self-assessment/SKILL.md) 定级：8 个勾选题走快速模式，5 轮 20 分走深度模式，按缺口生成学习路径。[lesson-quiz](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/.claude/skills/lesson-quiz/SKILL.md) 考单课：[题库](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/.claude/skills/lesson-quiz/references/question-bank.md) 100 题、每课 10 题，考完按 pre/during/after 给不同评语。教程教的是 Claude Code 的机制，考试用同一套机制实现。

维护靠 Python 工具链：`scripts/` 下是 EPUB 生成器、网站生成器、四类检查脚本，脚本自身受 ruff、mypy、bandit、pytest 管。pre-commit 对 `.md` 改动跑五道关。Mermaid 图用钉版本的 Pele 渲染，首次运行下载经 sha256 校验的 bundle，之后离线可用。

## 设计亮点

**序号即课程表。** 两位数字前缀编码学习顺序，排序原则（依赖、复杂度、使用频率）写在路线图里，[CLAUDE.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/CLAUDE.md) 把不许重排列为硬规则：The order is the curriculum。文件系统排序免费给出阅读顺序，新贡献者想按字母序整理目录时，规则先拦住他。

**出题技能防编题。** lesson-quiz 的 [SKILL.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/.claude/skills/lesson-quiz/SKILL.md) 立了护栏：题只能出自题库，题库没有这一课就停，不许现场编；选项打乱后必须追踪正解位置再判分；末尾列六条验收标准和正反触发用例（quiz me on hooks 该触发，explain hooks 不该）。内容修正会连考题一起修：CHANGELOG 的 v2.1.245 条目把考题随课文重新对齐（graded material realigned）列为修正项，对齐到 31 个 hook 事件、五种 hook 类型这样的粒度。课文改了题库没改，在这里算未完成的同步。

**自评是路由器。** self-assessment 的路径生成规则写死在技能里：满分项跳过，按依赖排序，只对缺口估时，按 2-3 个主题分阶段。静态版是 8 个勾选框，交互版用 AskUserQuestion 逐项问，两版共用同一套分级标准；没装 Claude Code 的读者用静态版也能定级。

**文档过五道关。** [.pre-commit-config.yaml](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/.pre-commit-config.yaml) 对 markdown 改动跑：markdownlint、交叉引用（相对链接、锚点、代码块必须声明语言）、mermaid 渲染（strict 模式，渲染失败即失败，不许跳过）、外链可达、渲染检查。全书 EPUB 构建慢，放 CI 不放 hook，这个取舍写在配置注释里，后来者不用重新推一遍。

**CHANGELOG 记勘误。** [CHANGELOG.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/CHANGELOG.md) 的 v2.1.245 条目记了七处事实修正：hook 默认超时从 60 秒改成 600 秒；技能优先级写反，课文与自己的考题互相矛盾；记忆文件是拼接不是覆盖。七处逐条列在条目里，可点开核对。缺了两条历史 sync 记录，条目声明不回填日期，只记录缺口。文档曾错这件事被当成负债公开，而不是藏在内容更新里。

## 借鉴清单

**能搬的：**

- 题库式出题护栏：不编题、追踪正解位置、验收标准、正反触发用例。任何让 agent 出题或评分的场景直接抄这套写法
- 文档 pre-commit 五道关；慢的全书构建放 CI，取舍理由写进配置注释
- 编号前缀编码阅读顺序，配一条不许重排的硬规则
- CHANGELOG 记事实勘误与记录缺口，不回填日期
- 课文与考题同一批次对齐的纪律

**不适用的：**

- 五棵全量翻译树（en、vi、ja、uk、zh）撑不住。漂移检测只对比 vi 的文件时间，pre-commit 语言钩子只盖 vi 和 ja；钉住的这个提交里，[MCP 数据库示例的只读化](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/05-mcp/README.md)进了 en、ja、uk、vi 四版，[zh/05-mcp/README.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/zh/05-mcp/README.md) 没进，zh 的版本徽章停在 2.1.112。多语言内容要么单源抽取，要么公开声明滞后
- 用文件修改时间检测翻译漂移，fresh clone 上失效：git 不保存 mtime，新克隆的全库时间戳相同，这套检测只对长期工作副本有意义
- 追着上游发版跑的内容策略成本极高：版本徽章 v2.1.302，行内钉着一串具体小版本行为，90 天 20 次提交几乎全在同步。没有这份维护预算，别承诺与最新版同步
- 16MB 仓库、#1 Trending 徽章、标题 emoji 是获客层，与结构无关

## 局限

快照口径：42696 stars、5356 forks、25 位贡献者，v2.1.302，评估当天上游仍在提交。257 次提交里 201 次来自作者一人，事实正确性靠他一个人的勘误纪律兜底；教程类内容没有 CI 能验证对错，上游每发一版都是一次过期。仓库自己的 CLAUDE.md 还引用着已删除的 openspec/ 目录，零漂移谁都做不到。Python 占 65.6%，全是维护工具，这不是可安装的库。

## 相关

站内《[Claude 第二大脑与文件夹工作流](/sdlc-playbook/articles/claude-second-brain/)》与它的 02-memory 章同题：怎么给 agent 留可导航的记忆。上游 [LEARNING-ROADMAP.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/LEARNING-ROADMAP.md) 是课程设计的完整样本，[CATALOG.md](https://github.com/luongnv89/claude-howto/blob/188f468893231cbe4525f45e657d554746232072/CATALOG.md) 是特性清单的编排样本。
