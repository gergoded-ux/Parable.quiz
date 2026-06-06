# Eikonia — Marketing Handoff

> Purpose: the execution starting point for marketing/distribution. Pick this up in a fresh session.
> Strategy and the "why" live in `docs/brand/eikonia-brand-and-marketing.md`. This doc is the "what to do next."
> Last updated: 2026-06-06. Status: foundation complete, distribution not started.

---

## 0. How to use this doc
1. Skim `docs/brand/eikonia-brand-and-marketing.md` for positioning, personas, and voice.
2. Read sections 1 to 5 here for current state, guardrails, metrics, and the plan.
3. Use section 6 (starter kit) to produce assets, and section 9 (kickoff prompt) to brief a new session.

---

## 1. Current state (2026-06-06)

**Done (do not redo):**
- Live at **https://eikonia.art** (HTTPS, www redirects to apex, clean 404s). Old `parable.quiz` retired.
- Brand: **Eikonia**, tagline **"What's your reflection?"** (palette/fonts in the strategy doc appendix).
- **126 live quizzes** in 3 types: Bible Character, Spiritual Profile, Bible IQ (about 134 more in backlog).
- Product: each result gives an illustrated **reward card** with a **rarity** (Common / Rare / Epic / Legendary), an ASV verse, and a shareable Open Graph card image. Polished quiz flow (intro, auto-advance, animation, reveal beat).
- **SEO**: canonicals, Organization/WebSite/Quiz/FAQ/Breadcrumb schema, OG share images on every page type, sized titles/descriptions, one H1 per page, a 929-URL sitemap submitted to **Google Search Console + Bing Webmaster**.
- **Analytics**: Vercel Web Analytics + Speed Insights live, with the full custom-event funnel (see section 3).
- **Contact**: hello@eikonia.art (forwarding live at Hostinger).

