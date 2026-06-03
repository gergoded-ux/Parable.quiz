# Bible Quizzes Expansion + Organized Catalog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `theme` classification to every quiz, generate an always-accurate master catalog, then research + build ~40 new Bible quizzes (mix of knowledge/trivia and Scripture archetypes) and launch all Bible quizzes live.

**Architecture:** Quizzes self-describe via a new optional `theme` field (controlled vocabulary in `lib/themes.ts`). A one-time backfill tags all existing quizzes. A pure catalog module (`lib/catalog.ts`) plus a thin IO script (`scripts/build-catalog.ts`) emit `content/generated/catalog.json` + `docs/catalog.md`, joining live status (`published.json`), cover art (cover manifest), and virality (`topic-backlog.tsv`). New quizzes follow the existing JSON schema, are humanized, use ASV verses, and are added to `published.json`.

**Tech Stack:** Next.js 16 (App Router, Turbopack), TypeScript strict, Zod v4, Vitest 4, tsx, pnpm. Tests live in `tests/*.test.ts`.

---

## File Structure

**Create:**
- `lib/themes.ts` — controlled vocabulary (`THEMES`), `Theme` type, `isValidTheme`, and `themeForStruggle()` heuristic.
- `lib/catalog.ts` — pure `buildCatalog()` + `renderCatalogMarkdown()` (no IO).
- `scripts/backfill-themes.ts` — one-time: writes `theme` into every quiz JSON.
- `scripts/build-catalog.ts` — IO wrapper that writes `content/generated/catalog.json` + `docs/catalog.md`.
- `tests/themes.test.ts`, `tests/catalog.test.ts`.
- `content/generated/catalog.json`, `docs/catalog.md` — generated artifacts (committed).
- ~20 `content/tests/knowledge/*.json` + ~20 `content/tests/archetype/*.json` (Phase 2).

**Modify:**
- `lib/schema.ts` — add `theme` to `TestBase`.
- `scripts/validate-tests.ts` — enforce a valid `theme` on every quiz.
- `package.json` — add `build:catalog` script; insert into `build`.
- `content/published.json` — add the live Bible slugs (Phase 3).
- `content/topic-backlog.tsv` — append the 40 researched rows (Phase 2).

---

# PHASE 1 — Classification + Catalog

## Task 1: Theme vocabulary module

**Files:**
- Create: `lib/themes.ts`
- Test: `tests/themes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/themes.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, isValidTheme, themeForStruggle } from '@/lib/themes';

describe('themes vocabulary', () => {
  it('has unique, non-empty entries', () => {
    expect(THEMES.length).toBeGreaterThan(10);
    expect(new Set(THEMES).size).toBe(THEMES.length);
  });

  it('validates membership', () => {
    expect(isValidTheme('anxiety')).toBe(true);
    expect(isValidTheme('not-a-theme')).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
  });
});

describe('themeForStruggle', () => {
  it.each([
    ['forgiving someone who hurt you', 'forgiveness'],
    ['church hurt', 'church-hurt'],
    ['Anxiety shows up differently for everyone', 'anxiety'],
    ['identity', 'identity'],
    ['healing past wounds', 'healing-wounds'],
    ['grieving a loss nobody acknowledges', 'grief-loss'],
  ])('maps %s -> %s', (struggle, theme) => {
    expect(themeForStruggle(struggle)).toBe(theme);
  });

  it('returns null when nothing matches', () => {
    expect(themeForStruggle('xyzzy nonsense', '')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/themes.test.ts`
Expected: FAIL — cannot resolve `@/lib/themes`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/themes.ts
// Controlled vocabulary for classifying quizzes, plus a heuristic that maps the
// free-text "struggle" column from topic-backlog.tsv to one theme. Order in
// RULES matters: first match wins.

export const THEMES = [
  'identity',
  'anxiety',
  'forgiveness',
  'church-hurt',
  'grief-loss',
  'healing-wounds',
  'doubt-faith',
  'calling-purpose',
  'relationships-dating',
  'money-work',
  'comparison-shame',
  'rest-burnout',
  'parenting-family',
  'hearing-god',
  'loneliness-belonging',
  'discipleship',
  'bible-knowledge',
  'scripture-archetype',
] as const;

