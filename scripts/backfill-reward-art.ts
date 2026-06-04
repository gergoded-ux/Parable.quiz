// scripts/backfill-reward-art.ts
// Tags every LIVE archetype/profile result with a rewardArt type:
//   per-result OVERRIDES  ->  per-quiz QUIZ_TYPE  ->  inferRewardArt() fallback.
// Re-runnable; prints anything unresolved so you can extend the maps and re-run.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import publishedSlugs from '@/content/published.json';
import { inferRewardArt, isValidRewardArt, type RewardArt } from '@/lib/reward-art';

const ROOT = join(process.cwd(), 'content', 'tests');
const LIVE = new Set(publishedSlugs as string[]);

// Whole-quiz type for quizzes whose results are all one non-character type.
const QUIZ_TYPE: Record<string, RewardArt> = {
  'which-bible-animal-are-you': 'creature',
  'which-biblically-accurate-angel-are-you': 'creature',
  'which-bible-mountain-are-you': 'place',
  'which-bible-city-are-you': 'place',
  'which-piece-of-the-armor-of-god-are-you': 'object',
  'which-name-of-god-are-you': 'symbol',
  'which-i-am-statement-of-jesus-are-you': 'symbol',
  'which-fruit-of-the-spirit-are-you': 'symbol',
  'which-beatitude-defines-you': 'symbol',
  'which-tribe-of-israel-are-you': 'symbol',
  'which-psalm-speaks-to-you': 'symbol',
  'which-bible-feast-are-you': 'scene',
  'which-plague-of-egypt-are-you': 'scene',
  'which-bible-miracle-are-you': 'scene',
  'which-day-of-creation-are-you': 'scene',
  'which-parable-describes-your-life': 'scene',
  'which-bible-story-are-you-living': 'scene',
};

// Per-result exceptions inside a mixed quiz: key is "slug/resultKey".
const OVERRIDES: Record<string, RewardArt> = {
  'which-christmas-character-are-you/angel': 'creature', // the announcing angel
  'found-by-god-story/lost-sheep': 'creature',           // the lost sheep (an animal)
};

function main() {
  const unresolved: string[] = [];
  let written = 0;

  for (const bucket of ['archetype', 'profile'] as const) {
    const dir = join(ROOT, bucket);
    for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const path = join(dir, file);
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      if (!LIVE.has(raw.slug)) continue;            // tag live only
      if (!raw.results) continue;

      let changed = false;
      for (const key of Object.keys(raw.results)) {
        const type: RewardArt =
          OVERRIDES[`${raw.slug}/${key}`] ??
          QUIZ_TYPE[raw.slug] ??
          inferRewardArt(raw.category, raw.mode);
        if (!isValidRewardArt(type)) { unresolved.push(`${raw.slug}/${key}`); continue; }
        if (raw.results[key].rewardArt !== type) { raw.results[key].rewardArt = type; changed = true; }
      }
      if (changed) { writeFileSync(path, JSON.stringify(raw, null, 2) + '\n'); written++; }
    }
  }

  console.log(`backfill-reward-art: wrote ${written} file(s)`);
  if (unresolved.length) {
    console.error(`unresolved: ${unresolved.length}`);
    unresolved.forEach(s => console.error('  ' + s));
    process.exit(1);
  }
}
main();
