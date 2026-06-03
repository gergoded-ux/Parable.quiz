# Bible quizzes expansion + organized catalog — design

Date: 2026-06-03
Status: approved (brainstorm) → pending spec review

## Goal

Two linked outcomes:

1. **Fill the Bible-content gap.** The catalog is currently all personality/struggle
   quizzes (200 from autoresearch + ~20 originals). Bible-knowledge and
   Scripture-character quizzes are nearly absent (only 4 IQ quizzes, none live).
   Add ~40 new Bible quizzes — a mix of knowledge/trivia and Scripture
   archetypes — and launch all Bible quizzes live (~44 total: 4 existing IQ + 40 new).

2. **Make the catalog a real, organized, classified repertory.** Today
   classification is split across folders, a `category` field, `published.json`,
   and `topic-backlog.tsv`, with no single accurate index. Introduce a `theme`
   classification on every quiz and an auto-generated master catalog that
   classifies all ~260 quizzes and never drifts.

## Decisions (from brainstorm)

- **Quiz type:** a mix — roughly 20 knowledge/trivia + 20 Scripture archetypes.
- **Launch scope:** all ~44 Bible quizzes go live (live total ≈ 114).
- **Repertory form:** an auto-generated catalog (`content/generated/catalog.json`
  + `docs/catalog.md`).
- **Classification model:** Approach A — quizzes self-describe via a new `theme`
  field; the catalog reads the quiz files as the source of truth and joins
  status/cover/virality from the other files.

## Non-goals (YAGNI)

- No homepage redesign to theme-based browsing yet (homepage stays mode-based;
  the Bible IQ section simply populates). A theme-based browse page can be a
  later follow-up.
- No physical folder reorganization of `content/tests`.
- No cover-art generation (the user makes covers; quizzes fall back to the
  gradient+emoji placeholder until art exists).
- No changes to scoring, the result-card system, or the OG renderer.

## Part 1 — Classification model

### `theme` field

Add an optional `theme: string` to `TestBase` in `lib/schema.ts`. Keep the
existing `category` (the three top-level buckets: `bible-character`,
`spiritual-profile`, `bible-iq`). `theme` is a finer, cross-cutting tag drawn
from a controlled vocabulary.

### Controlled vocabulary (≈17 themes)

```
identity              — who am I / worth / not-enough / chosen
anxiety               — worry, overthinking, fear patterns
forgiveness           — forgiving others, bitterness, unforgiveness
church-hurt           — religious trauma, leaving/returning to church
grief-loss            — grief, loss, lament
healing-wounds        — core wounds, inner healing, generational patterns
doubt-faith           — doubt, deconstruction, dark night, faith crisis
calling-purpose       — calling, decisions, waiting seasons
relationships-dating  — is-he-the-one, dating, marriage, love style
money-work            — money fears, hustle, workaholism
comparison-shame      — comparison, social-media envy, shame stories
rest-burnout          — rest, sabbath, burnout, tiredness
parenting-family      — parenting, honoring parents, family
hearing-god           — discernment, God's voice/silence, spiritual dryness
loneliness-belonging  — loneliness, friendship, belonging
bible-knowledge       — trivia / recall (the IQ quizzes)
scripture-archetype   — "which biblical ___ are you" (Bible-content archetypes)
```

The exact list is finalized during implementation; this is the working set.

### Backfill (all ~260 quizzes)

- **~200 autoresearch quizzes:** a script maps each quiz's `struggle` value (from
  `topic-backlog.tsv`, joined by slug) to one controlled theme via a mapping
  table. Ambiguous ones are reviewed by hand.
- **~20 originals + 40 new:** hand-tagged (they're not in the backlog TSV).
- Result: every quiz JSON carries a `theme`. `validate-tests` warns on any quiz
  missing a `theme` or using a theme outside the vocabulary.

## Part 2 — Auto-generated catalog

`scripts/build-catalog.ts` scans the source of truth and writes two artifacts:

- `content/generated/catalog.json` — machine-readable array:
  `{ slug, title, category, theme, mode, status, hasCover, virality }`
  - `status`: `"live"` if in `published.json`, else `"backlog"`.
  - `hasCover`: from the cover manifest / `public/quizzes`.
  - `virality`: from `topic-backlog.tsv` if present, else `null`.
- `docs/catalog.md` — human-readable repertory:
  - A summary header (total, live, backlog, with-cover counts; counts per
    category and per theme).
  - Tables grouped by **category → theme**, each row showing title, slug,
    LIVE/backlog, cover ✓/–, and virality.

Wiring: add `pnpm build:catalog`, run it in the `build` chain (alongside
`build:art`) and in `vercel.ts` `buildCommand`, so the catalog is regenerated on
every deploy and can never drift.

## Part 3 — The 40 new Bible quizzes

- **Autoresearch** scoped to Bible-content demand (not modern struggles),
  grounded in real search/YouTube/Reddit signals (e.g. "how well do you know the
  Bible", "which disciple are you", "Bible trivia", "which Psalm"). Deduped
  against the existing 220. Scored for virality. Appended to `topic-backlog.tsv`
  (same columns).
- **~20 knowledge/trivia** (`knowledge` mode): grade bands + per-option
  explanations. Examples: Gospels IQ, Parables IQ, Old Testament Kings, Names of
  God, Bible Geography, Miracles of Jesus.
- **~20 Scripture archetypes** (`archetype` mode): result set with
  emoji/traits/scripture/cardVerse. Examples: Which prophet, Which Psalm, Which
  miracle, Which tribe of Israel, Which disciple.
- All built schema-valid, **humanized** (no AI-writing tells), **ASV** verses
  for any scripture (ref labeled ASV), and passing `validate-tests`.
- Each new quiz is tagged `theme: bible-knowledge` or `theme: scripture-archetype`.

## Part 4 — Launch wiring

- Append all ~44 Bible slugs to `content/published.json`.
- Homepage: the Bible IQ (knowledge) section now populates; new Scripture
  archetypes appear in the Bible-character section. Featured row logic unchanged.
- Fix the `HomeNav` "Bible IQ" link (now a live section).
- Regenerate the catalog so `docs/catalog.md` reflects the new live set.

## Phasing (for the implementation plan)

1. **Classification + catalog** — `theme` schema field, backfill all 260,
   `build-catalog.ts` (+ json/md), build wiring, validation. Delivers the
   organized repertory for the current 220 immediately.
2. **Autoresearch + build the 40** — research, build (humanized, ASV), tag
   themes, append backlog TSV, validate.
3. **Launch wiring** — publish the 44, homepage/nav, regenerate catalog.

## Success criteria

- `docs/catalog.md` lists every quiz, classified by category + theme, with
  accurate live/backlog + cover + virality, regenerated on build.
- `theme` present and valid on all quizzes; `validate-tests` enforces it.
- ~40 new Bible quizzes (mix), humanized, ASV, schema-valid.
- All ~44 Bible quizzes live; homepage Bible sections populate; nav link works.
- Production build green; live page count rises from ~70 to ~114.
```
