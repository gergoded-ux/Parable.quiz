// tests/card-art.test.ts
import { describe, it, expect } from 'vitest';
import { hasIllustration, artUrl } from '@/lib/card-art';

describe('card-art', () => {
  it('reports illustration present for the pilot leah card', () => {
    expect(hasIllustration('are-you-a-leah-or-a-rachel', 'leah')).toBe(true);
  });
  it('reports no illustration for an unknown result', () => {
    expect(hasIllustration('which-apostle-are-you', 'peter')).toBe(false);
  });
  it('builds a url under the configured base', () => {
    expect(artUrl('are-you-a-leah-or-a-rachel', 'leah')).toMatch(/\/results\/are-you-a-leah-or-a-rachel\/leah\.jpg$/);
  });
});
