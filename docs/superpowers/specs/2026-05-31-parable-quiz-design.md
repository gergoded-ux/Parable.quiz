# Parable — Design Spec

**Date:** 2026-05-31
**Status:** Design approved, pending implementation plan
**Brand:** Parable
**Domain:** parable.quiz
**Tagline:** *What's your parable?*

---

## 1. Overview

Parable is an English-language, ecumenically-Christian, browser-based quiz site modeled on idrlabs.com's format but tuned for casual Christian seekers. The MVP ships **20 quizzes** across three modes — viral archetype quizzes, multi-dimensional spiritual profiles, and Bible-knowledge tests — with a content drumbeat that grows the catalog ~1 quiz per week post-launch.

Revenue comes from **display ads (Google AdSense) and viral share traffic**. No accounts, no email capture, no payments at launch.

### Scope (what's IN at launch)
- 20 quizzes (12 archetype + 5 profile + 3 knowledge)
- Static homepage, test pages, result pages
- Auto-generated OG share images per result
- Google AdSense placements (3 slots)
- Vercel Analytics + Speed Insights
- SEO basics: sitemap, robots, JSON-LD, canonical URLs

### Scope (what's explicitly OUT)
- User accounts / login
- Email capture / newsletter (deferred — possibly added in v2)
- Stripe / paid PDFs (deferred — possibly added in v2)
- Multilingual content (data model supports it; no non-English translations at launch)
- Catholic-specific saints / Reformer-specific Protestant quizzes (out of ecumenical scope)
- CMS (JSON files in repo are the source of truth, possibly forever)
- Mobile apps
- Interactive map UI (Bible Geography IQ deferred to post-launch)

### Locked-in decisions
| Decision | Value | Rationale |
|---|---|---|
| Audience | Casual seekers & curious Christians (TikTok/Pinterest traffic) | User pick |
| Doctrinal posture | Broadly Christian / ecumenical | Widest TAM, lowest controversy |
| Test mix (of 20) | 12 viral + 5 profile + 3 IQ | Lean viral, anchor with depth |
| Visual feel | Modern warm pastel (cream/sand/rose/brown) | Cozy, Hope-Nation-y, social-share-ready |
| Monetization | Ads + share buttons only (option A) | Fastest launch, no auth/payments infra |
| Languages | English only at launch; i18n-ready schema | Avoid premature complexity, preserve future option |
| Deploy | Git push → GitHub → Vercel auto-deploy | No Vercel CLI required locally |

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Theme | Custom warm-pastel tokens (cream, sand, rose, brown, ink) |
| Schema validation | Zod |
| OG images | `@vercel/og` |
| Hosting | Vercel (Hobby tier at launch) |
| Project config | `vercel.ts` (not vercel.json) |
| Package manager | pnpm |
| Analytics | Vercel Analytics + Speed Insights |
| Ads | Google AdSense (post-approval) |
| Source control | Git → GitHub → Vercel auto-deploy |

---

## 3. Brand & visual feel

**Wordmark:** "Parable" — bold, slightly-rounded sans-serif (e.g., Inter 800), color `#6b4423` (warm brown).

**Color tokens:**
- `--cream-1: #fdf5ee` (lightest background)
- `--cream-2: #f6e7d8` (gradient base)
- `--sand: #f0dcc4` (section dividers, hover)
- `--rose: #e8c9a7` (accents, pills)
- `--rose-dark: #d4a574` (CTAs, links)
- `--brown: #6b4423` (primary text, wordmark)
- `--brown-dark: #4a2f15` (headings)
- `--ink: #2d2a26` (body text)
- `--ink-soft: #4a3c2e` (secondary body)
- `--ink-mute: #8a6a47` (captions, meta)

**Typography:** Inter (sans-serif). Body 15-16px, headings 28-38px, captions 11-13px.

