// lib/scoring.ts
import type { ArchetypeTest, ProfileTest, KnowledgeTest } from './schema';

export interface KnowledgeResult {
  correct: number;
  total: number;
  percent: number;
  band: { min: number; max: number; label: string; message: string };
}

export function scoreArchetype(test: ArchetypeTest, answers: number[]): string {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const totals: Record<string, number> = {};
  const firstSeen: Record<string, number> = {};
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    const weights = q.options[optIdx].weights;
    for (const [key, w] of Object.entries(weights)) {
      totals[key] = (totals[key] ?? 0) + w;
      if (!(key in firstSeen)) firstSeen[key] = qi;
    }
  });
  const entries = Object.entries(totals);
  if (entries.length === 0) {
    return Object.keys(test.results)[0];
  }
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return firstSeen[a[0]] - firstSeen[b[0]];
  });
  return entries[0][0];
}

export function scoreProfile(test: ProfileTest, answers: number[]): Record<string, number> {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const raw: Record<string, number> = Object.fromEntries(test.dimensions.map(d => [d, 0]));
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    for (const [key, w] of Object.entries(q.options[optIdx].weights)) {
      if (key in raw) raw[key] += w;
    }
  });
  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Math.round((v / max) * 100)])
  );
}

export function scoreKnowledge(test: KnowledgeTest, answers: number[]): KnowledgeResult {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  let correct = 0;
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    if (q.options[optIdx].correct) correct++;
  });
  const total = test.questions.length;
  const percent = Math.round((correct / total) * 100);
  const band = test.scoring.gradeBands.find(b => percent >= b.min && percent <= b.max)
    ?? test.scoring.gradeBands[test.scoring.gradeBands.length - 1];
  return { correct, total, percent, band };
}

export interface AffinityEntry { key: string; name: string; pct: number }
export interface ArchetypeDetail { winner: string; matchPct: number; affinity: AffinityEntry[] }

export function scoreArchetypeDetailed(test: ArchetypeTest, answers: number[]): ArchetypeDetail {
  if (answers.length !== test.questions.length) {
    throw new Error(`Expected ${test.questions.length} answers, got ${answers.length}`);
  }
  const totals: Record<string, number> = {};
  for (const key of Object.keys(test.results)) totals[key] = 0;
  let grand = 0;
  test.questions.forEach((q, qi) => {
    const optIdx = answers[qi];
    if (optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`Answer index ${optIdx} out of bounds for question ${qi}`);
    }
    for (const [key, w] of Object.entries(q.options[optIdx].weights)) {
      if (key in totals) { totals[key] += w; grand += w; }
    }
  });
  const winner = scoreArchetype(test, answers); // reuse tie-break logic
  const affinity: AffinityEntry[] = Object.entries(totals)
    .map(([key, pts]) => ({ key, name: test.results[key].name, pct: grand ? Math.round((pts / grand) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);
  const matchPct = affinity.find(a => a.key === winner)?.pct ?? 0;
  return { winner, matchPct, affinity };
}