export type Theme = (typeof THEMES)[number];

const THEME_SET = new Set<string>(THEMES);

export function isValidTheme(t: string | undefined): t is Theme {
  return typeof t === 'string' && THEME_SET.has(t);
}

const RULES: Array<[RegExp, Theme]> = [
  [/forgiv|unforgiv|bitter|resent/, 'forgiveness'],
  [/church hurt|religious (trauma|abuse)|spiritual abuse|left.*church|leaving church|fraud.*church/, 'church-hurt'],
  [/grief|griev|mourn|lament|loss nobody|lost (a|my)/, 'grief-loss'],
  [/anxiet|worry|overthink|panic|so tired|afraid|fear is/, 'anxiety'],
  [/wound|trauma|generational|inner child|abandon|rejection|betray/, 'healing-wounds'],
  [/doubt|deconstruct|faith (crisis|problem)|dark night|unbelief|god.*silent|silent.*god/, 'doubt-faith'],
  [/callin|purpose|decision|waiting|prepare|next step|stuck|behind in life/, 'calling-purpose'],
  [/dating|marriage|relationship|the one|spouse|love (style|language)|romance|couple/, 'relationships-dating'],
  [/money|finance|wealth|hustle|workaholic|career|rich|provision/, 'money-work'],
  [/compar|envy|jealous|social media|shame|not enough|impostor|fraud/, 'comparison-shame'],
  [/\brest\b|sabbath|burnout|exhaust|rhythm|autopilot/, 'rest-burnout'],
  [/parent|\bmom\b|\bdad\b|child|family|discipline/, 'parenting-family'],
  [/discern|hear god|god.?s voice|spiritual dry|quiet time/, 'hearing-god'],
  [/lonel|friend|belong|isolat|outsider|unseen|invisible|seen/, 'loneliness-belonging'],
  [/identity|worth|who (am|are) (i|you)|chosen|beloved|\benough\b/, 'identity'],
  [/gift|disciplin|virtue|beatitude|fruit of the spirit|prayer style/, 'discipleship'],
];

