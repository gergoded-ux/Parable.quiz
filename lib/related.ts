// lib/related.ts
import { loadPublishedTests, loadTestBySlug, isPublished } from './test-loader';
import type { Test } from './schema';

const RELATED: Record<string, string[]> = {
  'which-apostle-are-you': ['which-fruit-of-the-spirit-are-you', 'which-parable-describes-your-life', 'spiritual-gifts-profile'],
};

// Only ever recommend LIVE quizzes (never link into the backlog).
export function getRelated(slug: string): Test[] {
  const hand = (RELATED[slug] ?? []).filter(isPublished);
  const out = hand.map(s => loadTestBySlug(s)).filter((t): t is Test => t !== null);
  if (out.length >= 3) return out.slice(0, 3);
  const me = loadTestBySlug(slug);
  if (!me) return out;
  const sameCat = loadPublishedTests().filter(t => t.category === me.category && t.slug !== slug && !out.includes(t));
  return [...out, ...sameCat].slice(0, 3);
}
