// lib/scoring.ts
import type { ArchetypeTest } from './schema';

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
