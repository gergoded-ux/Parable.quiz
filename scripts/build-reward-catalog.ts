// scripts/build-reward-catalog.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAllTests } from '@/lib/test-loader';
import { hasIllustration } from '@/lib/card-art';
import { buildRewardCatalog, renderRewardCatalogMarkdown } from '@/lib/reward-catalog';
import publishedSlugs from '@/content/published.json';

function main() {
  const entries = buildRewardCatalog({
    tests: loadAllTests(),
    published: new Set(publishedSlugs as string[]),
    hasImage: (slug, key) => hasIllustration(slug, key),
  });
  mkdirSync(join(process.cwd(), 'content', 'generated'), { recursive: true });
  writeFileSync(join(process.cwd(), 'content', 'generated', 'reward-catalog.json'), JSON.stringify(entries, null, 2) + '\n');
  writeFileSync(join(process.cwd(), 'docs', 'reward-catalog.md'), renderRewardCatalogMarkdown(entries));
  const live = entries.filter(e => e.status === 'live');
  const have = live.filter(e => e.hasImage).length;
  console.log(`build-reward-catalog: ${entries.length} reward images, ${live.length} live, ${have} generated`);
}
main();
