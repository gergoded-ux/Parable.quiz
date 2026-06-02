// scripts/build-art-manifest.ts
// Scans public/results/<slug>/<key>.(jpg|webp|png) and writes a manifest of
// which "slug/key" pairs have an illustration, so renderers know when to fall
// back to the emoji. Run at build time (works for local public/; when art moves
// to Cloudflare, keep this list in sync or regenerate from the bucket listing).
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'public', 'results');
const OUT_DIR = join(process.cwd(), 'content', 'generated');
const OUT = join(OUT_DIR, 'art-manifest.json');

function main() {
  const have: string[] = [];
  if (existsSync(ROOT)) {
    for (const slug of readdirSync(ROOT)) {
      const dir = join(ROOT, slug);
      if (!statSync(dir).isDirectory()) continue;
      for (const f of readdirSync(dir)) {
        const m = f.match(/^(.+)\.(jpg|jpeg|webp|png)$/i);
        if (m) have.push(`${slug}/${m[1]}`);
      }
    }
  }
  have.sort();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(have, null, 2) + '\n');
  console.log(`art-manifest: ${have.length} illustration(s)`);
}
main();
