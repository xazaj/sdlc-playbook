import type { APIRoute } from 'astro';
import { allCategories, allEntries, KIND_LABEL } from '../lib/catalog';

export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const categories = await allCategories();
  const titleOf = new Map(categories.map((c) => [c.data.id, c.data.title]));
  const entries = await allEntries();

  const index = entries.map((entry) => {
    const d = entry.data;
    const kind = KIND_LABEL[d.kind] ?? d.kind;
    const category = titleOf.get(d.category) ?? d.category;
    return {
      title: d.title,
      summary: d.summary,
      category,
      kind,
      url: `${base}/entries/${d.name}`,
      haystack: [d.name, d.title, d.summary, category, kind, d.provider ?? '', entry.body ?? '']
        .join(' ')
        .toLowerCase(),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
