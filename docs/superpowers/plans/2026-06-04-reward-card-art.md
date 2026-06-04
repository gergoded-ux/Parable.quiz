# Reward-Card Art System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Classify every live quiz result with a reward-art type, generate a Grok-build job sheet to create all 537 reward images, add an auto-generated reward repertory, and fix result-art rendering to be extension-agnostic.

**Architecture:** A reward-art taxonomy (6 types + style templates) lives in `lib/reward-art.ts`. A `rewardArt` field on each result self-classifies it; a backfill tags all live results. Pure modules (`lib/reward-catalog.ts`) plus thin IO scripts emit the reward catalog (`reward-catalog.json` + `docs/reward-catalog.md`) and the Grok job sheet (`docs/design/reward-card-prompts.md`). The result-art manifest records real file extensions so saved PNGs render.

**Tech Stack:** Next.js 16, TypeScript strict, Zod v4, Vitest 4, tsx, pnpm. Tests in `tests/*.test.ts`.

---

## File Structure

**Create:**
- `lib/reward-art.ts` — `REWARD_TYPES`, `RewardArt`, `isValidRewardArt`, base style + per-type templates + negative prompt, `inferRewardArt()`.
- `lib/reward-catalog.ts` — pure `buildRewardCatalog()` + `renderRewardCatalogMarkdown()`.
- `scripts/backfill-reward-art.ts` — tag every live result with `rewardArt`.
- `scripts/build-reward-catalog.ts` — emit `content/generated/reward-catalog.json` + `docs/reward-catalog.md`.
- `scripts/build-reward-prompts.ts` — emit `docs/design/reward-card-prompts.md` (Grok job sheet).
- `tests/reward-art.test.ts`, `tests/reward-catalog.test.ts`.

**Modify:**
- `lib/schema.ts` — add `rewardArt` to `ArchetypeResult` + `ProfileResult`.
- `scripts/validate-tests.ts` — enforce `rewardArt` on live archetype/profile results.
- `scripts/build-art-manifest.ts` — record result art with its real extension.
- `lib/card-art.ts` — resolve result-art URL + existence from the extension-aware manifest.
- `package.json` — add `build:reward-catalog` (into `build`) and `build:reward-prompts`.

---

# PHASE 1 — Taxonomy + Classification

## Task 1: Reward-art taxonomy module

**Files:**
- Create: `lib/reward-art.ts`
- Test: `tests/reward-art.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/reward-art.test.ts
import { describe, it, expect } from 'vitest';
import { REWARD_TYPES, isValidRewardArt, REWARD_TEMPLATES, REWARD_BASE_STYLE } from '@/lib/reward-art';

describe('reward-art taxonomy', () => {
  it('has 6 unique types', () => {
    expect(REWARD_TYPES.length).toBe(6);
    expect(new Set(REWARD_TYPES).size).toBe(6);
  });
  it('validates membership', () => {
    expect(isValidRewardArt('character')).toBe(true);
    expect(isValidRewardArt('portrait')).toBe(false);
    expect(isValidRewardArt(undefined)).toBe(false);
  });
  it('has a non-empty template for every type', () => {
    for (const t of REWARD_TYPES) expect(REWARD_TEMPLATES[t].length).toBeGreaterThan(10);
    expect(REWARD_BASE_STYLE.length).toBeGreaterThan(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/reward-art.test.ts`
Expected: FAIL — cannot resolve `@/lib/reward-art`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/reward-art.ts
// Reward-card art taxonomy: 6 types, a shared base style, per-type composition
// templates, and a negative prompt. Used by the Grok job sheet and the reward
// catalog. Every live quiz result is tagged with one RewardArt type.

export const REWARD_TYPES = ['character', 'creature', 'object', 'place', 'scene', 'symbol'] as const;
export type RewardArt = (typeof REWARD_TYPES)[number];

const SET = new Set<string>(REWARD_TYPES);
export function isValidRewardArt(x: string | undefined): x is RewardArt {
  return typeof x === 'string' && SET.has(x);
}

export const REWARD_BASE_STYLE =
  'Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour ' +
  'biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle ' +
  'diffused light, subtle canvas texture, reverent and hopeful, one clear central subject ' +
  'on a softly blurred background, square 1:1 composition, generous breathing room at the ' +
  'edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus ' +
  '(distant, silhouetted, or from behind only).';

export const REWARD_NEGATIVE =
  'text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, ' +
  'modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered ' +
  'background, busy edges, collage.';

