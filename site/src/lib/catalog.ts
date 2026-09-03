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

export const KIND_CODE: Record<string, string> = {
  skill: 'SKILL',
  'design-md': 'DESIGN-MD',
  'component-library': 'COMPONENT LIBRARY',
  doc: 'DOC',
  mcp: 'MCP',
};

export const KIND_NOTE: Record<string, string> = {
  skill: '以 SKILL.md 分发，安装后由 agent 在符合条件时自动触发。',
  'design-md': '整份写入项目根目录的视觉约束文件，版本以 commit 计。',
  'component-library': '进入项目的组件源码或依赖，附带主题变量的覆盖方式。',
  doc: '一段写入项目 AGENTS.md 的规则或清单，不安装任何依赖。',
  mcp: '通过 MCP 协议接入的外部服务。',
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

export function freshness(date: Date, now = new Date()): { state: FreshnessState; label: string; days: number } {
  const days = daysSince(date, now);
  if (days > STALE_AFTER_DAYS) return { state: 'stale', label: '需复核', days };
  if (days > DUE_AFTER_DAYS) return { state: 'due', label: '待复核', days };
  return { state: 'fresh', label: '新鲜', days };
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function allCategories(): Promise<Category[]> {
  const cats = await getCollection('categories');
  return cats.sort((a, b) => a.data.order - b.data.order);
}

export async function allEntries(): Promise<Entry[]> {
  const entries = await getCollection('entries');
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