**Component aesthetic:** Soft rounded corners (12-14px), gentle shadows (`0 8px 24px rgba(180,140,80,.15)`), generous whitespace, no harsh borders.

---

## 4. The 20-test catalog

### Bucket A — Archetype (12 viral, share-driven)

| # | Title | Result set |
|---|---|---|
| 1 | Which Apostle Are You? | Peter, John, James, Andrew, Thomas, Matthew, Philip, Bartholomew |
| 2 | Which Bible Character Are You? | David, Moses, Esther, Ruth, Daniel, Joseph, Paul, Mary |
| 3 | Which Fruit of the Spirit Are You? | The 9 fruits (Galatians 5:22-23) |
| 4 | Which Woman of the Bible Are You? | Mary, Martha, Ruth, Esther, Deborah, Hannah, Rahab, Priscilla |
| 5 | Are You More Mary or Martha? | 2-result (Luke 10) — 5-question mini quiz |
| 6 | Which Psalm Speaks To You? | Psalms 23, 51, 91, 139, 119, 121, 27, 46 |
| 7 | Which Prophet Are You? | Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Jonah, Elijah |
| 8 | Which Parable Describes Your Life Right Now? | Prodigal Son, Good Samaritan, Sower, Mustard Seed, Lost Sheep, Talents, Pharisee & Tax Collector |
| 9 | Which Beatitude Defines You? | The 8 Beatitudes (Matthew 5) |
| 10 | Which Bible Animal Are You? | Lion of Judah, Lamb, Eagle, Dove, Sheep, Donkey, Serpent |
| 11 | Which Bible Story Are You Living Through Right Now? | Exodus, Wilderness, Lions' Den, Resurrection, Burning Bush, Pentecost, Storm at Sea |
| 12 | Which Christmas Story Character Are You? | Mary, Joseph, Wise Men, Shepherds, Innkeeper, Angel (seasonal: December push) |

### Bucket B — Profile (5 depth tests, multi-dimensional)

| # | Title | Dimensions |
|---|---|---|
| 13 | Spiritual Gifts Profile | Teaching, Mercy, Prophecy, Leadership, Service, Wisdom, Faith, Healing, Discernment, Evangelism, Giving, Exhortation |
| 14 | Beatitudes Profile | The 8 Beatitudes — score across all 8 + growth area |
| 15 | Virtues & Vices Profile | 7 Virtues vs 7 Deadly Sins (paired mirror chart) |
| 16 | Prayer Style Profile | Contemplative, Petitionary, Praise, Lament, Intercessory, Listening, Scripture-praying |
| 17 | Spiritual Discipline Recommender | Output: actionable recommendation ("Try Lectio Divina this week") |

### Bucket C — Knowledge / Bible IQ (3)

| # | Title | Format |
|---|---|---|
| 18 | Genesis IQ | 15 questions |
| 19 | Parables IQ | 12 questions (match parable → lesson + spot misquotes) |
| 20 | Verse or Inspirational Quote? | 10 questions — "did Jesus say this, or did Pinterest?" |

### Post-launch roadmap (next 20, by quarter)

**Q2** — Which Easter Character Are You? · Which Pauline Letter Speaks To You? · Bible Geography IQ · New Testament IQ · Worship Style Profile
**Q3** — Which Spiritual Armor Piece Are You? · Which Bible Mountain Are You? · Names of God Quiz · Calling Profile · Discipleship Stage Profile
**Q4** — Which Christmas Hymn Are You? · Which Bible Villain Has Your Worst Trait? · Which Disciple Misunderstood Jesus Like You Do? · Old Testament IQ · Spiritual Battle Profile
**Evergreen** — Which Bible Friendship Are You In? · Books of the Bible Sorter · Acts IQ · Which Bible Prayer Matches Yours? · Which Sermon on the Mount Teaching Convicts You?

Total 12-month catalog: **40 quizzes**.

---

## 5. Test data model

