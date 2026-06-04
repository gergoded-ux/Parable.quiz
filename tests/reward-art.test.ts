// tests/reward-art.test.ts
import { describe, it, expect } from 'vitest';
import { REWARD_TYPES, isValidRewardArt, REWARD_TEMPLATES, REWARD_BASE_STYLE } from '@/lib/reward-art';

describe('reward-art taxonomy', () => {
  it('has 6 unique types', () => {
    expect(REWARD_TYPES.length).toBe(6);
    expect(new Set(REWARD_TYPES).size).toBe(6);
  });
  it('validates membership', () => {
    expect(isValidRewardArt('character')).toBe(true);
    expect(isValidRewardArt('portrait')).toBe(false);
    expect(isValidRewardArt(undefined)).toBe(false);
  });
  it('has a non-empty template for every type', () => {
    for (const t of REWARD_TYPES) expect(REWARD_TEMPLATES[t].length).toBeGreaterThan(10);
    expect(REWARD_BASE_STYLE.length).toBeGreaterThan(50);
  });
});
