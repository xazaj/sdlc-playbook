> **⚠ 本计划已暂缓，不要执行。**
>
> 它原本是 M0 里程碑，内容是 schema、加载器、校验器、构建器、CLI 与 CI 组成的工程底座。
> 暂缓原因：在 catalog 只有一个条目时建设施，且 schema 会把一个尚未验证的格式凝固下来，顺序反了。
> 路线图已改为内容优先（见 spec 第 14 节），本计划的技术设计移至 **M2 最小工具**，届时按 M1 记录的痛点清单裁剪后再启用。
> 保留原文的价值在于：schema 字段设计、ESM/CJS 互操作处理、CLI 分模块的理由都已验证过，M2 可直接复用。

---

# M0 地基 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 catalog 的格式契约与构建管线，使 `sdlc build` 能从 `catalog/` 产出合法 `dist/`，`sdlc check` 能拦住不合规条目并以非零退出码失败。

**Architecture:** 三段式管线 —— 加载器扫描 `catalog/` 并解析各条目元数据，校验器用 JSON Schema 逐条校验并检查 name 全局唯一，构建器在校验全过后才产出 `dist/`。CLI 是这三者的薄封装。所有模块以纯函数形式暴露，接受目录参数，便于用 fixtures 测试。

**Tech Stack:** TypeScript (ESM, NodeNext) + Node 22+ / pnpm / vitest / ajv (JSON Schema 2020-12) / gray-matter / fast-glob / commander / picocolors

**Spec:** `docs/superpowers/specs/2026-09-03-sdlc-knowledge-base-design.md`

## Global Constraints

以下约束逐字来自 spec，适用于本计划每一个任务：

- **catalog 是唯一真源**：`catalog/`、`stages/`、`library/`、`profiles/` 之外的内容均为生成物或工具代码。`dist/` 完全由构建生成，手改会被覆盖。
- **stages 是索引而非容器**：`stages/` 下不存放任何实体资源。（M0 不创建 stages 内容，但目录约定不得被违反。）
- **八类产物**：`skill` / `rule` / `knowledge` / `template` / `agent` / `command` / `hook` / `mcp`。
- **七个阶段标识**：`00-bootstrap` / `10-requirements` / `20-design` / `30-coding` / `40-testing` / `50-release` / `60-operate`。
- **公共必填字段**：`name`、`description`、`version`、`type`、`updated_at`。可选字段：`stages`、`stacks`、`source`、`license`、`derived_from`。
- **供应链声明**：带 `source` 的条目必须同时有 `license`（在 schema 层用 `dependentRequired` 强制）。
- **name 规则**：全库唯一的 kebab-case 标识。
- **version 规则**：每个条目独立的语义化版本，形如 `X.Y.Z`。
- **校验不过则不产出**：任一质量闸门失败，构建不产出 `dist/`。
- **语言规则**（来自用户全局约定）：代码标识符、代码注释、CLI 输出文案一律用英文；`.md` 文档用中文。
- **Node 版本下限**：`>=22`。

## 本里程碑明确不做

以下项在 spec 中存在，但属于后续里程碑，M0 不实现，也不要顺手加进来：

- `sdlc install` / `.sdlc-lock.json` / `tools/adapters/`（M1）
- 路由技能生成、`stages/` 的 DECIDE.md 与 MANIFEST.yaml、双向引用校验、`dist/by-stage/`（M2）
- `sdlc distill` 与 `library/`（M4）
- `.claude-plugin/marketplace.json` 生成、npm 发布（M5）
- 质量闸门中的 token 预算、description 冲突检测、链接有效性、触发 eval、过期检查（M1–M3 逐步加入）

M0 的 `sdlc check` 只包含两项闸门：**JSON Schema 校验** 与 **name 全局唯一性**。

## File Structure

| 文件 | 职责 |
|---|---|
| `package.json` | 依赖、脚本、packageManager 声明 |
| `tsconfig.json` | TS 编译配置（NodeNext ESM，strict） |
| `vitest.config.ts` | 测试配置 |
| `schemas/common.schema.json` | 公共 frontmatter 字段与供应链约束 |
| `schemas/{skill,rule,knowledge,template,agent,command,hook,mcp}.schema.json` | 八类产物各自的 schema |
| `schemas/stage-manifest.schema.json` | 阶段 MANIFEST.yaml 的 schema（M0 只定义，M2 才使用） |
| `tools/types.ts` | 跨模块共享的 TS 类型 |
| `tools/catalog/paths.ts` | 目录常量与各类型的 glob 规则 |
| `tools/catalog/load.ts` | 扫描 catalog、解析 frontmatter / JSON |
| `tools/validate/schema.ts` | ajv 实例构建与单条目校验 |
| `tools/validate/validate.ts` | 全量校验编排与唯一性检查 |
| `tools/validate/report.ts` | 校验结果格式化输出 |
| `tools/build/build.ts` | catalog → dist 构建与 manifest 生成 |
| `tools/cli/index.ts` | `sdlc build` / `sdlc check` 命令入口 |
| `tools/fixtures/` | 测试用的迷你 catalog 与 schemas 软引用 |
| `catalog/skills/meta/skill-authoring/SKILL.md` | 首个真实条目 |
| `AGENTS.md` | 本仓库自身给 agent 的规则 |
| `.github/workflows/ci.yml` | CI |

**对 spec 第 5 节的细化说明**：spec 中 `tools/` 只列了 `build/`、`adapters/`、`cli/` 三个子目录。本计划额外拆出 `catalog/` 与 `validate/` 两个模块，理由是加载与校验会被 build 和 install（M1）共同复用，放在 `build/` 下会造成 M1 的反向依赖。`adapters/` 在 M1 引入。

---

### Task 1: 项目脚手架与工具链验证

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `tools/types.ts`
- Test: `tools/types.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `EntryType`、`Stage`、`EntryMeta`、`CatalogEntry`、`ValidationIssue` 五个类型，以及常量 `ENTRY_TYPES: readonly EntryType[]`、`STAGES: readonly Stage[]`

- [ ] **Step 1: 初始化 pnpm 与依赖**

```bash
corepack enable
corepack use pnpm@latest
pnpm init
pnpm add ajv ajv-formats commander fast-glob gray-matter picocolors
pnpm add -D typescript tsx vitest @types/node
```

不指定版本号，由 pnpm 解析当前最新并锁定到 `pnpm-lock.yaml`。

- [ ] **Step 2: 改写 package.json**

把 `pnpm init` 生成的内容替换为下面这份（保留 pnpm 写入的 `dependencies`、`devDependencies`、`packageManager` 三个字段的实际版本值，不要手写版本）：

```json
{
  "name": "sdlc-kb",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Advisory knowledge base for coding agents",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "sdlc": "tsx tools/cli/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true
  },
  "include": ["tools/**/*.ts", "vitest.config.ts"]
}
```

`verbatimModuleSyntax` 要求所有仅类型的导入写成 `import type`。后续任务的代码已遵循这一点。

- [ ] **Step 4: 创建 vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tools/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 5: 写失败的测试**

创建 `tools/types.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { ENTRY_TYPES, STAGES } from './types.js';

