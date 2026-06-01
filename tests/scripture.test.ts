// tests/scripture.test.ts
import { describe, it, expect } from 'vitest';
import { getScripture, allScriptures } from '@/lib/scripture';

describe('getScripture', () => {
  it('returns the verse for a known ref', () => {
    const s = getScripture('matt-16-18');
    expect(s.reference).toBe('Matthew 16:18');
    expect(s.text).toMatch(/rock/);
  });
  it('throws on unknown ref', () => {
    expect(() => getScripture('does-not-exist')).toThrow();
  });
});

describe('allScriptures', () => {
  it('returns the full map', () => {
    expect(allScriptures()['john-13-23']).toBeDefined();
  });
});
