import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;
export type Article = CollectionEntry<'articles'>;
export type Project = CollectionEntry<'projects'>;


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

export async function allArticles(): Promise<Article[]> {
  const articles = await getCollection('articles');
  return articles.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** "https://github.com/owner/repo" → "owner/repo". */
export function repoPath(repo: string): string {
  return new URL(repo).pathname.replace(/^\//, '').replace(/\/$/, '');
}

/** "https://github.com/owner/repo" → ["owner", "repo"]. The repo card sets the
 *  two halves in different weights, so they have to be separate text nodes. */
export function repoParts(repo: string): [owner: string, name: string] {
  const [owner = '', name = ''] = repoPath(repo).split('/');
  return [owner, name];
}

/** GitHub Linguist colours, only for languages this catalogue has actually
 *  used. An unlisted language falls back to the neutral border grey: the bar
 *  states composition, and an invented colour would state nothing. */
const LANGUAGE_COLOR: Record<string, string> = {
  Astro: '#ff5a03',
  C: '#555555',
  'C++': '#f34b7d',
  CSS: '#663399',
  Dart: '#00b4ab',
  Dockerfile: '#384d54',
  Elixir: '#6e4a7e',
  Go: '#00add8',
  HTML: '#e34c26',
  Haskell: '#5e5086',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  Kotlin: '#a97bff',
  Lua: '#000080',
  MDX: '#fcb32c',
  Makefile: '#427819',
  Markdown: '#083fa1',
  Nix: '#7e7eff',
  PHP: '#4f5d95',
  Python: '#3572a5',
  Ruby: '#701516',
  Rust: '#dea584',
  SCSS: '#c6538c',
  Scala: '#c22d40',
  Shell: '#89e051',
  Swift: '#f05138',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  Zig: '#ec915c',
};

export type LanguageSlice = { name: string; percent: number; color: string };

/** The bottom bar of the repo card, largest share first. Falls back to the
 *  single `language` field so a card that never recorded a breakdown still
 *  shows one honest stripe instead of nothing. */
export function languageBar(
  languages: Record<string, number> | undefined,
  language: string | undefined,
): LanguageSlice[] {
  const entries = Object.entries(languages ?? {});
  if (entries.length === 0) {
    return language ? [{ name: language, percent: 100, color: colorOf(language) }] : [];
  }
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([name, percent]) => ({ name, percent, color: colorOf(name) }));
}

function colorOf(name: string): string {
  return LANGUAGE_COLOR[name] ?? 'var(--gray-300)';
}

/** Sections every project card must carry, plus at least one permalink
 *  anchored to the pinned commit — the difference between an anatomy card
 *  and a recommendation blurb is that every claim can be clicked open. */
const PROJECT_REQUIRED_SECTIONS = ['## 它解决什么问题', '## 设计亮点', '## 借鉴清单'] as const;

function assertProjectBodyContract(project: Project): void {
  const body = project.body ?? '';
  const missing = PROJECT_REQUIRED_SECTIONS.filter(
    (h) => !body.includes(`\n${h}`) && !body.startsWith(h),
  );
  if (!body.includes('/blob/')) missing.push('锚定 commit 的 GitHub permalink（…/blob/<sha>/…）' as never);
  if (missing.length > 0) {
    throw new Error(
      `projects/${project.data.name}.md 不符合项目卡正文契约，缺少：${missing.join('、')}。` +
        ' 见 CONTRIBUTING.md 的「新增项目卡」一节。',
    );
  }
}

export async function allProjects(): Promise<Project[]> {
  const projects = await getCollection('projects');
  for (const project of projects) assertProjectBodyContract(project);
  return projects.sort((a, b) => b.data.evaluated_at.getTime() - a.data.evaluated_at.getTime());
}

/** Rough reading time for CJK prose: 400 characters per minute. */
export function readingMinutes(body: string | undefined): number {
  const chars = (body ?? '').replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 400));
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
