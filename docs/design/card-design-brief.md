# Parable — Collectible Result Card: Design Brief for Gemini / Antigravity

You are designing a **collectible, shareable result card** for **Parable**, a free Christian quiz site. When a person finishes a quiz, they get a result; pressing **Share** generates a trading-card-style image. The goal is **virality**: the card must be beautiful and brag-worthy enough that people post it on X, Threads, Instagram, and TikTok for its own sake.

## 0. What to produce (read this first)

Produce **4 design options** (4 distinct art directions, defined in §6).

For **each** option, render a **batch of 3 card images** at three different rarities, using the sample data in §7:
- 1 × **Legendary**
- 1 × **Epic**
- 1 × **Common**

That is **12 card images total** (4 options × 3 cards). Label each clearly: `Option N — <Rarity> — <Result Name>`.

Then: a one-paragraph rationale per option, your single recommendation, and (for the recommended option only) the implementation-ready assets described in §8.

---

## 1. Product context

- Parable is a faith-themed quiz site in the spirit of 16personalities / IDRLabs, with ~220 quizzes (e.g. "Which Woman of the Bible Are You?", "What's Your Anxiety Style?").
- The result card is the **primary growth engine**. People share the *image*, not a link.
- Audience: Christians 18–45, heavy on Instagram/Pinterest/TikTok. Reverent but modern. The card should feel like a **premium sacred collectible**, never like a casino/loot-box pull.

## 2. Locked decisions — design WITHIN these (do not change them)

1. **Rarity drives the card's entire look.** The rarity tier sets the palette and finish. A Legendary must look unmistakably special (foil / holographic / radiant). A Common is tasteful but visibly plainer. This contrast is the whole point — it's what makes a rare pull worth screenshotting.
2. **Rarity = "match strength"** (how decisively the quiz answers point to one result). The card shows a **match %**. Tiers:
   - Common: under 70%
   - Rare: 70–84%
   - Epic: 85–94%
   - Legendary: 95%+
3. **Portrait trading-card format.**
4. **Tone: reverent, warm, premium, hopeful.** Sacred-collectible, not gambling.

## 3. Format & technical constraints (the card MUST be buildable in our stack)

- **Canonical share image: 1080 × 1350 px (4:5 portrait).** This is the feed-optimal ratio for Instagram / X / Threads. Compose the card within this frame. Keep the most important content within a vertically centered safe area so a 9:16 story reshare still reads.
- **Rendering pipeline:** Next.js + `@vercel/og` (which uses **Satori**). Satori supports **flexbox and a subset of CSS only** — NO CSS grid, NO `backdrop-filter`, limited/none `filter` and blend modes, no animations in the image. **Implication for your design:**
  - Bake all rich effects (foil, holographic sheen, texture, ornament, glow, starfield, gilding) into a **static frame image per rarity tier**. The dynamic content (name, %, stats, verse) gets composited on top with simple flat CSS.
  - So deliver each card as a **layered concept**: (a) a decorative **frame/background** that is rarity-specific and full-bleed, with a clearly defined **empty content safe-zone**; (b) the dynamic text/values placed in that safe-zone.
  - Keep all dynamic-text regions on relatively flat, high-contrast areas so 12–40px text stays legible.
- **Fonts:** body/labels use **Inter**. If you use a display font for the result name, name it explicitly (we must obtain the font file to embed in Satori).

## 4. Dynamic fields the card must hold (leave clean room for each)

| Field | Example | Notes |
|---|---|---|
| Wordmark | `Parable` | small, top of card |
| Match badge | `94%` | inside a hex or seal, a corner |
| Rarity label | `EPIC`, `✦ LEGENDARY` | prominent |
| Result name | `Esther` | the hero line, large |
| Epithet | `The Brave Advocate` | under the name |
| Hero emblem | `👑` | sits in an "image window". We currently use one emoji per result; design a clean window that could later hold an illustration. |
| Traits | `COURAGEOUS · STRATEGIC · FAITHFUL` | up to 3 short tags |
| Stat bars | `Courage 94`, `Faith 88`, `Influence 76` | up to 3 rows: label + 0–100 value + bar |
| Scripture | `"For such a time as this." — Esther 4:14 (ASV)` | must stay legible & uncluttered; translation tag "(ASV)" always shown |
| Quiz title | `Which Woman of the Bible Are You?` | small, optional, e.g. near footer |
| URL | `parable.quiz` | footer |

## 5. Rarity tiers — palette intent (each option interprets these in its own style)

