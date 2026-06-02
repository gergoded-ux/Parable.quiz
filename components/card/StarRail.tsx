// components/card/StarRail.tsx
import { Star } from './Star';
import type { RarityMaterial } from '@/lib/rarity';

export function StarRail({ filled, material, size = 16 }: { filled: number; material: RarityMaterial; size?: number }) {
  return (
    <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < filled} material={material} size={size} />
      ))}
    </div>
  );
}
