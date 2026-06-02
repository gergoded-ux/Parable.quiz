// components/card/Star.tsx
import { CARD, STAR_PATH } from '@/lib/card-layout';
import type { RarityMaterial } from '@/lib/rarity';

export function Star({ filled, material, size = 16 }: { filled: boolean; material: RarityMaterial; size?: number }) {
  const id = `star-${material}-${filled ? 'on' : 'off'}`;
  const { from, to } = CARD.star[material];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={filled ? from : '#d9cdb6'} />
          <stop offset="1" stopColor={filled ? to : '#c2b394'} />
        </linearGradient>
      </defs>
      <path fill={filled ? `url(#${id})` : 'rgba(107,68,35,0.20)'} d={STAR_PATH} />
    </svg>
  );
}