describe('catalog vocabulary', () => {
  it('declares exactly the eight product types from the spec', () => {
    expect([...ENTRY_TYPES]).toEqual([
      'skill',
      'rule',
      'knowledge',
      'template',
      'agent',
      'command',
      'hook',
      'mcp',
    ]);
  });

  it('declares exactly the seven SDLC stages from the spec', () => {
    expect([...STAGES]).toEqual([
      '00-bootstrap',
      '10-requirements',
      '20-design',
      '30-coding',
      '40-testing',
      '50-release',
      '60-operate',
    ]);
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，报错 `Failed to resolve import "./types.js"`

- [ ] **Step 7: 实现 tools/types.ts**

```ts
export const ENTRY_TYPES = [
  'skill',
  'rule',
  'knowledge',
  'template',
  'agent',
  'command',
  'hook',
  'mcp',
] as const;

export type EntryType = (typeof ENTRY_TYPES)[number];

export const STAGES = [
  '00-bootstrap',
  '10-requirements',
  '20-design',
  '30-coding',
  '40-testing',
  '50-release',
  '60-operate',
] as const;

export type Stage = (typeof STAGES)[number];

/** Frontmatter of a catalog entry, after parsing but before validation. */
export interface EntryMeta {
  name: string;
  description: string;
  version: string;
  type: EntryType;
  stages?: Stage[];
  stacks?: string[];
  source?: string;
  license?: string;
  derived_from?: string;
  updated_at: string;
  [key: string]: unknown;
}

/** One entry discovered under the catalog root. */
export interface CatalogEntry {
  /** Path relative to the catalog root, e.g. skills/meta/skill-authoring/SKILL.md */
  file: string;
  /** Directory of the entry, relative to the catalog root */
  dir: string;
  /** Parsed frontmatter. Not yet validated, so fields may be missing or wrong. */
  meta: Partial<EntryMeta>;
  /** Markdown body. Empty string for JSON-based entries. */
  body: string;
}

/** A single validation problem, addressed to a file and a field. */
export interface ValidationIssue {
  /** Path relative to the catalog root */
  file: string;
  /** JSON Pointer into the frontmatter, e.g. /version */
  path: string;
  message: string;
}
```

- [ ] **Step 8: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，2 passed

- [ ] **Step 9: 运行类型检查**

Run: `pnpm typecheck`
Expected: 无输出，退出码 0

- [ ] **Step 10: 提交**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts tools/types.ts tools/types.test.ts
git commit -m "chore: TypeScript 工具链脚手架与共享类型"
```

---

### Task 2: 公共 schema 与 skill schema

**Files:**
- Create: `schemas/common.schema.json`
- Create: `schemas/skill.schema.json`
- Create: `tools/validate/schema.ts`
- Test: `tools/validate/schema.test.ts`

**Interfaces:**
- Consumes: `EntryMeta`、`CatalogEntry`、`ValidationIssue`（Task 1）
- Produces:
  - `createValidator(schemasDir?: string): Promise<AjvInstance>`
  - `validateEntry(ajv: AjvInstance, entry: CatalogEntry): ValidationIssue[]`
  - `SCHEMA_ID_BASE = 'https://sdlc-kb.dev/schemas/'`
  - 类型别名 `AjvInstance`

- [ ] **Step 1: 创建 schemas/common.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/common.schema.json",
  "title": "Common catalog entry frontmatter",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
      "maxLength": 64,
      "description": "Globally unique kebab-case identifier"
    },
    "description": {
      "type": "string",
      "minLength": 20,
      "maxLength": 600,
      "description": "Trigger description, written like a search query"
    },
    "version": {
      "type": "string",
      "pattern": "^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$"
    },
    "type": {
      "enum": [
        "skill",
        "rule",
        "knowledge",
        "template",
        "agent",
        "command",
        "hook",
        "mcp"
      ]
    },
    "stages": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "enum": [
          "00-bootstrap",
          "10-requirements",
          "20-design",
          "30-coding",
          "40-testing",
          "50-release",
          "60-operate"
        ]
      }
    },
    "stacks": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    },
    "source": { "type": "string", "format": "uri" },
    "license": { "type": "string", "minLength": 1 },
    "derived_from": { "type": "string", "minLength": 1 },
    "updated_at": { "type": "string", "format": "date" }
  },
  "required": ["name", "description", "version", "type", "updated_at"],
  "dependentRequired": {
    "source": ["license"]
  }
}
```

`dependentRequired` 这一条直接实现了 spec 第 12 节第 8 项的供应链声明检查：声明了 `source` 就必须声明 `license`。

- [ ] **Step 2: 创建 schemas/skill.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/skill.schema.json",
  "title": "Skill entry frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "skill" },
    "allowed-tools": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    }
  },
  "unevaluatedProperties": false
}
```

用 `unevaluatedProperties: false` 而不是 `additionalProperties: false`：后者在 `allOf` 组合下会拒绝 common schema 里已定义的字段，前者才能正确识别被上游 schema 消费过的属性。

- [ ] **Step 3: 写失败的测试**

创建 `tools/validate/schema.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { createValidator, validateEntry } from './schema.js';
import type { CatalogEntry } from '../types.js';

function entryOf(meta: Record<string, unknown>): CatalogEntry {
  return {
    file: 'skills/demo/SKILL.md',
    dir: 'skills/demo',
    meta: meta as CatalogEntry['meta'],
    body: '',
  };
}

const valid = {
  name: 'demo-skill',
  description: 'A demo skill entry used only by the validator unit tests.',
  version: '0.1.0',
  type: 'skill',
  updated_at: '2026-09-03',
};

describe('validateEntry', () => {
  it('accepts a well-formed skill entry', async () => {
    const ajv = await createValidator();
    expect(validateEntry(ajv, entryOf(valid))).toEqual([]);
  });

  it('rejects a missing required field', async () => {
    const ajv = await createValidator();
    const { version: _omitted, ...withoutVersion } = valid;
    const issues = validateEntry(ajv, entryOf(withoutVersion));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('version');
  });

  it('rejects a non-kebab-case name', async () => {
    const ajv = await createValidator();
    const issues = validateEntry(ajv, entryOf({ ...valid, name: 'Demo_Skill' }));
    expect(issues.some((i) => i.path === '/name')).toBe(true);
  });

  it('rejects a source without a license', async () => {
    const ajv = await createValidator();
    const issues = validateEntry(
      ajv,
      entryOf({ ...valid, source: 'https://example.com/post' }),
    );
    expect(issues.some((i) => i.message.includes('license'))).toBe(true);
  });

  it('rejects an unknown extra field', async () => {
    const ajv = await createValidator();
    const issues = validateEntry(ajv, entryOf({ ...valid, bogus: true }));
    expect(issues).not.toEqual([]);
  });

  it('reports a helpful issue when type is missing entirely', async () => {
    const ajv = await createValidator();
    const { type: _omitted, ...withoutType } = valid;
    const issues = validateEntry(ajv, entryOf(withoutType));
    expect(issues).toEqual([
      {
        file: 'skills/demo/SKILL.md',
        path: '/type',
        message: 'frontmatter is missing the required "type" field',
      },
    ]);
  });
});
```

- [ ] **Step 4: 运行测试确认失败**

Run: `pnpm test`
Expected: FAIL，报错 `Failed to resolve import "./schema.js"`

- [ ] **Step 5: 实现 tools/validate/schema.ts**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import type { CatalogEntry, ValidationIssue } from '../types.js';

const require = createRequire(import.meta.url);

// ajv and ajv-formats ship as CommonJS with a default export. Loading them
// through createRequire avoids the ESM/CJS interop pitfalls of a default import.
const Ajv2020 = require('ajv/dist/2020.js') as typeof import('ajv/dist/2020.js').default;
const addFormats = require('ajv-formats') as typeof import('ajv-formats').default;

export type AjvInstance = InstanceType<typeof Ajv2020>;

export const SCHEMA_ID_BASE = 'https://sdlc-kb.dev/schemas/';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SCHEMAS_DIR = path.resolve(here, '..', '..', 'schemas');

/** Loads every *.schema.json in the directory into a single ajv instance. */
export async function createValidator(
  schemasDir: string = DEFAULT_SCHEMAS_DIR,
): Promise<AjvInstance> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  const files = (await fs.readdir(schemasDir))
    .filter((f) => f.endsWith('.schema.json'))
    .sort();

  for (const file of files) {
    const raw = await fs.readFile(path.join(schemasDir, file), 'utf8');
    ajv.addSchema(JSON.parse(raw) as object);
  }

  return ajv;
}

/** Validates one entry's frontmatter against the schema for its declared type. */
export function validateEntry(
  ajv: AjvInstance,
  entry: CatalogEntry,
): ValidationIssue[] {
  const type = entry.meta.type;

  if (typeof type !== 'string' || type.length === 0) {
    return [
      {
        file: entry.file,
        path: '/type',
        message: 'frontmatter is missing the required "type" field',
      },
    ];
  }

  const validate = ajv.getSchema(`${SCHEMA_ID_BASE}${type}.schema.json`);
  if (!validate) {
    return [
      {
        file: entry.file,
        path: '/type',
        message: `unknown entry type "${type}"`,
      },
    ];
  }

  if (validate(entry.meta)) return [];

  return (validate.errors ?? []).map((err) => ({
    file: entry.file,
    path: err.instancePath === '' ? '/' : err.instancePath,
    message: formatAjvError(err),
  }));
}

function formatAjvError(err: {
  message?: string;
  params?: Record<string, unknown>;
}): string {
  const base = err.message ?? 'failed validation';
  const params = err.params ?? {};

  if (typeof params['missingProperty'] === 'string') {
    return `missing required field "${params['missingProperty']}"`;
  }
  if (typeof params['additionalProperty'] === 'string') {
    return `unknown field "${params['additionalProperty']}"`;
  }
  if (Array.isArray(params['deps'])) {
    return `${base} (${(params['deps'] as string[]).join(', ')})`;
  }
  return base;
}
```

`formatAjvError` 把 `dependentRequired` 的错误参数 `deps` 展开进消息，测试中对 `license` 的断言依赖这一点。

- [ ] **Step 6: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，8 passed（Task 1 的 2 个 + 本任务的 6 个）

- [ ] **Step 7: 提交**

```bash
git add schemas/common.schema.json schemas/skill.schema.json tools/validate/schema.ts tools/validate/schema.test.ts
git commit -m "feat: 公共 schema 与 skill schema，含供应链声明约束"
```

---

### Task 3: 其余七类产物 schema 与 stage manifest schema

**Files:**
- Create: `schemas/rule.schema.json`
- Create: `schemas/knowledge.schema.json`
- Create: `schemas/template.schema.json`
- Create: `schemas/agent.schema.json`
- Create: `schemas/command.schema.json`
- Create: `schemas/hook.schema.json`
- Create: `schemas/mcp.schema.json`
- Create: `schemas/stage-manifest.schema.json`
- Test: `tools/validate/schema-types.test.ts`

**Interfaces:**
- Consumes: `createValidator`、`validateEntry`（Task 2）
- Produces: 无新函数，只新增 schema 文件。各类型额外必填字段为：`rule` → `section`；`template` → `target_path`；`hook` → `event`；`mcp` → `server`。其余类型无额外必填字段。

- [ ] **Step 1: 创建 schemas/rule.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/rule.schema.json",
  "title": "Rule entry frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "rule" },
    "section": {
      "type": "string",
      "minLength": 1,
      "description": "Heading in the target AGENTS.md this fragment is spliced under"
    }
  },
  "required": ["section"],
  "unevaluatedProperties": false
}
```

- [ ] **Step 2: 创建 schemas/knowledge.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/knowledge.schema.json",
  "title": "Knowledge pack frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "knowledge" },
    "shards": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "pattern": "^[^/].*\\.md$" },
      "description": "Shard files relative to the pack directory, listed in INDEX.md order"
    }
  },
  "unevaluatedProperties": false
}
```

