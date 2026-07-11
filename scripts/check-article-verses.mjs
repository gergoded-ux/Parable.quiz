// scripts/check-article-verses.mjs
// Verifies every quoted verse in content/blog/*/index.md against the local ASV
// bible JSON (scripts/.asv-bible.json). A quote passes if its normalized text is
// a substring of the normalized ASV text for the cited verse or range.
// Usage: node scripts/check-article-verses.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { findBook, verseText, isFaithful } from './asv-lookup.mjs';

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
    if (!isFaithful(quote, asv)) {
      bad++;
      console.log(`DIFF  ${slug}  (${ref})\n  quoted: ${quote}\n  asv:    ${asv.trim()}\n`);
    }
  }
}
console.log(`${total} quotes checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
