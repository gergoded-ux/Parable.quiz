// tests/rarity.test.ts
import { describe, it, expect } from 'vitest';
import { rarityFromMatch } from '@/lib/rarity';

describe('rarityFromMatch', () => {
  it('classifies common below 70', () => {
    const r = rarityFromMatch(63);
    expect(r.tier).toBe('common');
    expect(r.stars).toBe(2);
    expect(r.material).toBe('green');
    expect(r.frame).toBe('frame_stained_glass_common.png');
  });
  it('classifies rare at the 70 boundary', () => {
    expect(rarityFromMatch(70).tier).toBe('rare');
    expect(rarityFromMatch(84).tier).toBe('rare');
    expect(rarityFromMatch(70).stars).toBe(3);
    expect(rarityFromMatch(70).material).toBe('sapphire');
  });
  it('classifies epic 85-94', () => {
    expect(rarityFromMatch(85).tier).toBe('epic');
    expect(rarityFromMatch(94).tier).toBe('epic');
    expect(rarityFromMatch(85).stars).toBe(4);
    expect(rarityFromMatch(85).material).toBe('purple');
  });
  it('classifies legendary 95+', () => {
    expect(rarityFromMatch(95).tier).toBe('legendary');
    expect(rarityFromMatch(100).tier).toBe('legendary');
    expect(rarityFromMatch(95).stars).toBe(5);
    expect(rarityFromMatch(95).material).toBe('gold');
  });
  it('clamps out-of-range input', () => {
    expect(rarityFromMatch(-5).tier).toBe('common');
    expect(rarityFromMatch(150).tier).toBe('legendary');
  });
  it('exposes a label and accent hex', () => {
    expect(rarityFromMatch(98).label).toBe('Legendary');
    expect(rarityFromMatch(98).accent).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
