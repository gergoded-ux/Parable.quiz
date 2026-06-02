# Collectible Result Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship rarity-driven collectible result cards — a beautiful per-result trading-card image with match-strength rarity, a star rail, a flip reveal, one-tap PNG/Web-Share, and OG-as-card link previews — per `docs/superpowers/specs/2026-06-02-collectible-result-cards-design.md`.

**Architecture:** Pure logic (`lib/rarity.ts`, extended `lib/scoring.ts`, `lib/card-art.ts`) is unit-tested with TDD. Visual layers share one set of layout tokens (`lib/card-layout.ts`) used by both the server `next/og` card renderer and the live DOM card, so they match. The shareable PNG is a client snapshot of the live card; the OG route is the link preview. Illustration and card-verse are optional with emoji/main-verse fallbacks, so it ships without 1,100 assets.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · `next/og` (Satori) · `html-to-image` (client snapshot) · Web Share API · Vitest · pnpm.

**Working dir:** `C:\dev\Bible_Labs` (Windows, Git Bash). HEAD is on `main`, spec committed at `f4e04d5`.

**Commit style:** Conventional Commits. Frequent commits, one per task.

---

## Phase 0 — Dependencies & static assets

### Task 1: Install client snapshot dependency

**Files:** `package.json`

- [ ] **Step 1: Install**

```bash
pnpm add html-to-image
```

- [ ] **Step 2: Verify**

```bash
pnpm list html-to-image
```
Expected: prints a resolved version.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add html-to-image for client card snapshots"
```

---

### Task 2: Move rarity frames into public + add star SVGs

**Files:**
- Create dir: `public/cards/frames/`, `public/cards/stars/`
- Move: `docs/design/generated-cards/frames/frame_stained_glass_*.png` → `public/cards/frames/`
- Create: `public/cards/stars/{green,sapphire,purple,gold}.svg`

- [ ] **Step 1: Move the four frame PNGs into public**

```bash
mkdir -p public/cards/frames public/cards/stars
cp docs/design/generated-cards/frames/frame_stained_glass_common.png public/cards/frames/
cp docs/design/generated-cards/frames/frame_stained_glass_rare.png public/cards/frames/
cp docs/design/generated-cards/frames/frame_stained_glass_epic.png public/cards/frames/
cp docs/design/generated-cards/frames/frame_stained_glass_legendary.png public/cards/frames/
ls public/cards/frames/
```
Expected: four PNGs listed. (Originals stay in `docs/design/` as reference.)

- [ ] **Step 2: Create the four gem star SVGs**

Each is a 24×24 gold/green/etc. star with a vertical gradient. Create `public/cards/stars/green.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff0a0"/><stop offset="1" stop-color="#3d9b4a"/></linearGradient></defs><path fill="url(#g)" d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.9 5.9 20.8l1.2-6.6L2.3 9l6.6-.9z"/></svg>
```

`public/cards/stars/sapphire.svg` — same path, gradient stops `#a6d6f2` → `#2f7fc0`.
`public/cards/stars/purple.svg` — stops `#dcb6f7` → `#7c3aa0`.
`public/cards/stars/gold.svg` — stops `#f6d97a` → `#c8961f`.

(Use the identical `<path>`; only swap the two `stop-color` values and keep `id="g"`.)

- [ ] **Step 3: Commit**

```bash
git add public/cards/
git commit -m "chore(cards): add rarity frames + gem star SVG assets to public"
```

---

### Task 3: Add display fonts for the OG renderer

**Files:** Create `public/cards/fonts/` with `Cinzel-Bold.ttf`, `Cinzel-Black.ttf`, `Inter-Regular.ttf`, `Inter-Bold.ttf`, `Inter-ExtraBold.ttf`, `EBGaramond-Italic.ttf`

- [ ] **Step 1: Download the TTFs from Google Fonts**

```bash
mkdir -p public/cards/fonts
cd public/cards/fonts
curl -sL -o Cinzel-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/cinzel/static/Cinzel-Bold.ttf"
curl -sL -o Cinzel-Black.ttf "https://github.com/google/fonts/raw/main/ofl/cinzel/static/Cinzel-Black.ttf"
curl -sL -o Inter-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Regular.ttf"
curl -sL -o Inter-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Bold.ttf"
curl -sL -o Inter-ExtraBold.ttf "https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-ExtraBold.ttf"
curl -sL -o "EBGaramond-Italic.ttf" "https://github.com/google/fonts/raw/main/ofl/ebgaramond/static/EBGaramond-Italic.ttf"
cd ../../..
ls -la public/cards/fonts/
```
Expected: six `.ttf` files, each non-trivial size (>50KB). If any is tiny (<5KB) the URL 404'd — find the correct static path under `https://github.com/google/fonts/tree/main/ofl/<family>/static` and re-download.

- [ ] **Step 2: Commit**

```bash
git add public/cards/fonts/
git commit -m "chore(cards): vendor Cinzel/Inter/EB Garamond fonts for OG rendering"
```

---

## Phase 1 — Rarity (pure, TDD)

### Task 4: `lib/rarity.ts`

**Files:** Create `lib/rarity.ts`, `tests/rarity.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/rarity.test.ts
import { describe, it, expect } from 'vitest';
import { rarityFromMatch } from '@/lib/rarity';

describe('rarityFromMatch', () => {
  it('classifies common below 70', () => {
    const r = rarityFromMatch(63);
    expect(r.tier).toBe('common');
    expect(r.stars).toBe(2);
    expect(r.material).toBe('green');
    expect(r.frame).toBe('frame_stained_glass_common.png');
  });
  it('classifies rare at the 70 boundary', () => {
    expect(rarityFromMatch(70).tier).toBe('rare');
    expect(rarityFromMatch(84).tier).toBe('rare');
    expect(rarityFromMatch(70).stars).toBe(3);
    expect(rarityFromMatch(70).material).toBe('sapphire');
  });
  it('classifies epic 85-94', () => {
    expect(rarityFromMatch(85).tier).toBe('epic');
    expect(rarityFromMatch(94).tier).toBe('epic');
    expect(rarityFromMatch(85).stars).toBe(4);
    expect(rarityFromMatch(85).material).toBe('purple');
  });
  it('classifies legendary 95+', () => {
    expect(rarityFromMatch(95).tier).toBe('legendary');
    expect(rarityFromMatch(100).tier).toBe('legendary');
    expect(rarityFromMatch(95).stars).toBe(5);
    expect(rarityFromMatch(95).material).toBe('gold');
  });
  it('clamps out-of-range input', () => {
    expect(rarityFromMatch(-5).tier).toBe('common');
    expect(rarityFromMatch(150).tier).toBe('legendary');
  });
  it('exposes a label and accent hex', () => {
    expect(rarityFromMatch(98).label).toBe('Legendary');
    expect(rarityFromMatch(98).accent).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
```

