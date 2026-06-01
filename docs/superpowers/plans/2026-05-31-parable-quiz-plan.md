# Parable Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship parable.quiz — a Next.js 15 / Vercel-hosted Christian quiz site with 20 launch quizzes, viral share mechanics, auto-generated OG images, and ad-ready slots — strictly following the spec at `docs/superpowers/specs/2026-05-31-parable-quiz-design.md`.

**Architecture:** All test content lives as JSON in `content/tests/**` validated by a Zod discriminated union at build time. A generic `<TestRunner>` reads any test JSON and renders the right flow (archetype / profile / knowledge). Result pages are statically generated per result-key and serve as the viral payload; their `og:image` is generated on-demand via `@vercel/og`. No accounts, no payments, no database.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zod · @vercel/og · Vitest · Playwright (smoke only) · pnpm · Vercel (Hobby tier) · GitHub auto-deploy.

**Commit style:** Conventional Commits (`feat:`, `test:`, `chore:`, `docs:`, `style:`).

**Working directory:** `C:\dev\Bible_Labs` (already a git repo with remote `origin` → `gergoded-ux/Parable.quiz`).

---

## Phase 0 — Bootstrap

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/`
- Modify: `.gitignore` (re-add the entries Next overwrites)

- [ ] **Step 1: Preserve existing .gitignore**

```bash
cp .gitignore .gitignore.bak
```

- [ ] **Step 2: Run create-next-app into the current directory**

```bash
pnpm dlx create-next-app@latest . \
  --typescript --tailwind --app \
  --no-eslint --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm --turbopack \
  --yes
```

If it warns about existing files, accept overwrite for everything *except* the `docs/` directory (which it won't touch). Confirm `app/`, `package.json`, and config files are created.

- [ ] **Step 3: Merge .gitignore additions back in**

The generated `.gitignore` is Next's default. Append our project-specific entries:

```bash
cat >> .gitignore <<'EOF'

# Vercel
.vercel/

# Claude Code / Superpowers (local agent state, not project source)
.superpowers/
.claude/
EOF
rm .gitignore.bak
```

- [ ] **Step 4: Verify dev server starts**

```bash
pnpm dev
```

Open http://localhost:3000 — expect the default Next.js welcome page. Stop the dev server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 + Tailwind + App Router"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime libs**

```bash
pnpm add zod @vercel/og @vercel/analytics @vercel/speed-insights clsx tailwind-merge
```

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 3: Verify dependencies installed**

```bash
pnpm list zod @vercel/og vitest
```

Expect all three to print resolved versions.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add runtime and dev dependencies"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 2: Create `tests/setup.ts`**

```ts
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json` and add to `"scripts"`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "validate:tests": "tsx scripts/validate-tests.ts"
  }
}
```

- [ ] **Step 4: Install `tsx` for running TS scripts**

```bash
pnpm add -D tsx
```

- [ ] **Step 5: Run vitest with no tests to confirm config loads**

```bash
pnpm test
```

Expect: `No test files found, exiting with code 0` (or similar — Vitest exits cleanly when nothing to run).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json pnpm-lock.yaml
git commit -m "chore: configure Vitest + jsdom + testing-library"
```

---

### Task 4: Apply warm-pastel theme tokens to Tailwind

**Files:**
- Modify: `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Update `tailwind.config.ts` with theme tokens**

Replace the file entirely:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 1: '#fdf5ee', 2: '#f6e7d8' },
        sand: '#f0dcc4',
        rose: { DEFAULT: '#e8c9a7', dark: '#d4a574' },
        brown: { DEFAULT: '#6b4423', dark: '#4a2f15' },
        ink: { DEFAULT: '#2d2a26', soft: '#4a3c2e', mute: '#8a6a47' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(180,140,80,.15)',
        cardHover: '0 12px 30px rgba(80,50,20,.18)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Update `app/globals.css`**

Replace contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    background: linear-gradient(180deg, #fdf5ee 0%, #f6e7d8 100%);
    color: #2d2a26;
    font-family: 'Inter', -apple-system, sans-serif;
    min-height: 100%;
  }
}

@layer components {
  .card-hover { transition: transform .15s, box-shadow .15s; }
  .card-hover:hover { transform: translateY(-2px); }
}
```

- [ ] **Step 3: Update `app/layout.tsx` to load Inter via next/font**

Replace contents with:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Parable — What\'s your parable?', template: '%s · Parable' },
  description: '20 quizzes that reveal what scripture says about you. Always free, no sign-up.',
  metadataBase: new URL('https://parable.quiz'),
  openGraph: { siteName: 'Parable', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Sanity-check by starting dev server**

```bash
pnpm dev
```

Open http://localhost:3000 — the default Next welcome should now render on a cream-gradient background with Inter font. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat(theme): apply warm-pastel color tokens and Inter font"
```

---

### Task 5: Create `vercel.ts` project config

**Files:**
- Create: `vercel.ts`

- [ ] **Step 1: Install `@vercel/config`**

```bash
pnpm add -D @vercel/config
```

- [ ] **Step 2: Create `vercel.ts`**

```ts
// vercel.ts
import { type VercelConfig, routes } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm validate:tests && pnpm build',
  framework: 'nextjs',
  headers: [
    routes.cacheControl('/og/(.*)', { public: true, maxAge: '1 week' }),
  ],
};
```

- [ ] **Step 3: Commit**

```bash
git add vercel.ts package.json pnpm-lock.yaml
git commit -m "chore: add vercel.ts build config"
```

---

## Phase 1 — Zod schema for tests

### Task 6: Define base test schema + ScriptureRef

**Files:**
- Create: `lib/schema.ts`
- Create: `tests/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/schema.test.ts
import { describe, it, expect } from 'vitest';
import { ScriptureRef, TestBase } from '@/lib/schema';

describe('ScriptureRef', () => {
  it('accepts non-empty string', () => {
    expect(ScriptureRef.safeParse('matt-16-18').success).toBe(true);
  });
  it('rejects empty string', () => {
    expect(ScriptureRef.safeParse('').success).toBe(false);
  });
});

describe('TestBase', () => {
  it('accepts minimal valid test base', () => {
    const result = TestBase.safeParse({
      slug: 'which-apostle-are-you',
      title: 'Which Apostle Are You?',
      lang: 'en',
      category: 'bible-character',
      estimatedMinutes: 4,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't', lang: 'en',
      category: 'not-a-category', estimatedMinutes: 4,
    });
    expect(result.success).toBe(false);
  });
  it('defaults lang to "en" when missing', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't',
      category: 'bible-iq', estimatedMinutes: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lang).toBe('en');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test schema
```

Expected: FAIL with "Cannot find module '@/lib/schema'".

- [ ] **Step 3: Implement `lib/schema.ts` (base only)**

```ts
// lib/schema.ts
import { z } from 'zod';

export const ScriptureRef = z.string().min(1);

export const TestBase = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  lang: z.string().default('en'),
  category: z.enum(['bible-character', 'spiritual-profile', 'bible-iq']),
  estimatedMinutes: z.number().int().positive(),
});

export type TestBase = z.infer<typeof TestBase>;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test schema
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat(schema): add ScriptureRef + TestBase Zod schemas"
```

---

### Task 7: Add ArchetypeTest schema variant

**Files:**
- Modify: `lib/schema.ts`
- Modify: `tests/schema.test.ts`

- [ ] **Step 1: Add failing tests for ArchetypeTest**

Append to `tests/schema.test.ts`:

```ts
import { ArchetypeTest } from '@/lib/schema';

describe('ArchetypeTest', () => {
  const validArchetype = {
    slug: 'which-apostle-are-you',
    title: 'Which Apostle Are You?',
    lang: 'en',
    category: 'bible-character',
    estimatedMinutes: 4,
    mode: 'archetype' as const,
    questions: [
      {
        text: 'When a friend is hurting, you...',
        options: [
          { text: 'Sit with them quietly', weights: { john: 2 } },
          { text: 'Ask hard questions',     weights: { peter: 2 } },
        ],
      },
    ],
    results: {
      peter: {
        name: 'Peter the Bold', emoji: '🪨',
        traits: ['Loyal', 'Impulsive', 'All-in'],
        description: 'Big heart, big mistakes — and Jesus loved you anyway.',
        scriptureRef: 'matt-16-18',
      },
      john: {
        name: 'John the Beloved', emoji: '🕊️',
        traits: ['Tender', 'Steady', 'Present'],
        description: 'You hold the head of Jesus when others run.',
        scriptureRef: 'john-13-23',
      },
    },
  };

  it('accepts a valid archetype test', () => {
    const result = ArchetypeTest.safeParse(validArchetype);
    expect(result.success).toBe(true);
  });
  it('rejects when mode is wrong', () => {
    const bad = { ...validArchetype, mode: 'profile' };
    expect(ArchetypeTest.safeParse(bad).success).toBe(false);
  });
  it('rejects when a result key has no traits', () => {
    const bad = { ...validArchetype, results: { ...validArchetype.results, peter: { ...validArchetype.results.peter, traits: [] } } };
    // empty array allowed by default — only require at least one trait
    expect(ArchetypeTest.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test → expect fail**

```bash
pnpm test schema
```

Expected: FAIL with "ArchetypeTest is not exported".

- [ ] **Step 3: Add ArchetypeTest to `lib/schema.ts`**

Append:

```ts
const ArchetypeQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    weights: z.record(z.string(), z.number()),
  })).min(2),
});

const ArchetypeResult = z.object({
  name: z.string().min(1),
  emoji: z.string().min(1),
  traits: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef,
});

export const ArchetypeTest = TestBase.extend({
  mode: z.literal('archetype'),
  questions: z.array(ArchetypeQuestion).min(1),
  results: z.record(z.string(), ArchetypeResult),
});

export type ArchetypeTest = z.infer<typeof ArchetypeTest>;
```

- [ ] **Step 4: Run test → expect pass**

```bash
pnpm test schema
```

Expected: PASS — 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat(schema): add ArchetypeTest schema variant"
```