Test JSON lives under `content/tests/{archetype,profile,knowledge}/{slug}.json` and is validated by a single Zod discriminated union at build time. Scripture text is normalized into `content/shared/scriptures.json` so verses can be reused without duplication.

### Schema sketch

```ts
// lib/schema.ts (sketch — final form during implementation)
import { z } from 'zod';

const ScriptureRef = z.string();  // e.g., "matt-16-18" → resolves via shared/scriptures.json

const TestBase = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  lang: z.string().default('en'),
  category: z.enum(['bible-character', 'spiritual-profile', 'bible-iq']),
  estimatedMinutes: z.number().int().positive(),
});

const ArchetypeTest = TestBase.extend({
  mode: z.literal('archetype'),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.object({
      text: z.string(),
      weights: z.record(z.string(), z.number()),  // { peter: 2, james: 1 }
    })),
  })),
  results: z.record(z.string(), z.object({
    name: z.string(),
    emoji: z.string(),
    traits: z.array(z.string()),
    description: z.string(),
    scriptureRef: ScriptureRef,
  })),
});

const ProfileTest = TestBase.extend({
  mode: z.literal('profile'),
  dimensions: z.array(z.string()),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.object({
      text: z.string(),
      weights: z.record(z.string(), z.number()),  // dimension → score
    })),
  })),
  results: z.record(z.string(), z.object({
    name: z.string(),
    description: z.string(),
    scriptureRef: ScriptureRef.optional(),
  })),
});

const KnowledgeTest = TestBase.extend({
  mode: z.literal('knowledge'),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.object({
      text: z.string(),
      correct: z.boolean(),
      explanation: z.string().optional(),
    })),
  })),
  scoring: z.object({
    perfectMessage: z.string(),
    gradeBands: z.array(z.object({
      min: z.number(),
      max: z.number(),
      label: z.string(),
      message: z.string(),
    })),
  }),
});

export const Test = z.discriminatedUnion('mode', [ArchetypeTest, ProfileTest, KnowledgeTest]);
export type Test = z.infer<typeof Test>;
```

### Scoring functions (`lib/scoring.ts`)

- **scoreArchetype(test, answers)** → returns the result key with the highest weighted sum; ties broken by question order.
- **scoreProfile(test, answers)** → returns a `Record<dimension, normalizedScore>` (0-100) for chart rendering.
- **scoreKnowledge(test, answers)** → returns `{ correct, total, percent, gradeBand }`.

---

## 6. Architecture & routes

### Folder layout

```
parable-quiz/
  app/
    layout.tsx
    page.tsx                            ← homepage
    q/[slug]/page.tsx                   ← test page
    q/[slug]/r/[key]/page.tsx           ← result page (sharable URL)
    og/[slug]/[key]/route.tsx           ← @vercel/og image route
    sitemap.ts                          ← generated from test catalog
    robots.ts
  components/
    TestRunner.tsx                      ← generic, handles all 3 modes
    QuizCard.tsx
    ResultCard.tsx
    ShareBar.tsx
    AdSlot.tsx
  lib/
    schema.ts                           ← Zod (see Section 5)
    scoring.ts                          ← 3 functions, one per mode
    test-loader.ts                      ← reads + validates JSON at build
    scripture.ts                        ← loads + resolves scriptureRef
  content/
    tests/archetype/*.json              ← 12 files
    tests/profile/*.json                ← 5 files
    tests/knowledge/*.json              ← 3 files
    shared/scriptures.json
  scripts/
    validate-tests.ts                   ← pnpm validate:tests
  vercel.ts
  next.config.ts
  tailwind.config.ts
  package.json
```

### Rendering strategy

| Route | Strategy | Why |
|---|---|---|
| `/` | SSG (rebuilds on deploy) | Catalog only changes on commit |
| `/q/[slug]` | SSG | Pure static content |
| `/q/[slug]/r/[key]` | SSG (one per result-key, known at build) | Sharable, indexable |
| `/og/[slug]/[key]` | `@vercel/og`, ISR-cached | Auto-generated branded share image |

