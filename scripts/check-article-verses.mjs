// scripts/check-article-verses.mjs
// Verifies every quoted verse in content/blog/*/index.md against the local ASV
// bible JSON (scripts/.asv-bible.json). A quote passes if its normalized text is
// a substring of the normalized ASV text for the cited verse or range.
// Usage: node scripts/check-article-verses.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const bible = JSON.parse(readFileSync('scripts/.asv-bible.json', 'utf-8'));
// shape: { books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
const books = bible.books;

const normBook = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const bookIndex = new Map();
for (const b of books) {
  bookIndex.set(normBook(b.name), b);
  // the JSON uses Roman numerals (I Peter); register arabic aliases (1 Peter)
  const arabic = b.name.replace(/^III\s/, '3 ').replace(/^II\s/, '2 ').replace(/^I\s/, '1 ');
  if (arabic !== b.name) bookIndex.set(normBook(arabic), b);
}
// common aliases
const alias = { psalm: 'psalms', songofsongs: 'songofsolomon' };

function findBook(name) {
  let k = normBook(name);
  if (alias[k]) k = alias[k];
  if (bookIndex.has(k)) return bookIndex.get(k);
  for (const [nk, b] of bookIndex) if (nk.startsWith(k) || k.startsWith(nk)) return b;
  return null;
}

function verseText(bookObj, chapter, vFrom, vTo) {
  const ch = bookObj.chapters.find((c) => Number(c.chapter) === chapter);
  if (!ch) return null;
  const parts = [];
  for (let v = vFrom; v <= vTo; v++) {
    const vt = ch.verses.find((x) => Number(x.verse) === v);
    if (!vt) return null;
    parts.push(vt.text);
  }
  return parts.join(' ');
}

const norm = (s) =>
  s.toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const dir = 'content/blog';
const re = /"([^"]{10,400})"\s*\(((?:[1-3]\s)?[A-Za-z ]+?)\s(\d+):(\d+)(?:-(\d+))?,\s*ASV\)/g;

let total = 0;
let bad = 0;
for (const slug of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const md = readFileSync(join(dir, slug, 'index.md'), 'utf-8');
  for (const m of md.matchAll(re)) {
    total++;
    const [, quote, book, ch, v1, v2] = m;
    const bookObj = findBook(book);
    const ref = `${book.trim()} ${ch}:${v1}${v2 ? '-' + v2 : ''}`;
    if (!bookObj) {
      bad++;
      console.log(`MISS  ${slug}\n  ref:   ${ref} (book not found)\n`);
      continue;
    }
    const asv = verseText(bookObj, +ch, +v1, +(v2 ?? v1));
    if (!asv) {
      bad++;
      console.log(`MISS  ${slug}\n  ref:   ${ref} (verse not found)\n`);
      continue;
    }
    // spaceless fallback: the source JSON occasionally drops spaces ("Eventhe days")
    const spaceless = (s) => norm(s).replace(/ /g, '');
    if (!norm(asv).includes(norm(quote)) && !spaceless(asv).includes(spaceless(quote))) {
      bad++;
      console.log(`DIFF  ${slug}  (${ref})\n  quoted: ${quote}\n  asv:    ${asv.trim()}\n`);
    }
  }
}
console.log(`${total} quotes checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
