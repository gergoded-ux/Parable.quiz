# Reward-card regeneration — Grok job sheet

Regenerate the **25 reward images** flagged by the audit (`docs/reward-art-audit.csv`).
Source of the flags: each was either confirmed wrong (**15 MISMATCH**) or a weak/ambiguous fit
(**10 CHECK**). For every image below you get the exact save path, what it *should* show, what it
*wrongly* shows now, and a ready-to-paste prompt in the house style.

---

## How Grok should generate each image

- **Format:** PNG, **square 1:1**, generate large (1024×1024 or higher). We compress to WebP later.
- **Save path:** exactly as written, e.g. `public/results/<slug>/<key>.png`.
  Same folder + same base name as the current file — just `.png` instead of `.webp`.
  **Overwrite** if a `.png` is already there. (Leave the old `.webp` alone; I remove it during conversion.)
- **One prompt → one file.** Do not batch multiple subjects into one image.
- **No text, letters, numbers, or watermarks** anywhere in the image.
- Keep the **house style identical** across all of them so the regenerated cards match the existing set.

### House style (already baked into every prompt below — shown here for reference)

```
Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and
ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle
canvas texture, reverent and hopeful, one clear central subject on a softly blurred background,
square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no
watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### Negative prompt (apply to all)

```
text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern
objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background,
busy edges, collage.
```

---

## ⚡ Shortcut: 5 of these are just misfiled pairs (you can skip Grok for them)

For these five quizzes the existing art is **correct — it's only saved under the wrong name**, so the
fix is to **swap the two files**, no generation needed. Regeneration prompts are still included below
in case you'd rather have all-new art, but swapping is instant and keeps art you already approved.

| Quiz | Swap these two files |
|---|---|
| `which-piece-of-the-armor-of-god-are-you` | `helmet-of-salvation.webp` ↔ `breastplate-of-righteousness.webp` |
| `which-bible-figure-wounded-by-religious-leaders` | `david.webp` ↔ `hannah.webp` |
| `which-bible-parent-are-you` | `eli.webp` ↔ `mary.webp` |
| `is-your-phone-an-idol` | `surrendered.webp` ↔ `tempted.webp` |
| `which-gospel-writer-are-you` *(CHECK)* | `luke.webp` ↔ `mark.webp` |

> Tell me "swap the 5 pairs" and I'll do it in place (no Grok, no conversion needed — same filenames,
> just redeploy). Everything else genuinely needs new art.

---

# Section A — Confirmed wrong (15 images, MISMATCH)

## `which-piece-of-the-armor-of-god-are-you` · misfiled pair (helmet ↔ breastplate)

### `public/results/which-piece-of-the-armor-of-god-are-you/helmet-of-salvation.png` — The Helmet of Salvation
- **Type:** object · **Status:** MISMATCH · **Swap partner:** `breastplate-of-righteousness`
- **Should show:** An ancient bronze soldier's helmet that clearly protects the head, resting upright in soft golden light.
- **Currently (wrong):** A jeweled breastplate (chest armor), not a helmet.
- **Prompt:**
```
A single ancient bronze Roman-style soldier's war helmet that unmistakably covers the head, with a domed crown and cheek guards, resting upright and alone on plain pale ground, hero-lit as a still life, a faint warm halo of light glowing softly behind the crown to suggest hope and a settled, assured mind, gentle gleam on the polished metal. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/which-piece-of-the-armor-of-god-are-you/breastplate-of-righteousness.png` — The Breastplate of Righteousness
- **Type:** object · **Status:** MISMATCH · **Swap partner:** `helmet-of-salvation`
- **Should show:** An ancient bronze chest breastplate (cuirass) that clearly covers the torso and guards the heart.
- **Currently (wrong):** A war helmet (head armor), not a breastplate.
- **Prompt:**
```
A single ancient bronze chest breastplate, a Roman-style cuirass shaped to the torso with sculpted chest contours that clearly guards the heart, standing upright and alone on plain pale ground, hero-lit as a still life, a soft warm glow resting over the heart area to suggest a heart kept safe behind grace, gentle highlights tracing the curved metal. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `which-bible-figure-wounded-by-religious-leaders` · misfiled pair (david ↔ hannah)

### `public/results/which-bible-figure-wounded-by-religious-leaders/david.png` — David
- **Type:** character · **Status:** MISMATCH · **Swap partner:** `hannah`
- **Should show:** A young male shepherd-warrior, David, with a sling at his belt and open empty hands, sheltering among wilderness crags.
- **Currently (wrong):** A praying woman (looks like Hannah), not a male.
- **Prompt:**
```
A single young man, David the shepherd-warrior of ancient Israel: youthful and clean-shaven, dark hair, wearing a simple earth-toned ancient tunic with a shepherd's leather sling tucked at his belt, three-quarter portrait, gentle resolute expression, hands open and empty at his side as if refusing to strike, sheltering quietly among warm sandstone wilderness crags with a soft halo of light around him, conveying patient integrity while being unjustly hunted. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/which-bible-figure-wounded-by-religious-leaders/hannah.png` — Hannah
- **Type:** character · **Status:** MISMATCH · **Swap partner:** `david`
- **Should show:** A young grieving woman, Hannah, praying silently at the temple threshold, hands at her heart, a tear on her cheek.
- **Currently (wrong):** A bearded man with a harp and staff (looks like David), not a woman.
- **Prompt:**
```
A single woman, Hannah of ancient Israel: a young grieving woman in a flowing veiled robe and head covering, kneeling at the threshold of the ancient temple sanctuary, head bowed, eyes closed with a soft tear on her cheek, hands pressed together at her heart in silent fervent prayer, lips barely moving, a tender and sorrowful yet hopeful expression, warm lamplight and a gentle halo of light surrounding her as she pours out her ache to God. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `which-bible-parent-are-you` · misfiled pair (eli ↔ mary)

### `public/results/which-bible-parent-are-you/eli.png` — Eli
- **Type:** character · **Status:** MISMATCH · **Swap partner:** `mary`
- **Should show:** An elderly male high priest, Eli, white beard, priestly robes, seated near the temple sanctuary.
- **Currently (wrong):** A young woman in pink robes holding an oil lamp.
- **Prompt:**
```
A single elderly Hebrew high priest, Eli, an old man with a long flowing white beard and gentle weary eyes, wearing the layered robes and jeweled breastpiece of an ancient Israelite priest, seated quietly beside the lamplit temple sanctuary at Shiloh with a soft, devoted, peaceable expression, a warm three-quarter portrait, his human face clearly visible with a soft halo of light around his head. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/which-bible-parent-are-you/mary.png` — Mary
- **Type:** character · **Status:** MISMATCH · **Swap partner:** `eli`
- **Should show:** A young mother, Mary, in a blue head covering, tenderly holding her infant child.
- **Currently (wrong):** An elderly bearded priest standing at an altar.
- **Prompt:**
```
A single young woman, Mary the mother of Jesus, with a soft youthful face and serene tender expression, wearing a flowing deep-blue head covering and a simple humble robe, cradling and gazing thoughtfully at her swaddled infant child as she quietly ponders the moment in her heart, a warm three-quarter maternal portrait, her human face clearly visible with a soft halo of light around her head. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `is-your-phone-an-idol` · misfiled pair (surrendered ↔ tempted)