- [ ] **Step 3: 创建 schemas/template.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/template.schema.json",
  "title": "Template entry frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "template" },
    "target_path": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[^/].*",
      "description": "Landing path inside the consuming project, relative to its root"
    }
  },
  "required": ["target_path"],
  "unevaluatedProperties": false
}
```

- [ ] **Step 4: 创建 schemas/agent.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/agent.schema.json",
  "title": "Subagent entry frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "agent" },
    "tools": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    },
    "model": { "type": "string", "minLength": 1 }
  },
  "unevaluatedProperties": false
}
```

- [ ] **Step 5: 创建 schemas/command.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/command.schema.json",
  "title": "Slash command entry frontmatter",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "command" },
    "argument-hint": { "type": "string" }
  },
  "unevaluatedProperties": false
}
```

- [ ] **Step 6: 创建 schemas/hook.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/hook.schema.json",
  "title": "Hook entry metadata",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "hook" },
    "event": {
      "type": "string",
      "minLength": 1,
      "description": "Host hook event name this fragment binds to"
    },
    "config": {
      "type": "object",
      "description": "Fragment merged into the host settings file"
    }
  },
  "required": ["event", "config"],
  "unevaluatedProperties": false
}
```

- [ ] **Step 7: 创建 schemas/mcp.schema.json**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/mcp.schema.json",
  "title": "MCP server entry metadata",
  "allOf": [{ "$ref": "common.schema.json" }],
  "properties": {
    "type": { "const": "mcp" },
    "server": {
      "type": "object",
      "minProperties": 1,
      "description": "MCP server definition merged into the host MCP config"
    }
  },
  "required": ["server"],
  "unevaluatedProperties": false
}
```

- [ ] **Step 8: 创建 schemas/stage-manifest.schema.json**

M0 只定义，M2 才开始使用。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sdlc-kb.dev/schemas/stage-manifest.schema.json",
  "title": "Stage MANIFEST.yaml",
  "type": "object",
  "properties": {
    "stage": {
      "enum": [
        "00-bootstrap",
        "10-requirements",
        "20-design",
        "30-coding",
        "40-testing",
        "50-release",
        "60-operate"
      ]
    },
    "entry_skill": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
    "assets": {
      "type": "object",
      "properties": {
        "skill": { "$ref": "#/$defs/nameList" },
        "rule": { "$ref": "#/$defs/nameList" },
        "knowledge": { "$ref": "#/$defs/nameList" },
        "template": { "$ref": "#/$defs/nameList" },
        "agent": { "$ref": "#/$defs/nameList" },
        "command": { "$ref": "#/$defs/nameList" },
        "hook": { "$ref": "#/$defs/nameList" },
        "mcp": { "$ref": "#/$defs/nameList" }
      },
      "additionalProperties": false
    },
    "profiles": { "$ref": "#/$defs/nameList" }
  },
  "required": ["stage", "entry_skill", "assets"],
  "additionalProperties": false,
  "$defs": {
    "nameList": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    }
  }
}
```

注意 `assets` 的键使用单数类型名（`skill`、`knowledge`…），与 `EntryType` 完全一致，避免 M2 做双向引用校验时还要做单复数映射。

- [ ] **Step 9: 写失败的测试**

创建 `tools/validate/schema-types.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { createValidator, validateEntry } from './schema.js';
import { ENTRY_TYPES } from '../types.js';
import type { CatalogEntry, EntryType } from '../types.js';

const common = {
  description: 'A fixture entry that exists only to exercise the type schemas.',
  version: '1.0.0',
  updated_at: '2026-09-03',
};

/** Minimal valid frontmatter per type, including type-specific required fields. */
const MINIMAL: Record<EntryType, Record<string, unknown>> = {
  skill: { ...common, name: 'demo-skill', type: 'skill' },
  rule: { ...common, name: 'demo-rule', type: 'rule', section: 'Code style' },
  knowledge: { ...common, name: 'demo-knowledge', type: 'knowledge' },
  template: {
    ...common,
    name: 'demo-template',
    type: 'template',
    target_path: 'DESIGN.md',
  },
  agent: { ...common, name: 'demo-agent', type: 'agent' },
  command: { ...common, name: 'demo-command', type: 'command' },
  hook: {
    ...common,
    name: 'demo-hook',
    type: 'hook',
    event: 'SessionStart',
    config: { command: 'echo hi' },
  },
  mcp: {
    ...common,
    name: 'demo-mcp',
    type: 'mcp',
    server: { command: 'npx', args: ['-y', 'some-server'] },
  },
};

/** Type-specific required fields, used to assert each one is actually enforced. */
const REQUIRED_EXTRA: Partial<Record<EntryType, string>> = {
  rule: 'section',
  template: 'target_path',
  hook: 'event',
  mcp: 'server',
};

function entryOf(meta: Record<string, unknown>): CatalogEntry {
  return { file: 'fixture.md', dir: '.', meta: meta as CatalogEntry['meta'], body: '' };
}

describe('per-type schemas', () => {
  it.each(ENTRY_TYPES)('accepts a minimal valid %s entry', async (type) => {
    const ajv = await createValidator();
    expect(validateEntry(ajv, entryOf(MINIMAL[type]))).toEqual([]);
  });

  it.each(Object.entries(REQUIRED_EXTRA))(
    'rejects a %s entry missing its required "%s" field',
    async (type, field) => {
      const ajv = await createValidator();
      const meta = { ...MINIMAL[type as EntryType] };
      delete meta[field as string];
      const issues = validateEntry(ajv, entryOf(meta));
      expect(issues.some((i) => i.message.includes(field as string))).toBe(true);
    },
  );

  it('rejects an entry whose type does not match its schema', async () => {
    const ajv = await createValidator();
    const issues = validateEntry(
      ajv,
      entryOf({ ...MINIMAL.skill, type: 'rule' }),
    );
    expect(issues).not.toEqual([]);
  });
});
```