export const REWARD_TEMPLATES: Record<RewardArt, string> = {
  character: 'A single named biblical PERSON, warm portrait or three-quarter view, gentle expression, period ancient dress, soft halo of light; face shown (a human, never God or Jesus).',
  creature: 'A single noble biblical CREATURE or celestial being, centered and symbolic, dignified and calm.',
  object: 'A single sacred biblical OBJECT or artifact, hero-lit still life, resting in soft golden light on a plain ground.',
  place: 'A single iconic biblical PLACE, landmark, or structure, seen as a serene establishing view, no faces, soft atmosphere.',
  scene: 'A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted.',
  symbol: 'A single clean ICONOGRAPHIC EMBLEM or metaphor for an abstract idea, centered, minimal, lots of negative space.',
};

// Generic fallback used by the backfill when no explicit map entry exists.
export function inferRewardArt(category: string, mode: string): RewardArt {
  if (mode === 'profile') return 'symbol';
  if (category === 'spiritual-profile') return 'symbol';
  return 'character'; // most bible-character archetypes are people
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/reward-art.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reward-art.ts tests/reward-art.test.ts
git commit -m "feat(reward): reward-art taxonomy (6 types + style templates)"
```

---

## Task 2: Add `rewardArt` to result schemas

**Files:**
- Modify: `lib/schema.ts` (`ArchetypeResult`, `ProfileResult`)

- [ ] **Step 1: Add the field to both result objects**

In `lib/schema.ts`, add `rewardArt: z.string().optional()` to `ArchetypeResult` (after `cardVerse`) and to `ProfileResult` (after `cardVerse`). Keep it a plain optional string (the vocabulary is enforced by `validate-tests`, so a stray value never crashes the loader):

```ts
const ArchetypeResult = z.object({
  name: z.string().min(1),
  emoji: z.string().min(1),
  traits: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef.optional(),
  scripture: InlineScripture.optional(),
  cardVerse: InlineScripture.optional(),
  rewardArt: z.string().optional(),
});
```

```ts
const ProfileResult = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef.optional(),
  scripture: InlineScripture.optional(),
  cardVerse: InlineScripture.optional(),
  rewardArt: z.string().optional(),
});
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `pnpm exec vitest run tests/test-loader.test.ts`
Expected: PASS (additive optional field).

- [ ] **Step 3: Commit**

```bash
git add lib/schema.ts
git commit -m "feat(schema): add optional rewardArt to result types"
```

---

## Task 3: Backfill `rewardArt` on all live results

**Files:**
- Create: `scripts/backfill-reward-art.ts`
- Modify: live archetype/profile quiz JSONs under `content/tests/`

- [ ] **Step 1: Write the backfill script**

```ts
// scripts/backfill-reward-art.ts
// Tags every LIVE archetype/profile result with a rewardArt type:
//   per-result OVERRIDES  ->  per-quiz QUIZ_TYPE  ->  inferRewardArt() fallback.
// Re-runnable; prints anything unresolved so you can extend the maps and re-run.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import publishedSlugs from '@/content/published.json';
import { inferRewardArt, isValidRewardArt, type RewardArt } from '@/lib/reward-art';

const ROOT = join(process.cwd(), 'content', 'tests');
const LIVE = new Set(publishedSlugs as string[]);

// Whole-quiz type for quizzes whose results are all one non-character type.
const QUIZ_TYPE: Record<string, RewardArt> = {
  'which-bible-animal-are-you': 'creature',
  'which-biblically-accurate-angel-are-you': 'creature',
  'which-bible-mountain-are-you': 'place',
  'which-bible-city-are-you': 'place',
  'which-piece-of-the-armor-of-god-are-you': 'object',
  'which-name-of-god-are-you': 'symbol',
  'which-i-am-statement-of-jesus-are-you': 'symbol',
  'which-fruit-of-the-spirit-are-you': 'symbol',
  'which-beatitude-defines-you': 'symbol',
  'which-tribe-of-israel-are-you': 'symbol',
  'which-psalm-speaks-to-you': 'symbol',
  'which-bible-feast-are-you': 'scene',
  'which-plague-of-egypt-are-you': 'scene',
  'which-bible-miracle-are-you': 'scene',
  'which-day-of-creation-are-you': 'scene',
  'which-parable-describes-your-life': 'scene',
  'which-bible-story-are-you-living': 'scene',
};

// Per-result exceptions inside a mixed quiz: key is "slug/resultKey".
const OVERRIDES: Record<string, RewardArt> = {};

function main() {
  const unresolved: string[] = [];
  let written = 0;

  for (const bucket of ['archetype', 'profile'] as const) {
    const dir = join(ROOT, bucket);
    for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const path = join(dir, file);
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      if (!LIVE.has(raw.slug)) continue;            // tag live only
      if (!raw.results) continue;

      let changed = false;
      for (const key of Object.keys(raw.results)) {
        const type: RewardArt =
          OVERRIDES[`${raw.slug}/${key}`] ??
          QUIZ_TYPE[raw.slug] ??
          inferRewardArt(raw.category, raw.mode);
        if (!isValidRewardArt(type)) { unresolved.push(`${raw.slug}/${key}`); continue; }
        if (raw.results[key].rewardArt !== type) { raw.results[key].rewardArt = type; changed = true; }
      }
      if (changed) { writeFileSync(path, JSON.stringify(raw, null, 2) + '\n'); written++; }
    }
  }

  console.log(`backfill-reward-art: wrote ${written} file(s)`);
  if (unresolved.length) {
    console.error(`unresolved: ${unresolved.length}`);
    unresolved.forEach(s => console.error('  ' + s));
    process.exit(1);
  }
}
main();
```

