// lib/related.ts
import { loadAllTests, loadTestBySlug } from './test-loader';
import type { Test } from './schema';

const RELATED: Record<string, string[]> = {
  'which-apostle-are-you': ['which-fruit-of-the-spirit-are-you', 'which-parable-describes-your-life', 'spiritual-gifts-profile'],
};

export function getRelated(slug: string): Test[] {
  const hand = RELATED[slug] ?? [];
  const out = hand.map(s => loadTestBySlug(s)).filter((t): t is Test => t !== null);
  if (out.length >= 3) return out.slice(0, 3);
  const me = loadTestBySlug(slug);
  if (!me) return out;
  const sameCat = loadAllTests().filter(t => t.category === me.category && t.slug !== slug && !out.includes(t));
  return [...out, ...sameCat].slice(0, 3);
}
