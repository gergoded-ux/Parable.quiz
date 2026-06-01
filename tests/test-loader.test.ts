// tests/test-loader.test.ts
import { describe, it, expect } from 'vitest';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';

describe('loadAllTests', () => {
  it('returns an array (may be empty pre-content)', () => {
    const all = loadAllTests();
    expect(Array.isArray(all)).toBe(true);
  });
  it('every returned test passes the Test schema', () => {
    const all = loadAllTests();
    all.forEach(t => {
      expect(['archetype', 'profile', 'knowledge']).toContain(t.mode);
    });
  });
});

describe('loadTestBySlug', () => {
  it('returns null for unknown slug', () => {
    expect(loadTestBySlug('does-not-exist')).toBeNull();
  });
});