- [ ] **Step 2: Run it; review the result with the catalog later**

Run: `pnpm exec tsx scripts/backfill-reward-art.ts`
Expected: `backfill-reward-art: wrote N file(s)`, exit 0. (After Task 7 you will eyeball `docs/reward-catalog.md` and, for any result whose type looks wrong, add an `OVERRIDES["slug/key"]` or `QUIZ_TYPE["slug"]` entry and re-run.)

- [ ] **Step 3: Sanity check**

Run: `pnpm exec vitest run tests/test-loader.test.ts`
Expected: PASS (all JSON valid). Open 2-3 tagged quizzes and confirm sensible `rewardArt` values.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-reward-art.ts content/tests
git commit -m "feat(reward): tag all live results with rewardArt"
```

---

## Task 4: Enforce `rewardArt` on live results

**Files:**
- Modify: `scripts/validate-tests.ts`

- [ ] **Step 1: Add the check**

Add the import near the top:

```ts
import { isValidRewardArt } from '@/lib/reward-art';
```

Inside `main()`'s per-test loop, after the existing theme check, add:

```ts
    if ((t.mode === 'archetype' || t.mode === 'profile') && isPublished(t.slug)) {
      for (const [key, r] of Object.entries(t.results)) {
        if (!isValidRewardArt((r as { rewardArt?: string }).rewardArt)) {
          console.error(`❌ ${t.slug} → result "${key}" → invalid or missing rewardArt`);
          errors++;
        }
      }
    }
```

- [ ] **Step 2: Validate**

Run: `pnpm validate:tests`
Expected: exit 0, `✅ Validated 260 test(s) · 126 live, 134 backlog` (every live archetype/profile result now has a valid rewardArt).

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-tests.ts
git commit -m "feat(reward): require rewardArt on live archetype/profile results"
```

---

# PHASE 2 — Extension-agnostic result art

## Task 5: Record + resolve real result-art extension

**Files:**
- Modify: `scripts/build-art-manifest.ts`, `lib/card-art.ts`
- Test: `tests/test-loader.test.ts` stays green; manual render check

- [ ] **Step 1: Record the extension in the manifest**

In `scripts/build-art-manifest.ts`, change the result loop to store the path WITH its extension (currently it pushes `${slug}/${m[1]}`):

```ts
      for (const f of readdirSync(dir)) {
        const m = f.match(/^(.+)\.(jpg|jpeg|webp|png)$/i);
        if (m) have.push(`${slug}/${f}`);   // full filename incl. extension
      }
```

- [ ] **Step 2: Resolve from the extension-aware manifest in card-art**

In `lib/card-art.ts`, replace the `HAVE` set + `hasIllustration` + `artUrl` with a map keyed by `slug/key` -> `slug/key.ext`:

```ts
// manifest entries are now "slug/key.ext"; map the extensionless key to the file.
const ART_BY_KEY = new Map<string, string>(
  (manifest as string[]).map((rel) => [rel.replace(/\.(jpg|jpeg|webp|png)$/i, ''), rel]),
);

export function hasIllustration(slug: string, key: string): boolean {
  return ART_BY_KEY.has(`${slug}/${key}`);
}

export function artUrl(slug: string, key: string): string {
  const rel = ART_BY_KEY.get(`${slug}/${key}`);
  return rel ? `${BASE}/results/${rel}` : '';
}
```