### `public/results/is-your-phone-an-idol/surrendered.png` — Surrendered
- **Type:** symbol · **Status:** MISMATCH · **Swap partner:** `tempted`
- **Should show:** Empty open hands lifted upward in calm release toward light — nothing held or grasped.
- **Currently (wrong):** Temptation imagery (serpent around the wrist + a forbidden fruit) — that's the Tempted concept.
- **Prompt:**
```
A single clean emblem of two empty, open human hands lifted and cupped upward in peaceful release, palms turned toward a gentle shaft of golden light descending from above, a few tiny sparks of light drifting up from the open palms to suggest something freely given over to God; nothing is held, gripped, or chained, conveying calm surrender and open-handed freedom, centered with abundant negative space. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/is-your-phone-an-idol/tempted.png` — Tempted
- **Type:** symbol · **Status:** MISMATCH · **Swap partner:** `surrendered`
- **Should show:** A baited lure / honeyed fruit dangling before a hand that pauses and pulls back — the pull of temptation resisted.
- **Currently (wrong):** Open hands with cords falling away (a surrender/letting-go image).
- **Prompt:**
```
A single clean emblem of temptation: one alluring honey-glazed fruit dangling from a thin fishhook and fine thread, glowing invitingly, while a lone human hand reaches toward it but hesitates and draws back at the last moment, fingers curling away in restraint; the gap between the hand and the bait is the focus, conveying a strong lure resisted and a deliberate choice to pull back, centered with generous negative space. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `unseen-by-god-moment` · 4 results scrambled (regenerate all four)

### `public/results/unseen-by-god-moment/david-in-the-caves.png` — David in the Caves
- **Type:** character · **Status:** MISMATCH
- **Should show:** Young David sheltering inside a rocky cave, light from the cave mouth, harp/sling at his side.
- **Currently (wrong):** A man slumped under a tree in open desert with bread and a jug (the Elijah scene); no cave.
- **Prompt:**
```
Young David, a shepherd-warrior with dark wind-tossed hair, a simple belted tunic and travel cloak, sheltering deep inside a rough stone cave; he leans against the rocky wall in a soft shaft of golden light spilling from the distant cave mouth behind him, a small lyre and a shepherd's sling resting at his side, his weary face lifted upward in quiet trust. The cradling cave walls and the glowing opening make the hideaway unmistakable. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/unseen-by-god-moment/elijah-under-the-broom-tree.png` — Elijah Under the Broom Tree
- **Type:** character · **Status:** MISMATCH
- **Should show:** Exhausted Elijah lying down resting beneath a low desert broom (juniper) tree, bread and a jug of water on a stone beside him.
- **Currently (wrong):** A robed figure striding across the desert with a staff; no broom tree, no resting figure.
- **Prompt:**
```
The prophet Elijah, a weary bearded man in a rough hairy prophet's mantle, lying down and resting on the sand beneath a low, twiggy desert broom (juniper) tree, his head pillowed on his arm, eyes closing in deep exhaustion; on a flat stone beside him sit a round loaf of fresh baked bread and a clay jug of water, touched by a soft warm glow as if just left there for him. The sheltering broom tree and the bread-and-water beside the resting man make the moment unmistakable. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/unseen-by-god-moment/hagar-in-the-wilderness.png` — Hagar in the Wilderness
- **Type:** character · **Status:** MISMATCH
- **Should show:** Hagar, a young woman alone in the open desert, looking up in awe as she realizes God sees her, an empty waterskin beside her.
- **Currently (wrong):** A disembodied hand holding cloth with smoke and a small flame/dove; no woman at all.
- **Prompt:**
```
Hagar, a young woman with Egyptian features, a dusty draped head covering and a simple worn robe, alone in a vast open desert wilderness of rolling sand and sparse scrub; she kneels in the sand and lifts her tear-streaked face upward in dawning wonder as she realizes she is seen, an empty waterskin resting at her side, a single soft beam of golden light falling gently on her. The lone woman in the endless wilderness, gazing up, makes the moment unmistakable. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/unseen-by-god-moment/hannah-at-the-temple.png` — Hannah at the Temple
- **Type:** character · **Status:** MISMATCH
- **Should show:** Hannah praying silently inside the temple sanctuary at Shiloh, stone pillars and a glowing lampstand behind her.
- **Currently (wrong):** A woman weeping in the wilderness with a man walking away (the Hagar scene); no temple.
- **Prompt:**
```
Hannah, a grown woman in a flowing robe and soft head covering, kneeling in heartfelt silent prayer inside the temple sanctuary at Shiloh; her hands are clasped to her chest, her lips part in soundless prayer, gentle tears on her cheeks and a look of aching hope on her face, with smooth stone temple pillars and a warmly glowing golden lampstand behind her. The interior temple pillars and lampstand make the sacred setting unmistakable. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `are-you-a-cycle-breaker` · inverted meaning (regenerate)

### `public/results/are-you-a-cycle-breaker/still-in-the-cycle.png` — Still-in-the-Cycle
- **Type:** symbol · **Status:** MISMATCH
- **Should show:** A closed, unbroken loop with footprints tracing the same groove — being stuck repeating; a tiny sprout hints at dawning hope.
- **Currently (wrong):** Hands snapping a chain apart (breaking free) — the opposite of being stuck.
- **Prompt:**
```
A single closed circular loop formed by a worn looping path of sand worn into an endless ring, a single set of small bare footprints tracing the same groove around and around inside the unbroken circle, the loop deliberately whole and uncut, with one tiny fragile green sprout just beginning to push up at the edge of the ring as a quiet hint of awakening hope. Centered emblem, minimal, lots of negative space. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `are-you-in-a-dark-night-of-the-soul` · duplicate images (regenerate)

