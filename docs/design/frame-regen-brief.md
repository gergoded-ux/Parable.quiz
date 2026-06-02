# Parable card frames — regeneration brief (for Gemini / Antigravity)

We need the **4 rarity card frames** regenerated. The previous set was generated as square standalone card mockups (1024×1024, with the ornate stained glass sitting *inside* a blurred cathedral scene). When used as a background behind our content panel, the cathedral surround fills the visible border and the ornate stained glass is hidden. We need true **full-bleed frame assets**.

## Output
4 PNG files, **portrait 1080 × 1350 px** (4:5), named exactly:
- `frame_stained_glass_common.png`
- `frame_stained_glass_rare.png`
- `frame_stained_glass_epic.png`
- `frame_stained_glass_legendary.png`

## Hard requirements (this is the important part)
1. **Full-bleed border.** The ornate **stained-glass + gold leaded border must run edge-to-edge**, touching all four image edges. NO surrounding scene, NO blurred cathedral background, NO drop shadow, NO outer margin or padding around the frame. The decorative border IS the outer edge of the image.
2. **Clean flat center window.** The inner ~64% of the card (a centered rectangle, roughly from 16% to 84% horizontally and 15% to 88% vertically) must be a **flat, soft, near-uniform light area** — a pale cream / frosted-glass tint (or fully transparent PNG alpha). It will be covered by a text panel, so it must NOT contain busy glass detail, faces, or high-contrast pattern. Think "empty leaded-glass pane," not a picture.
3. **Consistent border thickness across all 4 frames** (~16% of the width on the sides, a bit more at top for an arched motif is fine, ~12% at bottom). All four must share the same window position/size so one layout fits every rarity.
4. **Portrait composition.** A gentle pointed-arch / cathedral-window motif at the top is welcome, but it must fit the 4:5 portrait and stay edge-to-edge.

## Per-rarity palette (rarity drives the color)
- **common** — warm green + aged gold leading (earthy, calm)
- **rare** — sapphire / cool blue glass + silver-gold leading
- **epic** — royal purple / amethyst glass + gold leading (richer glow)
- **legendary** — radiant gold / amber glass + bright gold leading (most ornate, luminous)

## Style
Ornate cathedral stained glass with dark leaded cames and gold accents, jewel-toned glass in the border, reverent and premium. Matches the existing art direction — just as a clean frame, not a scene.

## Do NOT
- No text, no numbers, no logos, no watermark.
- No human figures or faces.
- No background scene behind the frame (the frame fills the whole image).
- Don't vary the border thickness or window position between the 4 — only the colors change.

## After generating
Drop the 4 PNGs into `public/cards/frames/` (overwrite the existing files, same names). The card renderer already references them by those names; no code change needed. (If the border thickness differs from ~16%, tell me and I'll nudge the panel inset token to match.)
