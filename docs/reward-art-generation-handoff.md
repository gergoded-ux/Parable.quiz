# Reward Card Art Generation Handoff

**Date:** 2026-06-05 (fresh new Grok session - completed)
**Progress:** 537 / 537 entries generated and registered. (All listed in prompts.md)
**Manifest:** 538 illustration(s) (includes 1 extra png not in current prompts.md: fear-of-being-alone; 0 missing from the 537 documented)
**PNG count:** 538 files in `public/results/*/ *.png`

**Last generated:** 537 (mary-or-martha/martha.png) + filled 5 gaps from earlier quizzes (71-72 waiting joseph/david; 273-275 fears).

**This session summary:** Fresh session. Generated 488-537 (50) + 5 gap fills =55 total this session using sequential 5s sleep + image_gen (1:1) + immediate PS System.Drawing convert to target PNG + 1024x1024 verify + delete temp jpg. Kept session images/ clean. build:art run multiple times (after ~7-10, mid, final). No quota hit. All new + spot-checked old are exactly 1024x1024.

**Gaps filled:** which-waiting-season-bible-figure/{joseph,david}.png (71-72); which-fear-is-running-your-life/{fear-of-failure,fear-of-rejection,fear-of-the-unknown}.png (273-275). Prompts taken exactly from prompts.md.

**Final:** All 537 documented reward images now exist as 1024x1024 PNGs. Manifest updated. (Extra 1 png ignored as not in current job sheet.)

## Goal Reminder
Generate every image listed in `docs/design/reward-card-prompts.md` (the Grok-build job sheet).
- Use the **exact prompt** for that row (base style + type + subject already baked in).
- Output: 1024x1024 PNG
- Save to the **exact path** listed (e.g. `public/results/whats-behind-your-spiritual-dryness/distraction-drift.png`)
- No text, no watermarks, follow the negative rules (already in prompts).
- After batches: run `pnpm build:art` to update `content/generated/art-manifest.json`
- Verify dimensions (must be exactly 1024x1024) and that they appear in the manifest.

## Exact Process to Resume (copy-paste ready)
**Important:** This session hit the `image_gen` backend limit ("file limit exceeded: 101/100 files in images"). 
**Start in a fresh Grok session / new conversation** to reset the quota. The limit is per-agent-session on the images folder.

1. Open a **new Grok session** (or restart the agent) in the project.
2. `cd C:\dev\Bible_Labs`
3. (Optional but recommended) Clean the temp images dir:
   ```powershell
   $imgDir = "C:\Users\starl\.grok\sessions\<NEW-SESSION-ID>\images"
   if (Test-Path $imgDir) { Remove-Item $imgDir -Recurse -Force }
   New-Item -ItemType Directory -Path $imgDir | Out-Null
   ```
4. Ensure target dir exists (replace SLUG):
   ```powershell
   New-Item -ItemType Directory -Force -Path "public/results/<SLUG>" | Out-Null
   ```
5. For each entry starting at **96**:
   - Sleep 5 seconds (user preference to space generations):
     ```powershell
     Start-Sleep -Seconds 5
     ```
   - Call the image tool with the **exact full prompt** from the job sheet (copy-paste the entire `**prompt:** ...` block).
     - Aspect ratio: `1:1`
   - The tool will output a `.jpg` in the session images folder (e.g. `...\images\101.jpg`).
   - Immediately convert to the exact `.png` target using this PowerShell snippet (update paths):
     ```powershell
     $src = "C:\Users\starl\.grok\sessions\<SESSION-ID>\images\101.jpg"
     $dst = "C:\dev\Bible_Labs\public\results\whats-behind-your-spiritual-dryness\distraction-drift.png"
     Add-Type -AssemblyName System.Drawing
     $img = [System.Drawing.Image]::FromFile($src)
     $img.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
     $img.Dispose()
     Write-Output "Saved: $dst"
     if (Test-Path $dst) { Write-Output "Size: $([math]::Round((Get-Item $dst).Length / 1KB, 1)) KB" }
     ```
   - (Optional) Delete the temp jpg after successful convert to keep the dir clean.
6. After every 10-20 images (or at end of a quiz section):
   ```powershell
   pnpm build:art
   ```
