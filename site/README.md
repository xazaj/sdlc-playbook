# site：目录站点

把 `registry/` 的条目渲染成静态站点，由 GitHub Actions 构建、GitHub Pages 托管。

地址：https://aibrev.com

## 为什么是 Astro

条目的 frontmatter 是这套站点唯一的数据契约。Astro 的内容集合用 Zod 声明该契约（见 `src/content.config.ts`），字段写错、`category` 取值不在四类之内、日期格式不合法都会让构建失败，而不是静默生成一个空页面。这一条是选它而非 Jekyll 的主要理由。

其余理由：输出零 JavaScript（只有复制按钮与搜索是客户端脚本）；模板是组件而非 Liquid 片段，agent 修改时的定位成本更低；不依赖 Ruby 工具链。

## 结构

| 路径 | 职责 |
|---|---|
| `src/content.config.ts` | 条目与分类的 frontmatter 契约 |
| `src/content/categories/` | 四个分类的元数据与「怎么选」面板 |
| `src/lib/catalog.ts` | 新鲜度计算、分类与形态的中文标签 |
| `src/layouts/`、`src/components/` | 版式与可复用组件 |
| `src/pages/` | 首页、分类页、条目页、类型索引页、搜索索引 |
| `src/styles/global.css` | 全部设计 token 与版式规则 |

条目本身不在这个目录里。站点读取仓库根部的 `registry/`，路径在 `src/content.config.ts` 的 `glob({ base: ... })` 一处声明。

## 本地开发

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 site/dist
```

## 新增条目

在 `registry/` 新建 markdown，frontmatter 至少包含 `name`、`title`、`summary`、`category`、`kind`、`origin`、`evaluated_version`、`evaluated_at`。正文的第一个围栏代码块被视为安装 prompt，会被渲染成可复制的深色块。推送后 Action 自动重新构建。

## 新鲜度

评估日期距今 90 天内为「新鲜」，90 到 180 天为「待复核」，超过 180 天为「需复核」。该状态在构建时计算，因此工作流每周一定时重跑一次，让无人改动的条目也会随时间变色。
