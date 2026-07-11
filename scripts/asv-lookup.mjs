// scripts/asv-lookup.mjs
// Shared ASV bible lookup used by both the blog verse checker and the quiz
// verse checker, so there is exactly one implementation of "is this quote
// faithful ASV text" to keep correct.
import { readFileSync } from 'node:fs';

let bibleCache = null;
export function loadBible() {
  if (!bibleCache) bibleCache = JSON.parse(readFileSync('scripts/.asv-bible.json', 'utf-8'));
  return bibleCache;
}

const normBook = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const alias = { psalm: 'psalms', songofsongs: 'songofsolomon' };

let bookIndexCache = null;
function bookIndex() {
  if (bookIndexCache) return bookIndexCache;
  const idx = new Map();
  for (const b of loadBible().books) {
    idx.set(normBook(b.name), b);
    // the JSON uses Roman numerals (I Peter); register arabic aliases (1 Peter)
    const arabic = b.name.replace(/^III\s/, '3 ').replace(/^II\s/, '2 ').replace(/^I\s/, '1 ');
    if (arabic !== b.name) idx.set(normBook(arabic), b);
  }
  bookIndexCache = idx;
  return idx;
}

export function findBook(name) {
  const idx = bookIndex();
  let k = normBook(name);
  if (alias[k]) k = alias[k];
  if (idx.has(k)) return idx.get(k);
  for (const [nk, b] of idx) if (nk.startsWith(k) || k.startsWith(nk)) return b;
  return null;
}

export function verseText(bookObj, chapter, vFrom, vTo) {
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

export const norm = (s) =>
  s.toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Faithful = normalized quote is a substring of the normalized ASV text (with a spaceless fallback for source-JSON glitches). */
export function isFaithful(quote, asvText) {
  const spaceless = (s) => norm(s).replace(/ /g, '');
  return norm(asvText).includes(norm(quote)) || spaceless(asvText).includes(spaceless(quote));
}

/** Parse "Book chapter:verse(-verse)" into resolved ASV text, or null if unresolvable. */
export function resolveReference(ref) {
  const m = ref.trim().match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  const [, book, ch, v1, v2] = m;
  const bookObj = findBook(book);
  if (!bookObj) return null;
  return verseText(bookObj, +ch, +v1, +(v2 ?? v1));
}
