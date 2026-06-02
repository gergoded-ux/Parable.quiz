# Parable Result Cards — Generated Design Assets & Specs

This directory contains the collectible result card design deliverables requested in the card design brief. All image assets are organized in the [generated-cards/](file:///C:/dev/Bible_Labs/docs/design/generated-cards/) folder.

## File Structure

```
docs/design/generated-cards/
├── summary.md (this file)
├── mockups/
│   ├── option_1_legendary_esther.png
│   ├── option_1_epic_thomas.png
│   ├── option_1_common_overthinker.png
│   ├── option_2_legendary_esther.png
│   ├── option_2_epic_thomas.png
│   ├── option_2_common_overthinker.png
│   ├── option_3_legendary_esther.png (Recommended Option)
│   ├── option_3_epic_thomas.png
│   ├── option_3_common_overthinker.png
│   ├── option_4_legendary_esther.png
│   ├── option_4_epic_thomas.png
│   └── option_4_common_overthinker.png
└── frames/ (For the recommended Option 3: Stained Glass)
    ├── frame_stained_glass_legendary.png
    ├── frame_stained_glass_epic.png
    ├── frame_stained_glass_rare.png
    └── frame_stained_glass_common.png
```

---

## What Was Done

1. **Mockups Generated:** Rendered 12 sample cards (1080 × 1350 px, 4:5 aspect ratio) for 4 art directions across 3 rarity tiers using the sample data provided:
   - **Legendary (Esther, 98% Match)**
   - **Epic (Thomas, 89% Match)**
   - **Common (The Overthinker, 64% Match)**
2. **Background Frames Extracted:** Pre-rendered clean template background frame assets for **Option 3 (Stained Glass)** for all 4 rarity tiers. These frames include a clearly defined semi-transparent safe-zone ready for dynamic text layers, fully compatible with `@vercel/og` (Satori).
3. **Rationales & Specs Drafted:** Prepared layout specifications, color token tables, and CSS templates.

---

## Option Summary & Recommendation

- **Option 1: Celestial / Sacred Geometry:** Starfields, neon-style lines, glowing halo. (Premium trading-card feel).
- **Option 2: Illuminated Manuscript:** Textured parchment, filigree borders, calligraphic styling. (Biblical artifact feel).
- **Option 3: Stained Glass (RECOMMENDED):** Cathedral lead came lines, backlit jewel-toned glass panels. Highly visual, instantly sacred, excellent legibility, and high-impact glow on dark social feeds.
- **Option 4: Modern Minimal Holographic:** Airy layout, minimalist type, striking iridescent holographic foil emblem. (Modern lifestyle app feel).

---

## Specs & Implementation Guide (Option 3 Stained Glass)

### 1. Color Tokens (Hex)
- **Common:** Base glass `#fdf5ee`, lead border `#4a2f15`, accent `#d4af37`, text `#2d2a26`.
- **Rare:** Base glass `#e6f2f7`, lead border `#1a3e5c`, accent `#4fa6c2`, text `#0d1f2d`.
- **Epic:** Base glass `#f5eefd`, lead border `#3d1a5c`, accent `#b588f7`, text `#1b0d2d`.
- **Legendary:** Base glass `#fdfaee`, lead border `#6b4423`, accent `#d4af37`, text `#4a2f15`.

### 2. Layout Specification (1080 × 1350 px Satori Layout)
Satori renders raw HTML/CSS (Flexbox layout only). Bake the corresponding rarity background frame into the container style, then composite dynamic text fields directly over the safe-zone:

```html
<div style="
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 1080px;
  height: 1350px;
  padding: 60px 80px;
  background-image: url('/public/design/frames/frame_stained_glass_{rarity}.png');
  background-size: cover;
  font-family: 'Inter';
">
  <!-- Top row: Wordmark left, match badge right -->
  <!-- Center: Rarity text, emblem box, Result Name, Epithet, Traits, Stats bars -->
  <!-- Bottom: Scripture text, quiz title and domain link footer -->
</div>
```
Detailed inline CSS layout code can be found in the project's [walkthrough.md](file:///C:/Users/starl/.gemini/antigravity/brain/1b9805f9-e884-42d4-baa6-e503488d2909/walkthrough.md).
