// components/card/ShareableCard.tsx
'use client';
import { useRef, useState, useEffect } from 'react';
import { ResultCardLive } from './ResultCardLive';
import { ShareBar } from '@/components/ShareBar';
import type { CardData } from '@/lib/card-data';

export function ShareableCard({ data, shareUrl, shareText, ogImage }: { data: CardData; shareUrl: string; shareText: string; ogImage: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(ref.current); }, []);
  return (
    <>
      <ResultCardLive data={data} cardRef={ref} />
      <ShareBar url={shareUrl} text={shareText} image={ogImage} cardEl={el} />
    </>
  );
}