最后一个用例的原理：把 skill 的 frontmatter 改标为 `rule`，会因缺少 `section` 而失败，从而证明类型与 schema 确实是按 `type` 字段路由的。

- [ ] **Step 10: 运行测试确认失败**

Run: `pnpm test tools/validate/schema-types.test.ts`
Expected: FAIL，多个 `unknown entry type` 或缺 schema 的错误

- [ ] **Step 11: 运行测试确认通过**

创建完全部 schema 文件后重新运行。

Run: `pnpm test`
Expected: PASS，21 passed（Task 1 的 2 个 + Task 2 的 6 个 + 本任务的 13 个）

- [ ] **Step 12: 提交**

```bash
git add schemas/
git commit -m "feat: 其余七类产物 schema 与 stage manifest schema"
```

---

### Task 4: catalog 加载器

**Files:**
- Create: `tools/catalog/paths.ts`
- Create: `tools/catalog/load.ts`
- Create: `tools/fixtures/valid-catalog/skills/demo/SKILL.md`
- Create: `tools/fixtures/valid-catalog/rules/demo-rule.md`
- Create: `tools/fixtures/valid-catalog/mcp/demo-mcp.json`
- Test: `tools/catalog/load.test.ts`

**Interfaces:**
- Consumes: `CatalogEntry`、`EntryType`、`ENTRY_TYPES`（Task 1）
- Produces:
  - `DEFAULT_CATALOG_DIR: string`、`DEFAULT_DIST_DIR: string`、`REPO_ROOT: string`
  - `TYPE_GLOBS: Record<EntryType, string>`
  - `loadEntry(absPath: string, catalogDir: string): Promise<CatalogEntry>`
  - `loadCatalog(catalogDir?: string): Promise<CatalogEntry[]>`
  - `class CatalogParseError extends Error`（携带 `file` 属性）

- [ ] **Step 1: 创建 tools/catalog/paths.ts**

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EntryType } from '../types.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(here, '..', '..');
export const DEFAULT_CATALOG_DIR = path.join(REPO_ROOT, 'catalog');
export const DEFAULT_DIST_DIR = path.join(REPO_ROOT, 'dist');

/**
 * Where each product type lives under the catalog root, and which file
 * carries its metadata. Directory-shaped entries (skill, knowledge,
 * template) declare metadata in a fixed filename inside their directory.
 */
export const TYPE_GLOBS: Record<EntryType, string> = {
  skill: 'skills/**/SKILL.md',
  rule: 'rules/*.md',
  knowledge: 'knowledge/*/INDEX.md',
  template: 'templates/*/TEMPLATE.md',
  agent: 'agents/*.md',
  command: 'commands/*.md',
  hook: 'hooks/*.json',
  mcp: 'mcp/*.json',
};
```

- [ ] **Step 2: 创建 fixture —— 合法的迷你 catalog**

`tools/fixtures/valid-catalog/skills/demo/SKILL.md`：

```markdown
---
name: fixture-skill
description: A fixture skill used by the catalog loader tests, with a body long enough to be meaningful.
version: 0.1.0
type: skill
updated_at: "2026-09-03"
---

# Fixture skill

Body content used to assert the loader separates frontmatter from body.
```

`tools/fixtures/valid-catalog/rules/demo-rule.md`：

```markdown
---
name: fixture-rule
description: A fixture rule fragment used by the catalog loader tests to cover flat markdown entries.
version: 0.1.0
type: rule
section: Testing
updated_at: "2026-09-03"
---

Always write the failing test first.
```

`tools/fixtures/valid-catalog/mcp/demo-mcp.json`：

```json
{
  "name": "fixture-mcp",
  "description": "A fixture MCP entry used by the catalog loader tests to cover JSON-based entries.",
  "version": "0.1.0",
  "type": "mcp",
  "updated_at": "2026-09-03",
  "server": {
    "command": "npx",
    "args": ["-y", "fixture-server"]
  }
}
```

- [ ] **Step 3: 写失败的测试**

创建 `tools/catalog/load.test.ts`：

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CatalogParseError, loadCatalog } from './load.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const VALID = path.resolve(here, '..', 'fixtures', 'valid-catalog');
const BROKEN = path.resolve(here, '..', 'fixtures', 'broken-catalog');

describe('loadCatalog', () => {
  it('discovers markdown and json entries across type directories', async () => {
    const entries = await loadCatalog(VALID);
    const names = entries.map((e) => e.meta.name).sort();
    expect(names).toEqual(['fixture-mcp', 'fixture-rule', 'fixture-skill']);
  });

  it('records paths relative to the catalog root', async () => {
    const entries = await loadCatalog(VALID);
    const skill = entries.find((e) => e.meta.name === 'fixture-skill');
    expect(skill?.file).toBe('skills/demo/SKILL.md');
    expect(skill?.dir).toBe('skills/demo');
  });

  it('separates frontmatter from markdown body', async () => {
    const entries = await loadCatalog(VALID);
    const skill = entries.find((e) => e.meta.name === 'fixture-skill');
    expect(skill?.meta.type).toBe('skill');
    expect(skill?.body).toContain('Body content used to assert');
    expect(skill?.body).not.toContain('name: fixture-skill');
  });

  it('leaves the body empty for json entries', async () => {
    const entries = await loadCatalog(VALID);
    const mcp = entries.find((e) => e.meta.name === 'fixture-mcp');
    expect(mcp?.body).toBe('');
    expect(mcp?.meta.type).toBe('mcp');
  });

  it('returns entries in a stable order', async () => {
    const first = await loadCatalog(VALID);
    const second = await loadCatalog(VALID);
    expect(first.map((e) => e.file)).toEqual(second.map((e) => e.file));
  });

  it('returns an empty array for a catalog directory that does not exist', async () => {
    expect(await loadCatalog(path.join(VALID, 'nope'))).toEqual([]);
  });

  it('throws CatalogParseError naming the file when json is malformed', async () => {
    await expect(loadCatalog(BROKEN)).rejects.toBeInstanceOf(CatalogParseError);
    await expect(loadCatalog(BROKEN)).rejects.toThrow('mcp/malformed.json');
  });
});
```

- [ ] **Step 4: 创建 fixture —— 损坏的 catalog**

`tools/fixtures/broken-catalog/mcp/malformed.json`，内容为一段无效 JSON：

```
{ "name": "broken", this is not json }
```

- [ ] **Step 5: 运行测试确认失败**

Run: `pnpm test tools/catalog/load.test.ts`
Expected: FAIL，报错 `Failed to resolve import "./load.js"`

- [ ] **Step 6: 实现 tools/catalog/load.ts**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { DEFAULT_CATALOG_DIR, TYPE_GLOBS } from './paths.js';
import type { CatalogEntry } from '../types.js';

export class CatalogParseError extends Error {
  constructor(
    readonly file: string,
    readonly cause: unknown,
  ) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`${file}: could not be parsed — ${detail}`);
    this.name = 'CatalogParseError';
  }
}