(The callers `ResultCardLive.tsx` and `app/og/[slug]/[key]/route.tsx` already call `artUrl(slug, key)` and gate on `hasArt`/`hasIllustration`, so no caller change is needed. Confirm with: `Grep artUrl\(` — both call sites pass exactly two args.)

- [ ] **Step 3: Regenerate the manifest and verify existing art still resolves**

Run: `pnpm build:art`
Then: `pnpm exec tsx -e "import('./lib/card-art.ts').then(m=>console.log(m.hasIllustration('are-you-a-leah-or-a-rachel','leah'), m.artUrl('are-you-a-leah-or-a-rachel','leah')))"`
Expected: `true /results/are-you-a-leah-or-a-rachel/leah.jpg` (real extension, not a guessed `.jpg`).

- [ ] **Step 4: Build smoke**

Run: `pnpm build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-art-manifest.ts lib/card-art.ts content/generated/art-manifest.json
git commit -m "fix(reward): resolve result-art URL by real file extension"
```

---

# PHASE 3 — Reward repertory (catalog)

## Task 6: Pure reward-catalog module

**Files:**
- Create: `lib/reward-catalog.ts`
- Test: `tests/reward-catalog.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/reward-catalog.test.ts
import { describe, it, expect } from 'vitest';
import { buildRewardCatalog, renderRewardCatalogMarkdown } from '@/lib/reward-catalog';
import type { Test } from '@/lib/schema';

const archetype = {
  slug: 'q', title: 'Q', lang: 'en', category: 'bible-character',
  theme: 'scripture-archetype', estimatedMinutes: 4, mode: 'archetype',
  questions: [],
  results: {
    isaiah: { name: 'Isaiah', emoji: 'x', traits: ['a'], description: 'd', rewardArt: 'character' },
    sinai: { name: 'Mount Sinai', emoji: 'x', traits: ['a'], description: 'd', rewardArt: 'place' },
  },
} as unknown as Test;

describe('buildRewardCatalog', () => {
  const entries = buildRewardCatalog({
    tests: [archetype],
    published: new Set(['q']),
    hasImage: (s, k) => s === 'q' && k === 'isaiah',
  });
  it('emits one entry per result with type + status + image', () => {
    expect(entries).toHaveLength(2);
    const isa = entries.find(e => e.resultKey === 'isaiah')!;
    expect(isa.rewardArt).toBe('character');
    expect(isa.status).toBe('live');
    expect(isa.hasImage).toBe(true);
    expect(entries.find(e => e.resultKey === 'sinai')!.hasImage).toBe(false);
  });
});

describe('renderRewardCatalogMarkdown', () => {
  it('summarizes and groups by type', () => {
    const md = renderRewardCatalogMarkdown(buildRewardCatalog({
      tests: [archetype], published: new Set(['q']), hasImage: () => false,
    }));
    expect(md).toContain('2** reward images');
    expect(md).toContain('## character');
    expect(md).toContain('`public/results/q/isaiah.png`');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/reward-catalog.test.ts`
Expected: FAIL — cannot resolve `@/lib/reward-catalog`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/reward-catalog.ts
import type { Test } from './schema';

export interface RewardEntry {
  quizSlug: string;
  quizTitle: string;
  resultKey: string;
  resultName: string;
  rewardArt: string;
  category: Test['category'];
  status: 'live' | 'backlog';
  hasImage: boolean;
  path: string; // public/results/<slug>/<key>.png
}

export interface RewardCatalogInputs {
  tests: Test[];
  published: Set<string>;
  hasImage: (slug: string, key: string) => boolean;
}

export function buildRewardCatalog(inp: RewardCatalogInputs): RewardEntry[] {
  const out: RewardEntry[] = [];
  for (const t of inp.tests) {
    if (t.mode !== 'archetype' && t.mode !== 'profile') continue; // knowledge reuses the cover
    for (const [key, r] of Object.entries(t.results)) {
      out.push({
        quizSlug: t.slug,
        quizTitle: t.title,
        resultKey: key,
        resultName: (r as { name: string }).name,
        rewardArt: (r as { rewardArt?: string }).rewardArt ?? 'untagged',
        category: t.category,
        status: inp.published.has(t.slug) ? 'live' : 'backlog',
        hasImage: inp.hasImage(t.slug, key),
        path: `public/results/${t.slug}/${key}.png`,
      });
    }
  }
  return out.sort((a, b) =>
    a.rewardArt.localeCompare(b.rewardArt) ||
    a.quizSlug.localeCompare(b.quizSlug) ||
    a.resultKey.localeCompare(b.resultKey));
}

