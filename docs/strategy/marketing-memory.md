# Eikonia marketing memory

Single source of truth for branding, features, and the core loop. Update this whenever any of it changes.

## What it is

Eikonia (eikonia.art) is a free Christian quiz site. Take a quiz, get a collectible result card, keep it in your binder, share it. A blog meets people in a real struggle and points them to the matching quiz. Static site on Vercel, auto-deploys `main` to production.

## Mission

Help people. Meet someone where they actually are (anxiety, comparison, calling, identity, rest), point them to scripture and hope, and hand them something they want to keep and share.

## Audience

Christians and the spiritually curious, skewing younger and mobile, who already take and share quizzes. Strong fit with women 18 to 45 for the identity, relationships, and peace topics; broad appeal for Bible-character and Bible IQ.

## Voice and rules (non-negotiable)

- Warm, honest, hopeful. Never preachy, never salesy, never fear-based.
- Non-divisive: no denominational fights, no date-setting, no prosperity or deliverance spectacle, no politics.
- Scripture is ASV only, quoted exactly, always with a reference.
- No gambling or gacha framing. Rarity is quiet flavor; the binder is a keepsake, not a loot box.
- Never depict the face of God or Jesus.
- Plain language. No em-dashes in published copy.

## Visual identity

- Palette: warm cream and sand backgrounds, brown ink, gold accents (tokens in `app/globals.css`).
- Logo: the gold "E" mark plus the Eikonia wordmark (favicon, OG, card back).
- Cards: portrait stained-glass frames; rarity by material (green common, sapphire rare, purple epic, gold legendary), a star rail, the art, traits, and a verse.
- Home: a soft painted hero background (`public/home-bg.webp`) behind the content.
- Social images: `public/og-blog.png` for articles; per-result OG cards for quizzes.

## Features (what exists today)

- 80 quizzes in 7 collections: Bible Characters (28), Who Am I (8), Relationships (6), Calling (6), Peace and Rest (7), Walking (10), Bible IQ (15). Three types: character match (archetype), spiritual profile, Bible knowledge.
- Result cards with rarity and match %, shareable and downloadable, with per-result OG images for social.
- My Cards binder (`/collection`): every earned card rendered for real, grouped by collection, with progress bars and locked slots. localStorage, no account.
- Blog (`/blog`): 16 articles, transcript-fed, ASV, each embedding its paired quiz; Article and breadcrumb schema; in the sitemap.
- Homepage: rotating featured hero, collection rows, and collection hub pages (`/collections/[id]`).
- Feedback widget (needs `FEEDBACK_WEBHOOK_URL` set on Vercel production).
- SEO: sitemap (home, collections, blog, quizzes, results), JSON-LD, canonicals, OG and Twitter cards.
- Quality gate: `pnpm regression` plus `pnpm build` before every push (see `REGRESSION.md`).

## Core loop

Discover (blog, a shared card, search, home) -> take a quiz -> earn a card (auto-saved to the binder) -> see the binder fill, with gaps and progress -> pulled to take more and complete sets -> share standout cards -> friends arrive and start their own binder -> new quizzes and the blog bring everyone back.

Drivers: completion ("12 of 80"), meaning (each card carries a verse), identity (the card is about them, which is why they share). Sharing is the main acquisition channel.

## Distribution

- Organic search: blog articles plus quiz and result pages (SEO and AI citations).
- Social: shared result cards (Pinterest links to the quiz; Facebook, X, and copy link go to the result), shareable OG images.
- The help loop: article -> quiz -> card -> share.

## Constraints

- No backend yet: the collection and feedback are client-side. A cross-device, persistent collection needs accounts (the main future unlock).
- Free and static; auto-deploys `main` to eikonia.art.

## Core-loop features

Shipped (no backend):

1. Earn moment. A toast on the result page ("Saved to your binder, N of 80") that also nudges the nearest set to finish.
2. Set-completion seal. A "Complete" badge on a collection once every card in it is collected.
3. Share my binder. A branded image ("I have collected N of 80 cards") to share or download.
4. Next-gap nudge. Folded into the earn toast ("2 more to finish Bible Characters").
5. Quiz of the week. A date-rotated weekly pick on the home page, a cheap reason to return.
6. Re-pull depth. A line on the result page inviting a retake for a different card.
7. Favorites. Star a card and filter the binder to favorites only.

Not yet (deliberately deferred):

8. Email capture. The return trigger that scales ("a new quiz dropped"). Needs a list.
9. Accounts and sync. Cross-device, never-lost collection. The real ceiling for the loop; needs a backend.