> Both of these are currently **byte-identical copies of images from the "resting" quiz**, so they
> show calm rest instead of despair. They need genuinely new, distinct art.

### `public/results/are-you-in-a-dark-night-of-the-soul/depression-mask.png` — Depression Wearing a Spiritual Mask
- **Type:** symbol · **Status:** MISMATCH
- **Should show:** A serene smiling mask held up, with a heavy grey rain-cloud and a falling tear hidden behind it — heaviness behind a calm face.
- **Currently (wrong):** A peaceful calm-sunset rest scene (duplicate of "True Sabbath Rest").
- **Prompt:**
```
A single centered iconographic emblem: a pale, serenely smiling ancient clay mask held up by a slender reed, while directly behind it looms a low, heavy grey storm-cloud with one solitary teardrop slipping down, the dark weight of sorrow hidden behind the calm composed face; muted desaturated greys behind the mask contrasting the warm light around it, lots of empty negative space, minimal, no people. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/are-you-in-a-dark-night-of-the-soul/spiritual-burnout.png` — Spiritual Burnout (Not the Same)
- **Type:** symbol · **Status:** MISMATCH
- **Should show:** A clay oil lamp burned down to nothing — wick just extinguished, thin smoke rising, oil basin dry. Total depletion.
- **Currently (wrong):** A productive-rest scene (duplicate of "Productive Rest").
- **Prompt:**
```
A single centered iconographic emblem: a small ancient terracotta oil lamp burned completely empty, its wick freshly extinguished with one delicate ribbon of grey smoke curling upward, the oil basin dry and the last ember fading, resting alone on cracked bare earth, conveying total depletion and a flame that has given everything; warm faint afterglow on the smoke, lots of quiet negative space, minimal, no people. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

---

# Section B — Ambiguous CHECK (10 images, regenerate only if you agree)

These weren't clearly wrong — just weak or generic fits. Regenerate the ones you agree with; skip the rest.

## `which-gospel-writer-are-you` · likely misfiled pair (luke ↔ mark)

### `public/results/which-gospel-writer-are-you/luke.png` — Luke the Careful Witness
- **Type:** character · **Status:** CHECK · **Swap partner:** `mark` (swapping the two files likely fixes both)
- **Should show:** A calm physician-historian seated at a writing table, meticulously recording on a scroll with a quill.
- **Currently (wrong):** A man sprinting with a scroll (energetic motion that fits "Mark the Fast Mover").
- **Prompt:**
```
Luke the Careful Witness, a thoughtful first-century physician and historian, a calm man with a short trimmed beard and kind eyes, seated at a simple wooden writing table in ancient Near-East robes, meticulously recording his account on a parchment scroll with a dipped quill, pausing with a gentle attentive half-smile as he checks his facts; a small leather physician's herb pouch and a few neatly rolled reference scrolls rest beside him, an unhurried scholar getting every detail right. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

