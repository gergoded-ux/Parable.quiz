/**
 * fetch-asv.ts — one-off CONTENT script (not wired into the runtime app).
 *
 * Replaces every quiz's inline scripture text (and the shared scriptures.json)
 * with verified American Standard Version (1901, public domain) text, and tags
 * each verse `translation: "ASV"`.
 *
 * Why: the generated quizzes had verse text written from model memory, some of it
 * NIV-style (NIV is copyrighted). ASV is public domain, so this fixes accuracy and
 * licensing at once. The verse data is pulled ONCE from a bulk public-domain ASV
 * file and looked up locally — the deployed site stays fully static, no runtime API.
 *
 * Source: scrollmapper/bible_databases (ASV.json), cached to scripts/.asv-bible.json.
 * Run: pnpm tsx scripts/fetch-asv.ts
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TESTS_DIR = join(ROOT, 'content', 'tests');
const SHARED = join(ROOT, 'content', 'shared', 'scriptures.json');
const BIBLE_CACHE = join(ROOT, 'scripts', '.asv-bible.json');
const BIBLE_URL = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/ASV.json';

interface RawBible {
  books: { name: string; chapters: { chapter: number; verses: { verse: number; text: string }[] }[] }[];
}

const cleanVerse = (s: string) => s.replace(/¶/g, '').replace(/\s+/g, ' ').trim();

// Canonical book key. Unifies the dataset's naming ("I Samuel", "Revelation of
// John", "Psalms", "Song of Solomon") with how our references are written
// ("1 Samuel", "Revelation", "Psalm", "Song of Songs"). Applied to BOTH sides.
function canonBook(name: string): string {
  let s = name.toLowerCase().trim();
  s = s.replace(/^iii\s+/, '3 ').replace(/^ii\s+/, '2 ').replace(/^i\s+/, '1 ');
  s = s.replace(/[^a-z0-9]/g, '');
  if (s === 'revelationofjohn' || s === 'revelations') s = 'revelation';
  if (s === 'psalm') s = 'psalms';
  if (s === 'songofsongs' || s === 'canticles') s = 'songofsolomon';
  return s;
}

async function loadBible(): Promise<Map<string, string>> {
  let raw: RawBible;
  if (existsSync(BIBLE_CACHE)) {
    raw = JSON.parse(readFileSync(BIBLE_CACHE, 'utf-8'));
  } else {
    console.error('Downloading ASV bulk file...');
    const res = await fetch(BIBLE_URL);
    if (!res.ok) throw new Error(`Failed to download ASV: HTTP ${res.status}`);
    raw = await res.json() as RawBible;
    writeFileSync(BIBLE_CACHE, JSON.stringify(raw));
    console.error('Cached to scripts/.asv-bible.json');
  }
  // Map "<canonbook> <chapter>:<verse>" -> text
  const map = new Map<string, string>();
  for (const book of raw.books) {
    const nb = canonBook(book.name);
    for (const ch of book.chapters) {
      for (const v of ch.verses) {
        map.set(`${nb} ${ch.chapter}:${v.verse}`, cleanVerse(v.text));
      }
    }
  }
  return map;
}

// "Genesis 29:31" | "1 Samuel 18:1" | "Galatians 5:22-23" | "Psalm 13:1,5"
// Returns the resolved ASV text plus the (possibly simplified) reference, or null.
// Comma-style multi-part references are simplified to their first verse so the
// displayed reference and the quoted text stay consistent.
function resolve(map: Map<string, string>, reference: string): { text: string; reference: string } | null {
  const cleanRef = reference.split(',')[0].trim();
  const m = cleanRef.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  const nb = canonBook(m[1]);
  const chapter = Number(m[2]);
  const v1 = Number(m[3]);
  const v2 = m[4] ? Number(m[4]) : v1;
  const parts: string[] = [];
  for (let v = v1; v <= v2; v++) {
    const t = map.get(`${nb} ${chapter}:${v}`);
    if (!t) return null;
    parts.push(t);
  }
  return { text: parts.join(' '), reference: cleanRef };
}

function quizFiles(): string[] {
  const out: string[] = [];
  for (const bucket of readdirSync(TESTS_DIR)) {
    const dir = join(TESTS_DIR, bucket);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir).filter(x => x.endsWith('.json'))) out.push(join(dir, f));
  }
  return out;
}

async function main() {
  const map = await loadBible();
  console.error(`ASV verses indexed: ${map.size}`);

  const files = quizFiles();
  const failed = new Set<string>();
  let verseUpdates = 0, filesChanged = 0;

  for (const file of files) {
    const j = JSON.parse(readFileSync(file, 'utf-8'));
    let changed = false;
    if (j.results) {
      for (const key of Object.keys(j.results)) {
        const sc = j.results[key].scripture;
        if (!sc?.reference) continue;
        const hit = resolve(map, sc.reference);
        if (!hit) { failed.add(sc.reference.trim()); continue; }
        if (sc.text !== hit.text || sc.reference !== hit.reference || sc.translation !== 'ASV') {
          sc.text = hit.text;
          sc.reference = hit.reference;
          sc.translation = 'ASV';
          changed = true;
          verseUpdates++;
        }
      }
    }
    if (changed) { writeFileSync(file, JSON.stringify(j, null, 2) + '\n'); filesChanged++; }
  }

  let sharedUpdates = 0;
  if (existsSync(SHARED)) {
    const shared = JSON.parse(readFileSync(SHARED, 'utf-8'));
    for (const key of Object.keys(shared)) {
      const ref = shared[key].reference?.trim();
      const hit = ref ? resolve(map, ref) : null;
      if (!hit) { if (ref) failed.add(ref); continue; }
      shared[key].text = hit.text;
      shared[key].reference = hit.reference;
      shared[key].translation = 'ASV';
      sharedUpdates++;
    }
    writeFileSync(SHARED, JSON.stringify(shared, null, 2) + '\n');
  }

  console.error(`\nUpdated ${verseUpdates} inline verses across ${filesChanged} quiz files.`);
  console.error(`Updated ${sharedUpdates} verses in shared/scriptures.json.`);
  if (failed.size) {
    console.error(`\nUNRESOLVED (${failed.size}) — left unchanged, fix these references manually:`);
    [...failed].sort().forEach(r => console.error(`  ${r}`));
  } else {
    console.error('\nAll references resolved.');
  }
  console.log(failed.size); // metric: unresolved count (lower is better, target 0)
}

main();