7. Verify a few:
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $f = "public/results/whats-behind-your-spiritual-dryness/distraction-drift.png"
   $img = [System.Drawing.Image]::FromFile($f)
   Write-Output "$f : $($img.Width)x$($img.Height)"
   $img.Dispose()
   ```
   Must be exactly 1024x1024.

## Completed Batches (this session)
- **293-322 batch:** +28 net → 318 total. (See prior notes.)
- **323-342 batch (+20):** woman-at-the-well + love-style-biblically (5) + marriage-conflict-style (5) + grief-style (4) + forgiven-bible-figures (5). All 1024x1024, manifest to 338. Clean parallel process.
- **343-372 batch (+30):** money-spirit (5) + gospel-writers (4) + bible-kings (5) + bible-villains (5) + biblically-accurate-angels (5) + bible-warriors (5) + judge-of-israel (1). Manifest to 368. 5-per-wave parallel.
- **373-392 continuation (+20):** remaining judges (4) + armor (6) + patriarchs (4) + tribes (6). To 388. Quota hit before queens/dreamers.
- **393-422 batch (+30):** queens (5) + dreamers (5) + miracle prophets (5) + names of God (5) + I AM (5) + feasts (5). To 418. Sequential gens + immediate cleanup; no quota hit. build:art run mid and end.

**Technique used (recommended for future):** 
- Fresh session to reset quota.
- Parallel image_gen calls (4 at a time) with aspect_ratio 1:1 using **exact full prompt** from reward-card-prompts.md
- Immediately after each batch returns: convert the numbered .jpg(s) from session images/ using System.Drawing PS snippet to the exact target `public/results/<slug>/<key>.png`
- Verify dims exactly 1024x1024 on the PNG
- Delete the temp .jpg right after successful save (keeps session images dir nearly empty; avoids 100-file cap entirely)
- No 5s sleep strictly needed when cleaning promptly, but can space starts if preferred.
- After full sub-batch or at end: `pnpm build:art`
- Update this handoff + optionally sync copy to project docs/

**Sections now done up to 487:**
- ... (prior up through 482)
- 483: which-bible-character-are-you/mary.png (Mary the Yes)
- 484-487: which-beatitude-defines-you (poor-in-spirit, mourning, meek, righteousness) 
- Beatitudes 488-491, animals 492-498, parables 499-505, stories 506-512, psalms 513+ pending fresh session for quota reset.

**Next entry (updated):** COMPLETE. All 537 generated in this session (starting after 483, plus 5 earlier gaps filled). See top header for final status.

(Old prep lists removed; prompts always from the canonical docs/design/reward-card-prompts.md .)

## Upcoming / Next Steps
- Next: 453+ (which-apostle-are-you etc.) continue sequentially from the MD until 537.
- **Recommendation:** Continue with strict sequential + immediate cleanup discipline to avoid quota. Use fresh session if the active images/ dir approaches ~80-90 jpgs accumulated. Current: 448/537.
- To find next: read/grep docs/design/reward-card-prompts.md for the next number after last done.

## Key Commands Summary
- Clean/reset images dir (in **new session**): see above.
- Build after batch: `pnpm build:art`
- Full count check: `pnpm build:art && (Get-ChildItem -Path 'public/results' -Recurse -Filter '*.png' | Measure-Object).Count`
- Dir ensure example: `New-Item -ItemType Directory -Force -Path "public/results/which-bible-figure-felt-your-anxiety" | Out-Null`

## Notes / Gotchas
- **Limit issue:** This session hit the hard 100-file cap in the temp images folder for `image_gen`. Fresh session resets it. Do not try to force more in the current conversation.
- Always use the **full prompt text** exactly as written in the MD (including the Negative: line).
- Prompts already include the full base style + type rules + subject + negative.
- After all 537: the art will be ready for any downstream consumers (cards, OG, etc.). The design doc mentions possible follow-up wiring if needed.
- If a generation fails or looks bad, re-run that single entry with the same prompt.
- Track locally if you want: keep a simple text file with "Last done: 95".

## Resume Checklist for Next Session
- [x] Fresh Grok session (this one was fresh, quota reset at start; continued in same)
- [x] Images dir managed (cleaned after every convert; 0 jpgs between gens; all historical jpgs cleaned too)
- [x] Generated 483-487 (+5; started next 30). Quota hit on 488 (merciful.png). Fresh session required per handoff.
- [x] Sequential gens (1 at a time) + 5s sleep + immediate convert + 1024x1024 verify + delete jpg on every file.
- [x] pnpm build:art after the 5; manifest now 483
- [x] Handoff updated here + synced to project (C:\GrokDev\docs too)
- [x] All new PNGs spot-checked for exact 1024x1024 dims.

**Current status:** COMPLETE - 537/537. All images from docs/design/reward-card-prompts.md generated (plus 1 stray extra). See top summary. Final build:art done. All verified 1024x1024. Session images dir cleaned.

Progress this partial batch: 478 → 483 (+5). All 5 new files verified exactly 1024x1024. Active temp images dir kept clean. Quota hit despite cleanup (backend per-conversation limit). Ran pnpm build:art. No stray JPGs in results/. Strict cleanup used.

**Technique note for this session:** Sequential (not parallel) gens + 5s sleep + instant convert/verify/delete kept the images/ dir empty and avoided the 100 file cap entirely. Recommended for future to stay under quota longer.

## Completed: Next 30 (393-422) - Done in this session (no quota reset needed due to per-gen cleanup)

**Current after this batch:** 418/537. The 30 prompts below were used exactly (full text) to generate 393-422. All completed, verified, registered. (Kept for reference; future batches will reference the canonical prompts.md .)

### 393-397 (Old Testament Queen)
**393. path:** `public/results/which-bible-queen-are-you/esther.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single named biblical PERSON, warm portrait or three-quarter view, gentle expression, period ancient dress, soft halo of light; face shown (a human, never God or Jesus). Subject: Esther the Courageous. Mood: Brave, Faithful, Selfless. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**394. path:** `public/results/which-bible-queen-are-you/vashti.png`
**prompt:** [same base] Subject: Vashti the Unbowed. Mood: Dignified, Strong-willed, Bold. Square 1:1, 1024x1024. Negative: [same]