### `public/results/which-gospel-writer-are-you/mark.png` — Mark the Fast Mover
- **Type:** character · **Status:** CHECK · **Swap partner:** `luke` (swapping the two files likely fixes both)
- **Should show:** A young energetic man mid-stride, robe billowing, half-rolled scroll in hand, rushing to deliver the news.
- **Currently (wrong):** A man calmly reading a scroll with a quill (which fits "Luke the Careful Witness").
- **Prompt:**
```
Mark the Fast Mover, a young energetic first-century man caught mid-stride hurrying forward, robe and cloak billowing with the speed of his motion, a half-rolled parchment scroll clutched tightly in one hand, sandaled feet in dynamic step, eyes bright and alert with urgent purpose as if rushing to deliver good news immediately, all action and no filler. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `are-you-a-cycle-breaker`

### `public/results/are-you-a-cycle-breaker/healing-but-tired.png` — Healing-but-Tired
- **Type:** symbol · **Status:** CHECK
- **Should show:** A clay oil lamp burning low (almost spent) with a fresh olive sprig budding beside it — real healing, but deep weariness.
- **Currently (wrong):** A generic wreath of wheat, pomegranates and olive that doesn't read as healing or tiredness.
- **Prompt:**
```
A single small ancient clay oil lamp burning very low, its flame thin and almost spent yet still glowing softly, the lamp tilted and set down to rest as if by tired hands, with one fresh tender olive sprig bearing a small new green bud unfurling gently beside it to show that real healing is still alive even in exhaustion. A faint warm halo of restful light around the low flame. Single centered emblem, minimal, lots of negative space. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `what-shame-story-are-you-living`