export function themeForStruggle(struggle: string | undefined, title = ''): Theme | null {
  const hay = `${struggle ?? ''} ${title}`.toLowerCase();
  for (const [re, theme] of RULES) {
    if (re.test(hay)) return theme;
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/themes.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/themes.ts tests/themes.test.ts
git commit -m "feat(catalog): add theme vocabulary + struggle->theme heuristic"
```

---

## Task 2: Add `theme` to the quiz schema

**Files:**
- Modify: `lib/schema.ts` (the `TestBase` object)

- [ ] **Step 1: Add the field**

In `lib/schema.ts`, inside `TestBase = z.object({ ... })`, add `theme` after `category`:

```ts
  category: z.enum(['bible-character', 'spiritual-profile', 'bible-iq']),
  theme: z.string().optional(),
  estimatedMinutes: z.number().int().positive(),
```

(Optional string, not a Zod enum, so a stray value never crashes the runtime loader — the build gate in Task 4 enforces the vocabulary instead.)

- [ ] **Step 2: Verify existing tests still pass**

Run: `pnpm exec vitest run tests/test-loader.test.ts`
Expected: PASS (schema change is additive/optional).

- [ ] **Step 3: Commit**

```bash
git add lib/schema.ts
git commit -m "feat(schema): add optional theme field to TestBase"
```

---

## Task 3: Backfill `theme` onto all existing quizzes

**Files:**
- Create: `scripts/backfill-themes.ts`
- Modify: every `content/tests/**/*.json` (adds a `theme` key)

- [ ] **Step 1: Write the backfill script**

```ts
// scripts/backfill-themes.ts
// One-time (re-runnable): writes a `theme` onto every quiz JSON. Source of theme:
//   1) OVERRIDES (slug -> theme) for originals + known exceptions
//   2) themeForStruggle(struggle from topic-backlog.tsv, title)
//   3) mode fallback (knowledge -> bible-knowledge)
// Any quiz left unresolved is printed; add it to OVERRIDES and re-run until 0.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { themeForStruggle, isValidTheme, type Theme } from '@/lib/themes';

const ROOT = join(process.cwd(), 'content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'] as const;
const TSV = join(process.cwd(), 'content', 'topic-backlog.tsv');

// Hand-tagged themes for the original quizzes (not in the backlog TSV) and any
// autoresearch quiz the heuristic mis-tags. Extend as needed, then re-run.
const OVERRIDES: Record<string, Theme> = {
  'which-apostle-are-you': 'scripture-archetype',
  'which-prophet-are-you': 'scripture-archetype',
  'which-bible-character-are-you': 'scripture-archetype',
  'which-woman-of-the-bible-are-you': 'scripture-archetype',
  'which-bible-animal-are-you': 'scripture-archetype',
  'which-christmas-character-are-you': 'scripture-archetype',
  'which-bible-story-are-you-living': 'scripture-archetype',
  'which-parable-describes-your-life': 'scripture-archetype',
  'which-beatitude-defines-you': 'discipleship',
  'which-fruit-of-the-spirit-are-you': 'discipleship',
  'mary-or-martha': 'discipleship',
  'beatitudes-profile': 'discipleship',
  'prayer-style-profile': 'discipleship',
  'spiritual-gifts-profile': 'discipleship',
  'spiritual-discipline-recommender': 'discipleship',
  'virtues-and-vices-profile': 'discipleship',
  'genesis-iq': 'bible-knowledge',
  'parables-iq': 'bible-knowledge',
  'verse-or-quote': 'bible-knowledge',
  'bible-doubters-iq': 'bible-knowledge',
};

function struggleBySlug(): Map<string, string> {
  const map = new Map<string, string>();
  const lines = readFileSync(TSV, 'utf-8').split(/\r?\n/);
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const slug = cols[2], struggle = cols[4];
    if (slug) map.set(slug, struggle ?? '');
  }
  return map;
}

function main() {
  const struggles = struggleBySlug();
  const unresolved: string[] = [];
  let written = 0;

  for (const bucket of BUCKETS) {
    const dir = join(ROOT, bucket);
    for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const path = join(dir, file);
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      const slug: string = raw.slug;

      let theme: Theme | null =
        OVERRIDES[slug] ??
        themeForStruggle(struggles.get(slug), raw.title) ??
        (raw.mode === 'knowledge' ? 'bible-knowledge' : null);

      if (!isValidTheme(theme ?? undefined)) { unresolved.push(slug); continue; }

      if (raw.theme !== theme) {
        raw.theme = theme;
        writeFileSync(path, JSON.stringify(raw, null, 2) + '\n');
        written++;
      }
    }
  }

  console.log(`backfill-themes: wrote ${written} file(s)`);
  if (unresolved.length) {
    console.error(`⚠ ${unresolved.length} unresolved (add to OVERRIDES):`);
    unresolved.forEach(s => console.error('  ' + s));
    process.exit(1);
  }
}
main();
```

- [ ] **Step 2: Run it, resolve stragglers, repeat until clean**

Run: `pnpm exec tsx scripts/backfill-themes.ts`
If it exits 1 with an "unresolved" list, add each slug to `OVERRIDES` with the right theme and re-run. Repeat until: `backfill-themes: wrote N file(s)` and exit 0.

- [ ] **Step 3: Spot-check a few files**

Run: `pnpm exec vitest run tests/test-loader.test.ts`
Expected: PASS (all JSON still valid). Open 3-4 quiz JSONs and confirm each now has a sensible `theme`.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-themes.ts content/tests
git commit -m "feat(catalog): backfill theme onto all existing quizzes"
```

---

## Task 4: Enforce `theme` in validate-tests

**Files:**
- Modify: `scripts/validate-tests.ts`

- [ ] **Step 1: Add the check**

Add the import at the top:

```ts
import { loadAllTests, isPublished } from '@/lib/test-loader';
import { isValidTheme } from '@/lib/themes';
```

Inside `main()`, in the per-test loop (after the scripture checks, still inside `for (const t of tests)`), add:

```ts
    if (!isValidTheme(t.theme)) {
      console.error(`❌ ${t.slug} → invalid or missing theme: ${t.theme ?? '(none)'}`);
      errors++;
    }
```

- [ ] **Step 2: Run validation**

Run: `pnpm validate:tests`
Expected: `✅ Validated 220 test(s) · 70 live, 150 backlog` and exit 0 (every quiz now has a valid theme).

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-tests.ts
git commit -m "feat(catalog): require a valid theme on every quiz at build time"
```

---

## Task 5: Pure catalog module

**Files:**
- Create: `lib/catalog.ts`
- Test: `tests/catalog.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/catalog.test.ts
import { describe, it, expect } from 'vitest';
import { buildCatalog, renderCatalogMarkdown } from '@/lib/catalog';
import type { Test } from '@/lib/schema';

const t = (over: Partial<Test>): Test => ({
  slug: 'x', title: 'X', lang: 'en', category: 'bible-character',
  theme: 'identity', estimatedMinutes: 4, mode: 'archetype',
  questions: [], results: {}, ...over,
} as Test);

describe('buildCatalog', () => {
  const entries = buildCatalog({
    tests: [
      t({ slug: 'a', title: 'A', theme: 'identity' }),
      t({ slug: 'b', title: 'B', theme: 'anxiety', category: 'spiritual-profile', mode: 'profile' }),
    ],
    published: new Set(['a']),
    covers: new Set(['b']),
    virality: new Map([['a', 95]]),
  });

  it('marks live vs backlog', () => {
    expect(entries.find(e => e.slug === 'a')!.status).toBe('live');
    expect(entries.find(e => e.slug === 'b')!.status).toBe('backlog');
  });
  it('reports cover + virality', () => {
    expect(entries.find(e => e.slug === 'b')!.hasCover).toBe(true);
    expect(entries.find(e => e.slug === 'a')!.virality).toBe(95);
    expect(entries.find(e => e.slug === 'b')!.virality).toBeNull();
  });
});