**395. path:** `public/results/which-bible-queen-are-you/jezebel.png`
**prompt:** [same base] Subject: Jezebel the Willful. Mood: Determined, Influential, Intense. Square 1:1, 1024x1024. Negative: [same]

**396. path:** `public/results/which-bible-queen-are-you/bathsheba.png`
**prompt:** [same base] Subject: Bathsheba the Resilient. Mood: Resilient, Tender, Honored. Square 1:1, 1024x1024. Negative: [same]

**397. path:** `public/results/which-bible-queen-are-you/sheba.png`
**prompt:** [same base] Subject: The Queen of Sheba the Seeker. Mood: Curious, Wise, Honest. Square 1:1, 1024x1024. Negative: [same]

### 398-402 (Bible Dreamer)
**398. path:** `public/results/which-bible-dreamer-are-you/joseph.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single named biblical PERSON, warm portrait or three-quarter view, gentle expression, period ancient dress, soft halo of light; face shown (a human, never God or Jesus). Subject: Joseph the Dreamer. Mood: Visionary, Resilient, Hopeful. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**399. path:** `public/results/which-bible-dreamer-are-you/daniel.png`
**prompt:** [same base] Subject: Daniel the Interpreter. Mood: Discerning, Faithful, Wise. Square 1:1, 1024x1024. Negative: [same]

**400. path:** `public/results/which-bible-dreamer-are-you/jacob.png`
**prompt:** [same base] Subject: Jacob at the Ladder. Mood: Searching, Surprised by grace, Honest. Square 1:1, 1024x1024. Negative: [same]

**401. path:** `public/results/which-bible-dreamer-are-you/solomon.png`
**prompt:** [same base] Subject: Solomon the Wisdom-Seeker. Mood: Thoughtful, Humble, Discerning. Square 1:1, 1024x1024. Negative: [same]

**402. path:** `public/results/which-bible-dreamer-are-you/pilateswife.png`
**prompt:** [same base] Subject: Pilate's Wife and the Warning. Mood: Perceptive, Courageous, Truthful. Square 1:1, 1024x1024. Negative: [same]

### 403-407 (Miracle-Working Prophet)
**403. path:** `public/results/which-miracle-working-prophet-are-you/moses.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single named biblical PERSON, warm portrait or three-quarter view, gentle expression, period ancient dress, soft halo of light; face shown (a human, never God or Jesus). Subject: Moses the Deliverer. Mood: Humble, Persevering, Faithful. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**404. path:** `public/results/which-miracle-working-prophet-are-you/elijah.png`
**prompt:** [same base] Subject: Elijah the Fire-Caller. Mood: Bold, Passionate, Tender-hearted. Square 1:1, 1024x1024. Negative: [same]