### `public/results/what-shame-story-are-you-living/i-am-beyond-repair.png` — I Am Beyond Repair
- **Type:** symbol · **Status:** CHECK
- **Should show:** A shattered clay jar mended with glowing veins of gold (kintsugi) — brokenness restored and made precious.
- **Currently (wrong):** A figure walking into a warm lit village (hopeful homecoming); brokenness is only small objects on the ground.
- **Prompt:**
```
A single ancient terracotta clay jar that had shattered into pieces, now tenderly mended back into one whole vessel with luminous veins of liquid gold flowing along every crack, the seams of gold glowing softly as if grace itself is healing what was ruined. The mended jar sits centered and alone, radiant and made beautiful again, a clear emblem of something everyone called beyond repair being restored and treasured. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `whats-your-discernment-style`

### `public/results/whats-your-discernment-style/open-door-walker.png` — The Open-Door Walker
- **Type:** symbol · **Status:** CHECK
- **Should show:** An ancient stone doorway standing open, warm light pouring through, a path/footprints beginning at the threshold.
- **Currently (wrong):** A figure carrying a dove on a tray; no open-door motif at all.
- **Prompt:**
```
A single ancient stone doorway standing wide open at the center of the frame, its weathered wooden door swung back to reveal a glowing shaft of warm golden light pouring through, with a quiet dirt path and a few faint footprints beginning at the threshold and leading forward into the light, an iconographic emblem of moving ahead through the door God opens. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `whats-your-not-enough-story`

### `public/results/whats-your-not-enough-story/not-smart-enough.png` — Not Smart Enough
- **Type:** symbol · **Status:** CHECK
- **Should show:** An open book with a warm glow rising from its pages and a small oil lamp on it — mind, learning, and God-given wisdom.
- **Currently (wrong):** A haloed youth playing a harp in a cave (David-like); no intelligence/"smart" cue.
- **Prompt:**
```
A single clean iconographic emblem centered on lots of empty space: one open book lying flat with a soft warm radiant glow of understanding gently rising from its pages, and a small humble clay oil lamp with one tiny flame resting on the open book, an emblem of a quiet mind, knowledge, and God-given wisdom rather than striving cleverness; minimal, calm, no figures. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `which-psalm-speaks-to-you`

### `public/results/which-psalm-speaks-to-you/psalm-27.png` — Psalm 27: The Courage Psalm
- **Type:** symbol · **Status:** CHECK
- **Should show:** A single oil lamp with one steady flame pushing back the surrounding darkness — light overcoming fear (courage).
- **Currently (wrong):** An anchor-cross (reads as hope/steadfastness, not courage) and it duplicates the anchor used for psalm-46.
- **Prompt:**
```
A single small ancient clay oil lamp resting at the center, burning with one tall steady golden flame whose warm radiant glow pushes back the encircling shadow in a clean luminous halo, light triumphing over darkness as quiet courage. One clean iconographic emblem, centered, minimal, surrounded by deep soft shadow on all sides with no anchor and no shield. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `which-tribe-of-israel-are-you`