### Result page = the viral mechanism
When someone shares "I got Peter the Bold," the link `parable.quiz/q/which-apostle-are-you/r/peter` resolves to a pre-rendered page whose `og:image` is the branded Peter card. That's the share loop. Result pages are **separately indexable**, so Google can surface them in search ("which apostle is Peter most like" → result page wins the click).

---

## 7. UX templates (approved via mockup review)

### Homepage
- Top nav: wordmark + 4 nav links (Quizzes / Spiritual Profiles / Bible IQ / About)
- Hero: "What's your parable?" + subtitle + meta strip ("20 QUIZZES · ALWAYS FREE · NO SIGN-UP")
- Three section grids (3 cards each): Most shared this week · Spiritual profiles · Bible IQ
- One ad slot mid-page
- Minimal footer (© Parable · About · Privacy · Suggest a quiz)

### Test page (`/q/[slug]`)
- Sticky thin header: wordmark + progress bar with "Question 3 of 12 · {Title}"
- Large question text (28px, brown-dark)
- 4 answer cards (white, soft border, hover-rose, selected-brown)
- Back / Next buttons
- Ad slot between Q3 and Q4 (NOT before Q1 — protects bounce rate; NOT between question and answer reveal — protects engagement)

### Result page (`/q/[slug]/r/[key]`)
- Hero: top nav (consistent with homepage)
- Result card (the focal point above the fold):
  - "YOU ARE" label
  - Big archetype name (38px)
  - Emoji (60px)
  - Description paragraph
  - 3 trait pills
  - Scripture verse (italic, divided by hairline)
- Share bar (centered, just below card): **Pin it · X · Facebook · Copy link** (Pinterest leads because spiritual content shares heavily there)
- Ad slot after share bar
- "Take another" section with 3 related quiz cards

### Mobile collapse
- All 3-column grids → 1 column on phones
- Share bar wraps to 2×2 grid
- Result card maintains focal-point position above fold

---

## 8. Sharing & viral mechanics

- **OG share images**: 1200×630 PNG generated per result via `@vercel/og`. Includes wordmark, "I got {name}", emoji, traits, and result URL.
- **Share copy templates** per platform:
  - X / Twitter: `I got "{name}" on Parable — what's yours? {url}`
  - Pinterest: pin uses the OG image + result name as alt text + link to result URL
  - Copy link: URL only
- **Related quizzes**: 3 hand-picked related quizzes per quiz (defined in `lib/related.ts`) — drives internal session time.
- **Sitemap explicitly includes every result URL** so search engines index "you got Peter the Bold" pages.
- **JSON-LD `Quiz` schema** on every test page for rich Google results.

---

## 9. Build pipeline

1. `pnpm validate:tests` — runs every JSON through Zod. Catches typos, missing scriptureRefs, weight mismatches. Fails CI on error.
2. `pnpm build` — Next.js production build, statically generates all pages.
3. Sitemap auto-built from the test catalog at build time.
4. Preview deployment on every Git push.

### `vercel.ts`

```ts
import { type VercelConfig, routes } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm validate:tests && pnpm build',
  framework: 'nextjs',
  headers: [
    routes.cacheControl('/og/(.*)', { public: true, maxAge: '1 week' }),
  ],
};
```

---

## 10. Deployment