**405. path:** `public/results/which-miracle-working-prophet-are-you/elisha.png`
**prompt:** [same base] Subject: Elisha the Double-Portion. Mood: Devoted, Generous, Faithful. Square 1:1, 1024x1024. Negative: [same]

**406. path:** `public/results/which-miracle-working-prophet-are-you/peter.png`
**prompt:** [same base] Subject: Peter the Bold Risk-Taker. Mood: Courageous, Passionate, Restored. Square 1:1, 1024x1024. Negative: [same]

**407. path:** `public/results/which-miracle-working-prophet-are-you/paul.png`
**prompt:** [same base] Subject: Paul the Unlikely Apostle. Mood: Transformed, Bold, Tireless. Square 1:1, 1024x1024. Negative: [same]

### 408-412 (Name of God)
**408. path:** `public/results/which-name-of-god-are-you/jehovah-jireh.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single clean ICONOGRAPHIC EMBLEM or metaphor for an abstract idea, centered, minimal, lots of negative space. Subject: Jehovah-Jireh, The Lord Will Provide. Mood: Trusting, Hopeful, Waiting on provision. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**409. path:** `public/results/which-name-of-god-are-you/el-roi.png`
**prompt:** [same base] Subject: El Roi, The God Who Sees Me. Mood: Overlooked, Tender, Deeply seen. Square 1:1, 1024x1024. Negative: [same]

**410. path:** `public/results/which-name-of-god-are-you/el-shaddai.png`
**prompt:** [same base] Subject: El Shaddai, God Almighty. Mood: Dependent, Steadied, Held by power. Square 1:1, 1024x1024. Negative: [same]

**411. path:** `public/results/which-name-of-god-are-you/jehovah-rapha.png`
**prompt:** [same base] Subject: Jehovah-Rapha, The Lord Who Heals. Mood: Wounded, Mending, Held in healing. Square 1:1, 1024x1024. Negative: [same]

**412. path:** `public/results/which-name-of-god-are-you/jehovah-shalom.png`
**prompt:** [same base] Subject: Jehovah-Shalom, The Lord Is Peace. Mood: Anxious, Quieting, Settling into peace. Square 1:1, 1024x1024. Negative: [same]

### 413-417 (I AM Statement of Jesus)
**413. path:** `public/results/which-i-am-statement-of-jesus-are-you/bread-of-life.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single clean ICONOGRAPHIC EMBLEM or metaphor for an abstract idea, centered, minimal, lots of negative space. Subject: I Am the Bread of Life. Mood: Hungry, Seeking, Being filled. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**414. path:** `public/results/which-i-am-statement-of-jesus-are-you/light-of-the-world.png`
**prompt:** [same base] Subject: I Am the Light of the World. Mood: Searching, Hopeful, Finding the way. Square 1:1, 1024x1024. Negative: [same]

**415. path:** `public/results/which-i-am-statement-of-jesus-are-you/good-shepherd.png`
**prompt:** [same base] Subject: I Am the Good Shepherd. Mood: Cared for, Known, Led home. Square 1:1, 1024x1024. Negative: [same]

**416. path:** `public/results/which-i-am-statement-of-jesus-are-you/resurrection-and-life.png`
**prompt:** [same base] Subject: I Am the Resurrection and the Life. Mood: Grieving, Holding on, Coming alive. Square 1:1, 1024x1024. Negative: [same]

**417. path:** `public/results/which-i-am-statement-of-jesus-are-you/true-vine.png`
**prompt:** [same base] Subject: I Am the True Vine. Mood: Striving, Returning, Staying connected. Square 1:1, 1024x1024. Negative: [same]

