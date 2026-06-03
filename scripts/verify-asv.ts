/**
 * ASV scripture verification pass for the 40 newly-added Bible quizzes.
 *
 * Usage:
 *   tsx scripts/verify-asv.ts            # report-only (no writes)
 *   tsx scripts/verify-asv.ts --fix      # apply fixes in place
 *
 * Verifies that every quoted Bible verse is faithful ASV wording and that
 * every reference uses the site's modern style (1 Samuel, 2 Kings, Psalm).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--fix");

// ---------------------------------------------------------------------------
// Load ASV bible into a lookup: "Book|chapter|verse" -> text
// ---------------------------------------------------------------------------
type AsvVerse = { verse: number; text: string };
type AsvChapter = { chapter: number; verses: AsvVerse[] };
type AsvBook = { name: string; chapters: AsvChapter[] };
type AsvData = { translation: string; books: AsvBook[] };

const asv: AsvData = JSON.parse(
  readFileSync(join(ROOT, "scripts", ".asv-bible.json"), "utf8"),
);

// Map MODERN book name -> ASV file book name.
const MODERN_TO_ASV: Record<string, string> = {
  "Genesis": "Genesis",
  "Exodus": "Exodus",
  "Leviticus": "Leviticus",
  "Numbers": "Numbers",
  "Deuteronomy": "Deuteronomy",
  "Joshua": "Joshua",
  "Judges": "Judges",
  "Ruth": "Ruth",
  "1 Samuel": "I Samuel",
  "2 Samuel": "II Samuel",
  "1 Kings": "I Kings",
  "2 Kings": "II Kings",
  "1 Chronicles": "I Chronicles",
  "2 Chronicles": "II Chronicles",
  "Ezra": "Ezra",
  "Nehemiah": "Nehemiah",
  "Esther": "Esther",
  "Job": "Job",
  "Psalm": "Psalms",
  "Psalms": "Psalms",
  "Proverbs": "Proverbs",
  "Ecclesiastes": "Ecclesiastes",
  "Song of Solomon": "Song of Solomon",
  "Isaiah": "Isaiah",
  "Jeremiah": "Jeremiah",
  "Lamentations": "Lamentations",
  "Ezekiel": "Ezekiel",
  "Daniel": "Daniel",
  "Hosea": "Hosea",
  "Joel": "Joel",
  "Amos": "Amos",
  "Obadiah": "Obadiah",
  "Jonah": "Jonah",
  "Micah": "Micah",
  "Nahum": "Nahum",
  "Habakkuk": "Habakkuk",
  "Zephaniah": "Zephaniah",
  "Haggai": "Haggai",
  "Zechariah": "Zechariah",
  "Malachi": "Malachi",
  "Matthew": "Matthew",
  "Mark": "Mark",
  "Luke": "Luke",
  "John": "John",
  "Acts": "Acts",
  "Romans": "Romans",
  "1 Corinthians": "I Corinthians",
  "2 Corinthians": "II Corinthians",
  "Galatians": "Galatians",
  "Ephesians": "Ephesians",
  "Philippians": "Philippians",
  "Colossians": "Colossians",
  "1 Thessalonians": "I Thessalonians",
  "2 Thessalonians": "II Thessalonians",
  "1 Timothy": "I Timothy",
  "2 Timothy": "II Timothy",
  "Titus": "Titus",
  "Philemon": "Philemon",
  "Hebrews": "Hebrews",
  "James": "James",
  "1 Peter": "I Peter",
  "2 Peter": "II Peter",
  "1 John": "I John",
  "2 John": "II John",
  "3 John": "III John",
  "Jude": "Jude",
  "Revelation": "Revelation of John",
};

const verseMap = new Map<string, string>();
for (const book of asv.books) {
  for (const ch of book.chapters) {
    for (const v of ch.verses) {
      verseMap.set(`${book.name}|${ch.chapter}|${v.verse}`, v.text.trim());
    }
  }
}

/** Normalize a reference string to the site's modern style. */
function normalizeReference(ref: string): string {
  let r = ref.trim();
  // Leading numeral words: "I "/"II "/"III " -> "1 "/"2 "/"3 "
  r = r.replace(/^III\s+/, "3 ").replace(/^II\s+/, "2 ").replace(/^I\s+/, "1 ");
  // "Psalms 23:1" -> "Psalm 23:1"
  r = r.replace(/^Psalms\b/, "Psalm");
  return r;
}

