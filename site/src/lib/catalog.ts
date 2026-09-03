import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;
export type Category = CollectionEntry<'categories'>;

export const KIND_LABEL: Record<string, string> = {
  skill: '技能',
  'design-md': 'DESIGN.md',
  'component-library': '组件库',
  doc: '文档',
  mcp: 'MCP',
};

export const ORIGIN_LABEL: Record<string, string> = {
  local: '自建',
  marketplace: '外部',
  external: '外部',
};

/** Days after which an evaluation is flagged for re-review. */
const DUE_AFTER_DAYS = 90;
const STALE_AFTER_DAYS = 180;

export type FreshnessState = 'fresh' | 'due' | 'stale';

export function daysSince(date: Date, now = new Date()): number {
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

/** Never colour alone: every state carries a glyph and a word. */
export function freshness(
  date: Date,
  now = new Date(),
): { state: FreshnessState; label: string; glyph: string; days: number } {
  const days = daysSince(date, now);
  if (days > STALE_AFTER_DAYS) return { state: 'stale', label: '需复核', glyph: '‡', days };
  if (days > DUE_AFTER_DAYS) return { state: 'due', label: '待复核', glyph: '†', days };
  return { state: 'fresh', label: '现行', glyph: '·', days };
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function allCategories(): Promise<Category[]> {
  const cats = await getCollection('categories');
  return cats.sort((a, b) => a.data.order - b.data.order);
}

/** Sections every entry must carry. Frontmatter is checked by the schema;
 *  this is the body half of the same contract. A card missing its install
 *  prompt would otherwise render a page with nothing to copy. */
const REQUIRED_SECTIONS = ['## 何时用', '## 安装 prompt', '## 版本'] as const;

function assertBodyContract(entry: Entry): void {
  const body = entry.body ?? '';
  const missing = REQUIRED_SECTIONS.filter((h) => !body.includes(`\n${h}`) && !body.startsWith(h));
  if (!/^\s*`{3,}/m.test(body)) missing.push('围栏块（安装 prompt 本体）' as never);
  if (missing.length > 0) {
    throw new Error(
      `registry/${entry.data.name}.md 不符合条目正文契约，缺少：${missing.join('、')}。` +
        ' 见 CONTRIBUTING.md 的「新增条目」一节。',
    );
  }
}

export async function allEntries(): Promise<Entry[]> {
  const entries = await getCollection('entries');
  for (const entry of entries) assertBodyContract(entry);
  return entries.sort((a, b) => b.data.evaluated_at.getTime() - a.data.evaluated_at.getTime());
}

export function entriesOf(entries: Entry[], category: string): Entry[] {
  return entries.filter((e) => e.data.category === category);
}

export function relatedTo(entries: Entry[], category: string): Entry[] {
  return entries.filter((e) => e.data.category !== category && e.data.also_in.includes(category as never));
}

export function countByKind(entries: Entry[]): { kind: string; count: number }[] {
  const seen = new Map<string, number>();
  for (const e of entries) seen.set(e.data.kind, (seen.get(e.data.kind) ?? 0) + 1);
  return Array.from(seen.entries())
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count);
}

/** Pulls the first fenced code block out of the raw markdown body — the install prompt. */
export function extractPrompt(body: string | undefined): string | null {
  if (!body) return null;
  const match = body.match(/^\s*`{3,}[^\n]*\n([\s\S]*?)\n\s*`{3,}\s*$/m);
  return match ? match[1]!.trimEnd() : null;
}
