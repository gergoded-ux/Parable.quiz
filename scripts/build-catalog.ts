// scripts/build-catalog.ts
// Reads the source of truth and writes content/generated/catalog.json +
// docs/catalog.md. Pure logic lives in lib/catalog.ts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAllTests } from '@/lib/test-loader';
import { buildCatalog, renderCatalogMarkdown } from '@/lib/catalog';
import publishedSlugs from '@/content/published.json';
import coverManifest from '@/content/generated/cover-manifest.json';

const TSV = join(process.cwd(), 'content', 'topic-backlog.tsv');
const OUT_JSON = join(process.cwd(), 'content', 'generated', 'catalog.json');
const OUT_MD = join(process.cwd(), 'docs', 'catalog.md');

function viralityBySlug(): Map<string, number> {
  const m = new Map<string, number>();
  for (const line of readFileSync(TSV, 'utf-8').split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const slug = cols[2];
    const score = Number(cols[7]);
    if (slug && Number.isFinite(score)) m.set(slug, score);
  }
  return m;
}

function main() {
  const tests = loadAllTests();
  const published = new Set(publishedSlugs as string[]);
  const covers = new Set(
    (coverManifest as string[]).map(f => f.replace(/\.(jpg|jpeg|webp|png)$/i, '')),
  );
  const entries = buildCatalog({ tests, published, covers, virality: viralityBySlug() });

  mkdirSync(join(process.cwd(), 'content', 'generated'), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(entries, null, 2) + '\n');
  writeFileSync(OUT_MD, renderCatalogMarkdown(entries));

  const live = entries.filter(e => e.status === 'live').length;
  console.log(`build-catalog: ${entries.length} quizzes (${live} live) -> catalog.json + docs/catalog.md`);
}
main();
