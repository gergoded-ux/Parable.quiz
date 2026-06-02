// lib/card-data.ts
import type { Test } from './schema';
import { rarityFromMatch, type Rarity } from './rarity';
import { hasIllustration } from './card-art';

export interface CardData {
  slug: string;
  key: string;
  name: string;
  baseName: string;           // name with any parenthetical stripped
  epithet: string | null;     // text in parens after the name, if any
  emoji: string;
  traits: string[];
  verse: { text: string; reference: string; translation?: string };
  matchPct: number | null;    // null = representative card (no personal score)
  rarity: Rarity;
  hasArt: boolean;
  stat: { heading: string; rows: { label: string; value: number }[]; suffix: string };
}

// "Leah (overlooked but chosen)" -> { base: "Leah", epithet: "Overlooked but Chosen" }
function splitName(name: string): { base: string; epithet: string | null } {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { base: name, epithet: null };
  const ep = m[2].trim();
  return { base: m[1].trim(), epithet: ep.charAt(0).toUpperCase() + ep.slice(1) };
}

export function cardDataFromResult(
  test: Test,
  key: string,
  matchPct: number | null = null,
  stat?: { heading: string; rows: { label: string; value: number }[]; suffix: string },
): CardData | null {
  if (test.mode === 'knowledge') {
    const pct = matchPct ?? (parseInt(key, 10) || 0);
    const rarity = rarityFromMatch(pct);
    const base = { slug: test.slug, key, matchPct, rarity, hasArt: hasIllustration(test.slug, key) };
    const name = `${pct}%`;
    return { ...base, name, baseName: name, epithet: test.title, emoji: '📖', traits: [],
      verse: { text: '', reference: '' },
      stat: stat ?? { heading: 'SCORE', rows: [], suffix: '' } };
  }

  const r = test.results[key];
  if (!r) return null;

  const rarity = rarityFromMatch(matchPct ?? 0); // representative=common when null
  const base = { slug: test.slug, key, matchPct, rarity, hasArt: hasIllustration(test.slug, key) };
  const ar = r as { emoji?: string; traits?: string[] };
  const { base: nm, epithet } = splitName(r.name);
  const v = (r as { cardVerse?: typeof r.scripture }).cardVerse ?? r.scripture;
  const verse = v ? { text: v.text, reference: v.reference, translation: v.translation } : { text: '', reference: '' };
  const emoji = test.mode === 'archetype' ? ar.emoji! : '✨';
  const traits = test.mode === 'archetype' ? ar.traits! : [];
  const defaultStat = { heading: test.mode === 'profile' ? 'TOP GIFTS' : 'AFFINITY', rows: [], suffix: '%' };
  return { ...base, name: r.name, baseName: nm, epithet: epithet, emoji, traits, verse, stat: stat ?? defaultStat };
}