/** Reads and parses a single entry file. */
export async function loadEntry(
  absPath: string,
  catalogDir: string,
): Promise<CatalogEntry> {
  const file = path.relative(catalogDir, absPath).split(path.sep).join('/');
  const dir = path.dirname(file);
  const raw = await fs.readFile(absPath, 'utf8');

  try {
    if (absPath.endsWith('.json')) {
      const meta = JSON.parse(raw) as CatalogEntry['meta'];
      return { file, dir, meta, body: '' };
    }
    const parsed = matter(raw);
    return { file, dir, meta: parsed.data as CatalogEntry['meta'], body: parsed.content };
  } catch (cause) {
    throw new CatalogParseError(file, cause);
  }
}

/**
 * Scans every product-type directory under the catalog root.
 * Returns entries ordered by type (spec order) then by path, so that
 * build output and validation reports are deterministic.
 */
export async function loadCatalog(
  catalogDir: string = DEFAULT_CATALOG_DIR,
): Promise<CatalogEntry[]> {
  const entries: CatalogEntry[] = [];

  for (const glob of Object.values(TYPE_GLOBS)) {
    const matches = await fg(glob, {
      cwd: catalogDir,
      absolute: true,
      onlyFiles: true,
      followSymbolicLinks: false,
    });
    for (const abs of matches.sort()) {
      entries.push(await loadEntry(abs, catalogDir));
    }
  }

  return entries;
}
```

`fast-glob` 对不存在的 `cwd` 返回空数组，因此"目录不存在返回空数组"这条无需额外分支。

- [ ] **Step 7: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，28 passed

- [ ] **Step 8: 提交**

```bash
git add tools/catalog/ tools/fixtures/
git commit -m "feat: catalog 加载器，支持 markdown 与 json 两类条目"
```

---

### Task 5: 全量校验与报告

**Files:**
- Create: `tools/validate/validate.ts`
- Create: `tools/validate/report.ts`
- Create: `tools/fixtures/invalid-catalog/skills/bad/SKILL.md`
- Create: `tools/fixtures/invalid-catalog/skills/dupe-a/SKILL.md`
- Create: `tools/fixtures/invalid-catalog/skills/dupe-b/SKILL.md`
- Test: `tools/validate/validate.test.ts`

**Interfaces:**
- Consumes: `loadCatalog`（Task 4）、`createValidator`、`validateEntry`（Task 2）
- Produces:
  - `validateCatalog(entries: CatalogEntry[], schemasDir?: string): Promise<ValidationIssue[]>`
  - `formatIssues(issues: ValidationIssue[]): string`

- [ ] **Step 1: 创建 invalid fixture —— 缺必填字段**

`tools/fixtures/invalid-catalog/skills/bad/SKILL.md`（缺 `version`，这就是 spec M0 判据里"故意写错的条目"）：

```markdown
---
name: bad-skill
description: This fixture is deliberately missing its version field so that the checker has something to catch.
type: skill
updated_at: "2026-09-03"
---

Deliberately invalid.
```

- [ ] **Step 2: 创建 invalid fixture —— name 重复**

`tools/fixtures/invalid-catalog/skills/dupe-a/SKILL.md`：

```markdown
---
name: duplicated-name
description: First of two fixture entries that deliberately share the same name value.
version: 0.1.0
type: skill
updated_at: "2026-09-03"
---

First duplicate.
```

`tools/fixtures/invalid-catalog/skills/dupe-b/SKILL.md`：

```markdown
---
name: duplicated-name
description: Second of two fixture entries that deliberately share the same name value.
version: 0.1.0
type: skill
updated_at: "2026-09-03"
---

Second duplicate.
```

- [ ] **Step 3: 写失败的测试**

创建 `tools/validate/validate.test.ts`：

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../catalog/load.js';
import { validateCatalog } from './validate.js';
import { formatIssues } from './report.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const VALID = path.resolve(here, '..', 'fixtures', 'valid-catalog');
const INVALID = path.resolve(here, '..', 'fixtures', 'invalid-catalog');

describe('validateCatalog', () => {
  it('reports no issues for a valid catalog', async () => {
    const issues = await validateCatalog(await loadCatalog(VALID));
    expect(issues).toEqual([]);
  });

  it('catches a missing required field and names the file', async () => {
    const issues = await validateCatalog(await loadCatalog(INVALID));
    const missing = issues.filter((i) => i.file === 'skills/bad/SKILL.md');
    expect(missing).toHaveLength(1);
    expect(missing[0]?.message).toContain('version');
  });

  it('catches duplicated names and points at the earlier file', async () => {
    const issues = await validateCatalog(await loadCatalog(INVALID));
    const dupes = issues.filter((i) => i.path === '/name');
    expect(dupes).toHaveLength(1);
    expect(dupes[0]?.file).toBe('skills/dupe-b/SKILL.md');
    expect(dupes[0]?.message).toContain('skills/dupe-a/SKILL.md');
  });
});

describe('formatIssues', () => {
  it('reports success when there are no issues', () => {
    expect(formatIssues([])).toContain('All 0 entries valid');
  });

  it('groups issues by file and prints a total', () => {
    const output = formatIssues([
      { file: 'skills/a/SKILL.md', path: '/version', message: 'missing required field "version"' },
      { file: 'skills/a/SKILL.md', path: '/name', message: 'must match pattern' },
      { file: 'rules/b.md', path: '/section', message: 'missing required field "section"' },
    ]);
    expect(output).toContain('skills/a/SKILL.md');
    expect(output).toContain('rules/b.md');
    expect(output).toContain('3 problem(s) in 2 file(s)');
  });
});
```

注意 `formatIssues([])` 的成功文案需要条目总数，因此签名要带第二个可选参数。见 Step 5。

- [ ] **Step 4: 运行测试确认失败**

Run: `pnpm test tools/validate/validate.test.ts`
Expected: FAIL，报错 `Failed to resolve import "./validate.js"`

- [ ] **Step 5: 实现 tools/validate/validate.ts**

```ts
import { createValidator, validateEntry } from './schema.js';
import type { CatalogEntry, ValidationIssue } from '../types.js';

/**
 * Runs every M0 quality gate over the loaded catalog:
 * 1. JSON Schema validation per entry type
 * 2. global uniqueness of the name field
 */
export async function validateCatalog(
  entries: CatalogEntry[],
  schemasDir?: string,
): Promise<ValidationIssue[]> {
  const ajv = await createValidator(schemasDir);
  const issues: ValidationIssue[] = [];
  const seenNames = new Map<string, string>();

  for (const entry of entries) {
    issues.push(...validateEntry(ajv, entry));

    const name = entry.meta.name;
    if (typeof name !== 'string' || name.length === 0) continue;

    const firstSeenIn = seenNames.get(name);
    if (firstSeenIn === undefined) {
      seenNames.set(name, entry.file);
    } else {
      issues.push({
        file: entry.file,
        path: '/name',
        message: `name "${name}" is already used by ${firstSeenIn}`,
      });
    }
  }

  return issues;
}
```

- [ ] **Step 6: 实现 tools/validate/report.ts**

```ts
import pc from 'picocolors';
import type { ValidationIssue } from '../types.js';

/** Renders validation issues for the terminal, grouped by file. */
export function formatIssues(
  issues: ValidationIssue[],
  entryCount = 0,
): string {
  if (issues.length === 0) {
    return pc.green(`✓ All ${entryCount} entries valid`);
  }

  const byFile = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    const list = byFile.get(issue.file);
    if (list) list.push(issue);
    else byFile.set(issue.file, [issue]);
  }

  const lines: string[] = [];
  for (const [file, list] of [...byFile.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    lines.push(pc.red(`✗ ${file}`));
    for (const issue of list) {
      lines.push(`    ${pc.dim(issue.path)}  ${issue.message}`);
    }
  }

  lines.push('');
  lines.push(
    pc.red(`${issues.length} problem(s) in ${byFile.size} file(s)`),
  );
  return lines.join('\n');
}
```