---

### Task 8: Add ProfileTest schema variant

**Files:**
- Modify: `lib/schema.ts`
- Modify: `tests/schema.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/schema.test.ts`:

```ts
import { ProfileTest } from '@/lib/schema';

describe('ProfileTest', () => {
  const validProfile = {
    slug: 'spiritual-gifts-profile',
    title: 'Spiritual Gifts Profile',
    lang: 'en',
    category: 'spiritual-profile',
    estimatedMinutes: 7,
    mode: 'profile' as const,
    dimensions: ['teaching', 'mercy', 'leadership'],
    questions: [{
      text: 'When you see a need in the community, you...',
      options: [
        { text: 'Organize others to meet it', weights: { leadership: 2 } },
        { text: 'Meet it quietly yourself',   weights: { mercy: 2 } },
      ],
    }],
    results: {
      teaching: { name: 'Teaching', description: 'You make scripture clear.' },
      mercy: { name: 'Mercy', description: 'You feel others\' pain as your own.' },
      leadership: { name: 'Leadership', description: 'You see what could be and call others into it.' },
    },
  };

  it('accepts a valid profile test', () => {
    expect(ProfileTest.safeParse(validProfile).success).toBe(true);
  });
  it('requires at least one dimension', () => {
    const bad = { ...validProfile, dimensions: [] };
    expect(ProfileTest.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test schema
```

Expected: FAIL with "ProfileTest is not exported".

- [ ] **Step 3: Add ProfileTest to `lib/schema.ts`**

Append:

```ts
const ProfileQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    weights: z.record(z.string(), z.number()),
  })).min(2),
});

const ProfileResult = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef.optional(),
});

export const ProfileTest = TestBase.extend({
  mode: z.literal('profile'),
  dimensions: z.array(z.string().min(1)).min(1),
  questions: z.array(ProfileQuestion).min(1),
  results: z.record(z.string(), ProfileResult),
});

export type ProfileTest = z.infer<typeof ProfileTest>;
```

- [ ] **Step 4: Run → expect pass**

```bash
pnpm test schema
```

Expected: PASS — 9 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat(schema): add ProfileTest schema variant"
```

---

### Task 9: Add KnowledgeTest schema variant + discriminated union

**Files:**
- Modify: `lib/schema.ts`
- Modify: `tests/schema.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/schema.test.ts`:

```ts
import { KnowledgeTest, Test } from '@/lib/schema';

describe('KnowledgeTest', () => {
  const validKnowledge = {
    slug: 'genesis-iq',
    title: 'Genesis IQ',
    lang: 'en',
    category: 'bible-iq',
    estimatedMinutes: 5,
    mode: 'knowledge' as const,
    questions: [{
      text: 'Who tempted Eve in the Garden?',
      options: [
        { text: 'The serpent', correct: true,  explanation: 'Genesis 3:1' },
        { text: 'A dragon',    correct: false },
      ],
    }],
    scoring: {
      perfectMessage: 'Eden-level scholar!',
      gradeBands: [
        { min: 0, max: 50,  label: 'Beginner', message: 'Time to crack open Genesis.' },
        { min: 51, max: 100, label: 'Strong',   message: 'You know the beginning.' },
      ],
    },
  };

  it('accepts a valid knowledge test', () => {
    expect(KnowledgeTest.safeParse(validKnowledge).success).toBe(true);
  });
  it('requires at least one question', () => {
    const bad = { ...validKnowledge, questions: [] };
    expect(KnowledgeTest.safeParse(bad).success).toBe(false);
  });
});

describe('Test (discriminated union)', () => {
  it('routes archetype mode to ArchetypeTest', () => {
    const result = Test.safeParse({
      slug: 's', title: 't', lang: 'en', category: 'bible-character', estimatedMinutes: 1,
      mode: 'archetype',
      questions: [{ text: 'q', options: [{ text: 'a', weights: { x: 1 } }, { text: 'b', weights: { y: 1 } }] }],
      results: { x: { name: 'X', emoji: '⚓', traits: ['a'], description: 'd', scriptureRef: 'r' } },
    });
    expect(result.success).toBe(true);
  });
  it('rejects unknown mode', () => {
    const result = Test.safeParse({
      slug: 's', title: 't', lang: 'en', category: 'bible-iq', estimatedMinutes: 1,
      mode: 'unknown',
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test schema
```

Expected: FAIL — `KnowledgeTest` and `Test` not exported.

- [ ] **Step 3: Add KnowledgeTest + discriminated union to `lib/schema.ts`**

Append:

```ts
const KnowledgeQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(2),
});

export const KnowledgeTest = TestBase.extend({
  mode: z.literal('knowledge'),
  questions: z.array(KnowledgeQuestion).min(1),
  scoring: z.object({
    perfectMessage: z.string().min(1),
    gradeBands: z.array(z.object({
      min: z.number().int().min(0).max(100),
      max: z.number().int().min(0).max(100),
      label: z.string().min(1),
      message: z.string().min(1),
    })).min(1),
  }),
});

export type KnowledgeTest = z.infer<typeof KnowledgeTest>;

export const Test = z.discriminatedUnion('mode', [ArchetypeTest, ProfileTest, KnowledgeTest]);
export type Test = z.infer<typeof Test>;
```

- [ ] **Step 4: Run → expect pass**

```bash
pnpm test schema
```

Expected: PASS — 13 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat(schema): add KnowledgeTest + discriminated Test union"
```

---

## Phase 2 — Scoring functions

### Task 10: Implement `scoreArchetype`

**Files:**
- Create: `lib/scoring.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreArchetype } from '@/lib/scoring';
import type { ArchetypeTest } from '@/lib/schema';

const apostleTest: ArchetypeTest = {
  slug: 'wa', title: 'Which Apostle', lang: 'en',
  category: 'bible-character', estimatedMinutes: 3,
  mode: 'archetype',
  questions: [
    {
      text: 'q1',
      options: [
        { text: 'a', weights: { peter: 2, james: 1 } },
        { text: 'b', weights: { john: 2 } },
      ],
    },
    {
      text: 'q2',
      options: [
        { text: 'a', weights: { peter: 1 } },
        { text: 'b', weights: { james: 3 } },
      ],
    },
  ],
  results: {
    peter: { name: 'Peter', emoji: '🪨', traits: ['a'], description: 'd', scriptureRef: 'r' },
    james: { name: 'James', emoji: '⚓', traits: ['a'], description: 'd', scriptureRef: 'r' },
    john:  { name: 'John',  emoji: '🕊️', traits: ['a'], description: 'd', scriptureRef: 'r' },
  },
};

describe('scoreArchetype', () => {
  it('picks the result with the highest weighted sum', () => {
    // q1 → option 0 (peter:2, james:1); q2 → option 1 (james:3)
    // totals: peter=2, james=4, john=0 → james wins
    expect(scoreArchetype(apostleTest, [0, 1])).toBe('james');
  });
  it('breaks ties by earliest-question-encountered order', () => {
    // q1 → option 0 (peter:2, james:1); q2 → option 0 (peter:1)
    // totals: peter=3, james=1, john=0 → peter wins
    expect(scoreArchetype(apostleTest, [0, 0])).toBe('peter');
  });
  it('throws when answers length does not match questions', () => {
    expect(() => scoreArchetype(apostleTest, [0])).toThrow();
  });
  it('throws when an answer index is out of bounds', () => {
    expect(() => scoreArchetype(apostleTest, [0, 5])).toThrow();
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test scoring
```

Expected: FAIL — `lib/scoring` not found.

- [ ] **Step 3: Implement `lib/scoring.ts`**

```ts
// lib/scoring.ts
import type { ArchetypeTest } from './schema';

export function scoreArchetype(test: ArchetypeTest, answers: number[]): string {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const totals: Record<string, number> = {};
  const firstSeen: Record<string, number> = {};
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    const weights = q.options[optIdx].weights;
    for (const [key, w] of Object.entries(weights)) {
      totals[key] = (totals[key] ?? 0) + w;
      if (!(key in firstSeen)) firstSeen[key] = qi;
    }
  });
  const entries = Object.entries(totals);
  if (entries.length === 0) {
    // No weights accumulated — fall back to first declared result
    return Object.keys(test.results)[0];
  }
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return firstSeen[a[0]] - firstSeen[b[0]];
  });
  return entries[0][0];
}
```

- [ ] **Step 4: Run → expect pass**

```bash
pnpm test scoring
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): implement scoreArchetype with tie-break by earliest question"
```

---

### Task 11: Implement `scoreProfile`

**Files:**
- Modify: `lib/scoring.ts`
- Modify: `tests/scoring.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/scoring.test.ts`:

```ts
import { scoreProfile } from '@/lib/scoring';
import type { ProfileTest } from '@/lib/schema';

const profileTest: ProfileTest = {
  slug: 'p', title: 'P', lang: 'en',
  category: 'spiritual-profile', estimatedMinutes: 5,
  mode: 'profile',
  dimensions: ['teaching', 'mercy', 'leadership'],
  questions: [
    {
      text: 'q1',
      options: [
        { text: 'a', weights: { teaching: 2, mercy: 1 } },
        { text: 'b', weights: { leadership: 2 } },
      ],
    },
    {
      text: 'q2',
      options: [
        { text: 'a', weights: { mercy: 2 } },
        { text: 'b', weights: { teaching: 1 } },
      ],
    },
  ],
  results: {
    teaching: { name: 'Teaching', description: 'd' },
    mercy: { name: 'Mercy', description: 'd' },
    leadership: { name: 'Leadership', description: 'd' },
  },
};

describe('scoreProfile', () => {
  it('returns normalized 0-100 score per dimension', () => {
    // q1→0 (teaching:2, mercy:1); q2→0 (mercy:2)
    // raw: teaching=2, mercy=3, leadership=0; max=3 → 67/100/0
    const r = scoreProfile(profileTest, [0, 0]);
    expect(r.teaching).toBe(67);
    expect(r.mercy).toBe(100);
    expect(r.leadership).toBe(0);
  });
  it('includes every declared dimension even if score is zero', () => {
    const r = scoreProfile(profileTest, [1, 1]);  // leadership:2 only
    expect(Object.keys(r).sort()).toEqual(['leadership', 'mercy', 'teaching']);
  });
  it('throws on answer-length mismatch', () => {
    expect(() => scoreProfile(profileTest, [0])).toThrow();
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test scoring
```

Expected: FAIL — `scoreProfile` not exported.

- [ ] **Step 3: Implement `scoreProfile`**

Append to `lib/scoring.ts`:

```ts
import type { ProfileTest } from './schema';

export function scoreProfile(test: ProfileTest, answers: number[]): Record<string, number> {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const raw: Record<string, number> = Object.fromEntries(test.dimensions.map(d => [d, 0]));
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    for (const [key, w] of Object.entries(q.options[optIdx].weights)) {
      if (key in raw) raw[key] += w;
    }
  });
  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Math.round((v / max) * 100)])
  );
}
```

- [ ] **Step 4: Run → expect pass**

```bash
pnpm test scoring
```

Expected: PASS — 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): implement scoreProfile with normalized 0-100 output"
```

---

### Task 12: Implement `scoreKnowledge`

**Files:**
- Modify: `lib/scoring.ts`
- Modify: `tests/scoring.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/scoring.test.ts`:

```ts
import { scoreKnowledge } from '@/lib/scoring';
import type { KnowledgeTest } from '@/lib/schema';

const knowledgeTest: KnowledgeTest = {
  slug: 'g', title: 'G', lang: 'en',
  category: 'bible-iq', estimatedMinutes: 4,
  mode: 'knowledge',
  questions: [
    { text: 'q1', options: [{ text: 'a', correct: true }, { text: 'b', correct: false }] },
    { text: 'q2', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] },
    { text: 'q3', options: [{ text: 'a', correct: true }, { text: 'b', correct: false }] },
    { text: 'q4', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] },
  ],
  scoring: {
    perfectMessage: 'Perfect!',
    gradeBands: [
      { min: 0,  max: 50,  label: 'Beginner', message: 'Keep reading.' },
      { min: 51, max: 99,  label: 'Strong',   message: 'Nicely done.' },
      { min: 100, max: 100, label: 'Master', message: 'Flawless.' },
    ],
  },
};

describe('scoreKnowledge', () => {
  it('returns correct/total/percent/band', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 1, 0, 1]);  // all correct
    expect(r.correct).toBe(4);
    expect(r.total).toBe(4);
    expect(r.percent).toBe(100);
    expect(r.band.label).toBe('Master');
  });
  it('selects the right band for a mid score', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 0, 0, 0]);  // 2/4 → 50%
    expect(r.percent).toBe(50);
    expect(r.band.label).toBe('Beginner');
  });
  it('returns Strong for 51-99', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 1, 0, 0]);  // 3/4 → 75%
    expect(r.band.label).toBe('Strong');
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test scoring
```

Expected: FAIL — `scoreKnowledge` not exported.

- [ ] **Step 3: Implement `scoreKnowledge`**

Append to `lib/scoring.ts`:

```ts
import type { KnowledgeTest } from './schema';

