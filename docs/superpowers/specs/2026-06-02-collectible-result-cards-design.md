# Collectible Result Cards — Design Spec

**Date:** 2026-06-02
**Status:** Design approved, pending implementation plan
**Feature:** Shareable, rarity-driven collectible result cards for Parable

---

## 1. Goal

Turn every quiz result into a **collectible trading-card image** that people share on X, Threads, Instagram, and TikTok for its own sake. Virality comes from: a beautiful card, **rarity** (a rare pull is brag-worthy), a **personal match score**, and a **reveal moment** worth screen-recording.

This is scope **B** from the brainstorm (card + rarity tiers). The collection *binder* (scope C) is explicitly **deferred**, but the data model stores what it would need.

---

## 2. Locked decisions

| Decision | Value |
|---|---|
| Art direction | Stained-glass frame (Gemini Option 3) |
| Rarity tiers | Common / Rare / Epic / Legendary |
| Rarity driver | **Match strength** (how decisively answers point to the result) |
| Tier thresholds | Common <70 · Rare 70–84 · Epic 85–94 · Legendary 95+ |
| Star rating | Vertical rail, left edge of panel; 5-star **fill** by tier (2/3/4/5) + per-rarity **material**: green / sapphire / purple / gold |
| Format | Portrait 1080×1350 (4:5) |
| Image window | **Square**, arched-to-square framed window |
| Title | Fixed-height frame, font auto-fits to name length |
| Stat area | Archetype → **affinity split**; Profile → top-3 **dimension scores**; Knowledge → score + band |
| Card verse | Optional short positive `cardVerse` per result; falls back to the result's main verse |
| Illustration | Optional per result; falls back to the result **emoji** on a soft background |
| Typography | Cinzel (name), EB Garamond italic (epithet/verse), Inter (labels/stats) |
| Share artifact | Client-side PNG snapshot of the live card (full fidelity) + Web Share API |
| Link preview | Server `next/og` card as the OG image |
| Card-art hosting | `CARD_ART_BASE` env → `public/` for v1, Cloudflare later |
| Image format | JPG for v1; optional WebP batch step later |
| Collection binder | Deferred (data captured for later) |

---

## 3. Card anatomy (the face)

A portrait 1080×1350 card: a **rarity frame PNG** as the full-bleed background, with a cream **panel** overlay containing, top to bottom:

1. `PARABLE` wordmark (Cinzel, small)
2. **Square image window** — the result illustration (or emoji fallback) in an arched-top, square-bottom framed window
3. Rarity label (e.g., `✦ LEGENDARY`), colored per tier
4. **Name** in a fixed-height title frame (auto-fit font: long names shrink, short names stay large)
5. Epithet (EB Garamond italic)
6. Traits (up to 3, Inter caps)
7. **Stat area** (see §5)
8. **Card verse** (EB Garamond italic) + reference + `(ASV)`
9. Match line (e.g., `98% MATCH`, small)

Plus a **vertical star rail** on the panel's left edge: 5 stars, filled by tier, rendered in the rarity material.

Four rarity frames (green / sapphire / purple / gold) are interchangeable backgrounds; the same illustration rides any frame.

---

## 4. Rarity = match strength

`matchPct` (0–100) measures how decisively the answers point to the winning result:

- **Archetype / "which X":** winner's share of total weighted points across all results.
- **Profile:** the top dimension's normalized 0–100 score (already produced by `scoreProfile`).
- **Knowledge:** the score percentage.

`matchPct` → tier:

| Tier | matchPct | Stars (filled / 5) | Material |
|---|---|---|---|
| Common | < 70 | 2 | green |
| Rare | 70–84 | 3 | sapphire |
| Epic | 85–94 | 4 | purple |
| Legendary | 95+ | 5 | gold |

A small pure module `lib/rarity.ts` maps `matchPct → { tier, label, stars, material, accentHex, frameAsset }`.

---

## 5. Stat area by mode

- **Archetype/"which X":** **affinity split** — the top results by weighted share (e.g. Leah 88% / Rachel 12%). For binary quizzes that's two bars; for multi-result, show top 2–3. Derived from scoring; no new authored data.
- **Profile:** the top 3 **dimension scores** (the real 0–100 numbers from `scoreProfile`).
- **Knowledge:** correct/total + grade-band label (no bars).

`lib/scoring.ts` is extended so archetype and profile scoring return, in addition to the winner, an ordered **affinity/score distribution** and the **matchPct**. (Existing return shapes stay; new fields/functions are additive so current tests keep passing.)

---

## 6. Content fallbacks (ship without 1,100 assets)

- **Illustration optional.** The renderer resolves `CARD_ART_BASE/<slug>/<key>.(webp|jpg)`. If present, it fills the window; if not, the window shows the result **emoji** on a soft warm background. Leah/Rachel are the pilot set; more art is added over time without code changes.
- **Card verse optional.** A new optional `cardVerse` field (same shape as inline scripture) gives a short, positive verse tuned for the small card. If absent, the card uses the result's main verse (truncated if very long). No need to re-author verses for all results now.

---

## 7. Two rendering paths

### 7a. Live card (result page)
A React component renders the card in the DOM with full real data (match, affinity, rarity, verse, image). It plays a **flip reveal** on load: card-back → flips to front with a rarity shimmer; Legendary adds extra sparkle. Pure CSS transforms (no heavy animation lib). This is the screen-recordable moment.

### 7b. Share artifact (PNG)
On **Share**, the live card DOM is snapshotted to a PNG client-side (e.g. `html-to-image`). Then:
- **Mobile:** `navigator.share({ files: [png] })` → native share sheet (IG/TikTok/X stories).
- **Desktop / no Web Share:** download the PNG + copy link + Pinterest/X/Facebook buttons (extend existing `ShareBar`).