- Local: develop in `C:\dev\Bible_Labs`, push to GitHub
- GitHub: repo `parable-quiz` (private or public — user's choice; recommended public for transparency)
- Vercel: user connects GitHub repo to Vercel via Vercel UI; auto-deploy on every push to `main`
- DNS: `parable.quiz` configured in Vercel UI → Vercel-managed nameservers (simplest) or user's registrar with A/CNAME records
- Preview deployments: every PR gets a unique preview URL

User handles the Vercel UI side. Claude handles the code side.

---

## 11. Analytics & SEO

### Analytics (free)
- **Vercel Analytics**: pageviews, top tests, geography
- **Vercel Speed Insights**: Core Web Vitals
- **Custom events** tracked via Vercel Analytics:
  - `quiz_start` (on first question render)
  - `quiz_complete` (on result page load)
  - `share_click` (with platform parameter)
  - `related_quiz_click`

### SEO
- Per-result page: dynamic `<title>` ("You are Peter the Bold · Which Apostle Are You?")
- `og:image` → @vercel/og generated card
- JSON-LD `Quiz` schema on test pages
- Canonical URLs (result pages self-canonical, NOT redirected to test root)
- `sitemap.xml` includes all routes (home, tests, result pages)
- `robots.txt` allows all crawling

---

## 12. Ad strategy

- **Apply for Google AdSense ~30 days post-launch** (AdSense requires established traffic)
- 3 slot positions wired but conditional on `NEXT_PUBLIC_ADSENSE_CLIENT` env var
- Until AdSense approval, ad slots render empty by default; can optionally serve Christian-niche affiliate banners (Logos Bible Software, FaithGateway) as bridge revenue
- **Strict rule:** NO ad between a question and its answer reveal

---

## 13. AI-assisted authoring workflow (post-launch)

The point of the JSON schema is that each new test can be drafted in ~20 minutes:

1. **LLM prompt** (template lives in `docs/authoring-prompt.md`):
   *"Write a test JSON for [topic] matching `lib/schema.ts`. 8-10 questions, [N] result archetypes, each with scripture ref + 3 traits. Use ecumenical Christian framing."*
2. **Human review pass**: theology check, question quality, scripture accuracy
3. **`pnpm validate:tests`** confirms schema correctness
4. **Commit → preview deploys → ship**

Cadence target: **1 new test/week** post-launch = 52 tests/year on top of the 20 launch quizzes.

---

## 14. Costs (year 1)

| Item | Cost |
|---|---|
| `parable.quiz` domain | ~$15/yr |
| Vercel Hobby | $0 |
| Google AdSense | $0 (revenue) |
| Vercel Analytics & Speed Insights | $0 |
| **Minimum to launch** | **~$15** |
| Vercel Pro (if scale demands it) | $20/mo (optional, defer) |

---

## 15. High-level implementation outline

(Detailed step-by-step plan generated separately by the writing-plans skill.)

1. Scaffold Next.js 15 + TypeScript + Tailwind + shadcn/ui (warm pastel theme)
2. Implement `lib/schema.ts` (Zod) and `lib/scoring.ts` (3 functions)
3. Author 1 complete test JSON end-to-end as schema proof (Which Apostle)
4. Build generic `<TestRunner>` component (handles all 3 modes)
5. Build result page + `@vercel/og` image route
6. Build homepage with quiz grid + sections
7. Author remaining 19 tests with LLM assist + human edit
8. Configure `vercel.ts`, sitemap, robots, JSON-LD, analytics events
9. Add ShareBar, AdSlot (conditional on env var), related-quizzes logic
10. End-to-end QA on local + Vercel preview
11. Initialize GitHub repo and connect to Vercel (user); production deploy
12. Apply for AdSense ~30 days post-launch

---

## 16. Out of scope / future considerations

**Deferred to v2 (post-launch validation):**
- Email capture / newsletter
- Premium PDF reports (Stripe + light accounts)
- Spanish / Portuguese translations (data model supports it)
- Bible Geography IQ (deferred — needs interactive map UI)
- Catholic and Protestant denominational sub-verticals (deferred — would require posture lanes)

**Explicit non-goals:**
- A CMS (JSON in repo wins on cost, simplicity, and AI-assist friendliness)
- A mobile app (responsive web is sufficient for the casual-seeker audience)
- "Are you saved?" / "Is your faith real?" style tests (alienating)
- Tests that require denominational lanes (would split audience)