### 418-422 (Bible Feast)
**418. path:** `public/results/which-bible-feast-are-you/passover.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted. Subject: Passover, Deliverance and Mercy. Mood: Rescued, Grateful, Remembering. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**419. path:** `public/results/which-bible-feast-are-you/pentecost.png`
**prompt:** [same base] Subject: Pentecost, Fresh Fire and Power. Mood: Empowered, Expectant, Filled. Square 1:1, 1024x1024. Negative: [same]

**420. path:** `public/results/which-bible-feast-are-you/tabernacles.png`
**prompt:** [same base] Subject: Tabernacles, Dwelling and Rest. Mood: Grateful, Settled, Resting. Square 1:1, 1024x1024. Negative: [same]

**421. path:** `public/results/which-bible-feast-are-you/trumpets.png`
**prompt:** [same base] Subject: Trumpets, Awakening and Return. Mood: Alert, Awakening, Turning back. Square 1:1, 1024x1024. Negative: [same]

**422. path:** `public/results/which-bible-feast-are-you/day-of-atonement.png`
**prompt:** [same base] Subject: Day of Atonement, Cleansing and Forgiveness. Mood: Honest, Humbled, Made clean. Square 1:1, 1024x1024. Negative: [same]

**Completed:** The 30 (393-422) were generated in this session using the prompts listed above (full text from prompts.md), sequential process, 5s sleeps, immediate convert/verify/delete, and build:art. Progress updated, no quota hit.

**Completed (new):** The next 30 (423-452) generated in this continuation using exact full prompts from prompts.md (plagues 6 + mountains 6 + miracles 5 + cities 6 + creation days 7). Sequential + 5s + instant convert/verify/delete + build:art x3. All 30 verified 1024x1024. Progress 418 → 448. No quota hit. Synced to C:\GrokDev\docs .

**Completed (latest):** The following 30 (453-482) using exact full prompts (apostles 8 + prophets 7 + women 8 + characters 7). Sequential + 5s + instant convert/verify/delete + build:art x4. All 30 verified 1024x1024. Progress 448 → 478. No quota hit. Synced to C:\GrokDev\docs .

## Upcoming / Next Batches (488-517) - **REQUIRES FRESH GROK SESSION** to reset image_gen quota (hit at 488)

**Current after last work (prior session):** 483/537. (See updated top of this file for new session progress.)

**This fresh session progress:** Completed 488-498 (+11) using fresh session + sequential discipline. Ran build:art -> 494. Continuing below for reference; next gens from 499 onward. Prompts kept for the remainder.

### 488-491 (remaining Beatitudes)
**488. path:** `public/results/which-beatitude-defines-you/merciful.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single clean ICONOGRAPHIC EMBLEM or metaphor for an abstract idea, centered, minimal, lots of negative space. Subject: The Merciful. Mood: Gracious, Forgiving, Soft. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**489. path:** `public/results/which-beatitude-defines-you/pure-in-heart.png`
**prompt:** [same base] Subject: Pure in Heart. Mood: Honest, Single-minded, Clear. Square 1:1, 1024x1024. Negative: [same]

**490. path:** `public/results/which-beatitude-defines-you/peacemakers.png`
**prompt:** [same base] Subject: The Peacemaker. Mood: Brave, Calming, Bridging. Square 1:1, 1024x1024. Negative: [same]

**491. path:** `public/results/which-beatitude-defines-you/persecuted.png`
**prompt:** [same base] Subject: Persecuted for Right. Mood: Brave, Faithful, Steady. Square 1:1, 1024x1024. Negative: [same]

### 492-498 (Bible Animals)
**492. path:** `public/results/which-bible-animal-are-you/lion-of-judah.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single noble biblical CREATURE or celestial being, centered and symbolic, dignified and calm. Subject: Lion of Judah. Mood: Bold, Protective, Strong. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**493. path:** `public/results/which-bible-animal-are-you/lamb.png`
**prompt:** [same base] Subject: The Lamb. Mood: Surrendered, Pure, Gentle. Square 1:1, 1024x1024. Negative: [same]

**494. path:** `public/results/which-bible-animal-are-you/eagle.png`
**prompt:** [same base] Subject: Eagle on the Updraft. Mood: Visionary, Renewed, Soaring. Square 1:1, 1024x1024. Negative: [same]

**495. path:** `public/results/which-bible-animal-are-you/dove.png`
**prompt:** [same base] Subject: The Dove. Mood: Peaceful, Pure, Holy. Square 1:1, 1024x1024. Negative: [same]

**496. path:** `public/results/which-bible-animal-are-you/sheep.png`
**prompt:** [same base] Subject: Sheep of His Pasture. Mood: Following, Trusting, Known. Square 1:1, 1024x1024. Negative: [same]

**497. path:** `public/results/which-bible-animal-are-you/donkey.png`
**prompt:** [same base] Subject: Balaam's Donkey. Mood: Honest, Faithful, Truth-telling. Square 1:1, 1024x1024. Negative: [same]

**498. path:** `public/results/which-bible-animal-are-you/serpent.png`
**prompt:** [same base] Subject: Wise as Serpents. Mood: Discerning, Shrewd, Wise. Square 1:1, 1024x1024. Negative: [same]

### 499-505 (Parables)
**499. path:** `public/results/which-parable-describes-your-life/prodigal-son.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted. Subject: The Prodigal Coming Home. Mood: Honest, Returning, Loved. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**500. path:** `public/results/which-parable-describes-your-life/good-samaritan.png`
**prompt:** [same base] Subject: The Good Samaritan. Mood: Compassionate, Brave, Hands-on. Square 1:1, 1024x1024. Negative: [same]