- [ ] **Step 2: Run → fail**

```bash
pnpm test rarity
```
Expected: FAIL, `Cannot find module '@/lib/rarity'`.

- [ ] **Step 3: Implement `lib/rarity.ts`**

```ts
// lib/rarity.ts
export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';
export type RarityMaterial = 'green' | 'sapphire' | 'purple' | 'gold';

export interface Rarity {
  tier: RarityTier;
  label: string;
  stars: number;       // filled stars, out of 5
  material: RarityMaterial;
  accent: string;      // hex
  frame: string;       // frame asset filename under cards/frames/
}

const TABLE: Record<RarityTier, Omit<Rarity, 'tier'>> = {
  common:    { label: 'Common',    stars: 2, material: 'green',    accent: '#3d9b4a', frame: 'frame_stained_glass_common.png' },
  rare:      { label: 'Rare',      stars: 3, material: 'sapphire', accent: '#2f7fc0', frame: 'frame_stained_glass_rare.png' },
  epic:      { label: 'Epic',      stars: 4, material: 'purple',   accent: '#7c3aa0', frame: 'frame_stained_glass_epic.png' },
  legendary: { label: 'Legendary', stars: 5, material: 'gold',     accent: '#b8860b', frame: 'frame_stained_glass_legendary.png' },
};

export function rarityFromMatch(matchPct: number): Rarity {
  const m = Math.max(0, Math.min(100, matchPct));
  let tier: RarityTier;
  if (m < 70) tier = 'common';
  else if (m < 85) tier = 'rare';
  else if (m < 95) tier = 'epic';
  else tier = 'legendary';
  return { tier, ...TABLE[tier] };
}
```

- [ ] **Step 4: Run → pass**

```bash
pnpm test rarity
```
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/rarity.ts tests/rarity.test.ts
git commit -m "feat(cards): add rarity mapping from match strength"
```

---

## Phase 2 — Scoring extensions (pure, TDD)

### Task 5: `scoreArchetypeDetailed` (winner + matchPct + affinity)

**Files:** Modify `lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: Append failing tests** to `tests/scoring.test.ts`

```ts
import { scoreArchetypeDetailed } from '@/lib/scoring';

describe('scoreArchetypeDetailed', () => {
  it('returns winner, matchPct and ordered affinity', () => {
    // reuse apostleTest from earlier in this file: q1->0 (peter2,james1), q2->1 (james3)
    // totals: peter=2, james=4, john=0; total=6 -> james 67%, peter 33%, john 0%
    const r = scoreArchetypeDetailed(apostleTest, [0, 1]);
    expect(r.winner).toBe('james');
    expect(r.matchPct).toBe(67);
    expect(r.affinity[0]).toEqual({ key: 'james', name: 'James', pct: 67 });
    expect(r.affinity[1]).toEqual({ key: 'peter', name: 'Peter', pct: 33 });
    expect(r.affinity.find(a => a.key === 'john')?.pct).toBe(0);
  });
  it('matchPct is 100 when one result takes all weight', () => {
    const r = scoreArchetypeDetailed(apostleTest, [0, 0]); // peter3, james1 -> total 4, peter 75
    expect(r.winner).toBe('peter');
    expect(r.matchPct).toBe(75);
  });
});
```

- [ ] **Step 2: Run → fail**

```bash
pnpm test scoring
```
Expected: FAIL, `scoreArchetypeDetailed is not exported`.

- [ ] **Step 3: Append implementation to `lib/scoring.ts`**

```ts
export interface AffinityEntry { key: string; name: string; pct: number }
export interface ArchetypeDetail { winner: string; matchPct: number; affinity: AffinityEntry[] }

export function scoreArchetypeDetailed(test: ArchetypeTest, answers: number[]): ArchetypeDetail {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const totals: Record<string, number> = {};
  for (const key of Object.keys(test.results)) totals[key] = 0;
  let grand = 0;
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    for (const [key, w] of Object.entries(q.options[optIdx].weights)) {
      if (key in totals) { totals[key] += w; grand += w; }
    }
  });
  const winner = scoreArchetype(test, answers); // reuse tie-break logic
  const affinity: AffinityEntry[] = Object.entries(totals)
    .map(([key, pts]) => ({ key, name: test.results[key].name, pct: grand ? Math.round((pts / grand) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);
  const matchPct = affinity.find(a => a.key === winner)?.pct ?? 0;
  return { winner, matchPct, affinity };
}
```

- [ ] **Step 4: Run → pass**

```bash
pnpm test scoring
```
Expected: PASS (existing scoring tests + 2 new).

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): add scoreArchetypeDetailed with matchPct + affinity"
```

---

### Task 6: `scoreProfileDetailed` (top dimension + matchPct)

**Files:** Modify `lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: Append failing tests**

```ts
import { scoreProfileDetailed } from '@/lib/scoring';

describe('scoreProfileDetailed', () => {
  it('returns the top dimension, its matchPct, and full scores', () => {
    // reuse profileTest: answers [0,0] -> teaching 67, mercy 100, leadership 0
    const r = scoreProfileDetailed(profileTest, [0, 0]);
    expect(r.top).toBe('mercy');
    expect(r.matchPct).toBe(100);
    expect(r.scores.teaching).toBe(67);
    expect(r.scores.leadership).toBe(0);
  });
});
```

- [ ] **Step 2: Run → fail**

```bash
pnpm test scoring
```
Expected: FAIL, `scoreProfileDetailed is not exported`.

- [ ] **Step 3: Append implementation**

```ts
export interface ProfileDetail { top: string; matchPct: number; scores: Record<string, number> }

export function scoreProfileDetailed(test: ProfileTest, answers: number[]): ProfileDetail {
  const scores = scoreProfile(test, answers); // 0-100 normalized per dimension
  let top = Object.keys(scores)[0] ?? '';
  for (const [k, v] of Object.entries(scores)) if (v > (scores[top] ?? -1)) top = k;
  return { top, matchPct: scores[top] ?? 0, scores };
}
```

- [ ] **Step 4: Run → pass**

```bash
pnpm test scoring
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): add scoreProfileDetailed with matchPct"
```

---

## Phase 3 — Card-art resolver + manifest (TDD)

### Task 7: Art manifest build script

