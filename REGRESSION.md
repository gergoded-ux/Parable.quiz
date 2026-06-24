# Regression checklist

Run before every push. Both must pass:

```
pnpm regression   # unit tests + quiz validation + ASV verse check
pnpm build        # TypeScript + every route generates
```

Rule: every new feature adds a test to the suite below in the same change.

## Unit suite (`pnpm regression` -> `vitest run`)

| Area | File | Guards |
|------|------|--------|
| Scoring | tests/scoring.test.ts | archetype/profile/knowledge scoring + out-of-bounds and length guards (the quiz to result crash) |
| Rarity | tests/rarity.test.ts | match% to tier boundaries + clamping |
| Card art | tests/card-art.test.ts | result-art url building + hasIllustration |
| Card data | tests/card-data.test.ts | result to card-data mapping |
| Schema | tests/schema.test.ts | quiz zod schema |
| Scripture | tests/scripture.test.ts | scripture loader |
| Test loader | tests/test-loader.test.ts | published allowlist + loaders |
| Generated catalogs | tests/{themes,catalog,reward-art,reward-catalog}.test.ts | catalog/reward generation |
| Collection store | tests/collection.test.ts | localStorage cards: save/load/dedupe + non-object guard |
| Blog | tests/blog.test.ts | article frontmatter parse + published filter |
| Collections sync | tests/collections.test.ts | COLLECTIONS stays in sync with content/published.json, no dupes |

## Data checks (also in `pnpm regression`)

- `tsx scripts/validate-tests.ts` - every quiz JSON is schema-valid
- `node scripts/check-article-verses.mjs` - every blog scripture quote is exact ASV

## Build gate (`pnpm build`)

`next build` type-checks and statically generates all routes: home, /collections/[id],
/blog + /blog/[slug], /q + result + OG, sitemap, collection.