**501. path:** `public/results/which-parable-describes-your-life/sower.png`
**prompt:** [same base] Subject: The Sower's Good Soil. Mood: Receptive, Rooted, Fruitful. Square 1:1, 1024x1024. Negative: [same]

**502. path:** `public/results/which-parable-describes-your-life/mustard-seed.png`
**prompt:** [same base] Subject: The Mustard Seed. Mood: Small, Patient, Becoming. Square 1:1, 1024x1024. Negative: [same]

**503. path:** `public/results/which-parable-describes-your-life/lost-sheep.png`
**prompt:** [same base] Subject: The Lost Sheep Carried Home. Mood: Found, Carried, Rejoiced-over. Square 1:1, 1024x1024. Negative: [same]

**504. path:** `public/results/which-parable-describes-your-life/talents.png`
**prompt:** [same base] Subject: The Faithful Steward. Mood: Faithful, Diligent, Trusted. Square 1:1, 1024x1024. Negative: [same]

**505. path:** `public/results/which-parable-describes-your-life/pharisee-and-tax-collector.png`
**prompt:** [same base] Subject: The Tax Collector at the Back. Mood: Humble, Honest, Mercy-soaked. Square 1:1, 1024x1024. Negative: [same]

### 506-512 (Bible Stories)
**506. path:** `public/results/which-bible-story-are-you-living/exodus.png`
**prompt:** Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle diffused light, subtle canvas texture, reverent and hopeful, one clear central subject on a softly blurred background, square 1:1 composition, generous breathing room at the edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus (distant, silhouetted, or from behind only). A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted. Subject: Crossing the Red Sea. Mood: Trusting under pressure, Watching, Walking. Square 1:1, 1024x1024. Negative: text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered background, busy edges, collage.

**507. path:** `public/results/which-bible-story-are-you-living/wilderness.png`
**prompt:** [same base] Subject: Wilderness Season. Mood: Stretched, Humbled, Forming. Square 1:1, 1024x1024. Negative: [same]

**508. path:** `public/results/which-bible-story-are-you-living/lions-den.png`
**prompt:** [same base] Subject: In the Lions' Den. Mood: Surrounded, Faithful, Rescued. Square 1:1, 1024x1024. Negative: [same]

**509. path:** `public/results/which-bible-story-are-you-living/resurrection.png`
**prompt:** [same base] Subject: Resurrection Morning. Mood: Reborn, Awake, Astonished. Square 1:1, 1024x1024. Negative: [same]

**510. path:** `public/results/which-bible-story-are-you-living/burning-bush.png`
**prompt:** [same base] Subject: At the Burning Bush. Mood: Called, Holy-ground, Reluctant. Square 1:1, 1024x1024. Negative: [same]

**511. path:** `public/results/which-bible-story-are-you-living/pentecost.png`
**prompt:** [same base] Subject: Pentecost Power. Mood: Filled, Bold, Sent. Square 1:1, 1024x1024. Negative: [same]

**512. path:** `public/results/which-bible-story-are-you-living/storm-at-sea.png`
**prompt:** [same base] Subject: Storm on the Sea of Galilee. Mood: Battered, Scared, Held. Square 1:1, 1024x1024. Negative: [same]

**513-517:** Psalms (symbol type, same base as beatitudes) - psalm-23, psalm-51, psalm-91, psalm-139, psalm-119. Full prompts in MD.

**To generate:** In **fresh session**, for each:
1. Sleep 5s
2. image_gen with full exact prompt + aspect_ratio 1:1
3. Convert the output jpg (e.g. N.jpg) to the exact dst png using the PS System.Drawing snippet from top of handoff.
4. Verify dims == 1024x1024
5. Delete the temp jpg
6. Every 8-10: pnpm build:art
7. Update this handoff with new progress.

Once done (or as far as quota allows in the fresh session), update progress here and sync to C:\GrokDev\docs\reward-art-generation-handoff.md .

(End of handoff — copy this file into the project and refer to it in future sessions. Synced to C:\GrokDev\docs\ too.)