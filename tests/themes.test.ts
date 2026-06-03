// tests/themes.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, isValidTheme, themeForStruggle } from '@/lib/themes';

describe('themes vocabulary', () => {
  it('has unique, non-empty entries', () => {
    expect(THEMES.length).toBeGreaterThan(10);
    expect(new Set(THEMES).size).toBe(THEMES.length);
  });

  it('validates membership', () => {
    expect(isValidTheme('anxiety')).toBe(true);
    expect(isValidTheme('not-a-theme')).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
  });
});

describe('themeForStruggle', () => {
  it.each([
    ['forgiving someone who hurt you', 'forgiveness'],
    ['church hurt', 'church-hurt'],
    ['Anxiety shows up differently for everyone', 'anxiety'],
    ['identity', 'identity'],
    ['healing past wounds', 'healing-wounds'],
    ['grieving a loss nobody acknowledges', 'grief-loss'],
  ])('maps %s -> %s', (struggle, theme) => {
    expect(themeForStruggle(struggle)).toBe(theme);
  });

  it('returns null when nothing matches', () => {
    expect(themeForStruggle('xyzzy nonsense', '')).toBeNull();
  });
});
