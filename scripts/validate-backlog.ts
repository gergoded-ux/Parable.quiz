/**
 * validate-backlog.ts — the autoresearch "verify" metric for viral topic generation.
 *
 * Reads every docs/research/cluster-*.tsv (8 tab-separated columns, no header),
 * validates each row, dedupes by slug AND normalized title, drops anything that
 * collides with the existing-40 exclusion list, and prints the count of valid
 * unique net-new topics. That count is the metric (higher is better, target 200).
 *
 * Columns (in order): title, slug, bucket, struggle, result_set, viral_angle, virality_score, evidence
 *
 * Usage:
 *   tsx scripts/validate-backlog.ts            # print metric + diagnostics
 *   tsx scripts/validate-backlog.ts --write    # also write merged content/topic-backlog.tsv (ranked) + docs/viral-topics-research.md
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RESEARCH_DIR = join(ROOT, 'docs', 'research');
const EXCLUDE_FILE = join(RESEARCH_DIR, '_exclude-existing.txt');
const BUCKETS = new Set(['archetype', 'profile', 'knowledge']);

interface Topic {
  title: string;
  slug: string;
  bucket: string;
  struggle: string;
  resultSet: string;
  viralAngle: string;
  score: number;
  evidence: string;
  source: string; // cluster filename
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function loadExclusions(): Set<string> {
  const set = new Set<string>();
  if (!existsSync(EXCLUDE_FILE)) return set;
  for (const line of readFileSync(EXCLUDE_FILE, 'utf-8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    set.add(normalize(t));
  }
  return set;
}

function loadClusterFiles(): string[] {
  if (!existsSync(RESEARCH_DIR)) return [];
  return readdirSync(RESEARCH_DIR)
    .filter(f => f.startsWith('cluster-') && f.endsWith('.tsv'))
    .sort();
}

function main() {
  const write = process.argv.includes('--write');
  const capArg = process.argv.find(a => a.startsWith('--cap='));
  const cap = capArg ? Number(capArg.split('=')[1]) : 0;
  const exclude = loadExclusions();
  const files = loadClusterFiles();

  const valid: Topic[] = [];
  const seenSlug = new Set<string>();
  const seenTitle = new Set<string>();
  let malformed = 0;
  let dupes = 0;
  let excluded = 0;
  const perCluster: Record<string, number> = {};

  for (const file of files) {
    const raw = readFileSync(join(RESEARCH_DIR, file), 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const cols = line.split('\t');
      if (cols.length !== 8) { malformed++; continue; }
      const [title, slugRaw, bucket, struggle, resultSet, viralAngle, scoreRaw, evidence] =
        cols.map(c => c.trim());
      const score = Number(scoreRaw);
      if (!title || !slugRaw || !struggle || !resultSet || !viralAngle || !evidence) { malformed++; continue; }
      if (!BUCKETS.has(bucket)) { malformed++; continue; }
      if (!Number.isFinite(score) || score < 0 || score > 100) { malformed++; continue; }

      const slug = normalize(slugRaw);
      const nTitle = normalize(title);
      if (exclude.has(slug) || exclude.has(nTitle)) { excluded++; continue; }
      if (seenSlug.has(slug) || seenTitle.has(nTitle)) { dupes++; continue; }

      seenSlug.add(slug);
      seenTitle.add(nTitle);
      valid.push({ title, slug, bucket, struggle, resultSet, viralAngle, score, evidence, source: file });
      perCluster[file] = (perCluster[file] ?? 0) + 1;
    }
  }

  valid.sort((a, b) => b.score - a.score);

  // Apply cap (curate to top-N by score) if requested. The surplus stays in the
  // cluster files untouched, so nothing is lost — it's just not in the shipped set.
  const fullCount = valid.length;
  const shipped = cap > 0 ? valid.slice(0, cap) : valid;

  // Diagnostics to stderr so stdout stays a clean metric number for the loop.
  const byBucket = shipped.reduce<Record<string, number>>((acc, t) => {
    acc[t.bucket] = (acc[t.bucket] ?? 0) + 1; return acc;
  }, {});
  console.error(`Clusters read:       ${files.length}`);
  console.error(`Valid net-new:       ${fullCount}`);
  if (cap > 0) console.error(`Shipped (top ${cap}):    ${shipped.length}`);
  console.error(`  archetype:         ${byBucket.archetype ?? 0}`);
  console.error(`  profile:           ${byBucket.profile ?? 0}`);
  console.error(`  knowledge:         ${byBucket.knowledge ?? 0}`);
  console.error(`Dropped — malformed: ${malformed}`);
  console.error(`Dropped — duplicate: ${dupes}`);
  console.error(`Dropped — excluded:  ${excluded}`);
  if (files.length) {
    console.error(`Per-cluster kept:`);
    for (const f of files) console.error(`  ${f}: ${perCluster[f] ?? 0}`);
  }

  if (write) {
    const header = ['id', 'title', 'slug', 'bucket', 'struggle', 'result_set', 'viral_angle', 'virality_score', 'evidence'].join('\t');
    const rows = shipped.map((t, i) =>
      [i + 1, t.title, t.slug, t.bucket, t.struggle, t.resultSet, t.viralAngle, t.score, t.evidence].join('\t'));
    writeFileSync(join(ROOT, 'content', 'topic-backlog.tsv'), [header, ...rows].join('\n') + '\n');

    // Human-readable ranked doc.
    const md: string[] = [];
    md.push('# Parable — Viral Quiz Topic Backlog');
    md.push('');
    md.push(`${shipped.length} net-new quiz topics, ranked by virality score. Generated via autoresearch with Reddit / YouTube / search-trend grounding. Each topic targets a real human struggle and is deduped against the 20 live + 20 roadmap quizzes. Curated from a pool of ${fullCount} candidates (top ${shipped.length} by score).`);
    md.push('');
    md.push('## Virality score rubric (0-100)');
    md.push('- Demand signal (0-30): how high-volume the underlying struggle is (Reddit upvotes, YouTube views, search volume)');
    md.push('- Shareability (0-25): does the result give a postable identity badge');
    md.push('- Emotional charge (0-25): does it hit a real pain point or moment of self-recognition');
    md.push('- Novelty (0-10): fresh vs. generic');
    md.push('- Title/SEO strength (0-10): matches how people actually phrase and search it');
    md.push('');
    for (const bucket of ['profile', 'archetype', 'knowledge']) {
      const items = shipped.filter(t => t.bucket === bucket);
      if (!items.length) continue;
      md.push(`## ${bucket} (${items.length})`);
      md.push('');
      // Markdown tables use | as the column delimiter, so any | inside a cell
      // (the result_set uses " | ") must be swapped to a middot or it breaks rendering.
      const cell = (s: string) => s.replace(/\s*\|\s*/g, ' · ').trim();
      md.push('| # | Title | Score | Struggle | Results | Viral angle | Evidence |');
      md.push('|---|-------|-------|----------|---------|-------------|----------|');
      items.forEach((t, i) => {
        md.push(`| ${i + 1} | ${cell(t.title)} | ${t.score} | ${cell(t.struggle)} | ${cell(t.resultSet)} | ${cell(t.viralAngle)} | ${cell(t.evidence)} |`);
      });
      md.push('');
    }
    writeFileSync(join(ROOT, 'docs', 'viral-topics-research.md'), md.join('\n'));
    console.error(`\nWrote content/topic-backlog.tsv and docs/viral-topics-research.md`);
  }

  // The metric: clean number on stdout (shipped count when capped, else full count).
  console.log(shipped.length);
}

main();