- [ ] **Step 7: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，33 passed

- [ ] **Step 8: 提交**

```bash
git add tools/validate/validate.ts tools/validate/report.ts tools/validate/validate.test.ts tools/fixtures/invalid-catalog/
git commit -m "feat: 全量校验编排、name 唯一性检查与报告输出"
```

---

### Task 6: 构建器

**Files:**
- Create: `tools/build/build.ts`
- Test: `tools/build/build.test.ts`

**Interfaces:**
- Consumes: `loadCatalog`（Task 4）、`validateCatalog`（Task 5）、`DEFAULT_CATALOG_DIR`、`DEFAULT_DIST_DIR`（Task 4）
- Produces:
  - `build(options?: BuildOptions): Promise<BuildResult>`
  - `class BuildError extends Error`（携带 `issues: ValidationIssue[]`）
  - 接口 `BuildOptions { catalogDir?: string; schemasDir?: string; distDir?: string }`
  - 接口 `ManifestEntry { name, type, version, description, stages, stacks, file, sha256 }`
  - 接口 `Manifest { generatedAt, entryCount, entries }`
  - 接口 `BuildResult { manifest: Manifest; writtenFiles: string[] }`

M0 的构建职责限定为两件事：把 `skill` 类型的条目目录整体复制到 `dist/skills/<name>/`，以及生成 `dist/manifest.json` 收录全部八类条目。其余类型的落地形式由 M1 的 adapters 决定，此处只登记不复制。

- [ ] **Step 1: 写失败的测试**

创建 `tools/build/build.test.ts`：

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { BuildError, build } from './build.js';
import type { Manifest } from './build.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const VALID = path.resolve(here, '..', 'fixtures', 'valid-catalog');
const INVALID = path.resolve(here, '..', 'fixtures', 'invalid-catalog');

let distDir: string;

beforeEach(async () => {
  distDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdlc-dist-'));
});

async function readManifest(dir: string): Promise<Manifest> {
  return JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8')) as Manifest;
}

