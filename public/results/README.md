# Result card art

Drop generated character/result illustrations here. They get composited into the
card's image window by the card renderer.

## Convention

```
public/results/<quiz-slug>/<result-key>.png
```

- `<quiz-slug>` = the quiz's slug (matches the JSON filename in `content/tests/**`).
- `<result-key>` = the result key inside that quiz's `results` object (kebab-case).

## Image spec

- **1:1 square** (recommended 1024×1024), PNG.
- Single character, bust / head-and-shoulders, centered, facing viewer.
- Soft, simple, warm background (no busy scenery) so it reads at small size inside the card window and sits well on any rarity frame.
- Consistent illustration style across all results so cards feel like one collectible set.

## First set — "Are You a Leah or a Rachel?"

`are-you-a-leah-or-a-rachel/leah.png`
`are-you-a-leah-or-a-rachel/rachel.png`