**Files:** Create `scripts/build-art-manifest.ts`, generated `content/generated/art-manifest.json`; add `package.json` script

- [ ] **Step 1: Create the script**

```ts
// scripts/build-art-manifest.ts
// Scans public/results/<slug>/<key>.(jpg|webp|png) and writes a manifest of
// which "slug/key" pairs have an illustration, so renderers know when to fall
// back to the emoji. Run at build time (works for local public/; when art moves
// to Cloudflare, keep this list in sync or regenerate from the bucket listing).
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'public', 'results');
const OUT_DIR = join(process.cwd(), 'content', 'generated');
const OUT = join(OUT_DIR, 'art-manifest.json');

function main() {
  const have: string[] = [];
  if (existsSync(ROOT)) {
    for (const slug of readdirSync(ROOT)) {
      const dir = join(ROOT, slug);
      if (!statSync(dir).isDirectory()) continue;
      for (const f of readdirSync(dir)) {
        const m = f.match(/^(.+)\.(jpg|jpeg|webp|png)$/i);
        if (m) have.push(`${slug}/${m[1]}`);
      }
    }
  }
  have.sort();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(have, null, 2) + '\n');
  console.log(`art-manifest: ${have.length} illustration(s)`);
}
main();
```

- [ ] **Step 2: Add script + wire into build in `package.json`**

Add to `"scripts"`:
```json
"build:art": "tsx scripts/build-art-manifest.ts"
```
Change the existing `"build"` script to run it first:
```json
"build": "pnpm build:art && next build"
```
(Leave `validate:tests` where it is in `vercel.ts`'s buildCommand; add `build:art` there too in Task 16.)

- [ ] **Step 3: Run it (generates the manifest with the 2 pilot images)**

```bash
pnpm build:art
cat content/generated/art-manifest.json
```
Expected: `art-manifest: 2 illustration(s)` and JSON listing `are-you-a-leah-or-a-rachel/leah` and `.../rachel`.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-art-manifest.ts content/generated/art-manifest.json package.json
git commit -m "feat(cards): art manifest build script (illustration presence)"
```

---

### Task 8: `lib/card-art.ts` (TDD)

**Files:** Create `lib/card-art.ts`, `tests/card-art.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/card-art.test.ts
import { describe, it, expect } from 'vitest';
import { hasIllustration, artUrl } from '@/lib/card-art';

describe('card-art', () => {
  it('reports illustration present for the pilot leah card', () => {
    expect(hasIllustration('are-you-a-leah-or-a-rachel', 'leah')).toBe(true);
  });
  it('reports no illustration for an unknown result', () => {
    expect(hasIllustration('which-apostle-are-you', 'peter')).toBe(false);
  });
  it('builds a url under the configured base', () => {
    expect(artUrl('are-you-a-leah-or-a-rachel', 'leah')).toMatch(/\/results\/are-you-a-leah-or-a-rachel\/leah\.jpg$/);
  });
});
```

- [ ] **Step 2: Run → fail**

```bash
pnpm test card-art
```
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/card-art.ts`**

```ts
// lib/card-art.ts
import manifest from '@/content/generated/art-manifest.json';

// '' => same-origin (served from /public). Set CARD_ART_BASE to a Cloudflare
// base URL later (e.g. https://cdn.example.com) with no trailing slash.
const BASE = (process.env.CARD_ART_BASE ?? '').replace(/\/$/, '');
const HAVE = new Set(manifest as string[]);

export function hasIllustration(slug: string, key: string): boolean {
  return HAVE.has(`${slug}/${key}`);
}

export function artUrl(slug: string, key: string, ext: 'jpg' | 'webp' = 'jpg'): string {
  return `${BASE}/results/${slug}/${key}.${ext}`;
}

export function frameUrl(frameFile: string): string {
  return `${BASE}/cards/frames/${frameFile}`;
}

export function starUrl(material: string): string {
  return `${BASE}/cards/stars/${material}.svg`;
}
```

- [ ] **Step 4: Run → pass**

```bash
pnpm test card-art
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/card-art.ts tests/card-art.test.ts
git commit -m "feat(cards): card-art resolver with manifest-based fallback"
```

---

## Phase 4 — Schema: optional cardVerse (TDD)

### Task 9: Add `cardVerse` to result schemas

**Files:** Modify `lib/schema.ts`, `tests/schema.test.ts`

- [ ] **Step 1: Append failing test** to `tests/schema.test.ts`

```ts
describe('cardVerse', () => {
  it('accepts an archetype result with an optional cardVerse', () => {
    const r = ArchetypeTest.safeParse({
      slug: 's', title: 't', lang: 'en', category: 'bible-character', estimatedMinutes: 1,
      mode: 'archetype',
      questions: [{ text: 'q', options: [{ text: 'a', weights: { x: 1 } }, { text: 'b', weights: { y: 1 } }] }],
      results: { x: { name: 'X', emoji: '⚓', traits: ['a'], description: 'd',
        scripture: { text: 'long verse', reference: 'Gen 1:1' },
        cardVerse: { text: 'short', reference: 'Gen 1:1', translation: 'ASV' } } },
    });
    expect(r.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run → fail** (it will actually PASS-parse only if cardVerse is allowed; Zod objects are non-strict by default and ignore unknown keys, so this test would falsely pass). To make it a real test, assert the parsed value keeps `cardVerse`:

Replace the assertion with:
```ts
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.results.x.cardVerse?.text).toBe('short');
```
Now run:
```bash
pnpm test schema
```
Expected: FAIL — `cardVerse` is stripped (undefined) because the schema doesn't define it.

- [ ] **Step 3: Add `cardVerse` to both result schemas in `lib/schema.ts`**

In `ArchetypeResult` and `ProfileResult`, add after the `scripture` line:
```ts
  cardVerse: InlineScripture.optional(),
