// scripts/check-quiz-verses.mjs
// Verifies every quiz-intro verse (the optional `verses` field on a quiz JSON)
// is exact ASV text for its stated reference. Usage: node scripts/check-quiz-verses.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveReference, isFaithful } from './asv-lookup.mjs';

const ROOT = join('content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'];

let total = 0;
let bad = 0;
for (const bucket of BUCKETS) {
  const dir = join(ROOT, bucket);
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { continue; }
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
    for (const v of data.verses ?? []) {
      total++;
      const asv = resolveReference(v.reference);
      if (!asv) {
        bad++;
        console.log(`MISS  ${bucket}/${file}\n  ref:   ${v.reference} (not found)\n`);
        continue;
      }
      if (!isFaithful(v.text, asv)) {
        bad++;
        console.log(`DIFF  ${bucket}/${file}  (${v.reference})\n  quoted: ${v.text}\n  asv:    ${asv.trim()}\n`);
      }
    }
  }
}
console.log(`${total} quiz verses checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
