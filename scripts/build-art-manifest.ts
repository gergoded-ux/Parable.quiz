// scripts/build-art-manifest.ts
// Scans public/results/<slug>/<key>.(jpg|webp|png) and writes a manifest of
// which "slug/key" pairs have an illustration, so renderers know when to fall
// back to the emoji. Run at build time (works for local public/; when art moves
// to Cloudflare, keep this list in sync or regenerate from the bucket listing).
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'public', 'results');
const COVER_ROOT = join(process.cwd(), 'public', 'quizzes');
const OUT_DIR = join(process.cwd(), 'content', 'generated');
const OUT = join(OUT_DIR, 'art-manifest.json');
const COVER_OUT = join(OUT_DIR, 'cover-manifest.json');

function main() {
  // Result illustrations: public/results/<slug>/<key>.(jpg|webp|png) -> "slug/key"
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

  // Quiz cover images: public/quizzes/<slug>.(jpg|webp|png) -> "slug"
  const covers: string[] = [];
  if (existsSync(COVER_ROOT)) {
    for (const f of readdirSync(COVER_ROOT)) {
      const m = f.match(/^(.+)\.(jpg|jpeg|webp|png)$/i);
      if (m) covers.push(m[1]);
    }
  }
  covers.sort();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(have, null, 2) + '\n');
  writeFileSync(COVER_OUT, JSON.stringify(covers, null, 2) + '\n');
  console.log(`art-manifest: ${have.length} illustration(s), ${covers.length} cover(s)`);
}
main();
