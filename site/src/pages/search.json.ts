import type { APIRoute } from 'astro';
import {
  allArticles,
  allCategories,
  allEntries,
  allProjects,
  allSites,
  extractPrompts,
  INVOKE_LABEL,
  invokeOf,
  KIND_LABEL,
  SITE_CATEGORY_LABEL,
} from '../lib/catalog';

export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const categories = await allCategories();
  const titleOf = new Map(categories.map((c) => [c.data.id, c.data.title]));
  const entries = await allEntries();
  const articles = await allArticles();
  const projects = await allProjects();
  const sites = await allSites();

  const index = entries.map((entry) => {
    const d = entry.data;
    const kind = KIND_LABEL[d.kind] ?? d.kind;
    const invoke = INVOKE_LABEL[invokeOf(entry)];
    const category = titleOf.get(d.category) ?? d.category;
    return {
      title: d.title,
      summary: d.summary,
      category,
      kind,
      invoke,
      prompt: extractPrompts(entry.body)[0]?.text ?? '',
      url: `${base}/entries/${d.name}`,
      haystack: [d.name, d.title, d.summary, category, kind, invoke, d.provider ?? '', entry.body ?? '']
        .join(' ')
        .toLowerCase(),
    };
  });

  const articleItems = articles.map((article) => {
    const d = article.data;
    return {
      title: d.title,
      summary: d.summary,
      category: '文章',
      kind: '长文',
      invoke: '阅读',
      prompt: '',
      url: `${base}/articles/${d.name}`,
      haystack: [d.name, d.title, d.summary, d.tags.join(' '), d.author ?? '', article.body ?? '']
        .join(' ')
        .toLowerCase(),
    };
  });

  const projectItems = projects.map((project) => {
    const d = project.data;
    return {
      title: d.title,
      summary: d.summary,
      category: '项目',
      kind: '仓库',
      invoke: '浏览',
      prompt: '',
      url: `${base}/projects/${d.name}`,
      haystack: [d.name, d.title, d.summary, d.tags.join(' '), d.repo, project.body ?? '']
        .join(' ')
        .toLowerCase(),
    };
  });

  const siteItems = sites.map((site) => {
    const d = site.data;
    const category = SITE_CATEGORY_LABEL[d.category] ?? d.category;
    return {
      title: d.title,
      summary: d.summary,
      category,
      kind: '网站',
      invoke: '外链',
      prompt: '',
      url: `${base}/sites/${d.name}`,
      haystack: [d.name, d.title, d.summary, d.url, category, d.tags.join(' '), site.body ?? '']
        .join(' ')
        .toLowerCase(),
    };
  });

  return new Response(JSON.stringify([...index, ...articleItems, ...projectItems, ...siteItems]), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