- **Common (<70%):** muted, tasteful, matte. No foil. Calm.
- **Rare (70–84%):** cool jewel tone (sapphire / teal), subtle sheen.
- **Epic (85–94%):** royal purple / amethyst, stronger glow, light ornament.
- **Legendary (95%+):** gold foil / iridescent holo, radiant, maximum ornament — the "holy grail" pull.

## 6. The 4 design options (art directions to render)

All four are rarity-driven (per §2/§5). They differ in art style:

**Option 1 — Celestial / Sacred Geometry.** Deep cosmic starfield base, fine gold sacred-geometry linework framing the window, soft halo light rays behind the emblem. Rarity escalates through glow intensity, star density, and foil on the geometry. (Closest to a premium "card game" feel.)

**Option 2 — Illuminated Manuscript.** Aged parchment surface, ornate hand-illuminated gold filigree borders, a drop-cap treatment on the name, a wax-seal style match badge. Rarity escalates through richness of the gilding and the seal. Feels like a sacred relic.

**Option 3 — Stained Glass.** The card framed like a cathedral stained-glass window: leaded cames dividing jewel-toned glass panels, light glowing through. Rarity escalates through luminosity/backlight and gold in the leading. Instantly "Christian," very screenshot-able.

**Option 4 — Modern Minimal Holographic.** Clean, airy, lots of negative space, one bold central emblem, contemporary type. A holographic gradient that grows in coverage and intensity with rarity; metallic accents on higher tiers. Appeals to a younger, modern, design-literate audience.

## 7. Sample data — render these exact three for every option's batch

**Card A — LEGENDARY · 98% match**
- Name: **Esther** — epithet **The Brave Advocate**
- Emblem: 👑
- Traits: Courageous · Strategic · Faithful
- Stats: Courage 98 · Faith 92 · Influence 80
- Scripture: "For such a time as this." — Esther 4:14 (ASV)
- Quiz: Which Woman of the Bible Are You?

**Card B — EPIC · 89% match**
- Name: **Thomas** — epithet **The Honest Doubter**
- Emblem: 🔍
- Traits: Skeptical · Truth-seeking · Loyal
- Stats: Honesty 95 · Faith 71 · Courage 68
- Scripture: "Except I shall see, I will not believe." — John 20:25 (ASV)
- Quiz: Which Doubting Bible Figure Are You?

**Card C — COMMON · 64% match**
- Name: **The Overthinker** — epithet **Mind in Motion**
- Emblem: 🌀
- Traits: Analytical · Cautious · Deep
- Stats: Reflection 64 · Peace 38 · Trust 41
- Scripture: "In nothing be anxious." — Philippians 4:6 (ASV)
- Quiz: What's Your Anxiety Style?

## 8. Deliverables

1. **12 card mockup images** (4 options × 3 rarities), labeled `Option N — Rarity — Name`, at 1080 × 1350.
2. **One-paragraph rationale per option** — why it's shareable and who it appeals to.
3. **Your recommendation** (one option).
4. **For the recommended option only — implementation-ready package:**
   - The **4 rarity frame images** (Common, Rare, Epic, Legendary) as full-bleed 1080 × 1350 PNGs with a transparent or clearly marked content safe-zone.
   - A **layout spec**: for the 1080 × 1350 canvas, give the x/y position, width/height, font size, weight, color, and alignment of every dynamic field in §4.
   - **Color tokens** per rarity tier (hex).
   - The **display font name(s)** used, if any beyond Inter.
   - Keep it compatible with `@vercel/og` compositing: effects baked into the frame PNG, dynamic text rendered as simple flat flexbox/CSS over the safe-zone.

## 9. Brand tokens (use these; harmonize the Common tier with them)

- Wordmark font: **Inter 800**.
- Warm site palette: cream `#fdf5ee`, sand `#f0dcc4`, rose `#e8c9a7`, brown `#6b4423`, brown-dark `#4a2f15`, ink `#2d2a26`, gold `#d4af37`.
- The site itself is warm cream/brown; the cards are allowed to be more dramatic, but the **Common tier** should feel related to the site palette so cards read as "Parable."

## 10. Style guardrails (important for this audience)

- **No depictions of God or Jesus' face.** Use symbols, objects, light, and typography only. Respectful and reverent.
- **Scripture stays legible and accurate** — never decorate over the verse text or obscure the reference.
- **Nothing that reads as gambling / slot machine / loot box.** The "rare pull" excitement must come through sacred-collectible craft, not casino cues.
- Keep it **timeless**, not trend-chasing — these cards should age well.

---

*Context for the human: paste this whole file into Antigravity/Gemini. When it returns the 12 mockups, bring your favorite option (and ideally its frame assets + layout spec) back to Parable and we'll wire it into the `@vercel/og` card renderer and the share flow.*
