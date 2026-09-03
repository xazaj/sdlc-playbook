import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Scenario categories. An entry belongs to exactly one; `also_in` only surfaces
// a cross-reference row on another category page and never counts as an entry.
export const CATEGORY_IDS = ['bootstrap', 'design', 'build', 'verify'] as const;
export const KIND_IDS = ['skill', 'design-md', 'component-library', 'doc', 'mcp'] as const;

const categoryId = z.enum(CATEGORY_IDS);
const kindId = z.enum(KIND_IDS);

// Entry files keep the repository's existing snake_case frontmatter. The site
// reads them where they already live: this repository is a catalog first and a
// website second. A future content move only changes `base` here.
const entries = defineCollection({
  loader: glob({ base: '../registry', pattern: ['**/*.md', '!**/_*.md'] }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    summary: z.string(),
    category: categoryId,
    kind: kindId,
    origin: z.enum(['local', 'marketplace', 'external']),
    provider: z.string().optional(),
    asset: z.string().optional(),
    upstream: z.string().url().optional(),
    install_path: z.string().optional(),
    license: z.string().optional(),
    pairs_with: z.array(z.string()).default([]),
    agents: z.array(z.string()).default([]),
    release_source: z.string().optional(),
    evaluated_version: z.string(),
    evaluated_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
  }),
});

// One file per category: the metadata plus the "how to choose" panel the
// category page renders. Keeping it structured rather than free markdown is
// what lets every category page share a single layout.
const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: ['*.md', '!_*.md'] }),
  schema: z.object({
    id: categoryId,
    code: z.string(),
    title: z.string(),
    tagline: z.string(),
    order: z.number(),
    accent: z.string(),
    decision: z
      .object({
        headline: z.string(),
        intro: z.string(),
        steps: z.array(z.object({ label: z.string(), text: z.string() })),
        note: z.string().optional(),
        signals: z.array(z.object({ when: z.string(), then: z.string() })),
        pitfalls: z.string().optional(),
        sourceLabel: z.string().optional(),
        sourceHref: z.string().optional(),
      })
      .optional(),
    sections: z
      .array(z.object({ kind: kindId, title: z.string(), code: z.string(), note: z.string() }))
      .default([]),
    moreSources: z.string().optional(),
  }),
});

export const collections = { entries, categories };
