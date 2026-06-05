# Reward-card art job sheet — Bible knowledge cards (for Grok-build)

The 24 Bible-IQ (knowledge) quizzes are score-based, so each gets ONE quiz-level
**scene** image shown on the result card above the score. Generate ONE image per
row and SAVE it to the exact `path`. Each prompt is complete and self-contained.

- Size: 1024x1024 PNG. One scene, single focal subject, generous breathing room at the edges (a frame overlays the border).
- Do not add any text, letters, or watermark to the image.
- After generating all images, a human runs `pnpm build:art` to register them.

## Base style (already baked into every prompt)

> Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).

## Scene template (every card is a "scene")

> A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted.

## Negative prompt (already baked into every prompt)

> text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

---

## Covers (24)

1. **path:** `public/results/genesis-iq/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, square 1:1 composition, no text. A single quiet biblical scene: the garden of Eden at dawn, a lone fruit tree beside a winding river, soft light filtering through the leaves. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

2. **path:** `public/results/how-well-do-you-know-moses/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical palette (cream, sand, rose, gold, soft teal), gentle diffused light, canvas texture, reverent, square 1:1, no text. A single dramatic scene: the Red Sea parted into two towering walls of water with a dry path between them at dawn, tiny distant figures. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

3. **path:** `public/results/how-well-do-you-know-the-ten-commandments/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single dramatic scene: two glowing stone tablets atop Mount Sinai amid swirling cloud and fire at dusk. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

4. **path:** `public/results/how-well-do-you-know-the-ten-plagues/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm biblical palette, dramatic diffused light, canvas texture, reverent, square 1:1, no text. A single ominous scene: a blood-red dusk over the Nile, a faint haze of locusts on the far horizon, reeds in the foreground. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, gore.

5. **path:** `public/results/exodus-iq/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm biblical palette, gentle nocturnal glow, canvas texture, reverent, square 1:1, no text. A single scene: a towering pillar of fire glowing over a desert camp at night, a path winding into the wilderness, tiny tents below. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

6. **path:** `public/results/noahs-ark-iq/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour palette, gentle diffused light, canvas texture, hopeful, square 1:1, no text. A single serene scene: a great wooden ark afloat on calm water beneath a wide soft rainbow at golden hour, a dove in the distance. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

7. **path:** `public/results/joseph-in-egypt-iq/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm desert palette (sand, gold, rose), gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: Egyptian granaries and golden wheat sheaves under a warm desert sun, a folded coat of many colors resting on a stone. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

8. **path:** `public/results/how-well-do-you-know-david-and-goliath/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm dusk palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single tense scene: a smooth river stone and a leather sling resting on cracked ground, a giant's long shadow stretching across the valley at dusk. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

9. **path:** `public/results/book-of-judges-iq/card.png` · **type:** scene
   **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm nocturnal palette, gentle torchlight glow, canvas texture, reverent, square 1:1, no text. A single scene: a lone torch and a ram's-horn shofar on a dark hilltop, distant campfires of an army glowing in the valley below. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

10. **path:** `public/results/jonah-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, cool-warm moonlit palette with teal and gold, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single dramatic scene: a great fish breaching moonlit stormy seas, a tiny figure carried toward a distant shore. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, gore.

11. **path:** `public/results/proverbs-wisdom-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm study-lamp palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single quiet scene: a single oil lamp beside an open scroll and a small set of balanced brass scales on a wooden table in warm light. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

12. **path:** `public/results/women-of-the-bible-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single serene scene: a stone well at golden hour with a clay water jar resting on its rim, soft hills behind, no faces. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, portraits.

13. **path:** `public/results/how-well-do-you-know-the-gospels/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: an open scroll resting on a grassy hilltop at golden hour, four small oil lamps glowing softly around it. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

14. **path:** `public/results/jesus-miracles-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm-cool dawn palette with teal water and gold light, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: a small fishing boat on suddenly calm water as light breaks through parting storm clouds, a distant silhouette standing at the shore. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

15. **path:** `public/results/jesus-parables-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm lamplit palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single quiet scene: a single lost coin glinting on a freshly swept earthen floor in warm lamplight, a broom leaning nearby. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

16. **path:** `public/results/parables-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm sunrise palette, gentle diffused light, canvas texture, hopeful, square 1:1, no text. A single scene: a distant silhouetted sower scattering seed across a golden field at sunrise, soft furrows leading to the horizon. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

17. **path:** `public/results/easter-resurrection-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm dawn palette with soft gold and rose, gentle diffused light, canvas texture, hopeful and reverent, square 1:1, no text. A single luminous scene: an empty tomb with the great stone rolled aside, dawn light spilling across the threshold. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

18. **path:** `public/results/book-of-acts-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm palette with gold flame and soft wind, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: small tongues of flame and rushing wind over a courtyard at Pentecost, distant silhouetted figures, light pouring down. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

19. **path:** `public/results/apostle-paul-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm dawn sea palette (teal, gold, sand), gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: a small sailing ship on a calm Mediterranean at dawn beside a rolled letter and a quill on a stone ledge. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

20. **path:** `public/results/how-well-do-you-know-revelation/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, deep reverent palette with gold and indigo, gentle radiant light, canvas texture, awe-filled, square 1:1, no text. A single scene: seven golden lampstands glowing in a vast starlit throne hall, soft beams of light from above. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

21. **path:** `public/results/guess-the-bible-verse/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm dawn study palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single quiet scene: an open Bible on dark wood with a single beam of dawn light catching one line on the page, dust motes drifting. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, legible words.

22. **path:** `public/results/verse-or-quote/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm dawn palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: an open softly glowing Bible beside a small stack of plain closed books on a wooden desk at dawn, the Bible clearly radiant. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, legible words.

23. **path:** `public/results/bible-doubters-iq/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm palette with breaking light through clouds, gentle diffused light, canvas texture, hopeful, square 1:1, no text. A single scene: a lone hand reaching up toward a beam of light breaking through parted storm clouds. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background.

24. **path:** `public/results/name-the-books-of-the-bible/card.png` · **type:** scene
    **prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm candlelit palette, gentle diffused light, canvas texture, reverent, square 1:1, no text. A single scene: a tall stone library niche filled with stacked ancient scrolls in warm candlelight, one scroll partly unrolled. 1024x1024. Negative: text, watermark, modern objects, the face of God or Jesus, cluttered background, legible words.

---

_Total: 24 Bible knowledge scene cards. Save each to `public/results/<slug>/card.png`, then run `pnpm build:art`._