### `public/results/which-tribe-of-israel-are-you/benjamin.png` — Benjamin the Beloved
- **Type:** symbol · **Status:** CHECK
- **Should show:** A noble grey wolf (Benjamin's tribal emblem, Genesis 49:27) standing alert and protective — fierce loyalty, dignified not menacing.
- **Currently (wrong):** A gentle deer/gazelle with a pouch (a deer better fits Naphtali, not Benjamin).
- **Prompt:**
```
A single clean iconographic emblem of a noble grey wolf, the tribal animal of Benjamin, standing alert in a calm protective guarding stance, head lifted and watchful at dawn, conveying fierce loyalty and cherished belovedness rather than menace; one clear central wolf silhouette with a faint warm halo of morning light behind it, minimal and dignified, set against soft empty sky with generous negative space. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `why-cant-you-hear-gods-voice`

### `public/results/why-cant-you-hear-gods-voice/wanting-new-not-confirming.png` — He's Confirming, You Want New
- **Type:** symbol · **Status:** CHECK
- **Should show:** A sealed scroll-letter (one warm glowing wax seal) on a doorstep — one answer already given and confirmed; step out and obey it.
- **Currently (wrong):** A hand passing a sprout (reads as growth/giving), not "God confirming a word already given."
- **Prompt:**
```
A single sealed scroll-letter rests on a worn stone doorstep, bound and closed with one warm amber wax seal that glows with a gentle inner light, signifying one clear answer already given and confirmed by God. The scroll lies at the threshold of an open ancient doorway with a soft path of light leading outward beyond it, evoking the call to step out and obey the word already received rather than wait for a new one. No second scroll, no blank page, just this one sealed, settled message glowing quietly at the center. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

## `why-hard-to-make-friends`

### `public/results/why-hard-to-make-friends/keep-it-surface.png` — You Keep It Surface
- **Type:** symbol · **Status:** CHECK
- **Should show:** A leaf floating on the still glassy surface of a pool, clear deep water beneath left unentered — connection that never goes deep.
- **Currently (wrong):** Cupped hands holding a shallow tile; "surface-level friendship" doesn't read clearly.
- **Prompt:**
```
A single small leaf floating lightly on the perfectly smooth, glassy surface of a calm pool of water, gentle ripples spreading from where it touches, the clear blue-green deep water glowing softly beneath it but left unentered and untouched, an emblem of connection that drifts pleasantly on the surface and never sinks into the depths below. Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only).
```

---

## After Grok finishes — conversion + ship (Claude runs this)

Once the new `.png` files are dropped into their `public/results/<slug>/` folders, tell me
"the regen images are in" and I'll run:

1. **Delete the stale `.webp` siblings** for each regenerated key. (Required: `convert:webp` skips a
   PNG when a same-named `.webp` already exists — `scripts/convert-images-webp.ts` line 56 — so the
   old WebP must go first.)
2. `pnpm convert:webp` — encodes the new PNGs to WebP at 640px / quality 80 and moves the PNG
   originals into the gitignored `.image-originals/` backup.
3. `pnpm build:art && pnpm build:reward-catalog` — re-registers the WebP files and refreshes the catalog.
4. Commit + push to deploy.

**If you instead chose the 5 file swaps** (no Grok): I just exchange the two `.webp` files in place and
push — no conversion or manifest rebuild needed, since the filenames don't change.

---

### Summary

| Section | Images | Action |
|---|---|---|
| A — MISMATCH | 15 | Regenerate (or swap the 4 misfiled pairs in A) |
| B — CHECK | 10 | Regenerate only the ones you agree with (luke/mark is likely a swap) |
| **Total** | **25** | |
