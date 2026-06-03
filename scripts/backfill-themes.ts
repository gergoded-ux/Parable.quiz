// scripts/backfill-themes.ts
// One-time (re-runnable): writes a `theme` onto every quiz JSON. Source of theme:
//   1) OVERRIDES (slug -> theme) for originals + known exceptions
//   2) themeForStruggle(struggle from topic-backlog.tsv, title)
//   3) mode fallback (knowledge -> bible-knowledge)
// Any quiz left unresolved is printed; add it to OVERRIDES and re-run until 0.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { themeForStruggle, isValidTheme, type Theme } from '@/lib/themes';

const ROOT = join(process.cwd(), 'content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'] as const;
const TSV = join(process.cwd(), 'content', 'topic-backlog.tsv');

// Hand-tagged themes for the original quizzes (not in the backlog TSV) and any
// autoresearch quiz the heuristic mis-tags. Extend as needed, then re-run.
const OVERRIDES: Record<string, Theme> = {
  'which-apostle-are-you': 'scripture-archetype',
  'which-prophet-are-you': 'scripture-archetype',
  'which-bible-character-are-you': 'scripture-archetype',
  'which-woman-of-the-bible-are-you': 'scripture-archetype',
  'which-bible-animal-are-you': 'scripture-archetype',
  'which-christmas-character-are-you': 'scripture-archetype',
  'which-bible-story-are-you-living': 'scripture-archetype',
  'which-parable-describes-your-life': 'scripture-archetype',
  'which-beatitude-defines-you': 'discipleship',
  'which-fruit-of-the-spirit-are-you': 'discipleship',
  'mary-or-martha': 'discipleship',
  'beatitudes-profile': 'discipleship',
  'prayer-style-profile': 'discipleship',
  'spiritual-gifts-profile': 'discipleship',
  'spiritual-discipline-recommender': 'discipleship',
  'virtues-and-vices-profile': 'discipleship',
  'genesis-iq': 'bible-knowledge',
  'parables-iq': 'bible-knowledge',
  'verse-or-quote': 'bible-knowledge',
  'bible-doubters-iq': 'bible-knowledge',
  // Stragglers the heuristic could not resolve, hand-tagged from their struggle.
  'which-psalm-speaks-to-you': 'scripture-archetype',
  'which-anxious-bible-prayer-sounds-like-you': 'anxiety',
  'which-bible-figures-grudge': 'forgiveness',
  'which-bible-mother-are-you': 'parenting-family',
  'which-bible-temptation-are-you-fighting': 'discipleship',
  'which-healing-encounter-with-jesus': 'healing-wounds',
  'which-wilderness-season': 'calling-purpose',
  'are-you-allowed-to-be-angry-at-god': 'doubt-faith',
  'are-you-angry-at-god': 'doubt-faith',
  'are-you-carrying-more-than-you-can-hold': 'rest-burnout',
  'are-you-ready-to-find-a-new-church': 'church-hurt',
  'faith-or-feelings-what-running-on': 'doubt-faith',
  'gods-plan-for-this-season': 'calling-purpose',
  'how-do-you-react-when-plans-fall-apart': 'anxiety',
  'how-far-from-god-do-you-actually-feel': 'doubt-faith',
  'is-it-god-or-just-you': 'hearing-god',
  'what-habit-is-running-your-life': 'discipleship',
  'whats-driving-your-spending': 'money-work',
  'whats-your-path-back-to-god-after-falling': 'doubt-faith',
  'whats-your-triggered-reaction-style': 'healing-wounds',
  'where-is-god-in-your-pain-right-now': 'grief-loss',
  'which-part-of-you-needs-healing': 'healing-wounds',
  'which-quarter-life-crisis': 'calling-purpose',
  'which-stage-of-returning-to-god': 'doubt-faith',
  'which-toxic-church-pattern-survived': 'church-hurt',
  'why-arent-your-prayers-being-answered': 'hearing-god',
};

function struggleBySlug(): Map<string, string> {
  const map = new Map<string, string>();
  const lines = readFileSync(TSV, 'utf-8').split(/\r?\n/);
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const slug = cols[2], struggle = cols[4];
    if (slug) map.set(slug, struggle ?? '');
  }
  return map;
}

function main() {
  const struggles = struggleBySlug();
  const unresolved: string[] = [];
  let written = 0;

  for (const bucket of BUCKETS) {
    const dir = join(ROOT, bucket);
    for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const path = join(dir, file);
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      const slug: string = raw.slug;

      let theme: Theme | null =
        OVERRIDES[slug] ??
        themeForStruggle(struggles.get(slug), raw.title) ??
        (raw.mode === 'knowledge' ? 'bible-knowledge' : null);

      if (!isValidTheme(theme ?? undefined)) { unresolved.push(slug); continue; }

      if (raw.theme !== theme) {
        raw.theme = theme;
        writeFileSync(path, JSON.stringify(raw, null, 2) + '\n');
        written++;
      }
    }
  }

  console.log(`backfill-themes: wrote ${written} file(s)`);
  if (unresolved.length) {
    console.error(`⚠ ${unresolved.length} unresolved (add to OVERRIDES):`);
    unresolved.forEach(s => console.error('  ' + s));
    process.exit(1);
  }
}
main();