```
(Both already import/define `InlineScripture`.)

- [ ] **Step 4: Run → pass**

```bash
pnpm test schema
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat(schema): optional cardVerse on archetype/profile results"
```

---

## Phase 5 — Shared layout tokens + Star component

### Task 10: `lib/card-layout.ts` (shared tokens)

**Files:** Create `lib/card-layout.ts`

- [ ] **Step 1: Create the tokens module**

```ts
// lib/card-layout.ts
// Single source of truth for card colors/fonts so the live DOM card and the
// server next/og card render identically.
export const CARD = {
  width: 1080,
  height: 1350,
  fonts: { display: 'Cinzel', body: 'Inter', serifItalic: 'EB Garamond' },
  panel: { bg: 'rgba(253,250,238,0.95)', border: 'rgba(212,175,55,0.6)' },
  ink: { strong: '#3a2410', body: '#4a2f15', soft: '#7a5a2a', mute: '#a9762e', wm: '#6b4423' },
  star: {
    green:    { from: '#bff0a0', to: '#3d9b4a' },
    sapphire: { from: '#a6d6f2', to: '#2f7fc0' },
    purple:   { from: '#dcb6f7', to: '#7c3aa0' },
    gold:     { from: '#f6d97a', to: '#c8961f' },
  },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add lib/card-layout.ts
git commit -m "feat(cards): shared card layout tokens"
```

---

### Task 11: `<Star>` SVG component (used by live card)

**Files:** Create `components/card/Star.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/card/Star.tsx
import { CARD } from '@/lib/card-layout';
import type { RarityMaterial } from '@/lib/rarity';

export function Star({ filled, material, size = 16 }: { filled: boolean; material: RarityMaterial; size?: number }) {
  const id = `star-${material}-${filled ? 'on' : 'off'}`;
  const { from, to } = CARD.star[material];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={filled ? from : '#d9cdb6'} />
          <stop offset="1" stopColor={filled ? to : '#c2b394'} />
        </linearGradient>
      </defs>
      <path fill={filled ? `url(#${id})` : 'rgba(107,68,35,0.20)'}
        d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.9 5.9 20.8l1.2-6.6L2.3 9l6.6-.9z" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/card/Star.tsx
git commit -m "feat(cards): Star SVG component"
```

---

### Task 12: `<StarRail>` component

**Files:** Create `components/card/StarRail.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/card/StarRail.tsx
import { Star } from './Star';
import type { RarityMaterial } from '@/lib/rarity';

export function StarRail({ filled, material, size = 16 }: { filled: number; material: RarityMaterial; size?: number }) {
  return (
    <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < filled} material={material} size={size} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/card/StarRail.tsx
git commit -m "feat(cards): StarRail component"
```

---

### Task 13: `<CardStatArea>` component

**Files:** Create `components/card/CardStatArea.tsx`

- [ ] **Step 1: Implement** (affinity rows for archetype, dimension rows for profile, knowledge band line)

```tsx
// components/card/CardStatArea.tsx
import { CARD } from '@/lib/card-layout';

export interface StatRow { label: string; value: number } // value 0-100, shown as "value%" or "value"

export function CardStatArea({ rows, suffix = '%', heading }: { rows: StatRow[]; suffix?: string; heading?: string }) {
  return (
    <div style={{ width: '92%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {heading && <div style={{ fontFamily: CARD.fonts.body, fontSize: 9, letterSpacing: 2, color: CARD.ink.mute, fontWeight: 800 }}>{heading}</div>}
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: CARD.fonts.body, fontSize: 11, color: CARD.ink.strong }}>
          <span style={{ width: 70, textAlign: 'left', fontWeight: 600 }}>{r.label}</span>
          <span style={{ flex: 1, height: 6, background: 'rgba(120,74,13,0.18)', borderRadius: 9, overflow: 'hidden', display: 'flex' }}>
            <span style={{ width: `${Math.max(0, Math.min(100, r.value))}%`, height: '100%', borderRadius: 9, background: 'linear-gradient(90deg,#b8932f,#6b4423)' }} />
          </span>
          <span style={{ width: 30, textAlign: 'right', fontWeight: 800 }}>{r.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/card/CardStatArea.tsx
git commit -m "feat(cards): CardStatArea (affinity / dimension bars)"
```

---

## Phase 6 — Card data assembly (TDD) + live card

### Task 14: `lib/card-data.ts` — assemble everything a card needs (TDD)

**Files:** Create `lib/card-data.ts`, `tests/card-data.test.ts`

This converts a (test, answers) — or (test, resultKey, matchPct) for the no-answers OG case — into a single `CardData` object both renderers consume.

- [ ] **Step 1: Write the failing test**

```ts
// tests/card-data.test.ts
import { describe, it, expect } from 'vitest';
import { cardDataFromResult } from '@/lib/card-data';
import { loadTestBySlug } from '@/lib/test-loader';

describe('cardDataFromResult', () => {
  it('builds card data for an archetype result with a match%', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    const cd = cardDataFromResult(test, 'leah', 88);
    expect(cd.name).toBe('Leah (overlooked but chosen)');
    expect(cd.rarity.tier).toBe('epic');      // 88 -> epic
    expect(cd.matchPct).toBe(88);
    expect(cd.hasArt).toBe(true);             // pilot illustration exists
    expect(cd.emoji).toBe('🌾');
    expect(cd.verse.reference).toBeTruthy();
    expect(cd.stat.heading).toBe('AFFINITY'); // archetype uses affinity heading
  });
  it('falls back to common when no match% is provided', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    const cd = cardDataFromResult(test, 'rachel');
    expect(cd.matchPct).toBeNull();
    expect(cd.rarity.tier).toBe('common');    // representative default
  });
});
```

- [ ] **Step 2: Run → fail**

```bash
pnpm test card-data
```
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/card-data.ts`**

```ts
// lib/card-data.ts
import type { Test } from './schema';
import { rarityFromMatch, type Rarity } from './rarity';
import { hasIllustration } from './card-art';

export interface CardData {
  slug: string;
  key: string;
  name: string;
  epithet: string | null;     // text in parens after the name, if any
  emoji: string;
  traits: string[];
  verse: { text: string; reference: string; translation?: string };
  matchPct: number | null;    // null = representative card (no personal score)
  rarity: Rarity;
  hasArt: boolean;
  stat: { heading: string; rows: { label: string; value: number }[]; suffix: string };
}

// "Leah (overlooked but chosen)" -> { base: "Leah", epithet: "Overlooked but Chosen" }
function splitName(name: string): { base: string; epithet: string | null } {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { base: name, epithet: null };
  const ep = m[2].trim();
  return { base: m[1].trim(), epithet: ep.charAt(0).toUpperCase() + ep.slice(1) };
}

export function cardDataFromResult(
  test: Test,
  key: string,
  matchPct: number | null = null,
  stat?: { heading: string; rows: { label: string; value: number }[]; suffix: string },
): CardData {
  const rarity = rarityFromMatch(matchPct ?? 0); // representative=common when null
  const base = { slug: test.slug, key, matchPct, rarity, hasArt: hasIllustration(test.slug, key) };

  if (test.mode === 'knowledge') {
    const name = `${matchPct ?? 0}%`;
    return { ...base, name, epithet: test.title, emoji: '📖', traits: [],
      verse: { text: '', reference: '' },
      stat: stat ?? { heading: 'SCORE', rows: [], suffix: '' } };
  }

  const r = test.results[key];
  const { base: nm, epithet } = splitName(r.name);
  const v = (r as { cardVerse?: typeof r.scripture }).cardVerse ?? r.scripture;
  const verse = v ? { text: v.text, reference: v.reference, translation: v.translation } : { text: '', reference: '' };
  const emoji = test.mode === 'archetype' ? r.emoji : '✨';
  const traits = test.mode === 'archetype' ? r.traits : [];
  const defaultStat = { heading: test.mode === 'profile' ? 'TOP GIFTS' : 'AFFINITY', rows: [], suffix: '%' };
  return { ...base, name: r.name, epithet: epithet, emoji, traits, verse, stat: stat ?? defaultStat };
}
```

Note: `name` is kept full for `splitName` consumers; the live/OG card uses `splitName(name)` for display. Adjust the test if you prefer `cd.name` to be the base — here `cd.name` is the raw result name and `cd.epithet` is the extracted parenthetical, matching the assertions (`cd.name === 'Leah (overlooked but chosen)'`).

- [ ] **Step 4: Run → pass**

```bash
pnpm test card-data
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/card-data.ts tests/card-data.test.ts
git commit -m "feat(cards): assemble CardData from a result (+ optional match%)"
```

---

### Task 15: `<ResultCardLive>` + flip reveal, integrated into the result page

**Files:** Create `components/card/ResultCardLive.tsx`; modify `app/q/[slug]/r/[key]/page.tsx`

- [ ] **Step 1: Implement `components/card/ResultCardLive.tsx`** (client component; square image window; emoji fallback; flip reveal on mount)

```tsx
// components/card/ResultCardLive.tsx
'use client';
import { useEffect, useState } from 'react';
import { CARD } from '@/lib/card-layout';
import { StarRail } from './StarRail';
import { CardStatArea } from './CardStatArea';
import { artUrl, frameUrl } from '@/lib/card-art';
import type { CardData } from '@/lib/card-data';

function displayName(name: string) {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? m[1].trim() : name;
}

export function ResultCardLive({ data, cardRef }: { data: CardData; cardRef?: React.Ref<HTMLDivElement> }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 250); return () => clearTimeout(t); }, []);

  const name = displayName(data.name);
  const nameSize = name.length > 10 ? 24 : 30;
  const frame = frameUrl(data.rarity.frame);

  return (
    <div style={{ perspective: 1200, width: 330, margin: '0 auto' }}>
      <div ref={cardRef}
        style={{ position: 'relative', width: 330, height: 412, borderRadius: 14, transition: 'transform .7s',
          transformStyle: 'preserve-3d', transform: revealed ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
        {/* front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 14, overflow: 'hidden',
          backgroundImage: `url(${frame})`, backgroundSize: 'cover', boxShadow: '0 10px 26px rgba(80,50,20,.3)' }}>
          <div style={{ position: 'absolute', left: '16.5%', right: '16.5%', top: '18.5%', bottom: '12%',
            background: CARD.panel.bg, border: `1px solid ${CARD.panel.border}`, borderRadius: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9px 11px 9px 22px', textAlign: 'center' }}>
            <StarRail filled={data.rarity.stars} material={data.rarity.material} />
            <div style={{ fontFamily: CARD.fonts.display, fontWeight: 700, fontSize: 10, letterSpacing: 3, color: CARD.ink.wm }}>PARABLE</div>
            <div style={{ width: '100%', height: 118, marginTop: 4, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(212,175,55,.7)' }}>
              {data.hasArt
                ? <img src={artUrl(data.slug, data.key)} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, background: 'linear-gradient(160deg,#fff8ed,#f0dcc4)' }}>{data.emoji}</div>}
            </div>
            <div style={{ fontFamily: CARD.fonts.body, fontWeight: 800, fontSize: 9.5, letterSpacing: 2.5, marginTop: 6, color: data.rarity.accent }}>
              {data.rarity.tier === 'legendary' ? '✦ ' : ''}{data.rarity.label.toUpperCase()}
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }}>
              <div style={{ fontFamily: CARD.fonts.display, fontWeight: 900, fontSize: nameSize, color: CARD.ink.strong, lineHeight: 1 }}>{name}</div>
            </div>
            {data.epithet && <div style={{ fontFamily: CARD.fonts.serifItalic, fontStyle: 'italic', fontSize: 12.5, color: CARD.ink.soft }}>{data.epithet}</div>}
            {data.traits.length > 0 && <div style={{ fontFamily: CARD.fonts.body, fontWeight: 700, fontSize: 8.5, letterSpacing: .8, color: CARD.ink.body, marginTop: 5 }}>{data.traits.join(' · ').toUpperCase()}</div>}
            {data.stat.rows.length > 0 && <CardStatArea rows={data.stat.rows} suffix={data.stat.suffix} heading={data.stat.heading} />}
            {data.verse.text && <div style={{ fontFamily: CARD.fonts.serifItalic, fontStyle: 'italic', fontSize: 9.5, color: CARD.ink.body, marginTop: 7, lineHeight: 1.3 }}>&ldquo;{data.verse.text}&rdquo; — {data.verse.reference}{data.verse.translation ? ` (${data.verse.translation})` : ''}</div>}
            {data.matchPct !== null && <div style={{ fontFamily: CARD.fonts.body, fontSize: 7, letterSpacing: 1.5, color: CARD.ink.mute, marginTop: 4, fontWeight: 700 }}>{data.matchPct}% MATCH</div>}
          </div>
        </div>
        {/* back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 14,
          backgroundImage: `url(${frame})`, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px rgba(80,50,20,.3)' }}>
          <div style={{ fontFamily: CARD.fonts.display, fontWeight: 900, fontSize: 40, color: 'rgba(253,250,238,.85)' }}>✦</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the result page.** In `app/q/[slug]/r/[key]/page.tsx`, build `CardData` and render `<ResultCardLive>` above the existing `<ResultCard>` (keep ResultCard for the textual result body). At the top of the default export, after `const test = loadTestBySlug(slug)`:

```tsx
  // Representative card on the result page (no answers here): use a mid match for
  // a pleasant default; the personal score arrives via ?m= and the client snapshot.
  const { searchParams } = ... // Next 16: read from the page's searchParams prop
```

Concretely, change the signature to also receive `searchParams`:
```tsx
export default async function ResultPage({ params, searchParams }: { params: Promise<{ slug: string; key: string }>; searchParams: Promise<{ m?: string }> }) {
  const { slug, key } = await params;
  const { m } = await searchParams;
  const test = loadTestBySlug(slug);
  if (!test) notFound();
  const matchPct = m != null && m !== '' ? Math.max(0, Math.min(100, parseInt(m, 10) || 0)) : null;
  const cardData = cardDataFromResult(test, key, matchPct);
  // ...existing cardProps/shareText logic stays...
```
Then in the returned JSX, render the live card first:
```tsx
      <main className="py-8">
        <ResultCardLive data={cardData} />
        <ResultCard {...cardProps} />
        ...
```
Add imports:
```tsx
import { ResultCardLive } from '@/components/card/ResultCardLive';
import { cardDataFromResult } from '@/lib/card-data';
```

- [ ] **Step 3: Verify in dev**

```bash
pnpm dev
```
Open `http://localhost:3000/q/are-you-a-leah-or-a-rachel/r/leah` — the card flips in, shows the Leah illustration on a common (green) frame, green star rail, verse. Then `...r/leah?m=97` — legendary gold frame, 5 gold stars, "97% MATCH". Open `...r/which-apostle-are-you... /r/peter` (no art) — emoji fallback in the window. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add components/card/ResultCardLive.tsx "app/q/[slug]/r/[key]/page.tsx"
git commit -m "feat(cards): live result card with flip reveal + emoji/art fallback"
```

---

## Phase 7 — Server OG card renderer

### Task 16: Rewrite the OG route to render the full card

**Files:** Modify `app/og/[slug]/[key]/route.tsx`; modify `vercel.ts` build command

- [ ] **Step 1: Replace `app/og/[slug]/[key]/route.tsx`** with a full-card renderer that reads optional `?m=`, loads fonts + frame, composites art/emoji + panel + stars + stat + verse. Uses absolute file reads for fonts/frames (Satori needs ArrayBuffers).

```tsx
// app/og/[slug]/[key]/route.tsx
import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTestBySlug } from '@/lib/test-loader';
import { cardDataFromResult } from '@/lib/card-data';
import { CARD } from '@/lib/card-layout';

export const runtime = 'nodejs';

const FONT_DIR = join(process.cwd(), 'public', 'cards', 'fonts');
const FRAME_DIR = join(process.cwd(), 'public', 'cards', 'frames');
function font(f: string) { return readFileSync(join(FONT_DIR, f)); }
function frameDataUri(file: string) {
  const b = readFileSync(join(FRAME_DIR, file));
  return `data:image/png;base64,${b.toString('base64')}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const { slug, key } = await params;
  const url = new URL(req.url);
  const mRaw = url.searchParams.get('m');
  const matchPct = mRaw != null && mRaw !== '' ? Math.max(0, Math.min(100, parseInt(mRaw, 10) || 0)) : null;

  const test = loadTestBySlug(slug);
  const W = CARD.width, H = CARD.height;
  if (!test || (test.mode !== 'knowledge' && !test.results[key])) {
    return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', background: '#fdf5ee' }} />, { width: W, height: H });
  }
  const d = cardDataFromResult(test, key, matchPct);
  const name = d.name.replace(/\s*\([^)]*\)\s*$/, '');
  const nameSize = name.length > 10 ? 64 : 84;

  const starColor = (on: boolean) => on ? CARD.star[d.rarity.material].to : 'rgba(107,68,35,0.25)';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex',
        backgroundImage: `url(${frameDataUri(d.rarity.frame)})`, backgroundSize: '1080px 1350px' }}>
        <div style={{ position: 'absolute', left: '16.5%', right: '16.5%', top: '18.5%', bottom: '12%',
          background: CARD.panel.bg, border: `3px solid ${CARD.panel.border}`, borderRadius: 34,
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 40px 30px 70px' }}>
          {/* star rail */}
          <div style={{ position: 'absolute', left: 18, top: 120, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ fontSize: 34, color: starColor(i < d.rarity.stars), display: 'flex' }}>★</div>
            ))}
          </div>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: 30, letterSpacing: 6, color: CARD.ink.wm }}>PARABLE</div>
          {/* image window */}
          <div style={{ width: 560, height: 360, marginTop: 14, borderRadius: 24, overflow: 'hidden', border: '4px solid rgba(212,175,55,.7)', display: 'flex' }}>
            {d.hasArt
              ? <img width={560} height={360} src={`${url.origin}/results/${slug}/${key}.jpg`} style={{ objectFit: 'cover' }} />
              : <div style={{ width: 560, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 180, background: 'linear-gradient(160deg,#fff8ed,#f0dcc4)' }}>{d.emoji}</div>}
          </div>
          <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 26, letterSpacing: 6, marginTop: 18, color: d.rarity.accent, display: 'flex' }}>
            {d.rarity.tier === 'legendary' ? '✦ ' : ''}{d.rarity.label.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: nameSize, color: CARD.ink.strong, marginTop: 6, display: 'flex' }}>{name}</div>
          {d.epithet && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 34, color: CARD.ink.soft, marginTop: 4, display: 'flex' }}>{d.epithet}</div>}
          {d.verse.text && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 26, color: CARD.ink.body, marginTop: 22, textAlign: 'center', display: 'flex' }}>&ldquo;{d.verse.text}&rdquo; — {d.verse.reference}{d.verse.translation ? ` (${d.verse.translation})` : ''}</div>}
          {d.matchPct !== null && <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 3, color: CARD.ink.mute, marginTop: 'auto', display: 'flex' }}>{d.matchPct}% MATCH</div>}
        </div>
      </div>
    ),
    {
      width: W, height: H,
      fonts: [
        { name: 'Cinzel', data: font('Cinzel-Bold.ttf'), weight: 700, style: 'normal' },
        { name: 'Cinzel', data: font('Cinzel-Black.ttf'), weight: 900, style: 'normal' },
        { name: 'Inter', data: font('Inter-Regular.ttf'), weight: 400, style: 'normal' },
        { name: 'Inter', data: font('Inter-Bold.ttf'), weight: 700, style: 'normal' },
        { name: 'Inter', data: font('Inter-ExtraBold.ttf'), weight: 800, style: 'normal' },
        { name: 'EB Garamond', data: font('EBGaramond-Italic.ttf'), weight: 400, style: 'italic' },
      ],
    }
  );
}
```

Notes for the engineer: Satori requires every leaf to be flex/`display:flex` when it has siblings — the `display:'flex'` on text nodes above is intentional. Stars use a solid color (the rarity's `to` hex) rather than the gem gradient; this keeps Satori happy and reads clearly at card size. (The live card keeps the gradient gem via SVG.)

- [ ] **Step 2: Keep the build green.** In `vercel.ts`, change `buildCommand` to include the art manifest:
```ts
buildCommand: 'pnpm validate:tests && pnpm build:art && pnpm build',
```
(`pnpm build` already runs `build:art`, but list it explicitly so the Vercel build is unambiguous.)

- [ ] **Step 3: Verify**

```bash
pnpm dev
```
- `http://localhost:3000/og/are-you-a-leah-or-a-rachel/leah?m=97` → 1080×1350 PNG, gold legendary frame, Leah photo, "97% MATCH".
- `http://localhost:3000/og/which-apostle-are-you/peter` → emoji-fallback card (no art), representative common frame.
Stop dev.

- [ ] **Step 4: Commit**

```bash
git add "app/og/[slug]/[key]/route.tsx" vercel.ts
git commit -m "feat(cards): render full collectible card via next/og (+ ?m=)"
```

---

### Task 17: Point result-page OG metadata at the personal card

**Files:** Modify `app/q/[slug]/r/[key]/page.tsx` (`generateMetadata`)

- [ ] **Step 1: Make `generateMetadata` read `?m=` and append it to the og image URL**

In `generateMetadata`, change the signature to also receive `searchParams` and build the image URL with the match param when present:
```tsx
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string; key: string }>; searchParams: Promise<{ m?: string }> }): Promise<Metadata> {
  const { slug, key } = await params;
  const { m } = await searchParams;
  const test = loadTestBySlug(slug);
  if (!test) return {};
  const mq = m != null && m !== '' ? `?m=${encodeURIComponent(m)}` : '';
  const ogImage = `/og/${slug}/${key}${mq}`;
  // ...keep the existing title/description logic, but set images to [ogImage] in both openGraph and twitter...
}
```

- [ ] **Step 2: Verify**

```bash
pnpm build
```
Expected: build succeeds; result pages generate. (Dynamic `?m=` is read at request time; the static page still prerenders with the no-param representative image.)

- [ ] **Step 3: Commit**

```bash
git add "app/q/[slug]/r/[key]/page.tsx"
git commit -m "feat(cards): personal card as OG preview when ?m= present"
```

---

## Phase 8 — Share flow (Web Share + PNG snapshot)

### Task 18: Extend `ShareBar` with PNG snapshot + Web Share

**Files:** Modify `components/ShareBar.tsx`; modify `app/q/[slug]/r/[key]/page.tsx` to give ShareBar the card ref + match

- [ ] **Step 1: Add a "Save / Share card" capability to `ShareBar`.** Accept an optional `cardRef` (the live card DOM node) and `matchPct`. On click: snapshot to PNG via `html-to-image`, then Web Share the file if available, else download it.

Add to the top of `ShareBar.tsx`:
```tsx
import { toPng } from 'html-to-image';
```
Add to the component props: `cardEl?: HTMLElement | null`. Add a handler + button:
```tsx
  async function shareCard() {
    if (!cardEl) return;
    track('share_click', { platform: 'card' });
    const dataUrl = await toPng(cardEl, { pixelRatio: 3, cacheBust: true });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'parable-card.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
    } else {
      const a = document.createElement('a'); a.href = dataUrl; a.download = 'parable-card.png'; a.click();
    }
  }
```
Render a primary button before the others:
```tsx
      {cardEl && <button onClick={shareCard} className="bg-brown text-white px-5 py-3 rounded-full text-sm font-semibold">✦ Share my card</button>}
```

- [ ] **Step 2: Wire the card ref through the result page.** The result page must capture the live card's DOM node and pass it to ShareBar. Since both are in a server component, introduce a tiny client wrapper `components/card/ShareableCard.tsx` that holds the ref and renders `ResultCardLive` + `ShareBar` together:

```tsx
// components/card/ShareableCard.tsx
'use client';
import { useRef, useState, useEffect } from 'react';
import { ResultCardLive } from './ResultCardLive';
import { ShareBar } from '@/components/ShareBar';
import type { CardData } from '@/lib/card-data';

export function ShareableCard({ data, shareUrl, shareText, ogImage }: { data: CardData; shareUrl: string; shareText: string; ogImage: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(ref.current); }, []);
  return (
    <>
      <ResultCardLive data={data} cardRef={ref} />
      <ShareBar url={shareUrl} text={shareText} image={ogImage} cardEl={el} />
    </>
  );
}
```

Then in `app/q/[slug]/r/[key]/page.tsx`, replace the separate `<ResultCardLive>` + `<ShareBar>` with `<ShareableCard data={cardData} shareUrl={...} shareText={shareText} ogImage={ogImageAbs} />`. Build `shareUrl` to include `?m=` when `matchPct !== null` so a copied/shared link unfurls the personal card.

- [ ] **Step 3: Verify**

```bash
pnpm dev
```
On `http://localhost:3000/q/are-you-a-leah-or-a-rachel/r/leah?m=97`, click "✦ Share my card": on desktop it downloads `parable-card.png` (open it — it's the rendered card at 3× ≈ 990×1236). Confirm no console errors. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add components/ShareBar.tsx components/card/ShareableCard.tsx "app/q/[slug]/r/[key]/page.tsx"
git commit -m "feat(cards): one-tap PNG snapshot + Web Share of the card"
```

---

## Phase 9 — Wire real match/affinity from the quiz + pilot cardVerse

### Task 19: Pass real match% + affinity from TestRunner into the result URL

**Files:** Modify `components/TestRunner.tsx`

Currently `TestRunner` navigates to `/q/{slug}/r/{resultKey}` on completion. Make it compute the detailed score and append `?m=`.

- [ ] **Step 1: Update the completion logic** in `components/TestRunner.tsx`'s `goNext()`:

```tsx
import { scoreArchetypeDetailed, scoreProfileDetailed } from '@/lib/scoring';
// ...
    let resultKey: string;
    let m = 0;
    if (test.mode === 'archetype') {
      const d = scoreArchetypeDetailed(test, answers);
      resultKey = d.winner; m = d.matchPct;
    } else if (test.mode === 'profile') {
      const d = scoreProfileDetailed(test, answers);
      resultKey = d.top; m = d.matchPct;
    } else {
      const r = scoreKnowledge(test, answers);
      resultKey = String(r.percent); m = r.percent;
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    router.push(`/q/${test.slug}/r/${resultKey}?m=${m}`);
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```
Take the Leah/Rachel quiz at `http://localhost:3000/q/are-you-a-leah-or-a-rachel`; on completion the URL has `?m=<number>` and the card rarity matches that score. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add components/TestRunner.tsx
git commit -m "feat(cards): carry real match% from quiz completion into the result"
```

---

### Task 20: Compute affinity/dimension rows on the result page

**Files:** Modify `app/q/[slug]/r/[key]/page.tsx`

The result page currently gets only `key` + `m`. To show real affinity/dimension *bars* on the representative card it would need answers (which it doesn't have). Decision per spec: the **bars** are populated only when we can derive them; from `key`+`m` alone we can show a **two-row affinity for binary archetypes** (winner = m%, runner-up = 100−m%) and otherwise omit bars (the live card still shows name/verse/rarity, and the high-fidelity personal bars appear in the client snapshot only when we later pass full data). For v1, populate the binary case:

- [ ] **Step 1: Build the stat rows for the card** in the result page, before constructing `cardData`:

```tsx
  let stat: { heading: string; rows: { label: string; value: number }[]; suffix: string } | undefined;
  if (test.mode === 'archetype' && matchPct !== null) {
    const keys = Object.keys(test.results);
    if (keys.length === 2) {
      const other = keys.find(k => k !== key)!;
      stat = { heading: 'AFFINITY', suffix: '%', rows: [
        { label: test.results[key].name.replace(/\s*\(.*$/, ''), value: matchPct },
        { label: test.results[other].name.replace(/\s*\(.*$/, ''), value: 100 - matchPct },
      ]};
    }
  }
  const cardData = cardDataFromResult(test, key, matchPct, stat);
```

(Multi-result affinity and profile dimension bars with real values are a follow-up that threads full answers through a query token; v1 ships binary affinity + rarity/verse, which covers the pilot quiz. This limit is logged here intentionally.)

- [ ] **Step 2: Verify**

```bash
pnpm dev
```
`http://localhost:3000/q/are-you-a-leah-or-a-rachel/r/leah?m=88` shows AFFINITY Leah 88% / Rachel 12%. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add "app/q/[slug]/r/[key]/page.tsx"
git commit -m "feat(cards): binary affinity bars on archetype result cards"
```

---

### Task 21: Add pilot `cardVerse` to Leah & Rachel

**Files:** Modify `content/tests/archetype/are-you-a-leah-or-a-rachel.json`

- [ ] **Step 1: Add a short, positive `cardVerse` to each result** (the long Genesis 29:31 verse stays as the result-page `scripture`; the card uses the punchier one). Use real ASV text:

For `leah`, add:
```json
"cardVerse": { "text": "Jehovah hath looked upon my affliction.", "reference": "Genesis 29:32", "translation": "ASV" }
```
For `rachel`, add:
```json
"cardVerse": { "text": "I will in no wise fail thee, neither forsake thee.", "reference": "Hebrews 13:5", "translation": "ASV" }
```

- [ ] **Step 2: Validate**

```bash
pnpm validate:tests
```
Expected: `✅ Validated 220 test(s)`.

- [ ] **Step 3: Verify the card uses the short verse**

```bash
pnpm dev
```
`http://localhost:3000/q/are-you-a-leah-or-a-rachel/r/leah?m=97` — the card shows the short Genesis 29:32 line, not the long one. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add content/tests/archetype/are-you-a-leah-or-a-rachel.json
git commit -m "content: add card verses for Leah and Rachel"
```

---

## Phase 10 — Full verification + ship

### Task 22: Full test + build + smoke

- [ ] **Step 1: Unit tests**

```bash
pnpm test
```
Expected: all green (original 30 + rarity 6 + scoring additions + card-art 3 + card-data 2 + schema cardVerse).

- [ ] **Step 2: Validate + build**

```bash
pnpm validate:tests && pnpm build
```
Expected: 220 validated, build succeeds.

- [ ] **Step 3: Production smoke**

```bash
pnpm start
```
Check (new terminal): card flip on `/q/are-you-a-leah-or-a-rachel/r/rachel?m=92`; OG PNG at `/og/are-you-a-leah-or-a-rachel/rachel?m=92` and `/og/which-apostle-are-you/peter` (emoji fallback); "Share my card" downloads a PNG. Stop server.

- [ ] **Step 4: Commit any fixes**

```bash
git commit -am "fix: card rendering polish from smoke test" || echo "nothing to fix"
```

---

### Task 23: Push

- [ ] **Step 1: Confirm gh active account + push**

```bash
gh auth status | grep -i active
git push origin main
```
(If push rejects on auth, `gh auth switch -u gergoded-ux` then retry.)

- [ ] **Step 2: Verify remote HEAD matches local**

```bash
git rev-parse --short HEAD && git rev-parse --short origin/main
```
Expected: identical.

---

## Post-launch (NOT this build — reminders)

- Generate the full illustration set per result (start with top-traffic quizzes); regenerate `art-manifest.json` (or switch `CARD_ART_BASE` to Cloudflare + a bucket-derived manifest).
- Add a `sharp` WebP conversion step; serve `.webp` with `.jpg` fallback.
- Thread full answers (or a compact token) into the result URL so multi-result affinity + profile dimension bars render with real values on the OG card too.
- Collection binder (scope C): persist pulled cards (localStorage), a `/collection` grid, "X/Y collected."
- Autoresearch A/B on card variants using live `share_click ÷ quiz_complete` as the metric.

---

## Self-review notes (plan author)

Spec coverage: §3 face → Tasks 10–16; §4 rarity → Task 4; §5 stat area → Tasks 13, 20; §6 fallbacks → Tasks 7–8 (art), 9+21 (cardVerse); §7 render paths → Tasks 15 (live+reveal), 16 (og), 18 (snapshot/Web Share), 17 (og preview); §8 production render → Tasks 3, 16; §9 data model → Tasks 5–6, 9; §10 files → all; §11 config → Tasks 8, 16; §12 testing → Tasks 4–9, 22; §13 scope deferrals → Post-launch section. Knowledge-mode card is handled in `cardDataFromResult` (Task 14) and rendered by the same components (no bars, score name).

Type consistency: `rarityFromMatch→Rarity{tier,label,stars,material,accent,frame}` used in card-data/live/og; `CardData` shape consistent across Tasks 14/15/16/18; `scoreArchetypeDetailed`/`scoreProfileDetailed` names match Tasks 5/6/19; `CARD` tokens consistent Tasks 10/13/15/16; `artUrl/frameUrl/hasIllustration` consistent Tasks 8/15/16.

Known intentional v1 limit (logged in Task 20): real multi-result affinity + profile dimension bars on the OG card require threading full answers; v1 ships binary affinity + rarity/verse, which covers the pilot. The downloaded client snapshot can still show whatever the live card shows.