The client snapshot has full fidelity (all real numbers) and avoids encoding everything in a URL.

### 7c. Link preview (OG image)
The result route's `og:image` points to a server `next/og` card route. Because the OG route only knows `slug` + result `key` (not the taker's answers), it renders from those plus an optional `?m=<matchPct>` query param:
- **Personal share link:** the share/copy URL includes `?m=88` (and, for binary, that's enough to show affinity). The result page reads `?m=` so the unfurled preview matches the taker's pull.
- **Organic/SEO visit (no param):** the OG route renders a clean **representative** card for that result (default tier, no personal match line) — statically generatable for SEO.

So: full personal fidelity in the downloaded PNG; faithful link-unfurl via the OG route; clean static card for organic discovery.

---

## 8. Production rendering (`next/og` / Satori)

The server card route composites:
- The **rarity frame PNG** as background.
- The **illustration** (from `CARD_ART_BASE`) or emoji fallback.
- **Embedded fonts**: Cinzel, EB Garamond, Inter (fetched/bundled for Satori).
- **Star icons as small SVG/PNG per material** (Satori can't gradient-clip text, so gem stars ship as assets).
- Panel, text, bars — flat flexbox/CSS within Satori's supported subset.

Output: 1080×1350 PNG, cached. `next/og` runs on Vercel **or** a Node VPS, so this ports off-Vercel later.

The live card (§7a) and the server card (§8) share the same layout tokens (one source of truth for colors, fonts, positions) so they match.

---

## 9. Data model changes

- **Schema** (`lib/schema.ts`): add optional `cardVerse: InlineScripture` to `ArchetypeResult` and `ProfileResult`. Everything else unchanged. `validate-tests` does not require it.
- **Scoring** (`lib/scoring.ts`): additive — archetype scoring returns an ordered affinity distribution + `matchPct`; profile scoring exposes `matchPct` (top dimension). Existing functions/returns preserved so current 30 unit tests pass.
- **No database.** Rarity/affinity/match are computed from answers at runtime; nothing persisted. (A future collection binder could persist to localStorage; out of scope here.)

---

## 10. File structure (additions/changes)

```
lib/
  rarity.ts            ← matchPct → tier/stars/material/accent/frame (pure, unit-tested)
  scoring.ts           ← extend: affinity distribution + matchPct (additive)
  card-art.ts          ← resolve CARD_ART_BASE/<slug>/<key> with emoji fallback
  card-layout.ts       ← shared layout tokens (colors, fonts, positions) for both renderers
components/
  card/
    ResultCardLive.tsx     ← DOM card + flip reveal (client)
    StarRail.tsx           ← vertical star rail
    CardStatArea.tsx       ← affinity vs dimension bars
  ShareBar.tsx         ← extend: Web Share API (files) + PNG download
app/
  og/[slug]/[key]/route.tsx  ← rewrite: full card via next/og (+ optional ?m=)
public/
  cards/frames/frame_stained_glass_{common,rare,epic,legendary}.png
  cards/stars/{green,sapphire,purple,gold}.svg
  cards/fonts/{Cinzel,EBGaramond,Inter}-*.ttf   (or fetched at build)
  results/<slug>/<key>.jpg                        (pilot: are-you-a-leah-or-a-rachel/{leah,rachel}.jpg)
content/tests/**.json   ← optional cardVerse added where desired (pilot first)
```

Frames move from `docs/design/generated-cards/frames/` into `public/cards/frames/`.

---

## 11. Config

- **`CARD_ART_BASE`** (env, default `/`): base URL for frames + illustrations. `public/` now → Cloudflare later, no code change.
- **`NEXT_PUBLIC_SITE_URL`** already implied for share/OG absolute URLs.
- Optional later: a `sharp` script to batch-convert illustrations to WebP with JPG fallback.

---

## 12. Testing

- **Unit:** `lib/rarity.ts` (threshold/star/material mapping at boundaries 69/70/84/85/94/95), extended scoring (matchPct + affinity correctness, distribution ordering, binary + multi-result).
- **Build/smoke:** OG card route returns 200 + PNG for archetype/profile/knowledge results and with/without `?m=`; emoji fallback path (a result with no illustration); pilot art path (leah/rachel).
- Existing 30 tests must keep passing (changes are additive).

---

## 13. Scope

**In (this build):**
- `lib/rarity.ts`, extended scoring (matchPct + affinity)
- Card layout tokens shared by both renderers
- Server `next/og` card renderer (frame + art/emoji + fonts + star SVGs + bars), replacing the current basic OG route
- Live result-page card + flip reveal
- Share flow: Web Share (files) + PNG snapshot/download, extended ShareBar
- OG-as-card link preview (+ optional `?m=`)
- `cardVerse` optional field
- `CARD_ART_BASE` env + emoji fallback + Leah/Rachel pilot art committed under `public/`
- Star SVG assets (4 materials), frame PNGs moved to `public/cards/frames/`

**Deferred (not this build):**
- Full illustration set for all ~1,100 results
- WebP conversion pipeline
- Collection **binder** (scope C)
- Autoresearch **A/B card optimization** — legitimate once live, using real `share_click ÷ quiz_complete` as the mechanical metric; not possible pre-traffic
- Pack-opening / multi-card animations beyond the single flip reveal

---

## 14. Why this serves virality

- The **share artifact is an image**, not a link (images outperform links on X/Threads).
- **Rarity + stars + material** create brag-worthy scarcity; the **match %** is a personal flex.
- The **flip reveal** is a screen-recordable dopamine moment for TikTok.
- The **OG-as-card** means even a pasted link unfurls into the card.
- Graceful fallbacks mean it **ships now** (emoji + existing verses) and gets richer as illustrations are added.
