// tests/card-data.test.ts
import { describe, it, expect } from 'vitest';
import { cardDataFromResult, binaryAffinityStat } from '@/lib/card-data';
import { loadTestBySlug } from '@/lib/test-loader';

describe('cardDataFromResult', () => {
  it('builds card data for an archetype result with a match%', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    const cd = cardDataFromResult(test, 'leah', 88)!;
    expect(cd.name).toBe('Leah (overlooked but chosen)');
    expect(cd.baseName).toBe('Leah');
    expect(cd.rarity.tier).toBe('epic');      // 88 -> epic
    expect(cd.matchPct).toBe(88);
    expect(cd.hasArt).toBe(true);             // pilot illustration exists
    expect(cd.emoji).toBe('🌾');
    expect(cd.verse.reference).toBeTruthy();
    expect(cd.stat.heading).toBe('AFFINITY'); // archetype uses affinity heading
  });
  it('falls back to common when no match% is provided', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    const cd = cardDataFromResult(test, 'rachel')!;
    expect(cd.matchPct).toBeNull();
    expect(cd.rarity.tier).toBe('common');    // representative default
  });
});

describe('binaryAffinityStat', () => {
  it('builds two affinity rows for a binary archetype quiz', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    const stat = binaryAffinityStat(test, 'leah', 88)!;
    expect(stat.heading).toBe('AFFINITY');
    expect(stat.suffix).toBe('%');
    expect(stat.rows).toEqual([
      { label: 'Leah', value: 88 },
      { label: 'Rachel', value: 12 },
    ]);
  });
  it('returns undefined when match% is null', () => {
    const test = loadTestBySlug('are-you-a-leah-or-a-rachel')!;
    expect(binaryAffinityStat(test, 'leah', null)).toBeUndefined();
  });
  it('returns undefined for a non-binary archetype quiz', () => {
    const test = loadTestBySlug('which-apostle-are-you')!;
    expect(binaryAffinityStat(test, 'peter', 70)).toBeUndefined();
  });
});