function groupBy<T>(items: T[], key: (i: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const i of items) { const k = key(i); const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); }
  return m;
}

export function renderRewardCatalogMarkdown(entries: RewardEntry[]): string {
  const live = entries.filter(e => e.status === 'live');
  const withImg = entries.filter(e => e.hasImage).length;
  const out: string[] = [];
  out.push('# Reward-card repertory', '');
  out.push('_Generated by `pnpm build:reward-catalog`. Do not edit by hand._', '');
  out.push(`**${entries.length}** reward images · **${live.length}** live · **${withImg}** generated · **${live.length - live.filter(e => e.hasImage).length}** live still missing art`, '');
  for (const [type, group] of [...groupBy(entries, e => e.rewardArt)].sort()) {
    out.push(`## ${type} (${group.length})`, '');
    for (const [slug, rows] of [...groupBy(group, e => e.quizSlug)].sort()) {
      out.push(`### ${rows[0].quizTitle} \`${slug}\``, '');
      out.push('| Result | Path | Status | Image |', '| --- | --- | --- | --- |');
      for (const e of rows) {
        out.push(`| ${e.resultName} | \`${e.path}\` | ${e.status === 'live' ? '**LIVE**' : 'backlog'} | ${e.hasImage ? '✓' : '–'} |`);
      }
      out.push('');
    }
  }
  return out.join('\n') + '\n';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/reward-catalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reward-catalog.ts tests/reward-catalog.test.ts
git commit -m "feat(reward): pure reward-catalog builder + markdown"
```

---

## Task 7: Reward-catalog script + build wiring

**Files:**
- Create: `scripts/build-reward-catalog.ts`
- Modify: `package.json`
- Create (generated): `content/generated/reward-catalog.json`, `docs/reward-catalog.md`

- [ ] **Step 1: Write the IO script**

```ts
// scripts/build-reward-catalog.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAllTests } from '@/lib/test-loader';
import { hasIllustration } from '@/lib/card-art';
import { buildRewardCatalog, renderRewardCatalogMarkdown } from '@/lib/reward-catalog';
import publishedSlugs from '@/content/published.json';

function main() {
  const entries = buildRewardCatalog({
    tests: loadAllTests(),
    published: new Set(publishedSlugs as string[]),
    hasImage: (slug, key) => hasIllustration(slug, key),
  });
  mkdirSync(join(process.cwd(), 'content', 'generated'), { recursive: true });
  writeFileSync(join(process.cwd(), 'content', 'generated', 'reward-catalog.json'), JSON.stringify(entries, null, 2) + '\n');
  writeFileSync(join(process.cwd(), 'docs', 'reward-catalog.md'), renderRewardCatalogMarkdown(entries));
  const live = entries.filter(e => e.status === 'live');
  const have = live.filter(e => e.hasImage).length;
  console.log(`build-reward-catalog: ${entries.length} reward images, ${live.length} live, ${have} generated`);
}
main();
```

- [ ] **Step 2: Wire into package.json**

Add `build:reward-catalog` and insert it into `build` after `build:catalog`:

```json
    "build:catalog": "tsx scripts/build-catalog.ts",
    "build:reward-catalog": "tsx scripts/build-reward-catalog.ts",
    "build:reward-prompts": "tsx scripts/build-reward-prompts.ts",
    "build": "pnpm build:art && pnpm build:catalog && pnpm build:reward-catalog && next build",
```

- [ ] **Step 3: Generate + inspect**

Run: `pnpm build:reward-catalog`
Expected: `build-reward-catalog: 1187 reward images, 537 live, 2 generated` (2 = Leah/Rachel). Open `docs/reward-catalog.md`: grouped by type, every live row shows path + image –, the "–" rows are the to-generate list.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-reward-catalog.ts package.json content/generated/reward-catalog.json docs/reward-catalog.md
git commit -m "feat(reward): generate reward repertory (json + docs/reward-catalog.md)"
```

---

# PHASE 4 — Grok-build job sheet

## Task 8: Reward-prompt job-sheet generator

**Files:**
- Create: `scripts/build-reward-prompts.ts`
- Create (generated): `docs/design/reward-card-prompts.md`

- [ ] **Step 1: Write the generator**

```ts
// scripts/build-reward-prompts.ts
// Emits docs/design/reward-card-prompts.md: a self-contained job sheet an
// agentic Grok can execute (generate each image, save to the exact path).
// LIVE archetype/profile results only; knowledge quizzes reuse the cover.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPublishedTests } from '@/lib/test-loader';
import { REWARD_BASE_STYLE, REWARD_NEGATIVE, REWARD_TEMPLATES, isValidRewardArt, type RewardArt } from '@/lib/reward-art';

function subject(name: string, traits: string[]): string {
  const base = name.replace(/\s*\(([^)]+)\)\s*$/, (_m, p1) => `, ${p1}`);
  const mood = traits.length ? ` Mood: ${traits.join(', ')}.` : '';
  return `${base}.${mood}`;
}

function main() {
  const tests = loadPublishedTests().filter(t => t.mode === 'archetype' || t.mode === 'profile');
  const out: string[] = [];
  out.push('# Reward-card art job sheet (for Grok-build)', '');
  out.push('Generate ONE image per row below and SAVE it to the exact `path`. Each prompt is complete and self-contained.', '');
  out.push('- Size: 1024x1024 PNG. One subject. Leave breathing room at the edges (a frame overlays the border).');
  out.push('- Do not add any text, letters, or watermark to the image.');
  out.push('- After generating all images, a human runs `pnpm build:art` to register them.', '');
  out.push('## Base style (already baked into every prompt)', '', '> ' + REWARD_BASE_STYLE, '');
  out.push('## Negative prompt (already baked into every prompt)', '', '> ' + REWARD_NEGATIVE, '');
  out.push('---', '');

  let n = 0;
  for (const t of tests) {
    out.push(`### ${t.title} \`${t.slug}\``, '');
    for (const [key, r] of Object.entries(t.results)) {
      const type = (r as { rewardArt?: string }).rewardArt;
      if (!isValidRewardArt(type)) continue;
      const traits = ((r as { traits?: string[] }).traits) ?? [];
      const prompt = `${REWARD_BASE_STYLE} ${REWARD_TEMPLATES[type as RewardArt]} Subject: ${subject((r as { name: string }).name, traits)} Square 1:1, 1024x1024. Negative: ${REWARD_NEGATIVE}`;
      n++;
      out.push(`${n}. **path:** \`public/results/${t.slug}/${key}.png\`  ·  **type:** ${type}`);
      out.push(`   **prompt:** ${prompt}`, '');
    }
  }
  out.push('', `_Total: ${n} reward images._`, '');
  writeFileSync(join(process.cwd(), 'docs', 'design', 'reward-card-prompts.md'), out.join('\n'));
  console.log(`build-reward-prompts: ${n} prompts -> docs/design/reward-card-prompts.md`);
}
main();
```

- [ ] **Step 2: Generate the job sheet**

Run: `pnpm build:reward-prompts`
Expected: `build-reward-prompts: 537 prompts -> docs/design/reward-card-prompts.md`. Open it: a header with explicit base style + negative, then 537 numbered rows each with a full self-contained prompt and exact save path.

- [ ] **Step 3: Commit**

```bash
git add scripts/build-reward-prompts.ts docs/design/reward-card-prompts.md
git commit -m "feat(reward): Grok-build job sheet for 537 reward images"
```

- [ ] **Step 4: Final full build + push**

Run: `pnpm validate:tests && pnpm build`
Expected: validate exit 0 (126 live), build exit 0.

```bash
git push origin main
```

---

## Self-Review (completed during planning)

- **Spec coverage:** taxonomy (Task 1), `rewardArt` field (Task 2), tag 537 live (Task 3), validate gate (Task 4), ext-agnostic art (Task 5), reward catalog json+md + build wiring (Tasks 6-7), Grok job sheet (Task 8), knowledge-reuses-cover (excluded in Tasks 6 + 8 by skipping `knowledge` mode). All spec parts covered.
- **Type consistency:** `RewardArt`/`isValidRewardArt`/`REWARD_TEMPLATES`/`REWARD_BASE_STYLE`/`REWARD_NEGATIVE`/`inferRewardArt` (Task 1) reused in Tasks 3, 4, 8. `RewardEntry`/`buildRewardCatalog`/`renderRewardCatalogMarkdown` (Task 6) reused in Task 7. `artUrl(slug,key)`/`hasIllustration` new signatures (Task 5) match existing call sites in `ResultCardLive.tsx` and the OG route.
- **Placeholder scan:** `OVERRIDES` starts empty by design (filled via the Task 3 review loop against `docs/reward-catalog.md`); `QUIZ_TYPE` is a concrete list. No TBDs.
