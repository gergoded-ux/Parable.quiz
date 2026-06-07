// components/card/ShareableCard.tsx
'use client';
import { useRef, useState, useEffect } from 'react';
import { ResultCardLive } from './ResultCardLive';
import { ShareBar } from '@/components/ShareBar';
import type { CardData } from '@/lib/card-data';

const CARD_W = 330;
const CARD_H = 412;

export function ShareableCard({ data, shareUrl, shareText, ogImage }: { data: CardData; shareUrl: string; shareText: string; ogImage: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.8);

  useEffect(() => { setEl(ref.current); }, []);

  // Show the on-page card larger on desktop; mobile stays at its natural size.
  const [cardScale, setCardScale] = useState(1);
  useEffect(() => {
    const fit = () => setCardScale(window.innerWidth >= 1024 ? 1.25 : 1);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // While zoomed: size the (flat) card to fit the viewport, close on Escape, lock scroll.
  useEffect(() => {
    if (!zoom) return;
    const fit = () => setZoomScale(Math.max(1, Math.min((window.innerWidth - 48) / CARD_W, (window.innerHeight - 120) / CARD_H, 2.4)));
    fit();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', fit);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', fit); document.body.style.overflow = ''; };
  }, [zoom]);

  return (
    <>
      <div onClick={() => setZoom(true)} className="cursor-zoom-in select-none">
        <ResultCardLive data={data} cardRef={ref} scale={cardScale} />
      </div>
      <button onClick={() => setZoom(true)} className="mx-auto mt-1 block text-xs text-ink-mute underline-offset-2 hover:underline">
        Tap the card to zoom in
      </button>

      <ShareBar url={shareUrl} text={shareText} image={ogImage} cardEl={el} showCardShare />

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed result card"
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(20,12,4,0.82)', backdropFilter: 'blur(2px)', cursor: 'zoom-out' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
            <ResultCardLive data={data} flat scale={zoomScale} />
          </div>
          <button
            onClick={() => setZoom(false)}
            autoFocus
            aria-label="Close zoom"
            className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-xl text-white"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
