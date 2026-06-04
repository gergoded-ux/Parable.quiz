// tests/reward-catalog.test.ts
import { describe, it, expect } from 'vitest';
import { buildRewardCatalog, renderRewardCatalogMarkdown } from '@/lib/reward-catalog';
import type { Test } from '@/lib/schema';

const archetype = {
  slug: 'q', title: 'Q', lang: 'en', category: 'bible-character',
  theme: 'scripture-archetype', estimatedMinutes: 4, mode: 'archetype',
  questions: [],
  results: {
    isaiah: { name: 'Isaiah', emoji: 'x', traits: ['a'], description: 'd', rewardArt: 'character' },
    sinai: { name: 'Mount Sinai', emoji: 'x', traits: ['a'], description: 'd', rewardArt: 'place' },
  },
} as unknown as Test;

describe('buildRewardCatalog', () => {
  const entries = buildRewardCatalog({
    tests: [archetype],
    published: new Set(['q']),
    hasImage: (s, k) => s === 'q' && k === 'isaiah',
  });
  it('emits one entry per result with type + status + image', () => {
    expect(entries).toHaveLength(2);
    const isa = entries.find(e => e.resultKey === 'isaiah')!;
    expect(isa.rewardArt).toBe('character');
    expect(isa.status).toBe('live');
    expect(isa.hasImage).toBe(true);
    expect(entries.find(e => e.resultKey === 'sinai')!.hasImage).toBe(false);
  });
});

describe('renderRewardCatalogMarkdown', () => {
  it('summarizes and groups by type', () => {
    const md = renderRewardCatalogMarkdown(buildRewardCatalog({
      tests: [archetype], published: new Set(['q']), hasImage: () => false,
    }));
    expect(md).toContain('2** reward images');
    expect(md).toContain('## character');
    expect(md).toContain('`public/results/q/isaiah.png`');
  });
});
