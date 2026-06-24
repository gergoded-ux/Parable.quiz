'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadCards, nextGap } from '@/lib/collection';
import { COLLECTIONS } from '@/lib/collections';

const TOTAL = COLLECTIONS.reduce((n, c) => n + c.slugs.length, 0);
const inCollections = (s: string) => COLLECTIONS.some((c) => c.slugs.includes(s));

// Brief reward beat on the result page: confirms the card was kept and points
// to the nearest set the visitor can finish. Reads localStorage after the save.
export function EarnToast() {
  const [info, setInfo] = useState<{ count: number; gap: ReturnType<typeof nextGap> } | null>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const owned = new Set(loadCards().map((c) => c.slug).filter(inCollections));
      setInfo({ count: owned.size, gap: nextGap(owned) });
    }, 500); // let SaveToCollection write first
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, [info]);

  if (!info || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Link
        href="/collection"
        className="flex max-w-md items-center gap-3 rounded-full border border-rose/50 bg-cream-1 px-5 py-3 text-sm shadow-card no-underline"
      >
        <span className="font-extrabold text-brown-dark">Saved to your binder</span>
        <span className="text-ink-soft">
          {info.count} of {TOTAL}
          {info.gap ? ` · ${info.gap.remaining} more to finish ${info.gap.title}` : ''}
        </span>
      </Link>
    </div>
  );
}
