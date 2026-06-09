# Eikonia blog — plan (proposal)

_Mission: meet someone in a real struggle, point them to scripture and hope, and hand
them a quiz that goes deeper. Articles feed the quizzes; quizzes feed the cards; cards
get shared. A genuine help loop._

## Recommended architecture (lean, fits the stack)

- **Markdown files**, one per article: `content/blog/<slug>.md` with YAML-ish frontmatter
  (`title`, `description`, `date`, `quiz` = the slug to embed, `collection`, `published`,
  optional `hero`). Body is plain Markdown.
  - Why Markdown (not a CMS, not MDX): you'll feed me transcripts -> I turn them into
    Markdown easily; it's diff-able, free, zero infra, and you can edit it. MDX (embedding
    React per-article) is overkill — one quiz embed per article is template-driven.
- **Render:** `marked` (tiny, zero-dep) for Markdown -> HTML; frontmatter parsed by hand.
- **Routes:** `/blog` (index, newest first) and `/blog/[slug]` (the article).
- **The quiz embed:** the article template auto-renders a **"Take the quiz" card** (the
  related quiz's cover + title + CTA) after the intro and again at the end. Optional inline
  marker `{{quiz}}` to place it mid-article.
- **Cross-link both ways (SEO + loop):** article -> quiz, and the quiz's result page gets a
  "Read: <article>" link. Each article: canonical URL + `Article` JSON-LD + OG image.
- **Nav:** add "Articles" (or "Read"). Blog is in the sitemap.

Authoring template (so transcripts convert cleanly):
**Hook (the struggle, personal)** -> **What scripture says (ASV)** -> **A few honest,
practical steps** -> **[Take the quiz]** -> **Hope / next step**. Warm, never preachy.
Example tone target: the Gospel Coalition "your-calling-zigzag" piece.

## Starter article list (each embeds one quiz)

| # | Working title | Helps with | Embeds quiz | Collection |
| --- | --- | --- | --- | --- |
| 1 | Your Calling Is Rarely a Straight Line | feeling behind / lost | are-you-actually-behind-in-life | Calling |
| 2 | You Are Not Who Your Worst Day Says You Are | worth / identity | who-are-you-in-christ | Who Am I |
| 3 | The Lie That You're Falling Behind | comparison + timing | which-waiting-season-bible-figure | Calling |
| 4 | Is He the One? A Calmer Way to Discern | dating discernment | is-he-the-one-christian-discernment | Relationships |
| 5 | Rest Isn't a Reward — It's a Command | burnout / rest | are-you-actually-resting-or-just-stopping | Peace & Rest |
| 6 | How to Forgive Someone Who Never Said Sorry | forgiveness | can-you-forgive-someone-who-isnt-sorry | Walking With God |
| 7 | Hearing God in a Noisy World | discernment / guidance | whats-your-discernment-style | Walking With God |
| 8 | Anxiety and Faith Can Coexist | anxiety / peace | which-anxiety-verse-for-you | Peace & Rest |
| 9 | What Comparison Is Quietly Stealing | comparison / envy | whats-your-comparison-trap | Walking With God |
| 10 | Is Your Phone an Idol? An Honest Look | attention / idols | is-your-phone-an-idol | Walking With God |
| 11 | Grace for the Burned-Out Mom | mom burnout | do-you-have-mom-burnout | Peace & Rest |
| 12 | What Is God Preparing You For? | purpose / waiting | what-is-god-preparing-you-for | Calling |
| 13 | Loving the Way Jesus Loved | relationships | whats-your-love-style-biblically | Relationships |
| 14 | Which Bible Character Are You — and Why It Matters | identity / fun entry | which-bible-character-are-you | Bible Characters |
| 15 | When You Feel Unseen, Someone Sees You | loneliness / belonging | found-by-god-story | Who Am I |

All 15 point to **currently-live** quizzes, so embeds work day one.

## Build order (when approved)
1. `marked` dep + `lib/blog.ts` (loader) + `BlogQuizEmbed` component.
2. `/blog` + `/blog/[slug]` + Article JSON-LD + nav "Articles" + sitemap entries.
3. Seed 1-2 full example articles; the rest as drafts (`published: false`) until you send transcripts.
