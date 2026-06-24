'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toBlob } from 'html-to-image';
import { COLLECTIONS } from '@/lib/collections';
import { loadCards, loadFavorites, toggleFavorite, type SavedCard } from '@/lib/collection';
import { quizCoverUrl } from '@/lib/card-art';
import { ResultCardLive } from '@/components/card/ResultCardLive';

const TOTAL = COLLECTIONS.reduce((n, c) => n + c.slugs.length, 0);
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
  const [favs, setFavs] = useState<string[]>([]);
  const [view, setView] = useState<'all' | 'favorites'>('all');
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = new Map<string, SavedCard>();
    for (const c of loadCards()) {
      const prev = m.get(c.slug);
      if (!prev || c.ts > prev.ts) m.set(c.slug, c); // latest result per quiz wins
    }
    setBySlug(m);
    setFavs(loadFavorites());
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
  const favSet = new Set(favs);
  const fav = (slug: string) => setFavs(toggleFavorite(slug));

  async function shareBinder() {
    const el = summaryRef.current;
    if (!el) return;
    try {
      const blob = await toBlob(el, { pixelRatio: 2, cacheBust: true });
      if (!blob) throw new Error('snapshot failed');
      const file = new File([blob], 'eikonia-binder.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `I have collected ${owned} of ${TOTAL} cards on Eikonia` });
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'eikonia-binder.png';
        a.click();
        URL.revokeObjectURL(href);
      }
    } catch (err) {
      console.error('shareBinder failed', err);
    }
  }

  function tile(slug: string) {
    const card = bySlug!.get(slug);
    if (isFull(card)) {
      const href = `/q/${slug}/r/${card!.key}${card!.matchPct != null ? `?m=${card!.matchPct}` : ''}`;
      const on = favSet.has(slug);
      return (
        <div key={slug} className="relative">
          <Link href={href} className="block transition-transform hover:-translate-y-1" aria-label={card!.name}>
            <ResultCardLive data={card!} flat scale={scale} />
          </Link>
          <button
            onClick={() => fav(slug)}
            aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-cream-1/90 text-base shadow"
          >
            <span className={on ? 'text-rose-dark' : 'text-ink-mute'}>{on ? '★' : '☆'}</span>
          </button>
        </div>
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
  }

  const favCards = [...bySlug.values()].filter((c) => favSet.has(c.slug)).sort((a, b) => b.ts - a.ts);

  return (
    <div className="mx-auto max-w-6xl">
      {/* off-screen summary, snapshotted for "share my binder" */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
        <div ref={summaryRef} style={{ width: 600, padding: 48, background: '#fdf5ee', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#4a2f15' }}>Eikonia</div>
          <div style={{ fontSize: 30, color: '#6b4423', marginTop: 14 }}>I have collected {owned} of {TOTAL} cards</div>
          <div style={{ fontSize: 20, color: '#735630', marginTop: 18 }}>Find yours at eikonia.art</div>
        </div>
      </div>

      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark md:text-4xl">My cards</h1>
        <p className="mt-2 text-ink-soft">{owned} of {TOTAL} collected</p>
        <div className="mx-auto mt-3 max-w-md"><Bar owned={owned} total={TOTAL} /></div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setView('all')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === 'all' ? 'bg-brown text-white' : 'border border-brown/30 text-brown'}`}>All</button>
          <button onClick={() => setView('favorites')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === 'favorites' ? 'bg-brown text-white' : 'border border-brown/30 text-brown'}`}>Favorites</button>
          <button onClick={shareBinder} className="rounded-full border border-brown/30 px-4 py-1.5 text-sm font-semibold text-brown">Share my binder</button>
        </div>
      </header>

      {view === 'favorites' ? (
        favCards.length ? (
          <div className="flex flex-wrap justify-center gap-4">{favCards.map((c) => tile(c.slug))}</div>
        ) : (
          <p className="py-12 text-center text-ink-mute">No favorites yet. Tap the star on a card to keep it here.</p>
        )
      ) : (
        COLLECTIONS.map((col) => {
          const have = col.slugs.filter((s) => bySlug.has(s)).length;
          const complete = have === col.slugs.length;
          return (
            <section key={col.id} className="mb-10">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <Link href={`/collections/${col.id}`} className="text-lg font-extrabold text-brown-dark hover:text-brown">{col.title}</Link>
                {complete ? (
                  <span className="shrink-0 rounded-full bg-rose-dark px-2.5 py-0.5 text-xs font-bold text-white">Complete</span>
                ) : (
                  <span className="shrink-0 text-sm text-ink-mute">{have} / {col.slugs.length}</span>
                )}
              </div>
              <div className="mb-4"><Bar owned={have} total={col.slugs.length} /></div>
              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                {col.slugs.map((slug) => tile(slug))}
              </div>
            </section>
          );
        })
      )}
      <p className="pb-6 text-center text-xs text-ink-mute">Saved on this device</p>
    </div>
  );
}