**Not done (the marketing work):**
- No social accounts yet (Pinterest, Instagram, TikTok, Facebook).
- No content distribution started.
- No email capture / newsletter.
- Ads not enabled (the ad slots exist in code; turn on when traffic justifies).
- Indexing still warming up (GSC may show "couldn't fetch sitemap" for a day or two; it resolves on Google's retry).

---

## 2. Brand guardrails (apply to ALL copy and creative)
- **Voice:** warm, literate, gentle, hopeful. Talk WITH the reader, never preach. Not churchy-cringe, not clinical, not hype.
- **Hard rules:** no em dashes; quote only the **ASV** (public domain); **never depict the face of God or Jesus**; frame results as "for reflection, not a diagnosis."
- **Visual:** warm golden-hour, storybook palette. The **reward card is the hero asset** in every post. Protect the rarity mechanic (do not cheapen "Legendary").

---

## 3. Goal and measurement
- **North Star:** shares per 100 quiz completions (the share loop is the growth engine). Secondary headline: weekly quizzes completed.
- **Where to look:** Vercel dashboard (Analytics → Custom Events, and Speed Insights) and Google Search Console (indexation, queries, Core Web Vitals once traffic exists).
- **Events already firing:** `quiz_card_click`, `related_quiz_click`, `quiz_start`, `quiz_abandon` (with `question`), `quiz_complete` (with `result`), `result_view` (with `entry` = internal/external/direct = virality signal), `share_click` (with `platform`).
- **Funnel to track:** click → `quiz_start` → `quiz_complete` → `result_view` → `share_click`; plus `quiz_abandon` by question to find drop-off.
- **First targets to validate (not committed):** completion rate above 60 percent, share rate above 15 percent of completions, and a rising share of `result_view` with `entry=external` (inbound from shares).

---

## 4. Priority channels (in order)
1. **Pinterest (primary).** Reward cards are natively pinnable, the audience lives here, and pins have a long half-life.
2. **SEO (compounding, already built).** Keep shipping quizzes and let indexing accrue.
3. **Instagram / TikTok Reels.** Card-reveal shorts and "which X are you" trends.
4. **Facebook groups.** Christian women, moms, and small-group communities (value-first, not spammy).
5. **Email / newsletter (later, opt-in only).** Never gate the core quiz flow.

---

## 5. First two weeks (concrete plan)
**Week 1**
- Reserve and create accounts: Pinterest (business), Instagram, TikTok. Pick one consistent handle (try `@eikonia`, fall back to `@eikonia.art` / `@eikoniaquiz`). Reserve on all platforms even if unused.
- Pinterest: create the boards in section 6, then pin 3 to 5 per day using top quizzes' cards/covers, each linking to the quiz.
- Post 3 to 5 IG/TikTok card-reveal shorts (hooks in section 6).
- In GSC: confirm the sitemap flips to "Success," then use URL Inspection to request indexing on the homepage and 5 flagship quizzes.

**Week 2**
- Double down on whichever channel shows early traction.
- Seed 2 to 3 relevant Facebook groups with value-first posts.
- Review analytics: completion rate and share rate; fix the single worst `quiz_abandon` question.

---

## 6. Starter kit (templates to expand)

**Flagship quizzes to lead with** (broad appeal + searchable):
`which-apostle-are-you`, `who-are-you-in-christ`, `which-piece-of-the-armor-of-god-are-you`, `which-bible-character-are-you`, `which-woman-of-the-bible-are-you`, `mary-or-martha`, `which-fruit-of-the-spirit-are-you`. Seasonal: `which-christmas-character-are-you` (Advent), `easter-resurrection-iq` (Easter).

**Pinterest boards (name + description)**
- *Which Bible Character Are You?* — Free, beautiful Bible personality quizzes. Discover which figure of Scripture you most reflect.
- *Spiritual Gifts and Personality* — Reflective quizzes on your gifts, season, and spiritual style, paired with Scripture.
- *Bible Trivia and IQ* — How well do you know the Bible? Free scored quizzes on Genesis, the Gospels, and more.
- *Faith and Identity* — Who are you in Christ? Gentle quizzes for reflection and encouragement.
- *Christian Self-Reflection* — Two-minute quizzes that hold up a mirror, with a verse to carry with you.
- *Women of the Bible* — Which woman of Scripture mirrors your story? Free quizzes and shareable cards.
- *Advent and Christmas* (seasonal) — Nativity quizzes and Christmas character matches for the season.
- *Easter and Lent* (seasonal) — Reflective quizzes for Holy Week and the resurrection.

**Pin caption template**
- Title (up to ~100 chars, keyword first): e.g., `Which Apostle Are You? Free Bible Personality Quiz`
- Description (~150 to 300 chars, keyword + hook + CTA): warm sentence, what you get, "free, no sign-up," call to take it.
- Link: the quiz URL. Image: the reward card (hero) or the quiz cover.

**Example pins (clone this style)**
1. `which-apostle-are-you` — Title: "Which Apostle Are You? Free Bible Quiz." Desc: "Peter's fire or John's tenderness? Answer a few questions and meet the apostle you most reflect, with a verse and a card to share. Free, no sign-up."
2. `who-are-you-in-christ` — Title: "Who Are You in Christ, Really?" Desc: "Not what you do or what they said. A gentle two-minute quiz on your identity in Christ, with Scripture to keep. Free."
3. `which-piece-of-the-armor-of-god-are-you` — Title: "Which Piece of the Armor of God Are You?" Desc: "Shield of faith or sword of the Spirit? Discover the piece you carry, from Ephesians 6, with a collectible card. Free quiz."
4. `which-woman-of-the-bible-are-you` — Title: "Which Woman of the Bible Are You?" Desc: "Ruth's loyalty, Esther's courage, Mary's heart. Find the woman of Scripture who mirrors your story. Free, shareable result."
5. `mary-or-martha` — Title: "Are You a Mary or a Martha?" Desc: "Sit at His feet or serve in the kitchen? A warm, honest quiz about how you love God, with a verse and a card. Free."

**IG / TikTok hook formulas**
- "POV: you got Legendary on the Armor of God quiz." (card reveal, trending audio)
- "Tell me which apostle you are without telling me which apostle you are."
- "I took a Bible quiz and got [result]. Here is what it means." (screen-record the reveal)
- "Which woman of the Bible are you? I did not expect mine." (suspense to card reveal)
- "Free Christian quiz that actually feels beautiful." (b-roll of cards, end on CTA)
- Always end with: "Free, link in bio."

**Posting cadence (first 2 weeks)**
- Pinterest: 3 to 5 pins/day (rotate quizzes and boards).
- IG/TikTok: 1 short/day or every other day.
- Facebook groups: 1 to 2 value posts/week.

---

## 7. Assets and where they live
- **Quiz covers:** `public/quizzes/<slug>.webp` (landscape 3:2).
- **Reward result art:** `public/results/<slug>/<key>.webp`.
- **Full result cards (1080x1350, ready to screenshot/share):** the Open Graph route `https://eikonia.art/og/<slug>/<key>` (add `?m=NN` to set the match percent / rarity).
- **Local preview of random cards:** the dev-only `/mockup` page (run `pnpm dev`).
- **Palette/fonts:** strategy doc appendix; fonts are Cinzel (display), Inter (body), EB Garamond italic (verses).
- To batch-export pin images, screenshot the OG route per result, or ask a session to write a small export script.

---

## 8. Open decisions and dependencies
- **Reserve social handles** (consistent name across platforms).
- **Email tool** (later): pick a simple provider when ready; keep the core flow sign-up-free.
- **Ads:** enable the existing ad slots once traffic is steady; set a threshold first; keep density low to protect trust.
- **Monetization beyond ads (later):** card packs/printables, church or small-group quiz packs, affiliate (Bibles/books), a tip jar. See the strategy doc.
- **Low-priority polish:** 19 quizzes have short subtitles; their meta descriptions are already auto-padded, so this is optional.

---

## 9. Kickoff prompt for the next session (paste this)

> I am running marketing for **Eikonia** (eikonia.art), a free Christian quiz site. First read `docs/brand/eikonia-brand-and-marketing.md` (strategy) and `docs/marketing/handoff.md` (this handoff). Then help me execute: **[choose one]**
> - Draft 15 to 20 Pinterest pins (title + description + which quiz + which image) for my flagship quizzes.
> - Write 8 TikTok/Reels card-reveal scripts with hooks and on-screen text.
> - Build a 2-week posting calendar across Pinterest, IG/TikTok, and Facebook groups.
> Follow the brand voice (warm, not preachy, no em dashes), quote only the ASV, and make the reward card the hero visual. Keep it ready to post.
