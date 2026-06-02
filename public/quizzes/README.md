# Quiz cover art

Drop quiz-pick **cover images** here. They appear in the middle of each quiz
card on the homepage / related grids. A quiz with no cover shows a warm gradient
+ emoji placeholder instead.

## Convention
```
public/quizzes/<quiz-slug>.jpg     (or .webp)
```
- `<quiz-slug>` = the quiz's slug (the JSON filename in `content/tests/**`).
- Landscape **3:2** (e.g. 1200×800).

## After adding images
Run `pnpm build:art` (also runs as part of `pnpm build`) to refresh
`content/generated/cover-manifest.json`. Cards then show the real cover for any
slug that has a file; everything else keeps the placeholder. No 404s for
quizzes without covers.

Prompts for the first 70 covers (ranked by virality) are in
`docs/design/quiz-cover-prompts.md`.
