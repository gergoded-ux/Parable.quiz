import { describe, it, expect, beforeEach } from 'vitest';
import { saveCard, loadCards, loadFavorites, toggleFavorite, nextGap, weeklyIndex } from '@/lib/collection';
import type { CardData } from '@/lib/card-data';

// Minimal full CardData for store tests; only slug/key/matchPct matter here.
const mk = (slug: string, key: string, matchPct: number | null): CardData => ({
  slug, key, artKey: key, name: 'X', baseName: 'X', epithet: null, emoji: 'x',
  traits: [], verse: { text: '', reference: '' }, matchPct, hasArt: false,
  rarity: { tier: 'common', label: 'Common', stars: 2, material: 'green', accent: '#000', frame: 'f.png' },
  stat: { heading: '', rows: [], suffix: '' },
});

describe('collection store', () => {
  beforeEach(() => localStorage.clear());

  it('saves and loads a card with a timestamp', () => {
    saveCard(mk('a', '1', 90));
    const cards = loadCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].slug).toBe('a');
    expect(typeof cards[0].ts).toBe('number');
  });

  it('dedupes the same slug:key in place', () => {
    saveCard(mk('a', '1', 50));
    saveCard(mk('a', '1', 80));
    const cards = loadCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].matchPct).toBe(80);
  });

  it('does not drop a save when the store holds a non-object value', () => {
    localStorage.setItem('eikonia:cards', '[]');
    saveCard(mk('a', '1', 90));
    expect(loadCards()).toHaveLength(1);
  });

  it('treats a corrupt store as empty', () => {
    localStorage.setItem('eikonia:cards', '"oops"');
    expect(loadCards()).toEqual([]);
  });
});

describe('favorites', () => {
  beforeEach(() => localStorage.clear());

  it('toggles a favorite on and off', () => {
    expect(loadFavorites()).toEqual([]);
    expect(toggleFavorite('a')).toEqual(['a']);
    expect(loadFavorites()).toEqual(['a']);
    expect(toggleFavorite('a')).toEqual([]);
  });
});

describe('nextGap', () => {
  it('returns null when nothing is in progress', () => {
    expect(nextGap(new Set())).toBeNull();
  });

  it('returns the in-progress collection with fewest remaining', () => {
    const g = nextGap(new Set(['who-are-you-in-christ'])); // identity has 8 slugs
    expect(g?.id).toBe('identity');
    expect(g?.remaining).toBe(7);
  });
});

describe('weeklyIndex', () => {
  it('rotates once per week and wraps', () => {
    expect(weeklyIndex(5, 0)).toBe(0);
    expect(weeklyIndex(5, 7 * 86400000)).toBe(1);
    expect(weeklyIndex(5, 7 * 86400000 * 5)).toBe(0);
    expect(weeklyIndex(0, 123)).toBe(0);
  });
});
