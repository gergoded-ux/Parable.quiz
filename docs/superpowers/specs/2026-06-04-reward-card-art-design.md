# Reward-card art system — design

Date: 2026-06-04
Status: approved (brainstorm) → pending spec review

## Goal

Give every quiz **result** a consistent collectible-card "reward" image, driven by
a small reward-art **taxonomy** so it scales to current and future quizzes.
Deliverables:

1. A `rewardArt` type on every live result (the classification).
2. A **Grok-build job-sheet** MD that an agentic Grok can read and execute
   (generate each image, save it to an exact path), with ruthlessly explicit style.
3. An **auto-generated reward repertory** (catalog) so it is easy to find what
   each reward is and what still needs art.
4. A wiring fix so the saved images actually render on the card.

## Scale (live set)

- **537 live reward images**: 273 Bible-character results + 264 spiritual-profile
  results, across 102 live archetype/profile quizzes.
- **24 live knowledge quizzes** are score-based: they reuse the **quiz cover** as
  card art (no per-result reward images, no `rewardArt`).
- Backlog results are not tagged/generated now; they get tagged when promoted.

## Part 1 — Reward-art taxonomy (6 types)

All images share ONE base style; each type adds a composition template. Defined in
`lib/reward-art.ts` (the vocabulary + a per-quiz/per-result default inference).

**Base STYLE (verbatim, every image):**
> Soft 2D animated-storybook illustration, painterly cel shading, warm
> golden-hour biblical / ancient-Near-East palette (cream, sand, rose, gold, soft
> teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one
> clear central subject on a softly blurred background, square 1:1 composition, no
> text, no letters, no logos, no watermark. No depiction of God or Jesus' face
> (show distant, silhouetted, or from behind).

**Negative prompt (every image):** text, watermark, signature, extra limbs,
deformed hands, modern objects, any depiction of the face of God or Jesus, harsh
shadows, cluttered background, busy edges.

**Output rules:** 1024x1024 PNG, single subject, generous breathing room at the
edges (a stained-glass frame overlays the border).

**The 6 types (composition templates):**
1. **character** — a named person (Isaiah, Esther, David, a gospel writer). Single
   figure, portrait or 3/4, warm expression, period dress, face shown (people only,
   never God/Jesus).
2. **creature** — an animal or celestial being (lion, dove, lamb, eagle; a
   biblically-accurate angel). One noble creature, centered, symbolic.
3. **object** — a sacred artifact (ark, Moses' staff, crown, scroll, oil lamp,
   harp, a piece of the armor of God). Hero-lit single item on soft ground.
4. **place** — a location or structure (Mount Sinai, Jerusalem, the Temple, Eden,
   Nineveh, Noah's ark as a vessel). One iconic landmark, no faces.
5. **scene** — a dramatic moment/event (parted sea, calmed storm, a plague, a
   miracle, a feast, a day of creation). Atmospheric; figures distant or silhouetted.
6. **symbol** — an abstract concept with no literal form (a name of God, an "I AM"
   statement, a fruit of the spirit, a beatitude; profile traits like
   "The Overthinker"). An emblem or metaphor, iconographic, uncluttered.

## Part 2 — Classification (`rewardArt` field)

- Add optional `rewardArt` (enum of the 6) to `ArchetypeResult` and `ProfileResult`
  in `lib/schema.ts`.
- Tag all **537 live** results via a script: a per-quiz default (most quizzes are
  a single type, e.g. Which Prophet → all `character`, Which Bible Mountain → all
  `place`, every spiritual-profile → `symbol`) plus a per-result OVERRIDES map for
  mixed quizzes. Re-runnable; prints anything unresolved until 0.
- `validate-tests`: a **live** archetype/profile result must have a valid
  `rewardArt` (fail the build otherwise). Backlog results may be untagged.

## Part 3 — Grok-build job sheet (`docs/design/reward-card-prompts.md`)

A self-contained MD an agentic Grok executes:
- Header: the base STYLE, the 6 type templates, the negative prompt, output rules,
  and explicit Grok instructions ("generate each image at 1024x1024 PNG and SAVE it
  to the exact path in its row; do not add text; after all images, a human runs
  `pnpm build:art`").
- One **row per live result**, grouped by quiz in virality order:
  `slug/key` · type · **prompt** (base + that type's template + the specific
  subject, e.g. "the prophet Isaiah, scroll in hand, lips touched by a glowing
  coal") · **save path** `public/results/<slug>/<key>.png` · 1024x1024 PNG.
- Generated FROM the `rewardArt` tags + result names, so it stays in sync.
- 537 rows. Knowledge quizzes excluded (they reuse the cover).

## Part 4 — Reward repertory (auto-generated)

`scripts/build-reward-catalog.ts` → `content/generated/reward-catalog.json` +
`docs/reward-catalog.md`. One entry per reward image (per result):
`quizSlug, quizTitle, resultKey, resultName, rewardArt, category, status
(live/backlog), hasImage`.
- `hasImage` from the art manifest (does `public/results/<slug>/<key>.*` exist).
- `docs/reward-catalog.md`: summary counts (total, by type, live, with-image),
  then grouped by **reward type → quiz**, each row showing result name, save path,
  and image ✓/–. This is the "find what we need" repertory; the – rows are the
  to-generate list.
- Wired into the build (alongside `build:art` / `build:catalog`) so it never drifts.

## Part 5 — Wiring fix (ext-agnostic result art)

Today `build-art-manifest` stores `"slug/key"` (no extension) and
`card-art.artUrl(slug, key, ext='jpg')` guesses `.jpg`. If Grok saves `.png`, the
card requests a missing `.jpg` (the same bug class we hit with covers).
- Change the result manifest to record the real filename/extension (map
  `"slug/key" -> "slug/key.ext"`), and `artUrl` resolves the real ext from it.
- Update consumers (`app/og/[slug]/[key]/route.tsx`, `lib/card-data.ts` /
  `components/card/ResultCardLive.tsx`) to use the resolved URL and to fall back
  gracefully (existing emoji/placeholder) when a result has no image yet.

## Non-goals

- We do not generate the images (Grok-build does).
- No backlog reward images now (tagged + generated on promotion).
- No change to the card frame, rarity model, scoring, or layout.

## Success criteria

- Every live archetype/profile result has a valid `rewardArt`; `validate-tests`
  enforces it.
- `docs/design/reward-card-prompts.md` lists all 537 with the explicit style and
  exact save paths, ready for Grok-build.
- `docs/reward-catalog.md` (+ json) classifies every reward image with `hasImage`
  tracking, regenerated on build.
- Result-art lookup is extension-agnostic: a saved PNG renders on the card; a
  missing one falls back gracefully.
- Production build green.

## Phasing (for the plan)

1. Taxonomy module (`lib/reward-art.ts`) + `rewardArt` schema field + tag all 537
   live results + validate gate.
2. Ext-agnostic art lookup (manifest + `card-art` + consumers) + fallback check.
3. Reward catalog generator (json + md) + build wiring.
4. Grok job-sheet generator → `docs/design/reward-card-prompts.md`.