export interface KnowledgeResult {
  correct: number;
  total: number;
  percent: number;
  band: { min: number; max: number; label: string; message: string };
}

export function scoreKnowledge(test: KnowledgeTest, answers: number[]): KnowledgeResult {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  let correct = 0;
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    if (q.options[optIdx].correct) correct++;
  });
  const total = test.questions.length;
  const percent = Math.round((correct / total) * 100);
  const band = test.scoring.gradeBands.find(b => percent >= b.min && percent <= b.max)
    ?? test.scoring.gradeBands[test.scoring.gradeBands.length - 1];
  return { correct, total, percent, band };
}
```

- [ ] **Step 4: Run → expect pass**

```bash
pnpm test scoring
```

Expected: PASS — 10 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): implement scoreKnowledge with grade bands"
```

---

## Phase 3 — Content loaders + validation script

### Task 13: Write scripture loader

**Files:**
- Create: `lib/scripture.ts`
- Create: `content/shared/scriptures.json`
- Create: `tests/scripture.test.ts`

- [ ] **Step 1: Create the seed scriptures file**

```bash
mkdir -p content/shared
```

```json
// content/shared/scriptures.json
{
  "matt-16-18": {
    "text": "And on this rock I will build my church.",
    "reference": "Matthew 16:18"
  },
  "john-13-23": {
    "text": "Now there was leaning on Jesus' bosom one of his disciples, whom Jesus loved.",
    "reference": "John 13:23"
  }
}
```

- [ ] **Step 2: Write failing tests**

```ts
// tests/scripture.test.ts
import { describe, it, expect } from 'vitest';
import { getScripture, allScriptures } from '@/lib/scripture';

describe('getScripture', () => {
  it('returns the verse for a known ref', () => {
    const s = getScripture('matt-16-18');
    expect(s.reference).toBe('Matthew 16:18');
    expect(s.text).toMatch(/rock/);
  });
  it('throws on unknown ref', () => {
    expect(() => getScripture('does-not-exist')).toThrow();
  });
});

describe('allScriptures', () => {
  it('returns the full map', () => {
    expect(allScriptures()['john-13-23']).toBeDefined();
  });
});
```

- [ ] **Step 3: Run → expect fail**

```bash
pnpm test scripture
```

Expected: FAIL — `lib/scripture` not found.

- [ ] **Step 4: Implement `lib/scripture.ts`**

```ts
// lib/scripture.ts
import scriptures from '@/content/shared/scriptures.json';

export interface Scripture {
  text: string;
  reference: string;
}

const map: Record<string, Scripture> = scriptures as Record<string, Scripture>;

export function getScripture(ref: string): Scripture {
  const s = map[ref];
  if (!s) throw new Error(`Unknown scriptureRef: ${ref}`);
  return s;
}

export function allScriptures(): Record<string, Scripture> {
  return map;
}
```

- [ ] **Step 5: Run → expect pass**

```bash
pnpm test scripture
```

Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add content/shared/scriptures.json lib/scripture.ts tests/scripture.test.ts
git commit -m "feat(content): add scripture loader with seed verses"
```

---

### Task 14: Write test-loader

**Files:**
- Create: `lib/test-loader.ts`
- Create: `tests/test-loader.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/test-loader.test.ts
import { describe, it, expect } from 'vitest';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';

describe('loadAllTests', () => {
  it('returns an array (may be empty pre-content)', () => {
    const all = loadAllTests();
    expect(Array.isArray(all)).toBe(true);
  });
  it('every returned test passes the Test schema', () => {
    // Once content exists, every loaded test should already be validated
    const all = loadAllTests();
    all.forEach(t => {
      expect(['archetype', 'profile', 'knowledge']).toContain(t.mode);
    });
  });
});

