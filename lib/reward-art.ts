// lib/reward-art.ts
// Reward-card art taxonomy: 6 types, a shared base style, per-type composition
// templates, and a negative prompt. Used by the Grok job sheet and the reward
// catalog. Every live quiz result is tagged with one RewardArt type.

export const REWARD_TYPES = ['character', 'creature', 'object', 'place', 'scene', 'symbol'] as const;
export type RewardArt = (typeof REWARD_TYPES)[number];

const SET = new Set<string>(REWARD_TYPES);
export function isValidRewardArt(x: string | undefined): x is RewardArt {
  return typeof x === 'string' && SET.has(x);
}

export const REWARD_BASE_STYLE =
  'Soft 2D animated-storybook illustration, painterly cel shading, warm golden-hour ' +
  'biblical and ancient-Near-East palette (cream, sand, rose, gold, soft teal), gentle ' +
  'diffused light, subtle canvas texture, reverent and hopeful, one clear central subject ' +
  'on a softly blurred background, square 1:1 composition, generous breathing room at the ' +
  'edges, no text, no letters, no logos, no watermark. Never show the face of God or Jesus ' +
  '(distant, silhouetted, or from behind only).';

export const REWARD_NEGATIVE =
  'text, words, letters, watermark, signature, frame, border, extra limbs, deformed hands, ' +
  'modern objects, photographic realism, the face of God or Jesus, harsh shadows, cluttered ' +
  'background, busy edges, collage.';

export const REWARD_TEMPLATES: Record<RewardArt, string> = {
  character: 'A single named biblical PERSON, warm portrait or three-quarter view, gentle expression, period ancient dress, soft halo of light; face shown (a human, never God or Jesus).',
  creature: 'A single noble biblical CREATURE or celestial being, centered and symbolic, dignified and calm.',
  object: 'A single sacred biblical OBJECT or artifact, hero-lit still life, resting in soft golden light on a plain ground.',
  place: 'A single iconic biblical PLACE, landmark, or structure, seen as a serene establishing view, no faces, soft atmosphere.',
  scene: 'A single quiet dramatic biblical MOMENT or event, atmospheric and cinematic; any people are small, distant, or silhouetted.',
  symbol: 'A single clean ICONOGRAPHIC EMBLEM or metaphor for an abstract idea, centered, minimal, lots of negative space.',
};

// Generic fallback used by the backfill when no explicit map entry exists.
export function inferRewardArt(category: string, mode: string): RewardArt {
  if (mode === 'profile') return 'symbol';
  if (category === 'spiritual-profile') return 'symbol';
  return 'character'; // most bible-character archetypes are people
}