describe('build', () => {
  it('writes a manifest covering every entry', async () => {
    const result = await build({ catalogDir: VALID, distDir });
    const manifest = await readManifest(distDir);
    expect(manifest.entryCount).toBe(3);
    expect(manifest.entries.map((e) => e.name).sort()).toEqual([
      'fixture-mcp',
      'fixture-rule',
      'fixture-skill',
    ]);
    expect(result.manifest.entryCount).toBe(3);
  });

  it('gives every manifest entry a sha256 of its source file', async () => {
    await build({ catalogDir: VALID, distDir });
    const manifest = await readManifest(distDir);
    for (const entry of manifest.entries) {
      expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('copies skill entry directories into dist/skills/<name>', async () => {
    await build({ catalogDir: VALID, distDir });
    const copied = await fs.readFile(
      path.join(distDir, 'skills', 'fixture-skill', 'SKILL.md'),
      'utf8',
    );
    expect(copied).toContain('name: fixture-skill');
  });

  it('does not copy non-skill entries in M0', async () => {
    await build({ catalogDir: VALID, distDir });
    const top = await fs.readdir(distDir);
    expect(top.sort()).toEqual(['manifest.json', 'skills']);
  });

  it('throws BuildError and writes nothing when validation fails', async () => {
    await expect(build({ catalogDir: INVALID, distDir })).rejects.toBeInstanceOf(
      BuildError,
    );
    expect(await fs.readdir(distDir)).toEqual([]);
  });

  it('clears stale output from a previous build', async () => {
    await fs.writeFile(path.join(distDir, 'stale.txt'), 'old');
    await build({ catalogDir: VALID, distDir });
    expect(await fs.readdir(distDir)).not.toContain('stale.txt');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test tools/build/build.test.ts`
Expected: FAIL，报错 `Failed to resolve import "./build.js"`

- [ ] **Step 3: 实现 tools/build/build.ts**

```ts
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadCatalog } from '../catalog/load.js';
import { DEFAULT_CATALOG_DIR, DEFAULT_DIST_DIR } from '../catalog/paths.js';
import { validateCatalog } from '../validate/validate.js';
import type {
  CatalogEntry,
  EntryType,
  Stage,
  ValidationIssue,
} from '../types.js';

export interface BuildOptions {
  catalogDir?: string;
  schemasDir?: string;
  distDir?: string;
}

export interface ManifestEntry {
  name: string;
  type: EntryType;
  version: string;
  description: string;
  stages: Stage[];
  stacks: string[];
  /** Source path relative to the catalog root */
  file: string;
  sha256: string;
}

export interface Manifest {
  generatedAt: string;
  entryCount: number;
  entries: ManifestEntry[];
}

export interface BuildResult {
  manifest: Manifest;
  /** Paths written, relative to the dist root */
  writtenFiles: string[];
}

export class BuildError extends Error {
  constructor(readonly issues: ValidationIssue[]) {
    super(`catalog validation failed with ${issues.length} problem(s)`);
    this.name = 'BuildError';
  }
}

/**
 * Builds dist/ from catalog/. Validation runs first and a failure aborts
 * before anything is written, so a failed build never leaves partial output.
 */
export async function build(options: BuildOptions = {}): Promise<BuildResult> {
  const catalogDir = options.catalogDir ?? DEFAULT_CATALOG_DIR;
  const distDir = options.distDir ?? DEFAULT_DIST_DIR;

  const entries = await loadCatalog(catalogDir);
  const issues = await validateCatalog(entries, options.schemasDir);
  if (issues.length > 0) throw new BuildError(issues);

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const writtenFiles: string[] = [];
  const manifestEntries: ManifestEntry[] = [];

  for (const entry of entries) {
    manifestEntries.push(await toManifestEntry(entry, catalogDir));

    if (entry.meta.type === 'skill') {
      const from = path.join(catalogDir, entry.dir);
      const to = path.join(distDir, 'skills', entry.meta.name as string);
      await fs.cp(from, to, { recursive: true });
      writtenFiles.push(`skills/${entry.meta.name as string}`);
    }
  }

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    entryCount: manifestEntries.length,
    entries: manifestEntries,
  };

  await fs.writeFile(
    path.join(distDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  writtenFiles.push('manifest.json');

  return { manifest, writtenFiles };
}

async function toManifestEntry(
  entry: CatalogEntry,
  catalogDir: string,
): Promise<ManifestEntry> {
  const raw = await fs.readFile(path.join(catalogDir, entry.file));
  return {
    name: entry.meta.name as string,
    type: entry.meta.type as EntryType,
    version: entry.meta.version as string,
    description: entry.meta.description as string,
    stages: entry.meta.stages ?? [],
    stacks: entry.meta.stacks ?? [],
    file: entry.file,
    sha256: createHash('sha256').update(raw).digest('hex'),
  };
}
```

`entry.meta.name as string` 这类断言是安全的：`validateCatalog` 已在此之前保证全部必填字段存在且类型正确，校验不过就不会走到这里。

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，39 passed

- [ ] **Step 5: 提交**

```bash
git add tools/build/
git commit -m "feat: 构建器，校验通过才产出 dist 与 manifest"
```

---

### Task 7: CLI

**Files:**
- Create: `tools/cli/commands.ts`
- Create: `tools/cli/index.ts`
- Test: `tools/cli/commands.test.ts`

**Interfaces:**
- Consumes: `loadCatalog`（Task 4）、`validateCatalog`、`formatIssues`（Task 5）、`build`、`BuildError`（Task 6）
- Produces:
  - `runCheck(options: { catalogDir?: string; schemasDir?: string }): Promise<{ exitCode: number; output: string }>`
  - `runBuild(options: BuildOptions): Promise<{ exitCode: number; output: string }>`
  - CLI 命令 `sdlc check` 与 `sdlc build`

两个 run 函数住在 `commands.ts`，返回退出码与输出字符串而不直接调用 `process.exit`，因此可被单元测试直接断言。`index.ts` 只做 commander 装配。

**这两者必须分成两个文件。** 若 `program.parseAsync(process.argv)` 与 run 函数同处一个模块，测试 import 该模块时顶层代码会立即执行，把 vitest 的命令行参数当成 sdlc 的参数解析，测试将直接失败。

- [ ] **Step 1: 写失败的测试**

创建 `tools/cli/commands.test.ts`：

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runBuild, runCheck } from './commands.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const VALID = path.resolve(here, '..', 'fixtures', 'valid-catalog');
const INVALID = path.resolve(here, '..', 'fixtures', 'invalid-catalog');

describe('runCheck', () => {
  it('exits 0 and reports success for a valid catalog', async () => {
    const { exitCode, output } = await runCheck({ catalogDir: VALID });
    expect(exitCode).toBe(0);
    expect(output).toContain('All 3 entries valid');
  });

  it('exits 1 and names the offending file for an invalid catalog', async () => {
    const { exitCode, output } = await runCheck({ catalogDir: INVALID });
    expect(exitCode).toBe(1);
    expect(output).toContain('skills/bad/SKILL.md');
    expect(output).toContain('version');
  });
});

describe('runBuild', () => {
  it('exits 0 and reports what it wrote', async () => {
    const distDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdlc-cli-'));
    const { exitCode, output } = await runBuild({ catalogDir: VALID, distDir });
    expect(exitCode).toBe(0);
    expect(output).toContain('3 entries');
  });

  it('exits 1 and prints validation issues instead of building', async () => {
    const distDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdlc-cli-'));
    const { exitCode, output } = await runBuild({ catalogDir: INVALID, distDir });
    expect(exitCode).toBe(1);
    expect(output).toContain('problem(s)');
    expect(await fs.readdir(distDir)).toEqual([]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test tools/cli/commands.test.ts`
Expected: FAIL，报错 `Failed to resolve import "./commands.js"`

- [ ] **Step 3: 实现 tools/cli/commands.ts**

```ts
import { loadCatalog } from '../catalog/load.js';
import { validateCatalog } from '../validate/validate.js';
import { formatIssues } from '../validate/report.js';
import { BuildError, build } from '../build/build.js';
import type { BuildOptions } from '../build/build.js';

export interface CommandResult {
  exitCode: number;
  output: string;
}

/** Runs every quality gate and reports the result. */
export async function runCheck(options: {
  catalogDir?: string;
  schemasDir?: string;
}): Promise<CommandResult> {
  const entries = await loadCatalog(options.catalogDir);
  const issues = await validateCatalog(entries, options.schemasDir);
  return {
    exitCode: issues.length === 0 ? 0 : 1,
    output: formatIssues(issues, entries.length),
  };
}

/** Builds dist/ from catalog/, reporting validation issues on failure. */
export async function runBuild(options: BuildOptions): Promise<CommandResult> {
  try {
    const result = await build(options);
    const lines = [
      `Built ${result.manifest.entryCount} entries`,
      ...result.writtenFiles.map((f) => `  ${f}`),
    ];
    return { exitCode: 0, output: lines.join('\n') };
  } catch (error) {
    if (error instanceof BuildError) {
      return { exitCode: 1, output: formatIssues(error.issues) };
    }
    throw error;
  }
}
```

- [ ] **Step 4: 实现 tools/cli/index.ts**

```ts
#!/usr/bin/env node
import { Command } from 'commander';
import { runBuild, runCheck } from './commands.js';

const program = new Command();

program
  .name('sdlc')
  .description('Advisory knowledge base for coding agents')
  .version('0.1.0');

program
  .command('check')
  .description('Run all quality gates over the catalog')
  .option('--catalog <dir>', 'catalog directory to check')
  .option('--schemas <dir>', 'schemas directory to validate against')
  .action(async (opts: { catalog?: string; schemas?: string }) => {
    const { exitCode, output } = await runCheck({
      catalogDir: opts.catalog,
      schemasDir: opts.schemas,
    });
    console.log(output);
    process.exitCode = exitCode;
  });

program
  .command('build')
  .description('Build dist/ from the catalog')
  .option('--catalog <dir>', 'catalog directory to build from')
  .option('--schemas <dir>', 'schemas directory to validate against')
  .option('--dist <dir>', 'output directory')
  .action(async (opts: { catalog?: string; schemas?: string; dist?: string }) => {
    const { exitCode, output } = await runBuild({
      catalogDir: opts.catalog,
      schemasDir: opts.schemas,
      distDir: opts.dist,
    });
    console.log(output);
    process.exitCode = exitCode;
  });

await program.parseAsync(process.argv);
```

顶层 `await program.parseAsync` 依赖 ESM 的 top-level await，`tsconfig` 的 `module: NodeNext` 已支持。

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，43 passed

- [ ] **Step 6: 手工验证 CLI 对 fixtures 的行为**

```bash
pnpm sdlc check --catalog tools/fixtures/valid-catalog
echo "exit=$?"
pnpm sdlc check --catalog tools/fixtures/invalid-catalog
echo "exit=$?"
```

Expected: 第一条输出 `✓ All 3 entries valid` 且 `exit=0`；第二条列出 `skills/bad/SKILL.md` 与重复 name 的问题且 `exit=1`。

- [ ] **Step 7: 提交**

```bash
git add tools/cli/
git commit -m "feat: sdlc check 与 sdlc build 命令"
```

---

### Task 8: 首个真实条目、仓库规则与 README

**Files:**
- Create: `catalog/skills/meta/skill-authoring/SKILL.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md`（软链至 `AGENTS.md`）
- Create: `README.md`
- Test: `tools/build/real-catalog.test.ts`

**Interfaces:**
- Consumes: `runCheck`、`runBuild`（Task 7）
- Produces: 真实 catalog 的首个条目，name 为 `skill-authoring`

- [ ] **Step 1: 写失败的测试**

创建 `tools/build/real-catalog.test.ts`：

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runBuild, runCheck } from '../cli/commands.js';

describe('the real catalog', () => {
  it('passes every quality gate', async () => {
    const { exitCode, output } = await runCheck({});
    expect(output).not.toContain('problem(s)');
    expect(exitCode).toBe(0);
  });

  it('contains at least one entry and builds successfully', async () => {
    const distDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdlc-real-'));
    const { exitCode } = await runBuild({ distDir });
    expect(exitCode).toBe(0);
    const manifest = JSON.parse(
      await fs.readFile(path.join(distDir, 'manifest.json'), 'utf8'),
    ) as { entryCount: number; entries: { name: string }[] };
    expect(manifest.entryCount).toBeGreaterThanOrEqual(1);
    expect(manifest.entries.map((e) => e.name)).toContain('skill-authoring');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test tools/build/real-catalog.test.ts`
Expected: FAIL，manifest 的 entryCount 为 0，找不到 `skill-authoring`

- [ ] **Step 3: 创建首个真实条目**

`catalog/skills/meta/skill-authoring/SKILL.md`：

````markdown
---
name: skill-authoring
description: 为 SDLC 知识库编写或修改 catalog 条目时使用。覆盖八类产物的目录位置与元数据必填字段、description 触发词写法、正文与 references 的切分、以及提交前的本地校验命令。触发词包括：写一个 skill、加一条规则、新增 catalog 条目、条目校验不过、sdlc check 报错。
version: 0.1.0
type: skill
updated_at: "2026-09-03"
---

# 编写 catalog 条目

## 先确定产物类型

八类产物的边界不同，选错类型会导致条目被错误加载或在错误时机进入 context：

| 类型 | 用途 | 目录与元数据文件 |
|---|---|---|
| `skill` | 单个可重复执行的任务 | `catalog/skills/<域>/<名>/SKILL.md` |
| `rule` | 拼进目标项目 AGENTS.md 的常驻规则片段 | `catalog/rules/<名>.md` |
| `knowledge` | 按需查阅的导航式知识包 | `catalog/knowledge/<主题>/INDEX.md` |
| `template` | 复制进目标项目的脚手架 | `catalog/templates/<名>/TEMPLATE.md` |
| `agent` | subagent 定义 | `catalog/agents/<名>.md` |
| `command` | slash command | `catalog/commands/<名>.md` |
| `hook` | hooks 配置片段 | `catalog/hooks/<名>.json` |
| `mcp` | MCP server 清单 | `catalog/mcp/<名>.json` |

判断标准：**它会常驻在每次对话里吗** —— 会则是 `rule`；**它是一段被执行的流程吗** —— 是则是 `skill`；**它是被查阅的资料吗** —— 是则是 `knowledge`。

## 必填元数据

markdown 类条目写在 YAML frontmatter 里，JSON 类条目写在顶层字段里：

- `name` —— 全库唯一的 kebab-case 标识
- `description` —— 触发描述，至少 20 字符
- `version` —— 语义化版本，形如 `0.1.0`
- `type` —— 上表中的八类之一
- `updated_at` —— `YYYY-MM-DD` 格式

若内容来自外部，必须同时声明 `source` 与 `license`，缺一不可，校验器会拦截。

类型专属的必填字段：`rule` 需要 `section`，`template` 需要 `target_path`，`hook` 需要 `event` 与 `config`，`mcp` 需要 `server`。

## description 怎么写

description 同时驱动自动触发和检索，按搜索查询来写，不要写成标题。

把用户真实会说的话塞进去：不要写"技能编写指南"，要写"写一个 skill、加一条规则、新增 catalog 条目、条目校验不过"。

不要和已有条目抢同一批触发短语。新增前先看一眼 `dist/manifest.json` 里已有条目的 description。

## 正文的取舍

`SKILL.md` 正文只放"总是需要的那部分"。深层细节、长表格、示例代码放进同级的 `references/` 目录，在正文里用相对路径显式指向，由 agent 按需读取。

判断标准很简单：如果一段内容在八成的使用场景里都用不上，它就该待在 `references/` 里。

## 提交前校验

```bash
pnpm sdlc check
```

输出 `✓ All N entries valid` 才可提交。报错时按 `文件 → 字段 → 说明` 三段定位，逐条修完再跑。

构建产物用这条命令生成，`dist/` 不入 main 分支：

```bash
pnpm sdlc build
```
````

- [ ] **Step 4: 创建 AGENTS.md**

````markdown
# SDLC 知识库 —— 仓库规则

本仓库是面向 coding agent 的顾问式知识库。设计文档在 `docs/superpowers/specs/`。

## 目录职责

- `catalog/` —— 唯一真源，八类可安装产物。手写内容只应出现在这里。
- `stages/` —— 决策入口，只放索引与决策矩阵，**不放任何实体资源**。
- `library/` —— 外部文章原料与蒸馏笔记，**永不进入 agent context**。
- `profiles/` —— 技术栈组合包，只引用 catalog 条目。
- `schemas/` —— 各类产物的 JSON Schema 契约。
- `tools/` —— 构建、校验与 CLI 实现。
- `dist/` —— 完全由构建生成，禁止手改，不入 main 分支。

## 硬性约束

- 新增或修改 catalog 条目后必须跑 `pnpm sdlc check`，通过才可提交。
- 条目的 `name` 全库唯一，kebab-case。
- 带 `source` 的条目必须同时带 `license`。
- 不要把资源文件放进 `stages/`，资产跨阶段，按阶段物理存放会导致重复漂移。
- 不要把 `library/` 的内容直接引用进 `catalog/` 或 `stages/`，必须先提炼为正式条目。

## 语言约定

- 代码标识符、代码注释、CLI 输出文案用英文。
- `.md` 文档用中文。

## 常用命令

```bash
pnpm sdlc check      # 运行全部质量闸门
pnpm sdlc build      # 构建 dist/
pnpm test            # 运行单元测试
pnpm typecheck       # 类型检查
```
````

- [ ] **Step 5: 创建 CLAUDE.md 软链**

```bash
ln -s AGENTS.md CLAUDE.md
```

- [ ] **Step 6: 创建 README.md**

````markdown
# SDLC

面向 coding agent 的顾问式知识库，支持 Claude Code、Codex CLI 与 pi。

它回答的不是"库里有什么"，而是"此刻我该用什么"：初始化新项目时该装哪些规范、做设计时该用哪个设计系统、编码时该走 SDD 还是 TDD。

## 结构

```
stages/    决策入口：按 SDLC 时刻组织的选型矩阵
catalog/   资产层：八类可安装产物，唯一真源
library/   原料层：外部文章与蒸馏笔记
profiles/  技术栈组合包
```

## 开发

```bash
pnpm install
pnpm sdlc check   # 校验 catalog
pnpm sdlc build   # 构建 dist/
pnpm test
```

设计文档见 `docs/superpowers/specs/2026-09-03-sdlc-knowledge-base-design.md`。

## 当前状态

M0 地基阶段：格式契约与构建管线可用，内容尚在填充中。
````

- [ ] **Step 7: 运行测试确认通过**

Run: `pnpm test`
Expected: PASS，45 passed

- [ ] **Step 8: 手工验证真实构建**

```bash
pnpm sdlc build
cat dist/manifest.json
ls dist/skills/skill-authoring/
```

Expected: manifest 含 1 条 `skill-authoring` 记录且 `sha256` 为 64 位十六进制；`dist/skills/skill-authoring/SKILL.md` 存在。

- [ ] **Step 9: 提交**

```bash
git add catalog/ AGENTS.md CLAUDE.md README.md tools/build/real-catalog.test.ts
git commit -m "feat: 首个 catalog 条目 skill-authoring，仓库规则与 README"
```

---

### Task 9: CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `pnpm typecheck`、`pnpm test`、`pnpm sdlc check`（Task 1、7）
- Produces: 无代码接口。CI 在每次 push 与 PR 上强制三道关卡。

- [ ] **Step 1: 更新 .gitignore**

现有内容为 `dist/`、`node_modules/`、`.DS_Store`。追加：

```
# tsx / vitest caches
.vitest/
*.tsbuildinfo
```

- [ ] **Step 2: 创建 .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Unit tests
        run: pnpm test

      - name: Catalog quality gates
        run: pnpm sdlc check
```

`pnpm/action-setup@v4` 不指定 version，会读取 `package.json` 的 `packageManager` 字段，与 Task 1 中 `corepack use pnpm@latest` 写入的版本保持一致。

- [ ] **Step 3: 本地模拟 CI 全流程**

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm sdlc check
```

Expected: 四条命令全部退出码 0。

- [ ] **Step 4: 验证 CI 确实能拦住坏条目**

临时把真实条目改坏，确认闸门生效：

```bash
sed -i.bak 's/^version: 0.1.0$/version: not-a-version/' catalog/skills/meta/skill-authoring/SKILL.md
pnpm sdlc check; echo "exit=$?"
mv catalog/skills/meta/skill-authoring/SKILL.md.bak catalog/skills/meta/skill-authoring/SKILL.md
pnpm sdlc check; echo "exit=$?"
```

Expected: 第一次 `exit=1` 并指出 `/version` 不匹配模式；恢复后 `exit=0`。这就是 spec 中 M0 的完成判据。

- [ ] **Step 5: 提交**

```bash
git add .github/workflows/ci.yml .gitignore
git commit -m "ci: typecheck、单元测试与 catalog 质量闸门"
```

---

## M0 完成判据核对

对照 spec 第 14 节的 M0 判据逐条核对：

- [ ] `sdlc build` 能从 catalog 产出合法 dist —— Task 8 Step 8 手工验证，Task 8 的 `real-catalog.test.ts` 自动验证
- [ ] `sdlc check` 能拦住一个故意写错的条目 —— Task 5 的 `invalid-catalog` fixture 自动验证，Task 9 Step 4 在真实条目上手工验证
- [ ] `schemas/` 覆盖八类产物 + stage manifest —— Task 2、Task 3
- [ ] 1 个样例 skill 条目 —— Task 8 的 `skill-authoring`
- [ ] `tools/build` 基础构建 —— Task 6
- [ ] CI 接入 —— Task 9
