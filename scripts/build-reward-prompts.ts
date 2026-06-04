// scripts/build-reward-prompts.ts
// Emits docs/design/reward-card-prompts.md: a self-contained job sheet an
// agentic Grok can execute (generate each image, save to the exact path).
// LIVE archetype/profile results only; knowledge quizzes reuse the cover.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPublishedTests } from '@/lib/test-loader';
import { REWARD_BASE_STYLE, REWARD_NEGATIVE, REWARD_TEMPLATES, isValidRewardArt, type RewardArt } from '@/lib/reward-art';

function subject(name: string, traits: string[]): string {
  const base = name.replace(/\s*\(([^)]+)\)\s*$/, (_m, p1) => `, ${p1}`);
  const mood = traits.length ? ` Mood: ${traits.join(', ')}.` : '';
  return `${base}.${mood}`;
}

function main() {
  const tests = loadPublishedTests().filter(t => t.mode === 'archetype' || t.mode === 'profile');
  const out: string[] = [];
  out.push('# Reward-card art job sheet (for Grok-build)', '');
  out.push('Generate ONE image per row below and SAVE it to the exact `path`. Each prompt is complete and self-contained.', '');
  out.push('- Size: 1024x1024 PNG. One subject. Leave breathing room at the edges (a frame overlays the border).');
  out.push('- Do not add any text, letters, or watermark to the image.');
  out.push('- After generating all images, a human runs `pnpm build:art` to register them.', '');
  out.push('## Base style (already baked into every prompt)', '', '> ' + REWARD_BASE_STYLE, '');
  out.push('## Negative prompt (already baked into every prompt)', '', '> ' + REWARD_NEGATIVE, '');
  out.push('---', '');

  let n = 0;
  for (const t of tests) {
    out.push(`### ${t.title} \`${t.slug}\``, '');
    for (const [key, r] of Object.entries(t.results)) {
      const type = (r as { rewardArt?: string }).rewardArt;
      if (!isValidRewardArt(type)) continue;
      const traits = ((r as { traits?: string[] }).traits) ?? [];
      const prompt = `${REWARD_BASE_STYLE} ${REWARD_TEMPLATES[type as RewardArt]} Subject: ${subject((r as { name: string }).name, traits)} Square 1:1, 1024x1024. Negative: ${REWARD_NEGATIVE}`;
      n++;
      out.push(`${n}. **path:** \`public/results/${t.slug}/${key}.png\`  ·  **type:** ${type}`);
      out.push(`   **prompt:** ${prompt}`, '');
    }
  }
  out.push('', `_Total: ${n} reward images._`, '');
  writeFileSync(join(process.cwd(), 'docs', 'design', 'reward-card-prompts.md'), out.join('\n'));
  console.log(`build-reward-prompts: ${n} prompts -> docs/design/reward-card-prompts.md`);
}
main();
