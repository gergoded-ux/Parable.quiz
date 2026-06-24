import { describe, it, expect, beforeEach } from 'vitest';
import { saveCard, loadCards } from '@/lib/collection';
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
