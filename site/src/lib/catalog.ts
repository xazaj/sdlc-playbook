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

export type Invoke = 'direct' | 'install' | 'both';

export const INVOKE_LABEL: Record<Invoke, string> = {
  direct: '即时',
  install: '需安装',
  both: '即时/需安装',
};

/** How the user calls the asset. Orthogonal to `kind` (what the asset is):
 *  a prompt can be self-sufficient even when the asset is a skill. Absent
 *  frontmatter derives from kind. */
export function invokeOf(entry: Entry): Invoke {
  return (entry.data.invoke as Invoke | undefined) ?? (entry.data.kind === 'doc' ? 'direct' : 'install');
}

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
 *  this is the body half of the same contract. A card missing its prompt
 *  section would otherwise render a page with nothing to copy. */
const REQUIRED_SECTIONS = ['## 何时用', '## 版本'] as const;
const PROMPT_HEADING = /^## (使用|固化|安装) prompt\b/m;

function assertBodyContract(entry: Entry, prompts: PromptSection[]): void {
  const body = entry.body ?? '';
  const missing = REQUIRED_SECTIONS.filter((h) => !body.includes(`\n${h}`) && !body.startsWith(h));
  if (!PROMPT_HEADING.test(body)) missing.push('prompt 小节（使用 / 固化 / 安装 任一）' as never);
  if (!/^\s*`{3,}/m.test(body)) missing.push('围栏块（prompt 本体）' as never);
  // The invocation type named in frontmatter must match the sections present.
  const has = (t: PromptSection['type']) => prompts.some((p) => p.type === t);
  const inv = invokeOf(entry);
  const ok =
    inv === 'both' ? has('use') && has('install')
    : inv === 'direct' ? has('use') || has('persist')
    : has('install');
  if (!ok) missing.push(`与 invoke: ${inv} 匹配的 prompt 小节` as never);
  if (missing.length > 0) {
    throw new Error(
      `registry/${entry.data.name}.md 不符合条目正文契约，缺少：${missing.join('、')}。` +
        ' 见 CONTRIBUTING.md 的「新增条目」一节。',
    );
  }
}

export async function allEntries(): Promise<Entry[]> {
  const entries = await getCollection('entries');
  for (const entry of entries) assertBodyContract(entry, extractPrompts(entry.body));
  return entries.sort((a, b) => b.data.evaluated_at.getTime() - a.data.evaluated_at.getTime());
}

export function entriesOf(entries: Entry[], category: string): Entry[] {
  return entries.filter((e) => e.data.category === category);
}

export function countByKind(entries: Entry[]): { kind: string; count: number }[] {
  const seen = new Map<string, number>();
  for (const e of entries) seen.set(e.data.kind, (seen.get(e.data.kind) ?? 0) + 1);
  return Array.from(seen.entries())
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count);
}

export type PromptSection = { type: 'use' | 'persist' | 'install'; label: string; text: string };

const PROMPT_SECTION_HEADINGS: [RegExp, PromptSection['type'], string][] = [
  [/^## 使用 prompt\b/, 'use', '使用'],
  [/^## 固化 prompt\b/, 'persist', '固化'],
  [/^## 安装 prompt\b/, 'install', '安装'],
];

/** Every prompt section with its first fenced block, in document order.
 *  The first section is the page's primary copy target. Only the first
 *  block inside a prompt section counts; later blocks (review sub-prompts
 *  and the like) stay secondary. */
export function extractPrompts(body: string | undefined): PromptSection[] {
  if (!body) return [];
  const lines = body.split('\n');
  const out: PromptSection[] = [];
  let current: Omit<PromptSection, 'text'> | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^##\s/.test(line)) {
      const heading = PROMPT_SECTION_HEADINGS.find(([re]) => re.test(line));
      current = heading ? { type: heading[1], label: heading[2] } : null;
      continue;
    }
    if (current && /^\s*`{4,}/.test(line)) {
      const end = lines.findIndex((l, j) => j > i && /^\s*`{4,}/.test(l));
      if (end > i) out.push({ ...current, text: lines.slice(i + 1, end).join('\n').trimEnd() });
      current = null;
    }
  }
  return out;
}
