// components/HomeHero.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export type HeroItem = { slug: string; title: string; cover: string };

// A gentle rotating spotlight of featured quizzes (replaces the static "Start here"
// strip). Auto-advances; pauses on hover; dots let you jump.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (!items.length) return null;
  const cur = items[i % items.length];

  return (
    <section className="px-6" aria-label="Featured quiz">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-rose/40 bg-white/85 shadow-card backdrop-blur"
      >
        <Link href={`/q/${cur.slug}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-cream-1/60 sm:gap-5 sm:p-5">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-24 sm:w-36">
            {cur.cover && <img src={cur.cover} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-mute">Featured</div>
            <div className="line-clamp-2 text-lg font-extrabold leading-tight text-brown-dark sm:text-xl">{cur.title}</div>
            <div className="mt-1 text-sm font-semibold text-brown">Take the quiz &rarr;</div>
          </div>
        </Link>
      </div>
      {items.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {items.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`Show featured quiz ${n + 1}`}
              className={`h-1.5 rounded-full transition-all ${n === i % items.length ? 'w-5 bg-brown' : 'w-1.5 bg-brown/30 hover:bg-brown/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