describe('renderCatalogMarkdown', () => {
  it('includes a summary line and a table', () => {
    const md = renderCatalogMarkdown(buildCatalog({
      tests: [t({ slug: 'a', title: 'A' })],
      published: new Set(['a']), covers: new Set(), virality: new Map(),
    }));
    expect(md).toContain('1** quizzes');
    expect(md).toContain('| Title |');
    expect(md).toContain('`a`');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/catalog.test.ts`
Expected: FAIL — cannot resolve `@/lib/catalog`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/catalog.ts
import type { Test } from './schema';

export interface CatalogEntry {
  slug: string;
  title: string;
  category: Test['category'];
  theme: string;
  mode: Test['mode'];
  status: 'live' | 'backlog';
  hasCover: boolean;
  virality: number | null;
}

export interface CatalogInputs {
  tests: Test[];
  published: Set<string>;
  covers: Set<string>;            // slugs (no extension) that have a cover
  virality: Map<string, number>;  // slug -> score
}

export function buildCatalog(inp: CatalogInputs): CatalogEntry[] {
  return inp.tests
    .map((t): CatalogEntry => ({
      slug: t.slug,
      title: t.title,
      category: t.category,
      theme: t.theme ?? 'unclassified',
      mode: t.mode,
      status: inp.published.has(t.slug) ? 'live' : 'backlog',
      hasCover: inp.covers.has(t.slug),
      virality: inp.virality.get(t.slug) ?? null,
    }))
    .sort((a, b) =>
      a.category.localeCompare(b.category) ||
      a.theme.localeCompare(b.theme) ||
      (b.virality ?? 0) - (a.virality ?? 0) ||
      a.title.localeCompare(b.title));
}

function groupBy<T>(items: T[], key: (i: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const i of items) {
    const k = key(i);
    const arr = m.get(k);
    if (arr) arr.push(i); else m.set(k, [i]);
  }
  return m;
}

export function renderCatalogMarkdown(entries: CatalogEntry[]): string {
  const live = entries.filter(e => e.status === 'live').length;
  const cover = entries.filter(e => e.hasCover).length;
  const out: string[] = [];
  out.push('# Parable quiz catalog', '');
  out.push('_Generated by `pnpm build:catalog`. Do not edit by hand._', '');
  out.push(`**${entries.length}** quizzes · **${live}** live · **${entries.length - live}** backlog · **${cover}** with cover art`, '');

  for (const [cat, catEntries] of [...groupBy(entries, e => e.category)].sort()) {
    out.push(`## ${cat} (${catEntries.length})`, '');
    for (const [theme, themeEntries] of [...groupBy(catEntries, e => e.theme)].sort()) {
      out.push(`### ${theme} (${themeEntries.length})`, '');
      out.push('| Title | Slug | Status | Cover | Virality |', '| --- | --- | --- | --- | --- |');
      for (const e of themeEntries) {
        out.push(`| ${e.title} | \`${e.slug}\` | ${e.status === 'live' ? '**LIVE**' : 'backlog'} | ${e.hasCover ? '✓' : '–'} | ${e.virality ?? '–'} |`);
      }
      out.push('');
    }
  }
  return out.join('\n') + '\n';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/catalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/catalog.ts tests/catalog.test.ts
git commit -m "feat(catalog): pure buildCatalog + markdown renderer"
```

---

## Task 6: Catalog build script + wiring

**Files:**
- Create: `scripts/build-catalog.ts`
- Create (generated): `content/generated/catalog.json`, `docs/catalog.md`
- Modify: `package.json`

- [ ] **Step 1: Write the IO script**

```ts
// scripts/build-catalog.ts
// Reads the source of truth and writes content/generated/catalog.json +
// docs/catalog.md. Pure logic lives in lib/catalog.ts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAllTests } from '@/lib/test-loader';
import { buildCatalog, renderCatalogMarkdown } from '@/lib/catalog';
import publishedSlugs from '@/content/published.json';
import coverManifest from '@/content/generated/cover-manifest.json';

const TSV = join(process.cwd(), 'content', 'topic-backlog.tsv');
const OUT_JSON = join(process.cwd(), 'content', 'generated', 'catalog.json');
const OUT_MD = join(process.cwd(), 'docs', 'catalog.md');

function viralityBySlug(): Map<string, number> {
  const m = new Map<string, number>();
  for (const line of readFileSync(TSV, 'utf-8').split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const slug = cols[2];
    const score = Number(cols[7]);
    if (slug && Number.isFinite(score)) m.set(slug, score);
  }
  return m;
}

function main() {
  const tests = loadAllTests();
  const published = new Set(publishedSlugs as string[]);
  const covers = new Set(
    (coverManifest as string[]).map(f => f.replace(/\.(jpg|jpeg|webp|png)$/i, '')),
  );
  const entries = buildCatalog({ tests, published, covers, virality: viralityBySlug() });

  mkdirSync(join(process.cwd(), 'content', 'generated'), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(entries, null, 2) + '\n');
  writeFileSync(OUT_MD, renderCatalogMarkdown(entries));

  const live = entries.filter(e => e.status === 'live').length;
  console.log(`build-catalog: ${entries.length} quizzes (${live} live) -> catalog.json + docs/catalog.md`);
}
main();
```

- [ ] **Step 2: Wire into package.json**

In `package.json` `scripts`, add `build:catalog` and insert it into `build` (after `build:art`):

```json
    "build:art": "tsx scripts/build-art-manifest.ts",
    "build:catalog": "tsx scripts/build-catalog.ts",
    "build": "pnpm build:art && pnpm build:catalog && next build",
```

(`vercel.ts` already runs `pnpm build`, so the catalog regenerates on every deploy.)

- [ ] **Step 3: Generate the catalog**

Run: `pnpm build:catalog`
Expected: `build-catalog: 220 quizzes (70 live) -> catalog.json + docs/catalog.md`. Open `docs/catalog.md` and confirm it groups by category → theme with LIVE/backlog, cover, and virality columns.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-catalog.ts package.json content/generated/catalog.json docs/catalog.md
git commit -m "feat(catalog): generate catalog.json + docs/catalog.md on build"
```

- [ ] **Step 5: Full build smoke**

Run: `pnpm build`
Expected: build:art → build:catalog → next build all succeed (exit 0).

---

# PHASE 2 — Autoresearch + Build 40 Bible Quizzes

> Content tasks. The acceptance gate is `pnpm validate:tests` (schema + scripture + theme) passing and the file counts increasing. Reuse the authoring contract in `docs/research/_authoring-spec.md` and `docs/authoring-prompt.md`, and the humanizer + ASV workflow already used for the 200.

## Task 7: Research the 40 Bible topics

**Files:**
- Modify: `content/topic-backlog.tsv` (append rows)
- Create: `docs/research/bible-expansion-shortlist.md` (the chosen 40)

- [ ] **Step 1: Run autoresearch scoped to Bible content**

Invoke the `autoresearch` skill with the goal: *find high-demand Bible-content quiz topics* — split into (a) Bible knowledge/trivia ("how well do you know X", recall) and (b) Scripture-character archetypes ("which biblical ___ are you"). Ground each in real signals (search volume, YouTube titles, Reddit, existing quiz sites). Produce ~50 candidates with a `virality_score` and `evidence`.

- [ ] **Step 2: Dedupe + select**

Load existing slugs (`pnpm exec tsx -e "import('./lib/test-loader.ts').then(m=>console.log(m.loadAllTests().map(t=>t.slug).join('\n')))"`). Drop any candidate whose topic/slug duplicates an existing quiz. Select the top **20 knowledge** + top **20 archetype** by score.

- [ ] **Step 3: Append to the backlog TSV + write shortlist**

Append 40 rows to `content/topic-backlog.tsv` using the existing columns (`id` continues the max id; `bucket` = `knowledge` or `archetype`; fill `struggle` with a Bible-content tag like `bible-knowledge`/`scripture-archetype`, `result_set`, `viral_angle`, `virality_score`, `evidence`). List the 40 chosen (title, slug, bucket, score) in `docs/research/bible-expansion-shortlist.md`.

- [ ] **Step 4: Commit**

```bash
git add content/topic-backlog.tsv docs/research/bible-expansion-shortlist.md
git commit -m "research(bible): shortlist 40 Bible quiz topics (20 knowledge + 20 archetype)"
```

## Task 8: Build the ~20 knowledge quizzes

**Files:**
- Create: `content/tests/knowledge/<slug>.json` × ~20

- [ ] **Step 1: Author each quiz JSON**

For each shortlisted knowledge topic, create a JSON matching the `knowledge` schema (see `content/tests/knowledge/genesis-iq.json` as the reference shape):
`slug` (= filename), `title`, `subtitle`, `lang: "en"`, `category: "bible-iq"`, `theme: "bible-knowledge"`, `estimatedMinutes`, `mode: "knowledge"`, `questions[]` (each option `{text, correct, explanation}`, exactly one `correct: true`), and `scoring` `{perfectMessage, gradeBands[]}` covering 0–100. Any verse quoted in an explanation must be **ASV** wording with the reference labeled (e.g. "(Genesis 1:1, ASV)").

- [ ] **Step 2: Humanize**

Run the `humanizer` skill over every new file's prose (questions, explanations, messages). Remove AI tells; zero em-dashes.

- [ ] **Step 3: Validate**

Run: `pnpm validate:tests`
Expected: exit 0; the count rises by the number of files added (e.g. `Validated 240 test(s)`).

- [ ] **Step 4: Commit**

```bash
git add content/tests/knowledge
git commit -m "feat(content): add ~20 Bible knowledge quizzes (humanized, ASV)"
```

## Task 9: Build the ~20 Scripture-archetype quizzes

**Files:**
- Create: `content/tests/archetype/<slug>.json` × ~20

- [ ] **Step 1: Author each quiz JSON**

For each shortlisted archetype topic, create a JSON matching the `archetype` schema (reference: `content/tests/archetype/which-prophet-are-you.json`):
`slug`, `title`, `subtitle`, `lang`, `category: "bible-character"`, `theme: "scripture-archetype"`, `estimatedMinutes`, `mode: "archetype"`, `questions[]` (each option `{text, weights}` where weights map to result keys), and `results` (each `{name, emoji, traits[], description, scripture` inline ASV `or scriptureRef, cardVerse}`). Every result needs scripture (inline ASV or a resolvable ref) — `validate-tests` enforces this.

- [ ] **Step 2: Humanize**

Run the `humanizer` skill over all new prose.

- [ ] **Step 3: Validate**

Run: `pnpm validate:tests`
Expected: exit 0; total ≈ 260 (`Validated 260 test(s)`).

- [ ] **Step 4: Regenerate catalog + commit**

```bash
pnpm build:catalog
git add content/tests/archetype content/generated/catalog.json docs/catalog.md
git commit -m "feat(content): add ~20 Scripture-archetype quizzes (humanized, ASV)"
```

---

# PHASE 3 — Launch Wiring

## Task 10: Publish all Bible quizzes + regenerate catalog

**Files:**
- Modify: `content/published.json`
- (Verify) `app/page.tsx`, `components/HomeNav.tsx`

- [ ] **Step 1: Add the Bible slugs to the allowlist**

Append to `content/published.json`: the 4 existing IQ slugs (`genesis-iq`, `parables-iq`, `verse-or-quote`, `bible-doubters-iq`) + the 40 new slugs (from `docs/research/bible-expansion-shortlist.md`). **Decision point:** also consider promoting the ~11 original Scripture-archetype quizzes (`which-apostle-are-you`, `which-prophet-are-you`, `which-woman-of-the-bible-are-you`, etc.) for a coherent Bible-character section — confirm with the user; if yes, add them too.

- [ ] **Step 2: Validate the allowlist**

Run: `pnpm validate:tests`
Expected: exit 0; the live count reflects the additions (e.g. `70 live` → `114 live`). The build fails here if any published slug has no quiz file.

- [ ] **Step 3: Verify homepage + nav**

Confirm `app/page.tsx` renders the now-populated `knowledge` section (id `knowledge`) and that `components/HomeNav.tsx`'s "Bible IQ" link (`/#knowledge`) now resolves to it. The new Scripture archetypes appear under the `archetype` section. No code change needed unless the nav anchor/label is wrong — fix if so.

- [ ] **Step 4: Regenerate catalog + full build**

Run: `pnpm build:catalog && pnpm build`
Expected: catalog shows the new live count; `next build` generates ~114+ `/q/[slug]` paths; exit 0.

- [ ] **Step 5: Commit + push**

```bash
git add content/published.json content/generated/catalog.json docs/catalog.md
git commit -m "feat(catalog): launch all Bible quizzes live (knowledge + Scripture archetypes)"
git push origin main
```

---

## Self-Review (completed during planning)

- **Spec coverage:** theme field (Task 2), vocabulary (Task 1), backfill all 260 (Task 3), validation gate (Task 4), catalog json+md (Tasks 5-6), build wiring (Task 6), autoresearch (Task 7), 20 knowledge + 20 archetype (Tasks 8-9), publish 44 (Task 10), homepage/nav (Task 10). All spec sections covered.
- **Type consistency:** `Theme`, `isValidTheme`, `themeForStruggle` (Task 1) reused in Tasks 3-4. `CatalogEntry`/`CatalogInputs`/`buildCatalog`/`renderCatalogMarkdown` (Task 5) reused in Task 6. `loadAllTests`/`isPublished` already exist in `lib/test-loader.ts`.
- **Placeholder scan:** content Tasks 8-9 are necessarily procedural (40 quizzes can't be inlined), but each gives the exact schema, reference file, theme value, humanize step, and a concrete validate command as the acceptance gate.
```