describe('loadTestBySlug', () => {
  it('returns null for unknown slug', () => {
    expect(loadTestBySlug('does-not-exist')).toBeNull();
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
pnpm test test-loader
```

Expected: FAIL — `lib/test-loader` not found.

- [ ] **Step 3: Create content directories**

```bash
mkdir -p content/tests/archetype content/tests/profile content/tests/knowledge
```

- [ ] **Step 4: Implement `lib/test-loader.ts`**

```ts
// lib/test-loader.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from './schema';
import type { Test as TestType } from './schema';

const ROOT = join(process.cwd(), 'content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'] as const;

let cache: TestType[] | null = null;

export function loadAllTests(): TestType[] {
  if (cache) return cache;
  const out: TestType[] = [];
  for (const bucket of BUCKETS) {
    const dir = join(ROOT, bucket);
    let files: string[];
    try {
      files = readdirSync(dir).filter(f => f.endsWith('.json'));
    } catch {
      continue;  // bucket dir may not exist yet during early development
    }
    for (const file of files) {
      const raw = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
      const parsed = Test.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`Invalid test JSON ${bucket}/${file}: ${parsed.error.message}`);
      }
      out.push(parsed.data);
    }
  }
  cache = out;
  return out;
}

export function loadTestBySlug(slug: string): TestType | null {
  return loadAllTests().find(t => t.slug === slug) ?? null;
}
```

- [ ] **Step 5: Run → expect pass**

```bash
pnpm test test-loader
```

Expected: PASS — 3 tests passing (empty array case is fine).

- [ ] **Step 6: Commit**

```bash
git add lib/test-loader.ts tests/test-loader.test.ts
git commit -m "feat(content): add test-loader with build-time Zod validation"
```

---

### Task 15: Write `scripts/validate-tests.ts`

**Files:**
- Create: `scripts/validate-tests.ts`

- [ ] **Step 1: Implement the script**

```ts
// scripts/validate-tests.ts
import { loadAllTests } from '@/lib/test-loader';
import { getScripture } from '@/lib/scripture';

function main() {
  const tests = loadAllTests();
  let errors = 0;

  for (const t of tests) {
    // For archetype/profile: verify every scriptureRef resolves
    if (t.mode === 'archetype') {
      for (const [key, r] of Object.entries(t.results)) {
        try { getScripture(r.scriptureRef); }
        catch (e) {
          console.error(`❌ ${t.slug} → result "${key}" → ${(e as Error).message}`);
          errors++;
        }
      }
    } else if (t.mode === 'profile') {
      for (const [key, r] of Object.entries(t.results)) {
        if (r.scriptureRef) {
          try { getScripture(r.scriptureRef); }
          catch (e) {
            console.error(`❌ ${t.slug} → result "${key}" → ${(e as Error).message}`);
            errors++;
          }
        }
      }
    }
  }

  console.log(`✅ Validated ${tests.length} test(s)`);
  if (errors > 0) {
    console.error(`💥 ${errors} validation error(s)`);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: Run the script — should report 0 tests, no errors**

```bash
pnpm validate:tests
```

Expected output: `✅ Validated 0 test(s)`.

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-tests.ts
git commit -m "feat(build): add validate-tests script (Zod + scripture refs)"
```

---

## Phase 4 — First quiz content (proves the schema end-to-end)

### Task 16: Author "Which Apostle Are You?" JSON

**Files:**
- Modify: `content/shared/scriptures.json` (add verses referenced)
- Create: `content/tests/archetype/which-apostle-are-you.json`

- [ ] **Step 1: Extend `content/shared/scriptures.json`** with all verses needed for this quiz:

```json
{
  "matt-16-18": { "text": "And on this rock I will build my church.", "reference": "Matthew 16:18" },
  "john-13-23": { "text": "Now there was leaning on Jesus' bosom one of his disciples, whom Jesus loved.", "reference": "John 13:23" },
  "mark-3-17": { "text": "James and John, to whom he gave the name Boanerges, that is, sons of thunder.", "reference": "Mark 3:17" },
  "john-1-41": { "text": "He first findeth his own brother Simon, and saith unto him, We have found the Messiah.", "reference": "John 1:41" },
  "john-20-25": { "text": "Except I shall see in his hands the print of the nails... I will not believe.", "reference": "John 20:25" },
  "matt-9-9": { "text": "And as Jesus passed forth from thence, he saw a man, named Matthew, sitting at the receipt of custom: and he saith unto him, Follow me.", "reference": "Matthew 9:9" },
  "john-6-7": { "text": "Two hundred pennyworth of bread is not sufficient for them.", "reference": "John 6:7" },
  "john-1-45": { "text": "Philip findeth Nathanael, and saith unto him, We have found him.", "reference": "John 1:45" }
}
```

- [ ] **Step 2: Create the apostle quiz JSON**

```json
// content/tests/archetype/which-apostle-are-you.json
{
  "slug": "which-apostle-are-you",
  "title": "Which Apostle Are You?",
  "subtitle": "Find out which of the Twelve mirrors your soul",
  "lang": "en",
  "category": "bible-character",
  "estimatedMinutes": 4,
  "mode": "archetype",
  "questions": [
    {
      "text": "When a friend tells you they're going through something hard, you...",
      "options": [
        { "text": "Sit with them in silence — just being there is enough.",       "weights": { "john": 3 } },
        { "text": "Ask hard questions to help them see what's really going on.", "weights": { "peter": 3, "thomas": 1 } },
        { "text": "Pray with them on the spot — out loud, right there.",         "weights": { "andrew": 2, "philip": 1 } },
        { "text": "Show up with food and practical help before they ask.",       "weights": { "matthew": 2, "bartholomew": 1 } }
      ]
    },
    {
      "text": "Your friend group is making a decision. You usually...",
      "options": [
        { "text": "Speak first — even if I haven't fully thought it through.", "weights": { "peter": 3, "james": 1 } },
        { "text": "Wait, listen, then make the call quietly.",                  "weights": { "andrew": 2, "matthew": 1 } },
        { "text": "Push back if something feels off, even when it's awkward.", "weights": { "thomas": 3, "bartholomew": 1 } },
        { "text": "Look for who hasn't spoken yet and pull them in.",          "weights": { "philip": 2, "john": 1 } }
      ]
    },
    {
      "text": "Pick the trait you secretly know you struggle with most:",
      "options": [
        { "text": "Doubting things will work out.", "weights": { "thomas": 3 } },
        { "text": "Speaking before thinking.",      "weights": { "peter": 3 } },
        { "text": "Wanting to be the favorite.",    "weights": { "john": 2, "james": 1 } },
        { "text": "Avoiding hard conversations.",   "weights": { "matthew": 2, "philip": 1 } }
      ]
    },
    {
      "text": "How do you handle being wrong?",
      "options": [
        { "text": "I apologize immediately — sometimes overcorrecting.", "weights": { "peter": 3 } },
        { "text": "I sit with it quietly until I can name what happened.", "weights": { "john": 2, "andrew": 1 } },
        { "text": "I need to see the evidence before I'll admit it.",      "weights": { "thomas": 3 } },
        { "text": "I make amends through action, not words.",              "weights": { "matthew": 3, "bartholomew": 1 } }
      ]
    },
    {
      "text": "Pick the call you'd find hardest to follow:",
      "options": [
        { "text": "Leave everything and start over.",            "weights": { "peter": 2, "andrew": 1, "james": 1 } },
        { "text": "Stand near the cross when others run.",        "weights": { "john": 3 } },
        { "text": "Reach the people no one wants to reach.",      "weights": { "matthew": 3 } },
        { "text": "Tell strangers about someone they can't see.", "weights": { "philip": 3, "andrew": 1 } }
      ]
    },
    {
      "text": "What energizes you about faith?",
      "options": [
        { "text": "Big public moments — preaching, leading, declaring.", "weights": { "peter": 3, "james": 1 } },
        { "text": "Quiet intimacy — long prayer, deep listening.",        "weights": { "john": 3 } },
        { "text": "Bringing one specific person to Jesus.",               "weights": { "andrew": 3, "philip": 1 } },
        { "text": "Wrestling honestly with the hard questions.",          "weights": { "thomas": 3, "bartholomew": 1 } }
      ]
    },
    {
      "text": "Your version of a perfect Sunday afternoon:",
      "options": [
        { "text": "A long meal with old friends.",                "weights": { "matthew": 2, "andrew": 1 } },
        { "text": "Doing something physical outdoors.",            "weights": { "peter": 2, "james": 2 } },
        { "text": "A walk and a real conversation.",               "weights": { "philip": 2, "bartholomew": 1 } },
        { "text": "Reading something dense and beautiful.",        "weights": { "john": 2, "thomas": 1 } }
      ]
    },
    {
      "text": "If you had to describe your faith in one word:",
      "options": [
        { "text": "Bold.",       "weights": { "peter": 3, "james": 2 } },
        { "text": "Beloved.",    "weights": { "john": 3 } },
        { "text": "Honest.",     "weights": { "thomas": 3 } },
        { "text": "Practical.",  "weights": { "matthew": 2, "andrew": 1 } }
      ]
    }
  ],
  "results": {
    "peter": {
      "name": "Peter the Bold", "emoji": "🪨",
      "traits": ["Loyal", "Impulsive", "All-in"],
      "description": "Big heart, big feet, big mistakes — and Jesus loved you anyway. You're the friend who'd jump out of the boat for someone you care about, even if you sink halfway there.",
      "scriptureRef": "matt-16-18"
    },
    "john": {
      "name": "John the Beloved", "emoji": "🕊️",
      "traits": ["Tender", "Steady", "Present"],
      "description": "You hold the head of Jesus when others run. Your love is quiet and unembarrassed, and people feel safe being weak around you.",
      "scriptureRef": "john-13-23"
    },
    "james": {
      "name": "James the Thunder", "emoji": "⚡",
      "traits": ["Fierce", "Ambitious", "Devoted"],
      "description": "You don't do half-measures. When you commit, the room knows it. Jesus called you a 'son of thunder' for a reason.",
      "scriptureRef": "mark-3-17"
    },
    "andrew": {
      "name": "Andrew the Gatherer", "emoji": "🎣",
      "traits": ["Quiet", "Connector", "Generous"],
      "description": "You're the one who finds your brother first. You don't need credit; you just bring people to Jesus and step back.",
      "scriptureRef": "john-1-41"
    },
    "thomas": {
      "name": "Thomas the Honest", "emoji": "🔍",
      "traits": ["Skeptical", "Truth-seeking", "Uncompromising"],
      "description": "You need it to be real before you'll call it real. That isn't a flaw — it's why Jesus came to your room personally.",
      "scriptureRef": "john-20-25"
    },
    "matthew": {
      "name": "Matthew the Outsider", "emoji": "🪙",
      "traits": ["Watchful", "Practical", "Redeemed"],
      "description": "You know what it's like to be excluded — so you make tables wide. You write things down so people remember the truth.",
      "scriptureRef": "matt-9-9"
    },
    "philip": {
      "name": "Philip the Seeker", "emoji": "🧭",
      "traits": ["Curious", "Calculating", "Earnest"],
      "description": "You run the numbers, then trust Jesus anyway. You're the one who says 'come and see' to someone who's never been invited.",
      "scriptureRef": "john-6-7"
    },
    "bartholomew": {
      "name": "Bartholomew the Sincere", "emoji": "📖",
      "traits": ["Honest", "Thoughtful", "Without guile"],
      "description": "There's no pretense in you. People might miss your depth because you don't perform — but Jesus saw you under the fig tree.",
      "scriptureRef": "john-1-45"
    }
  }
}
```

- [ ] **Step 3: Run validation**

```bash
pnpm validate:tests
```

Expected: `✅ Validated 1 test(s)` with no errors.

- [ ] **Step 4: Run unit tests (test-loader will now load 1 test)**

```bash
pnpm test
```

Expected: All previous tests still pass; loader picks up the new file.

- [ ] **Step 5: Commit**

```bash
git add content/
git commit -m "feat(content): add 'Which Apostle Are You?' quiz + supporting verses"
```

---

## Phase 5 — UI primitives

### Task 17: `cn` utility and shared types

**Files:**
- Create: `lib/cn.ts`

- [ ] **Step 1: Create the utility**

```ts
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/cn.ts
git commit -m "chore: add cn() class-merge utility"
```

---

### Task 18: `<Wordmark />` component

**Files:**
- Create: `components/Wordmark.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/Wordmark.tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  return (
    <Link href="/" className={cn('font-extrabold tracking-tight text-brown', sizes[size])}>
      Parable
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Wordmark.tsx
git commit -m "feat(ui): add Wordmark component"
```

---

### Task 19: `<HomeNav />` component

**Files:**
- Create: `components/HomeNav.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/HomeNav.tsx
import Link from 'next/link';
import { Wordmark } from './Wordmark';

export function HomeNav() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-rose/50">
      <Wordmark />
      <div className="flex gap-6 text-sm text-ink-soft">
        <Link href="/#archetype">Quizzes</Link>
        <Link href="/#profile">Spiritual Profiles</Link>
        <Link href="/#knowledge">Bible IQ</Link>
        <Link href="/about">About</Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/HomeNav.tsx
git commit -m "feat(ui): add HomeNav component"
```

---

### Task 20: `<QuizCard />` component

**Files:**
- Create: `components/QuizCard.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/QuizCard.tsx
import Link from 'next/link';
import type { Test } from '@/lib/schema';

function pickEmoji(t: Test): string {
  // first archetype result's emoji, or per-category fallback
  if (t.mode === 'archetype') {
    const first = Object.values(t.results)[0];
    if (first?.emoji) return first.emoji;
  }
  return t.category === 'spiritual-profile' ? '✨' : t.category === 'bible-iq' ? '📖' : '📜';
}

function describeMeta(t: Test): string {
  const m = `${t.estimatedMinutes} min`;
  if (t.mode === 'knowledge') return `${m} · ${t.questions.length} questions`;
  if (t.mode === 'profile')   return `${m} · ${t.dimensions.length} dimensions`;
  return `${m} · ${Object.keys(t.results).length} results`;
}

export function QuizCard({ test }: { test: Test }) {
  return (
    <Link
      href={`/q/${test.slug}`}
      className="block bg-white border border-rose/60 rounded-card p-5 card-hover shadow-card"
    >
      <div className="text-3xl mb-2">{pickEmoji(test)}</div>
      <div className="text-base font-bold text-brown leading-tight">{test.title}</div>
      <div className="text-xs text-ink-mute mt-1">{describeMeta(test)}</div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/QuizCard.tsx
git commit -m "feat(ui): add QuizCard component"
```

---

### Task 21: `<ProgressBar />` component

**Files:**
- Create: `components/ProgressBar.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/ProgressBar.tsx
export function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  return (
    <div className="flex-1">
      <div className="h-1.5 bg-sand rounded-full overflow-hidden">
        <div className="h-full bg-brown transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-ink-mute mt-1">
        Question {current} of {total}{label ? ` · ${label}` : ''}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProgressBar.tsx
git commit -m "feat(ui): add ProgressBar component"
```

---

### Task 22: `<QuestionCard />` component

**Files:**
- Create: `components/QuestionCard.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/QuestionCard.tsx
'use client';
import { cn } from '@/lib/cn';

interface Option { text: string }

export function QuestionCard({
  questionNumber,
  questionText,
  options,
  selectedIndex,
  onSelect,
}: {
  questionNumber: number;
  questionText: string;
  options: Option[];
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ink-mute mb-2">Question {questionNumber}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-brown-dark leading-snug mb-6">{questionText}</h2>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'text-left bg-white border-2 rounded-card px-5 py-4 text-base transition-colors',
              selectedIndex === i
                ? 'border-brown bg-cream-1'
                : 'border-rose/50 hover:border-rose-dark hover:bg-cream-1/40'
            )}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/QuestionCard.tsx
git commit -m "feat(ui): add QuestionCard component"
```

---

### Task 23: `<AdSlot />` component

**Files:**
- Create: `components/AdSlot.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/AdSlot.tsx
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: 'auto' | 'rectangle' | 'horizontal' }) {
  if (!ADSENSE_CLIENT) return null;
  return (
    <div className="my-6 mx-8 text-center">
      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        style={{ display: 'block' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AdSlot.tsx
git commit -m "feat(ads): add env-gated AdSlot component"
```

---

## Phase 6 — TestRunner + Result components

### Task 24: `<TestRunner />` client component

**Files:**
- Create: `components/TestRunner.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/TestRunner.tsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import type { Test } from '@/lib/schema';
import { scoreArchetype, scoreProfile, scoreKnowledge } from '@/lib/scoring';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { Wordmark } from './Wordmark';
import { AdSlot } from './AdSlot';

export function TestRunner({ test }: { test: Test }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const totalQuestions = test.questions.length;

  useEffect(() => {
    track('quiz_start', { slug: test.slug, mode: test.mode });
  }, [test.slug, test.mode]);

  const currentAnswer = answers[step] ?? null;
  const isLast = step === totalQuestions - 1;

  function pick(idx: number) {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
  }

  function goNext() {
    if (currentAnswer === null) return;
    if (!isLast) { setStep(step + 1); return; }
    // Done — score and navigate
    let resultKey: string;
    if (test.mode === 'archetype') {
      resultKey = scoreArchetype(test, answers);
    } else if (test.mode === 'profile') {
      const r = scoreProfile(test, answers);
      const top = Object.entries(r).sort((a, b) => b[1] - a[1])[0];
      resultKey = top[0];
    } else {
      const r = scoreKnowledge(test, answers);
      resultKey = String(r.percent);
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    router.push(`/q/${test.slug}/r/${resultKey}`);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  const showMidAd = useMemo(() => step === 2 && totalQuestions >= 6, [step, totalQuestions]);

  return (
    <>
      <div className="flex items-center gap-5 px-8 py-4 border-b border-rose/50 sticky top-0 bg-cream-1/80 backdrop-blur">
        <Wordmark size="sm" />
        <ProgressBar current={step + 1} total={totalQuestions} label={test.title} />
      </div>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <QuestionCard
          questionNumber={step + 1}
          questionText={test.questions[step].text}
          options={test.questions[step].options.map(o => ({ text: o.text }))}
          selectedIndex={currentAnswer}
          onSelect={pick}
        />
        <div className="flex justify-between mt-6">
          <button onClick={goBack} disabled={step === 0} className="text-ink-mute disabled:opacity-30 text-sm">
            ← Back
          </button>
          <button
            onClick={goNext}
            disabled={currentAnswer === null}
            className="bg-brown text-white px-6 py-3 rounded-full font-semibold text-sm disabled:opacity-40"
          >
            {isLast ? 'See result →' : 'Next →'}
          </button>
        </div>
      </main>
      {showMidAd && <AdSlot slot="mid-quiz" />}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TestRunner.tsx
git commit -m "feat(ui): add TestRunner client component with all 3 scoring modes"
```

---

### Task 25: `<ResultCard />` component

**Files:**
- Create: `components/ResultCard.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/ResultCard.tsx
import { getScripture } from '@/lib/scripture';

interface ArchetypeResultProps {
  mode: 'archetype';
  name: string;
  emoji: string;
  traits: string[];
  description: string;
  scriptureRef: string;
}

interface ProfileResultProps {
  mode: 'profile';
  name: string;
  description: string;
  scriptureRef?: string;
  topDimensions: Array<{ dimension: string; score: number; label: string }>;
}

interface KnowledgeResultProps {
  mode: 'knowledge';
  percent: number;
  correct: number;
  total: number;
  bandLabel: string;
  message: string;
}

type Props = ArchetypeResultProps | ProfileResultProps | KnowledgeResultProps;

export function ResultCard(props: Props) {
  if (props.mode === 'archetype') {
    const verse = getScripture(props.scriptureRef);
    return (
      <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
        <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">You are</div>
        <div className="text-4xl font-extrabold text-brown-dark mb-2 -tracking-wide">{props.name}</div>
        <div className="text-6xl my-3">{props.emoji}</div>
        <div className="text-base text-ink-soft leading-relaxed mb-4">{props.description}</div>
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {props.traits.map(t => (
            <span key={t} className="bg-white text-brown rounded-full px-3 py-1 text-xs font-semibold">{t}</span>
          ))}
        </div>
        <div className="border-t border-brown/15 pt-3 italic text-sm text-ink-soft">
          &ldquo;{verse.text}&rdquo; — {verse.reference}
        </div>
      </div>
    );
  }

  if (props.mode === 'profile') {
    return (
      <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
        <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">Your top gift</div>
        <div className="text-4xl font-extrabold text-brown-dark mb-3">{props.name}</div>
        <div className="text-base text-ink-soft leading-relaxed mb-4">{props.description}</div>
        <div className="space-y-2 text-left mt-4">
          {props.topDimensions.map(d => (
            <div key={d.dimension}>
              <div className="flex justify-between text-xs text-ink-soft mb-1">
                <span>{d.label}</span><span>{d.score}%</span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div className="h-full bg-brown" style={{ width: `${d.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // knowledge
  return (
    <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
      <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">Your score</div>
      <div className="text-6xl font-extrabold text-brown-dark mb-1">{props.percent}%</div>
      <div className="text-base text-ink-mute mb-3">{props.correct} of {props.total} correct</div>
      <div className="text-xl font-bold text-brown mb-2">{props.bandLabel}</div>
      <div className="text-base text-ink-soft">{props.message}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResultCard.tsx
git commit -m "feat(ui): add ResultCard with mode-specific layouts"
```

---

### Task 26: `<ShareBar />` component

**Files:**
- Create: `components/ShareBar.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/ShareBar.tsx
'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';

export function ShareBar({ url, text, image }: { url: string; text: string; image?: string }) {
  const [copied, setCopied] = useState(false);

  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(text);
  const encImage = image ? encodeURIComponent(image) : '';

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    track('share_click', { platform: 'copy' });
    setTimeout(() => setCopied(false), 2000);
  }

  function logShare(platform: string) {
    track('share_click', { platform });
  }

  return (
    <div className="flex justify-center gap-3 my-6 max-w-xl mx-auto flex-wrap">
      <a
        href={`https://pinterest.com/pin/create/button/?url=${encUrl}&media=${encImage}&description=${encText}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('pinterest')}
        className="bg-brown text-white px-5 py-3 rounded-full text-sm font-semibold"
      >
        📌 Pin it
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('x')}
        className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold"
      >
        𝕏 Share
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('facebook')}
        className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold"
      >
        📘 Facebook
      </a>
      <button onClick={copy} className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold">
        {copied ? '✓ Copied' : '🔗 Copy link'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ShareBar.tsx
git commit -m "feat(ui): add ShareBar with platform-tagged analytics events"
```

---

### Task 27: Related-quizzes mapping + `<RelatedQuizzes />`

**Files:**
- Create: `lib/related.ts`
- Create: `components/RelatedQuizzes.tsx`

- [ ] **Step 1: Implement related-quiz map**

```ts
// lib/related.ts
import { loadAllTests, loadTestBySlug } from './test-loader';
import type { Test } from './schema';

// Hand-curated related quizzes per slug. Fallback: same-category, up to 3.
const RELATED: Record<string, string[]> = {
  'which-apostle-are-you': ['which-fruit-of-the-spirit-are-you', 'which-parable-describes-your-life', 'spiritual-gifts-profile'],
};

export function getRelated(slug: string): Test[] {
  const hand = RELATED[slug] ?? [];
  const out = hand.map(s => loadTestBySlug(s)).filter((t): t is Test => t !== null);
  if (out.length >= 3) return out.slice(0, 3);
  // top up with same category
  const me = loadTestBySlug(slug);
  if (!me) return out;
  const sameCat = loadAllTests().filter(t => t.category === me.category && t.slug !== slug && !out.includes(t));
  return [...out, ...sameCat].slice(0, 3);
}
```

- [ ] **Step 2: Implement the component**

```tsx
// components/RelatedQuizzes.tsx
'use client';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { getRelated } from '@/lib/related';
import type { Test } from '@/lib/schema';

function pickEmoji(t: Test): string {
  if (t.mode === 'archetype') {
    const first = Object.values(t.results)[0];
    if (first?.emoji) return first.emoji;
  }
  return t.category === 'spiritual-profile' ? '✨' : t.category === 'bible-iq' ? '📖' : '📜';
}

export function RelatedQuizzes({ slug }: { slug: string }) {
  const related = getRelated(slug);
  if (related.length === 0) return null;
  return (
    <section className="px-8 pb-8">
      <h3 className="text-xs uppercase tracking-widest text-brown my-6">Take another</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {related.map(t => (
          <Link
            key={t.slug}
            href={`/q/${t.slug}`}
            onClick={() => track('related_quiz_click', { from: slug, to: t.slug })}
            className="block bg-white border border-rose/60 rounded-card p-5 card-hover shadow-card"
          >
            <div className="text-3xl mb-2">{pickEmoji(t)}</div>
            <div className="text-base font-bold text-brown leading-tight">{t.title}</div>
            <div className="text-xs text-ink-mute mt-1">{t.estimatedMinutes} min</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/related.ts components/RelatedQuizzes.tsx
git commit -m "feat(ui): add RelatedQuizzes with hand-curated + category-fallback map"
```

---

## Phase 7 — Routes

### Task 28: Build the homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
// app/page.tsx
import { loadAllTests } from '@/lib/test-loader';
import { QuizCard } from '@/components/QuizCard';
import { HomeNav } from '@/components/HomeNav';
import { AdSlot } from '@/components/AdSlot';

export default function Home() {
  const all = loadAllTests();
  const archetype = all.filter(t => t.mode === 'archetype');
  const profile   = all.filter(t => t.mode === 'profile');
  const knowledge = all.filter(t => t.mode === 'knowledge');

  return (
    <>
      <HomeNav />
      <header className="text-center py-16 px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brown-dark -tracking-wide mb-3">
          What&rsquo;s your parable?
        </h1>
        <p className="text-base text-ink-soft mb-3">20 quizzes that reveal what scripture says about you.</p>
        <div className="text-xs uppercase tracking-widest text-ink-mute">20 QUIZZES · ALWAYS FREE · NO SIGN-UP</div>
      </header>

      <Section id="archetype" title="Most shared this week">
        {archetype.slice(0, 6).map(t => <QuizCard key={t.slug} test={t} />)}
      </Section>

      <AdSlot slot="home-mid" />

      <Section id="profile" title="Spiritual profiles · deeper dives">
        {profile.map(t => <QuizCard key={t.slug} test={t} />)}
      </Section>

      <Section id="knowledge" title="Bible IQ · how well do you know scripture?">
        {knowledge.map(t => <QuizCard key={t.slug} test={t} />)}
      </Section>

      <footer className="px-8 py-8 text-center text-xs text-ink-mute">
        © Parable · <a href="/about">About</a> · <a href="/privacy">Privacy</a>
      </footer>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-8 mt-6">
      <h2 className="text-xs uppercase tracking-widest text-brown my-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Start dev server, verify homepage renders**

```bash
pnpm dev
```

Open http://localhost:3000 — expect "What's your parable?" hero + one QuizCard for the apostle quiz (only quiz so far). Stop the server.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(routes): implement homepage with 3-section grid"
```

---

### Task 29: Build the test page `/q/[slug]`

**Files:**
- Create: `app/q/[slug]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/q/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';
import { TestRunner } from '@/components/TestRunner';

export function generateStaticParams() {
  return loadAllTests().map(t => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const test = loadTestBySlug(params.slug);
  if (!test) return {};
  return {
    title: test.title,
    description: test.subtitle ?? `Take the ${test.title} quiz on Parable.`,
    openGraph: { title: test.title, type: 'website' },
  };
}

export default function TestPage({ params }: { params: { slug: string } }) {
  const test = loadTestBySlug(params.slug);
  if (!test) notFound();
  return <TestRunner test={test} />;
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/q/which-apostle-are-you — expect the test runner with question 1 of 8. Click through; confirm scoring redirects (will 404 on the result page — that's the next task).

- [ ] **Step 3: Commit**

```bash
git add app/q/[slug]/page.tsx
git commit -m "feat(routes): implement test page with SSG generateStaticParams"
```

---

### Task 30: Build the result page `/q/[slug]/r/[key]`

**Files:**
- Create: `app/q/[slug]/r/[key]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/q/[slug]/r/[key]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';
import { HomeNav } from '@/components/HomeNav';
import { ResultCard } from '@/components/ResultCard';
import { ShareBar } from '@/components/ShareBar';
import { AdSlot } from '@/components/AdSlot';
import { RelatedQuizzes } from '@/components/RelatedQuizzes';

export function generateStaticParams() {
  const params: { slug: string; key: string }[] = [];
  for (const t of loadAllTests()) {
    if (t.mode === 'archetype' || t.mode === 'profile') {
      Object.keys(t.results).forEach(key => params.push({ slug: t.slug, key }));
    } else {
      // knowledge: pre-render 0-100% buckets
      for (let p = 0; p <= 100; p += 10) params.push({ slug: t.slug, key: String(p) });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { slug: string; key: string } }): Metadata {
  const test = loadTestBySlug(params.slug);
  if (!test) return {};
  let title = test.title;
  let description = `Take ${test.title} on Parable.`;
  if (test.mode === 'archetype') {
    const r = test.results[params.key];
    if (r) {
      title = `You are ${r.name} · ${test.title}`;
      description = r.description;
    }
  } else if (test.mode === 'profile') {
    const r = test.results[params.key];
    if (r) {
      title = `Your top gift: ${r.name} · ${test.title}`;
      description = r.description;
    }
  } else {
    title = `${params.key}% · ${test.title}`;
  }
  const ogImage = `/og/${test.slug}/${params.key}`;
  return {
    title, description,
    openGraph: { title, description, images: [ogImage], type: 'article' },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default function ResultPage({ params }: { params: { slug: string; key: string } }) {
  const test = loadTestBySlug(params.slug);
  if (!test) notFound();

  const shareUrl = `https://parable.quiz/q/${test.slug}/r/${params.key}`;
  const ogImageAbs = `https://parable.quiz/og/${test.slug}/${params.key}`;

  let cardProps;
  let shareText;

  if (test.mode === 'archetype') {
    const r = test.results[params.key];
    if (!r) notFound();
    cardProps = { mode: 'archetype' as const, name: r.name, emoji: r.emoji, traits: r.traits, description: r.description, scriptureRef: r.scriptureRef };
    shareText = `I got "${r.name}" on Parable — what's yours?`;
  } else if (test.mode === 'profile') {
    const r = test.results[params.key];
    if (!r) notFound();
    cardProps = {
      mode: 'profile' as const, name: r.name, description: r.description,
      topDimensions: [{ dimension: params.key, score: 100, label: r.name }],
    };
    shareText = `My top spiritual gift: ${r.name}. Take the quiz on Parable.`;
  } else {
    const percent = parseInt(params.key, 10);
    if (isNaN(percent)) notFound();
    const band = test.scoring.gradeBands.find(b => percent >= b.min && percent <= b.max)
      ?? test.scoring.gradeBands[test.scoring.gradeBands.length - 1];
    const total = test.questions.length;
    const correct = Math.round((percent / 100) * total);
    cardProps = { mode: 'knowledge' as const, percent, correct, total, bandLabel: band.label, message: band.message };
    shareText = `I scored ${percent}% on ${test.title}. Try it on Parable!`;
  }

  return (
    <>
      <HomeNav />
      <main className="py-8">
        <ResultCard {...cardProps} />
        <ShareBar url={shareUrl} text={shareText} image={ogImageAbs} />
        <AdSlot slot="post-share" />
        <RelatedQuizzes slug={test.slug} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Take the apostle quiz at http://localhost:3000/q/which-apostle-are-you → see the result page with the named archetype + share bar. Confirm no errors in the console.

- [ ] **Step 3: Commit**

```bash
git add app/q/[slug]/r/[key]/page.tsx
git commit -m "feat(routes): implement result page with per-mode rendering + metadata"
```

---

### Task 31: Build the OG image route

**Files:**
- Create: `app/og/[slug]/[key]/route.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/og/[slug]/[key]/route.tsx
import { ImageResponse } from 'next/og';
import { loadTestBySlug } from '@/lib/test-loader';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

export async function GET(_req: Request, { params }: { params: { slug: string; key: string } }) {
  const test = loadTestBySlug(params.slug);

  let name = test?.title ?? 'Parable';
  let emoji = '📜';
  let line = "What's your parable?";

  if (test?.mode === 'archetype' && test.results[params.key]) {
    name = test.results[params.key].name;
    emoji = test.results[params.key].emoji;
    line = `I got ${name} on Parable`;
  } else if (test?.mode === 'profile' && test.results[params.key]) {
    name = test.results[params.key].name;
    line = `My top gift: ${name}`;
  } else if (test?.mode === 'knowledge') {
    name = `${params.key}%`;
    line = `I scored ${params.key}% on ${test.title}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, #fdf5ee 0%, #e8c9a7 100%)',
          color: '#4a2f15', fontFamily: 'Inter', padding: 60, justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, color: '#6b4423' }}>Parable</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 120 }}>{emoji}</div>
          <div style={{ fontSize: 72, fontWeight: 800, marginTop: 12 }}>{name}</div>
          <div style={{ fontSize: 28, color: '#4a3c2e', marginTop: 12 }}>{line}</div>
        </div>
        <div style={{ fontSize: 22, color: '#8a6a47' }}>parable.quiz</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/og/which-apostle-are-you/peter — expect a 1200×630 PNG with "Peter the Bold" rendered.

- [ ] **Step 3: Commit**

```bash
git add app/og/[slug]/[key]/route.tsx
git commit -m "feat(seo): add @vercel/og share image route"
```

---

### Task 32: Build sitemap + robots + about + 404

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/about/page.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Implement `app/sitemap.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { loadAllTests } from '@/lib/test-loader';

const BASE = 'https://parable.quiz';

export default function sitemap(): MetadataRoute.Sitemap {
  const tests = loadAllTests();
  const out: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/about`, changeFrequency: 'yearly', priority: 0.3 },
  ];
  for (const t of tests) {
    out.push({ url: `${BASE}/q/${t.slug}`, changeFrequency: 'monthly', priority: 0.8 });
    if (t.mode === 'archetype' || t.mode === 'profile') {
      Object.keys(t.results).forEach(key => {
        out.push({ url: `${BASE}/q/${t.slug}/r/${key}`, changeFrequency: 'monthly', priority: 0.6 });
      });
    } else {
      for (let p = 0; p <= 100; p += 10) {
        out.push({ url: `${BASE}/q/${t.slug}/r/${p}`, changeFrequency: 'monthly', priority: 0.4 });
      }
    }
  }
  return out;
}
```

- [ ] **Step 2: Implement `app/robots.ts`**

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://parable.quiz/sitemap.xml',
  };
}
```

- [ ] **Step 3: Implement `app/about/page.tsx`**

```tsx
// app/about/page.tsx
import { HomeNav } from '@/components/HomeNav';

export const metadata = { title: 'About Parable' };

export default function About() {
  return (
    <>
      <HomeNav />
      <main className="max-w-2xl mx-auto px-8 py-12 text-ink-soft leading-relaxed">
        <h1 className="text-3xl font-extrabold text-brown-dark mb-4">About Parable</h1>
        <p className="mb-4">
          Parable is a collection of free Christian quizzes — built so you can see something
          true about yourself reflected in scripture, then share it with a friend.
        </p>
        <p className="mb-4">
          No sign-ups, no email walls, no algorithms guessing what you want. Just questions,
          a result, and a verse.
        </p>
        <p>
          Made with care. New quizzes added each week.
        </p>
      </main>
    </>
  );
}
```

- [ ] **Step 4: Implement `app/not-found.tsx`**

```tsx
// app/not-found.tsx
import { HomeNav } from '@/components/HomeNav';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <HomeNav />
      <main className="max-w-xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl font-extrabold text-brown-dark mb-3">Lost like a sheep.</h1>
        <p className="text-ink-soft mb-6">We couldn&rsquo;t find that page.</p>
        <Link href="/" className="bg-brown text-white px-6 py-3 rounded-full font-semibold text-sm">
          Back home
        </Link>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Verify sitemap renders**

```bash
pnpm dev
```

Open http://localhost:3000/sitemap.xml — expect XML with home, /about, /q/which-apostle-are-you, and 8 result URLs.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/about/page.tsx app/not-found.tsx
git commit -m "feat(seo): add sitemap, robots, about page, and 404"
```

---

## Phase 8 — Content authoring (remaining 19 quizzes)

### Task 33: Document the LLM authoring prompt

**Files:**
- Create: `docs/authoring-prompt.md`

- [ ] **Step 1: Write the prompt template**

```markdown
# Parable Quiz Authoring Prompt

Use this prompt with Claude (or any capable LLM) to draft a new test JSON.
After the LLM produces the JSON, run `pnpm validate:tests` to verify it parses.
Always do a human theology + scripture-accuracy pass before committing.

---

## The prompt

> You are authoring a JSON quiz for **Parable**, an ecumenically-Christian quiz
> site. Write a complete test JSON matching the Zod schema at `lib/schema.ts`.
>
> **Quiz title:** {{TITLE}}
> **Mode:** {{archetype | profile | knowledge}}
> **Result set:** {{COMMA-SEPARATED RESULT NAMES}}
> **Estimated minutes:** {{N}}
> **Category:** {{bible-character | spiritual-profile | bible-iq}}
>
> Requirements:
> 1. 8–10 questions for archetype/profile, 10–15 for knowledge
> 2. Each question has exactly 4 options
> 3. Weights sum so no single answer determines the result alone
> 4. Each archetype/profile result MUST include a `scriptureRef` keyed to
>    `content/shared/scriptures.json` — add new entries to that file with
>    the full verse text and reference
> 5. Use warm, second-person voice. Avoid theological jargon.
> 6. Avoid denominationally-loaded language (no "saints," no "predestination")
> 7. For knowledge mode, include `explanation` strings on each option
>
> Output the JSON file verbatim (no markdown fence, no commentary).
```

- [ ] **Step 2: Commit**

```bash
git add docs/authoring-prompt.md
git commit -m "docs: add LLM authoring prompt template"
```

---

### Task 34: Author the remaining 11 archetype quizzes

**Files:**
- Create one JSON file each in `content/tests/archetype/`:
  - `which-bible-character-are-you.json`
  - `which-fruit-of-the-spirit-are-you.json`
  - `which-woman-of-the-bible-are-you.json`
  - `mary-or-martha.json`
  - `which-psalm-speaks-to-you.json`
  - `which-prophet-are-you.json`
  - `which-parable-describes-your-life.json`
  - `which-beatitude-defines-you.json`
  - `which-bible-animal-are-you.json`
  - `which-bible-story-are-you-living.json`
  - `which-christmas-character-are-you.json`
- Modify: `content/shared/scriptures.json` (add verses for each)

For each file below, the engineer should:
1. Use the prompt in `docs/authoring-prompt.md` with the inputs given
2. Add any new scripture refs the LLM uses to `scriptures.json`
3. Run `pnpm validate:tests` after each file
4. Commit after each file with message `feat(content): add {{TITLE}} quiz`

- [ ] **Sub-task 34a: Which Bible Character Are You?**
  - Title: `Which Bible Character Are You?`
  - Mode: `archetype`
  - Results (8): David, Moses, Esther, Ruth, Daniel, Joseph, Paul, Mary (mother of Jesus)
  - Estimated minutes: 5
  - Category: `bible-character`

- [ ] **Sub-task 34b: Which Fruit of the Spirit Are You?**
  - Title: `Which Fruit of the Spirit Are You?`
  - Mode: `archetype`
  - Results (9): Love, Joy, Peace, Patience, Kindness, Goodness, Faithfulness, Gentleness, Self-control
  - Estimated minutes: 3
  - Category: `bible-character`
  - Note: Anchor the scriptureRef on Galatians 5:22-23 (add as `gal-5-22-23`)

- [ ] **Sub-task 34c: Which Woman of the Bible Are You?**
  - Title: `Which Woman of the Bible Are You?`
  - Mode: `archetype`
  - Results (8): Mary, Martha, Ruth, Esther, Deborah, Hannah, Rahab, Priscilla
  - Estimated minutes: 4
  - Category: `bible-character`

- [ ] **Sub-task 34d: Are You More Mary or Martha?**
  - Title: `Are You More Mary or Martha?`
  - Mode: `archetype`
  - Results (2): Mary (of Bethany), Martha
  - Estimated minutes: 2
  - Category: `bible-character`
  - Questions: exactly 5 (mini-quiz format)

- [ ] **Sub-task 34e: Which Psalm Speaks To You?**
  - Title: `Which Psalm Speaks To You?`
  - Mode: `archetype`
  - Results (8): Psalm 23, Psalm 51, Psalm 91, Psalm 139, Psalm 119, Psalm 121, Psalm 27, Psalm 46
  - Estimated minutes: 4
  - Category: `bible-character`
  - Note: result keys are kebab-case like `psalm-23`; scripture refs are the opening verse of each

- [ ] **Sub-task 34f: Which Prophet Are You?**
  - Title: `Which Prophet Are You?`
  - Mode: `archetype`
  - Results (7): Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Jonah, Elijah
  - Estimated minutes: 4
  - Category: `bible-character`

- [ ] **Sub-task 34g: Which Parable Describes Your Life Right Now?**
  - Title: `Which Parable Describes Your Life Right Now?`
  - Mode: `archetype`
  - Results (7): Prodigal Son, Good Samaritan, Sower, Mustard Seed, Lost Sheep, Talents, Pharisee & Tax Collector
  - Estimated minutes: 4
  - Category: `bible-character`

- [ ] **Sub-task 34h: Which Beatitude Defines You?**
  - Title: `Which Beatitude Defines You?`
  - Mode: `archetype`
  - Results (8): Poor in spirit, Mourning, Meek, Hungering for righteousness, Merciful, Pure in heart, Peacemakers, Persecuted
  - Estimated minutes: 4
  - Category: `bible-character`

- [ ] **Sub-task 34i: Which Bible Animal Are You?**
  - Title: `Which Bible Animal Are You?`
  - Mode: `archetype`
  - Results (7): Lion of Judah, Lamb, Eagle, Dove, Sheep, Donkey, Serpent
  - Estimated minutes: 3
  - Category: `bible-character`

- [ ] **Sub-task 34j: Which Bible Story Are You Living Through Right Now?**
  - Title: `Which Bible Story Are You Living Through Right Now?`
  - Mode: `archetype`
  - Results (7): Exodus, Wilderness, Lions' Den, Resurrection, Burning Bush, Pentecost, Storm at Sea
  - Estimated minutes: 5
  - Category: `bible-character`

- [ ] **Sub-task 34k: Which Christmas Story Character Are You?**
  - Title: `Which Christmas Story Character Are You?`
  - Mode: `archetype`
  - Results (6): Mary, Joseph, Wise Men, Shepherds, Innkeeper, Angel
  - Estimated minutes: 3
  - Category: `bible-character`

After all 11 are added:

- [ ] **Final step: Final validation pass**

```bash
pnpm validate:tests
```

Expected: `✅ Validated 12 test(s)` (Apostle + 11 new). No errors.

---

### Task 35: Author the 5 spiritual profile quizzes

**Files:**
- Create one JSON file each in `content/tests/profile/`:
  - `spiritual-gifts-profile.json`
  - `beatitudes-profile.json`
  - `virtues-and-vices-profile.json`
  - `prayer-style-profile.json`
  - `spiritual-discipline-recommender.json`

Same workflow as Task 34. For each:

- [ ] **Sub-task 35a: Spiritual Gifts Profile**
  - Title: `Spiritual Gifts Profile`
  - Mode: `profile`
  - Dimensions (12): teaching, mercy, prophecy, leadership, service, wisdom, faith, healing, discernment, evangelism, giving, exhortation
  - Estimated minutes: 7
  - Category: `spiritual-profile`
  - Questions: 12 (one anchor question per dimension, but each option may weight up to 2 dims)

- [ ] **Sub-task 35b: Beatitudes Profile**
  - Title: `Beatitudes Profile`
  - Mode: `profile`
  - Dimensions (8): poor-in-spirit, mourning, meek, righteousness, merciful, pure-in-heart, peacemakers, persecuted
  - Estimated minutes: 5
  - Category: `spiritual-profile`

- [ ] **Sub-task 35c: Virtues & Vices Profile**
  - Title: `Virtues & Vices Profile`
  - Mode: `profile`
  - Dimensions (14): humility, kindness, patience, diligence, charity, temperance, chastity, pride, envy, wrath, sloth, greed, gluttony, lust
  - Estimated minutes: 6
  - Category: `spiritual-profile`

- [ ] **Sub-task 35d: Prayer Style Profile**
  - Title: `Prayer Style Profile`
  - Mode: `profile`
  - Dimensions (7): contemplative, petitionary, praise, lament, intercessory, listening, scripture-praying
  - Estimated minutes: 5
  - Category: `spiritual-profile`

- [ ] **Sub-task 35e: Spiritual Discipline Recommender**
  - Title: `Spiritual Discipline Recommender`
  - Mode: `profile`
  - Dimensions (8): lectio-divina, fasting, silence, journaling, sabbath, fixed-hour-prayer, examen, almsgiving
  - Estimated minutes: 4
  - Category: `spiritual-profile`
  - Note: Each result's `description` should read as a "Try this week" recommendation

- [ ] **Final step: Validate**

```bash
pnpm validate:tests
```

Expected: `✅ Validated 17 test(s)`.

- [ ] Commit each as you go: `git commit -m "feat(content): add {{TITLE}} quiz"`.

---

### Task 36: Author the 3 knowledge quizzes

**Files:**
- Create one JSON file each in `content/tests/knowledge/`:
  - `genesis-iq.json`
  - `parables-iq.json`
  - `verse-or-quote.json`

For each:

- [ ] **Sub-task 36a: Genesis IQ**
  - Title: `Genesis IQ`
  - Mode: `knowledge`
  - Questions: 15
  - Estimated minutes: 5
  - Category: `bible-iq`
  - Grade bands: 0–50 Beginner / 51–80 Strong / 81–100 Master / 100 (perfect) handled by `perfectMessage`

- [ ] **Sub-task 36b: Parables IQ**
  - Title: `Parables IQ`
  - Mode: `knowledge`
  - Questions: 12 (mix: match parable to lesson; spot fake/misquoted parable)
  - Estimated minutes: 4

- [ ] **Sub-task 36c: Verse or Inspirational Quote?**
  - Title: `Verse or Inspirational Quote?`
  - Mode: `knowledge`
  - Questions: 10 (each question: a quote; pick "scripture" or "Pinterest")
  - Estimated minutes: 3
  - Note: Quotes that sound biblical but aren't — e.g., "God helps those who help themselves" (NOT in Bible)

- [ ] **Final step: Validate**

```bash
pnpm validate:tests
```

Expected: `✅ Validated 20 test(s)`.

- [ ] Commit each as you go.

---

## Phase 9 — Polish + deploy

### Task 37: Add JSON-LD structured data to test pages

**Files:**
- Modify: `app/q/[slug]/page.tsx`

- [ ] **Step 1: Add `<script type="application/ld+json">` to the test page**

Edit `app/q/[slug]/page.tsx` and inside the rendered output (before `<TestRunner test={test} />`), inject:

```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: test.title,
  about: test.subtitle ?? test.title,
  educationalLevel: 'beginner',
  numberOfQuestions: test.questions.length,
};

return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <TestRunner test={test} />
  </>
);
```

- [ ] **Step 2: Commit**

```bash
git add app/q/[slug]/page.tsx
git commit -m "feat(seo): add JSON-LD Quiz structured data on test pages"
```

---

### Task 38: Production build smoke test

- [ ] **Step 1: Build**

```bash
pnpm validate:tests && pnpm build
```

Expected: Validation passes for all 20 tests. Build completes without errors. Output shows all routes statically generated.

- [ ] **Step 2: Run the production server locally**

```bash
pnpm start
```

Open http://localhost:3000 — homepage shows all 20 quizzes grouped. Take one quiz, see result, click share. Verify no console errors.

- [ ] **Step 3: Commit any fixes needed**

```bash
git status
# resolve any issues, then:
git commit -am "fix: production build issues"
```

---

### Task 39: Push and verify Vercel preview

- [ ] **Step 1: Push**

```bash
git push origin main
```

(If push fails on auth, ensure gh is active as `gergoded-ux`: `gh auth status` then `gh auth switch -u gergoded-ux`.)

- [ ] **Step 2: User connects Vercel** *(user action, not engineer)*

Open vercel.com → *Add New Project* → *Import* `gergoded-ux/Parable.quiz` → defaults are fine → Deploy. Vercel will auto-detect Next.js.

- [ ] **Step 3: User configures domain** *(user action)*

In Vercel Project Settings → Domains, add `parable.quiz`. Update DNS at the registrar to Vercel's nameservers (or A/CNAME records per Vercel's instructions).

- [ ] **Step 4: Engineer verifies production**

After domain propagates, take a quiz at https://parable.quiz/q/which-apostle-are-you and confirm:
- Result page renders
- Share buttons open correctly
- OG image at `/og/.../...` returns the 1200×630 PNG
- `/sitemap.xml` lists all routes
- `/robots.txt` allows crawling

---

### Task 40: Post-launch checklist (do NOT do at launch — these are reminders)

These are deferred ops tasks, captured here so they aren't lost:

- After ~30 days of traffic, apply for Google AdSense. When approved:
  1. Set `NEXT_PUBLIC_ADSENSE_CLIENT` env var in Vercel
  2. Add the AdSense loader script to `app/layout.tsx` head:
     ```tsx
     <Script async strategy="afterInteractive"
       src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
       crossOrigin="anonymous" />
     ```
  3. Redeploy
- Submit `sitemap.xml` to Google Search Console
- Set up a Pinterest business account and pin every result page
- Begin the weekly content cadence (1 new quiz / week, draft via `docs/authoring-prompt.md`)
- Q2: build out the 5 quizzes from the roadmap in the spec (Easter, Pauline Letter, Geography IQ, NT IQ, Worship Style Profile)

---

## Self-review notes (engineer ignore — for plan author's eyes only)

Spec coverage verified against `docs/superpowers/specs/2026-05-31-parable-quiz-design.md`:

- §2 Tech stack → Tasks 1–3
- §3 Brand tokens → Task 4
- §4 Test catalog → Tasks 16, 34–36
- §5 Test data model → Tasks 6–9 (Zod), 10–12 (scoring)
- §6 Folder layout / routes → Tasks 18–32
- §7 UX templates → matched component-by-component
- §8 Sharing + OG → Tasks 26, 31
- §9 Build pipeline + vercel.ts → Tasks 5, 15
- §10 Deploy → Task 39
- §11 Analytics + SEO → Tasks 4 (Analytics), 26 (events), 32 (sitemap/robots), 37 (JSON-LD)
- §12 Ad strategy → Tasks 23, 24, 30 (env-gated)
- §13 Authoring workflow → Task 33
- §14 Costs → no engineering task (informational)
- §15 Implementation outline → this entire plan
- §16 Out of scope → not implemented (correctly absent)

Type consistency verified:
- `scoreArchetype(test, answers)`, `scoreProfile(test, answers)`, `scoreKnowledge(test, answers)` — signatures used identically in Tasks 10–12 and Task 24 (`TestRunner`)
- `loadTestBySlug` and `loadAllTests` — names match across Tasks 14, 27, 28, 29, 30, 31, 32
- `ScriptureRef`, `TestBase`, `ArchetypeTest`, `ProfileTest`, `KnowledgeTest`, `Test` — all exported in Task 9, referenced consistently after
- `getScripture` — same name in Tasks 13, 15, 25
