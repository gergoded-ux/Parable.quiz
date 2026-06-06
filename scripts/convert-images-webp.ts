// scripts/convert-images-webp.ts
// Convert site images to WebP, sized for how each is actually displayed.
// "Fits for usage": a homepage tile and a full-card frame should NOT be encoded
// the same way, so each folder has its own max dimension + quality.
//
//   public/results/* -> card center art. Shown at most ~470px (OG share image);
//                       640px gives a retina margin. quality 80.
//   public/quizzes/* -> homepage tile cover (~250px card, ~500px retina).
//                       600px wide. quality 80.
//   public/cards/*   -> stained-glass frames, drawn at full card size in the OG
//                       image (1080x1350). Keep large + crisp. quality 88.
//
// Run:
//   pnpm convert:webp --dry   (report projected sizes, change nothing)
//   pnpm convert:webp         (convert: write .webp, move originals to a
//                              gitignored .image-originals/ backup, idempotent)
// After a real run: `pnpm build:art` to register the .webp files.
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const PUBLIC = join(process.cwd(), 'public');
const ORIG = join(process.cwd(), '.image-originals');
const DRY = process.argv.includes('--dry');
const SAMPLE = 24; // dry-run: images measured per folder, then projected by count

// NOTE: frames (public/cards/frames) are intentionally NOT converted - they are
// referenced by a hardcoded .png name in lib/rarity.ts and embedded as
// image/png in the OG route, and they are only ~3.7 MB. Leave them as PNG.
const CONFIG: Record<string, { max: number; quality: number }> = {
  results: { max: 640, quality: 80 },
  quizzes: { max: 600, quality: 80 },
  // Category icons render in a ~32px circle; 128px covers retina. quality 85 keeps edges crisp.
  icons: { max: 128, quality: 85 },
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(png|jpe?g)$/i.test(p)) out.push(p);
  }
  return out;
}

function mb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

async function main() {
  let totalOrig = 0, totalWebp = 0, totalConverted = 0, totalSkipped = 0;

  for (const folder of Object.keys(CONFIG)) {
    const root = join(PUBLIC, folder);
    if (!existsSync(root)) continue;
    const cfg = CONFIG[folder];
    const files = walk(root).filter(f => !existsSync(f.replace(/\.(png|jpe?g)$/i, '.webp')));
    const alreadyWebp = walk(root).length - files.length;
    totalSkipped += alreadyWebp;

    if (DRY) {
      const sample = files.slice(0, SAMPLE);
      let so = 0, sw = 0;
      for (const f of sample) {
        so += statSync(f).size;
        const buf = await sharp(f).resize(cfg.max, cfg.max, { fit: 'inside', withoutEnlargement: true }).webp({ quality: cfg.quality }).toBuffer();
        sw += buf.length;
      }
      const ratio = so > 0 ? sw / so : 0;
      const folderOrig = files.reduce((a, f) => a + statSync(f).size, 0);
      const projWebp = Math.round(folderOrig * ratio);
      totalOrig += folderOrig; totalWebp += projWebp; totalConverted += files.length;
      console.log(`${folder.padEnd(9)} max ${cfg.max}px q${cfg.quality} | ${files.length} imgs | ${mb(folderOrig)} -> ~${mb(projWebp)} (sample ${sample.length}, ${(ratio * 100).toFixed(0)}% of original)`);
      continue;
    }

    for (const f of files) {
      const webpPath = f.replace(/\.(png|jpe?g)$/i, '.webp');
      const origSize = statSync(f).size;
      const buf = await sharp(f).resize(cfg.max, cfg.max, { fit: 'inside', withoutEnlargement: true }).webp({ quality: cfg.quality }).toBuffer();
      writeFileSync(webpPath, buf);
      const dest = join(ORIG, relative(PUBLIC, f));
      mkdirSync(dirname(dest), { recursive: true });
      renameSync(f, dest); // keep full-res original (gitignored)
      totalOrig += origSize; totalWebp += buf.length; totalConverted++;
    }
    console.log(`${folder.padEnd(9)} converted ${files.length} (skipped ${alreadyWebp} already webp)`);
  }

  console.log('');
  console.log(`${DRY ? 'PROJECTED' : 'DONE'}: ${totalConverted} image(s) ${mb(totalOrig)} -> ${DRY ? '~' : ''}${mb(totalWebp)} (${totalOrig > 0 ? (100 - totalWebp / totalOrig * 100).toFixed(0) : 0}% smaller), ${totalSkipped} already webp`);
  if (!DRY) console.log('Originals moved to .image-originals/ (gitignored). Next: pnpm build:art');
}
main();
