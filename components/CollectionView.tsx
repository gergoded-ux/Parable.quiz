'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/collections';
import { loadCards, type SavedCard } from '@/lib/collection';
import { artUrl, quizCoverUrl } from '@/lib/card-art';
import { rarityFromMatch } from '@/lib/rarity';

const TOTAL = COLLECTIONS.reduce((n, c) => n + c.slugs.length, 0);

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

  useEffect(() => {
    const m = new Map<string, SavedCard>();
    for (const c of loadCards()) {
      const prev = m.get(c.slug);
      if (!prev || c.ts > prev.ts) m.set(c.slug, c); // latest result per quiz wins
    }
    setBySlug(m);
  }, []);

  if (!bySlug) return <p className="py-16 text-center text-ink-mute">Loading your cards...</p>;

  const owned = [...bySlug.keys()].filter((s) => COLLECTIONS.some((c) => c.slugs.includes(s))).length;

  if (owned === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark">My cards</h1>
        <p className="mt-3 text-ink-soft">Your collection is empty. Take a quiz and your first card lands here.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brown px-7 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5">Find a quiz</Link>
      </div>
    );
  }

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {col.slugs.map((slug) => {
                const card = bySlug.get(slug);
                if (card) {
                  const rar = rarityFromMatch(card.matchPct ?? 0);
                  const art = artUrl(slug, card.artKey) || quizCoverUrl(slug);
                  return (
                    <Link key={slug} href={`/q/${slug}/r/${card.key}${card.matchPct != null ? `?m=${card.matchPct}` : ''}`}
                      className="overflow-hidden rounded-2xl border border-rose/50 bg-white shadow-card transition-transform hover:-translate-y-0.5">
                      <div className="aspect-[4/5] bg-cream-2">
                        {art && <img src={art} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="p-2.5">
                        <div className="truncate text-sm font-extrabold text-brown-dark">{card.name}</div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: rar.accent, border: `1px solid ${rar.accent}55` }}>{rar.label}</span>
                          {card.matchPct != null && !card.name.endsWith('%') && <span className="text-[11px] font-semibold text-ink-mute">{card.matchPct}%</span>}
                        </div>
                      </div>
                    </Link>
                  );
                }
                const cover = quizCoverUrl(slug);
                return (
                  <Link key={slug} href={`/q/${slug}`}
                    className="overflow-hidden rounded-2xl border border-dashed border-rose/50 bg-cream-1/50 transition-transform hover:-translate-y-0.5">
                    <div className="relative aspect-[4/5] bg-cream-2">
                      {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-20" />}
                      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-ink-mute/50">?</div>
                    </div>
                    <div className="p-2.5"><div className="text-xs text-ink-mute">Not yet collected</div></div>
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
