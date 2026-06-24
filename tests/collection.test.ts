import { describe, it, expect, beforeEach } from 'vitest';
import { saveCard, loadCards } from '@/lib/collection';

describe('collection store', () => {
  beforeEach(() => localStorage.clear());

  it('saves and loads a card with a timestamp', () => {
    saveCard({ slug: 'a', key: '1', artKey: '1', name: 'A', matchPct: 90 });
    const cards = loadCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].slug).toBe('a');
    expect(typeof cards[0].ts).toBe('number');
  });

  it('dedupes the same slug:key in place', () => {
    saveCard({ slug: 'a', key: '1', artKey: '1', name: 'A', matchPct: 50 });
    saveCard({ slug: 'a', key: '1', artKey: '1', name: 'A', matchPct: 80 });
    const cards = loadCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].matchPct).toBe(80);
  });

  it('does not drop a save when the store holds a non-object value', () => {
    localStorage.setItem('eikonia:cards', '[]');
    saveCard({ slug: 'a', key: '1', artKey: '1', name: 'A', matchPct: 90 });
    expect(loadCards()).toHaveLength(1);
  });

  it('treats a corrupt store as empty', () => {
    localStorage.setItem('eikonia:cards', '"oops"');
    expect(loadCards()).toEqual([]);
  });
});
