import { describe, it, expect } from 'vitest';
import { ScriptureRef, TestBase } from '@/lib/schema';

describe('ScriptureRef', () => {
  it('accepts non-empty string', () => {
    expect(ScriptureRef.safeParse('matt-16-18').success).toBe(true);
  });
  it('rejects empty string', () => {
    expect(ScriptureRef.safeParse('').success).toBe(false);
  });
});

describe('TestBase', () => {
  it('accepts minimal valid test base', () => {
    const result = TestBase.safeParse({
      slug: 'which-apostle-are-you',
      title: 'Which Apostle Are You?',
      lang: 'en',
      category: 'bible-character',
      estimatedMinutes: 4,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't', lang: 'en',
      category: 'not-a-category', estimatedMinutes: 4,
    });
    expect(result.success).toBe(false);
  });
  it('defaults lang to "en" when missing', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't',
      category: 'bible-iq', estimatedMinutes: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lang).toBe('en');
  });
});
