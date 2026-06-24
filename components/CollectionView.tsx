'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/collections';
import { loadCards, type SavedCard } from '@/lib/collection';
import { quizCoverUrl } from '@/lib/card-art';
import { ResultCardLive } from '@/components/card/ResultCardLive';

const TOTAL = COLLECTIONS.reduce((n, c) => n + c.slugs.length, 0);

// A complete card (full CardData) can render as the real card; legacy/partial
// entries fall back to a slot tile.
const isFull = (c?: SavedCard) => !!c && !!c.rarity && !!c.verse && !!c.stat;

function Bar({ owned, total }: { owned: number; total: number }) {
  const pct = total ? Math.round((owned / total) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-2">
      <div className="h-full rounded-full bg-rose-dark" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CollectionView() {
  const [bySlug, setBySlug] = useState<Map<string, SavedCard> | null>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const m = new Map<string, SavedCard>();
    for (const c of loadCards()) {
      const prev = m.get(c.slug);
      if (!prev || c.ts > prev.ts) m.set(c.slug, c); // latest result per quiz wins
    }
    setBySlug(m);
  }, []);

  useEffect(() => {
    const fit = () => setScale(window.innerWidth < 640 ? 0.5 : 0.6);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  if (!bySlug) return <p className="py-16 text-center text-ink-mute">Loading your cards...</p>;

  const owned = [...bySlug.keys()].filter((s) => COLLECTIONS.some((c) => c.slugs.includes(s))).length;

  if (owned === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark">My cards</h1>
        <p className="mt-3 text-ink-soft">No cards yet. Take a quiz and your first one lands right here.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brown px-7 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5">Take your first quiz</Link>
      </div>
    );
  }

  const W = Math.round(330 * scale);
  const H = Math.round(412 * scale);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark md:text-4xl">My cards</h1>
        <p className="mt-2 text-ink-soft">{owned} of {TOTAL} collected</p>
        <div className="mx-auto mt-3 max-w-md"><Bar owned={owned} total={TOTAL} /></div>
      </header>

      {COLLECTIONS.map((col) => {
        const have = col.slugs.filter((s) => bySlug.has(s)).length;
        return (
          <section key={col.id} className="mb-10">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <Link href={`/collections/${col.id}`} className="text-lg font-extrabold text-brown-dark hover:text-brown">{col.title}</Link>
              <span className="shrink-0 text-sm text-ink-mute">{have} / {col.slugs.length}</span>
            </div>
            <div className="mb-4"><Bar owned={have} total={col.slugs.length} /></div>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
              {col.slugs.map((slug) => {
                const card = bySlug.get(slug);
                if (isFull(card)) {
                  const href = `/q/${slug}/r/${card!.key}${card!.matchPct != null ? `?m=${card!.matchPct}` : ''}`;
                  return (
                    <Link key={slug} href={href} className="block transition-transform hover:-translate-y-1" aria-label={card!.name}>
                      <ResultCardLive data={card!} flat scale={scale} />
                    </Link>
                  );
                }
                const cover = quizCoverUrl(slug);
                return (
                  <Link key={slug} href={card ? `/q/${slug}/r/${card.key}` : `/q/${slug}`}
                    style={{ width: W, height: H }}
                    className="relative shrink-0 overflow-hidden rounded-[14px] border border-dashed border-rose/50 bg-cream-2 transition-transform hover:-translate-y-1">
                    {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-ink-mute/50">?</div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="pb-6 text-center text-xs text-ink-mute">Saved on this device</p>
    </div>
  );
}