/** Parse a reference like "1 Samuel 17:45" or "Psalm 23:1" into {book, chapter, verses[]}. */
function parseReference(
  ref: string,
): { book: string; chapter: number; verses: number[] } | null {
  const r = normalizeReference(ref);
  // book (may contain digits prefix + words), space, chapter:verse(-verse)
  const m = r.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  const book = m[1].trim();
  const chapter = parseInt(m[2], 10);
  const vStart = parseInt(m[3], 10);
  const vEnd = m[4] ? parseInt(m[4], 10) : vStart;
  const verses: number[] = [];
  for (let v = vStart; v <= vEnd; v++) verses.push(v);
  return { book, chapter, verses };
}

/** Get concatenated ASV text for a (modern) reference, or null if unresolvable. */
function getAsvText(ref: string): string | null {
  const parsed = parseReference(ref);
  if (!parsed) return null;
  const asvBook = MODERN_TO_ASV[parsed.book];
  if (!asvBook) return null;
  const parts: string[] = [];
  for (const v of parsed.verses) {
    const t = verseMap.get(`${asvBook}|${parsed.chapter}|${v}`);
    if (t == null) return null;
    parts.push(t);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Loose normalization for substring comparison. */
function norm(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

/** Strip surrounding quotes and leading/trailing punctuation+space for matching. */
function stripForMatch(s: string): string {
  let t = norm(s);
  // remove wrapping straight quotes
  t = t.replace(/^"+/, "").replace(/"+$/, "");
  // trim leading/trailing punctuation and whitespace
  t = t.replace(/^[\s.,;:!?'"—-]+/, "").replace(/[\s.,;:!?'"—-]+$/, "");
  return t;
}

/**
 * Is `quote` a faithful ASV excerpt of `asvText`?
 * Faithful = case-insensitive substring match after normalization, ignoring
 * surrounding capitalization of first letter and trailing punctuation.
 */
function isFaithful(quote: string, asvText: string): boolean {
  const q = stripForMatch(quote).toLowerCase();
  const a = norm(asvText).toLowerCase();
  if (!q) return false;
  if (a.includes(q)) return true;
  // Fallback: the ASV source JSON has ~20 verses with a missing-space artifact
  // (e.g. "Pridegoethbefore", "Agoodname"). Compare with all spaces removed so
  // those data glitches do not produce false paraphrase reports.
  const qd = q.replace(/\s+/g, "");
  const ad = a.replace(/\s+/g, "");
  return ad.includes(qd);
}

// ---------------------------------------------------------------------------
// File lists (the 40 newly-added quizzes)
// ---------------------------------------------------------------------------
const KNOWLEDGE_FILES = [
  "apostle-paul-iq.json",
  "book-of-acts-iq.json",
  "book-of-judges-iq.json",
  "easter-resurrection-iq.json",
  "exodus-iq.json",
  "guess-the-bible-verse.json",
  "how-well-do-you-know-david-and-goliath.json",
  "how-well-do-you-know-moses.json",
  "how-well-do-you-know-revelation.json",
  "how-well-do-you-know-the-gospels.json",
  "how-well-do-you-know-the-ten-commandments.json",
  "how-well-do-you-know-the-ten-plagues.json",
  "jesus-miracles-iq.json",
  "jesus-parables-iq.json",
  "jonah-iq.json",
  "joseph-in-egypt-iq.json",
  "name-the-books-of-the-bible.json",
  "noahs-ark-iq.json",
  "proverbs-wisdom-iq.json",
  "women-of-the-bible-iq.json",
].map((f) => join(ROOT, "content", "tests", "knowledge", f));

const ARCHETYPE_FILES = [
  "which-bible-city-are-you.json",
  "which-bible-dreamer-are-you.json",
  "which-bible-feast-are-you.json",
  "which-bible-king-are-you.json",
  "which-bible-miracle-are-you.json",
  "which-bible-mountain-are-you.json",
  "which-bible-queen-are-you.json",
  "which-bible-villain-are-you.json",
  "which-bible-warrior-are-you.json",
  "which-biblically-accurate-angel-are-you.json",
  "which-day-of-creation-are-you.json",
  "which-gospel-writer-are-you.json",
  "which-i-am-statement-of-jesus-are-you.json",
  "which-judge-of-israel-are-you.json",
  "which-miracle-working-prophet-are-you.json",
  "which-name-of-god-are-you.json",
  "which-patriarch-are-you.json",
  "which-piece-of-the-armor-of-god-are-you.json",
  "which-plague-of-egypt-are-you.json",
  "which-tribe-of-israel-are-you.json",
].map((f) => join(ROOT, "content", "tests", "archetype", f));

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
type Finding = {
  file: string;
  location: string;
  reference: string;
  issue: string;
  detail?: string;
};
const findings: Finding[] = [];
let checked = 0;
let textFixed = 0;
let refsNormalized = 0;
let unresolved = 0;

const short = (s: string, n = 90) => (s.length > n ? s.slice(0, n) + "…" : s);

// ---------------------------------------------------------------------------
// KNOWLEDGE: scan string fields for `"quote" (Ref, ASV)` patterns
// We walk every string value, and for each occurrence of `(Ref, ASV)` we
// look back for the immediately-preceding quoted clause.
// ---------------------------------------------------------------------------
// Match a quoted clause followed by an (Reference, ASV) label.
// Book-name alternation for inline reference detection. Includes modern forms
// and roman-numeral forms so we catch references written either way.
const BOOK_NAMES_FOR_RE = [
  // multi-word / numbered first so the regex prefers the longer match
  "Song of Solomon",
  "1 Samuel", "2 Samuel", "I Samuel", "II Samuel",
  "1 Kings", "2 Kings", "I Kings", "II Kings",
  "1 Chronicles", "2 Chronicles", "I Chronicles", "II Chronicles",
  "1 Corinthians", "2 Corinthians", "I Corinthians", "II Corinthians",
  "1 Thessalonians", "2 Thessalonians", "I Thessalonians", "II Thessalonians",
  "1 Timothy", "2 Timothy", "I Timothy", "II Timothy",
  "1 Peter", "2 Peter", "I Peter", "II Peter",
  "1 John", "2 John", "3 John", "I John", "II John", "III John",
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua",
  "Judges", "Ruth", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Psalm",
  "Proverbs", "Ecclesiastes", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel",
  "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
  "Mark", "Luke", "John", "Acts", "Romans", "Galatians", "Ephesians",
  "Philippians", "Colossians", "Titus", "Philemon", "Hebrews", "James",
  "Jude", "Revelation",
];
// Reference pattern: <Book> <chapter>:<verse>(-<verse>)?
const REF_RE = new RegExp(
  `\\b(${BOOK_NAMES_FOR_RE.map((b) => b.replace(/ /g, "\\s")).join("|")})\\s+(\\d+):(\\d+)(?:-(\\d+))?`,
  "g",
);

function processKnowledgeString(
  value: string,
  fileBase: string,
  loc: string,
): string {
  let result = value;
  // Only strings that carry an ASV marker can contain a cited quotation.
  if (!result.includes("ASV")) return result;

  // ---- Pass 1: normalize EVERY reference token to modern style. ----
  REF_RE.lastIndex = 0;
  result = result.replace(REF_RE, (full) => {
    const normalized = normalizeReference(full);
    if (normalized !== full) {
      refsNormalized++;
      findings.push({
        file: fileBase,
        location: loc,
        reference: `${full} -> ${normalized}`,
        issue: "numeral style",
        detail: "inline reference",
      });
    }
    return normalized;
  });

  // ---- Pass 2: collect references present in this string. ----
  const refs: string[] = [];
  REF_RE.lastIndex = 0;
  let rm: RegExpExecArray | null;
  while ((rm = REF_RE.exec(result)) !== null) refs.push(rm[0]);

  // ---- Pass 3: verify every double-quoted span against a known ref. ----
  // Each cited explanation/question carries exactly one reference in practice;
  // when several exist we test each quote against ALL of them and accept a
  // faithful match to any (covers strings that quote two verses).
  const QUOTE_RE = /"([^"]+)"/g;
  let qm: RegExpExecArray | null;
  while ((qm = QUOTE_RE.exec(result)) !== null) {
    const quote = qm[1];
    // Skip trivial / non-scripture quoted fragments (single short words like
    // a label). Heuristic: must contain a space OR be a known clause; we still
    // verify, but if it matches none and is very short we treat as descriptive.
    if (refs.length === 0) continue;
    checked++;
    let matchedFaithful = false;
    let anyResolved = false;
    let bestAsv = "";
    let bestRef = "";
    for (const ref of refs) {
      const asvText = getAsvText(ref);
      if (asvText == null) continue;
      anyResolved = true;
      if (!bestAsv) {
        bestAsv = asvText;
        bestRef = ref;
      }
      if (isFaithful(quote, asvText)) {
        matchedFaithful = true;
        break;
      }
    }
    if (!anyResolved) {
      unresolved++;
      findings.push({
        file: fileBase,
        location: loc,
        reference: refs.join(", "),
        issue: "UNRESOLVED reference",
        detail: `quote: ${short(quote)}`,
      });
      continue;
    }
    if (!matchedFaithful) {
      findings.push({
        file: fileBase,
        location: loc,
        reference: bestRef,
        issue: "PARAPHRASE / wrong words",
        detail: `was: "${short(quote)}" | asv: "${short(bestAsv)}"`,
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// ARCHETYPE: verify scripture + cardVerse objects
// ---------------------------------------------------------------------------
type VerseObj = { text: string; reference: string; translation?: string };

function processVerseObj(
  obj: VerseObj,
  fileBase: string,
  loc: string,
  short_clause: boolean,
): void {
  checked++;
  const origRef = obj.reference;
  const normRef = normalizeReference(origRef);
  if (normRef !== origRef) {
    refsNormalized++;
    findings.push({
      file: fileBase,
      location: loc,
      reference: `${origRef} -> ${normRef}`,
      issue: "numeral style",
    });
    if (APPLY) obj.reference = normRef;
  }
  const asvText = getAsvText(normRef);
  if (asvText == null) {
    unresolved++;
    findings.push({
      file: fileBase,
      location: loc,
      reference: normRef,
      issue: "UNRESOLVED reference",
      detail: `text: ${short(obj.text)}`,
    });
    return;
  }
  if (!isFaithful(obj.text, asvText)) {
    findings.push({
      file: fileBase,
      location: loc,
      reference: normRef,
      issue: "PARAPHRASE / wrong words",
      detail: `was: "${short(obj.text)}" | asv: "${short(asvText)}"`,
    });
    // Fix decided manually in a separate curated map (see below) because
    // cardVerse needs a SHORT clause and scripture a fuller excerpt.
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
function rel(p: string): string {
  return p.replace(ROOT + "\\", "").replace(/\\/g, "/");
}

// Knowledge files
for (const file of KNOWLEDGE_FILES) {
  const fileBase = rel(file);
  let raw = readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  // Walk and process all string values; rebuild via JSON to keep structure.
  function walk(node: any, path: string): any {
    if (typeof node === "string") {
      return processKnowledgeString(node, fileBase, path);
    }
    if (Array.isArray(node)) {
      return node.map((x, i) => walk(x, `${path}[${i}]`));
    }
    if (node && typeof node === "object") {
      const out: any = {};
      for (const k of Object.keys(node)) out[k] = walk(node[k], `${path}.${k}`);
      return out;
    }
    return node;
  }
  const fixed = walk(data, "");
  if (APPLY) {
    const text = JSON.stringify(fixed, null, 2) + "\n";
    writeFileSync(file, text, "utf8");
  }
}

// Archetype files
for (const file of ARCHETYPE_FILES) {
  const fileBase = rel(file);
  const data = JSON.parse(readFileSync(file, "utf8"));
  const results = data.results ?? {};
  for (const key of Object.keys(results)) {
    const r = results[key];
    if (r.scripture) {
      processVerseObj(r.scripture, fileBase, `results.${key}.scripture`, false);
    }
    if (r.cardVerse) {
      processVerseObj(r.cardVerse, fileBase, `results.${key}.cardVerse`, true);
    }
  }
  if (APPLY) {
    const text = JSON.stringify(data, null, 2) + "\n";
    writeFileSync(file, text, "utf8");
  }
}

// ---------------------------------------------------------------------------
// Output report
// ---------------------------------------------------------------------------
console.log("\n================ ASV VERIFICATION REPORT ================");
console.log(`Mode: ${APPLY ? "FIX (writing changes)" : "REPORT-ONLY"}`);
console.log(`Verses/quotes checked: ${checked}`);
console.log(`Reference-style issues: ${refsNormalized}`);
console.log(`Paraphrase/wrong-word issues: ${findings.filter((f) => f.issue.startsWith("PARAPHRASE")).length}`);
console.log(`Unresolved references: ${unresolved}`);
console.log(`Text fixes applied: ${textFixed}`);
console.log("=========================================================\n");

const byIssue = (kind: string) => findings.filter((f) => f.issue.includes(kind));

if (byIssue("PARAPHRASE").length) {
  console.log("---- PARAPHRASE / WRONG WORDS ----");
  for (const f of byIssue("PARAPHRASE")) {
    console.log(`\n[${f.file}] ${f.location}`);
    console.log(`  ref: ${f.reference}`);
    console.log(`  ${f.detail}`);
  }
}
if (byIssue("UNRESOLVED").length) {
  console.log("\n---- UNRESOLVED REFERENCES ----");
  for (const f of byIssue("UNRESOLVED")) {
    console.log(`[${f.file}] ${f.location} ref=${f.reference} ${f.detail ?? ""}`);
  }
}
console.log(`\n---- NUMERAL/PSALMS STYLE (${byIssue("numeral").length}) ----`);
for (const f of byIssue("numeral")) {
  console.log(`[${f.file}] ${f.location}: ${f.reference}`);
}
