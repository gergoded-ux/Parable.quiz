// lib/rarity.ts
export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';
export type RarityMaterial = 'green' | 'sapphire' | 'purple' | 'gold';

export interface Rarity {
  tier: RarityTier;
  label: string;
  stars: number;       // filled stars, out of 5
  material: RarityMaterial;
  accent: string;      // hex
  frame: string;       // frame asset filename under cards/frames/
}

const TABLE: Record<RarityTier, Omit<Rarity, 'tier'>> = {
  common:    { label: 'Common',    stars: 2, material: 'green',    accent: '#3d9b4a', frame: 'frame_stained_glass_common.png' },
  rare:      { label: 'Rare',      stars: 3, material: 'sapphire', accent: '#2f7fc0', frame: 'frame_stained_glass_rare.png' },
  epic:      { label: 'Epic',      stars: 4, material: 'purple',   accent: '#7c3aa0', frame: 'frame_stained_glass_epic.png' },
  legendary: { label: 'Legendary', stars: 5, material: 'gold',     accent: '#b8860b', frame: 'frame_stained_glass_legendary.png' },
};

export function rarityFromMatch(matchPct: number): Rarity {
  const m = Math.max(0, Math.min(100, matchPct));
  let tier: RarityTier;
  if (m < 70) tier = 'common';
  else if (m < 85) tier = 'rare';
  else if (m < 95) tier = 'epic';
  else tier = 'legendary';
  return { tier, ...TABLE[tier] };
}
