'use client';
import Link from 'next/link';
import { weeklyIndex } from '@/lib/collection';

type Item = { slug: string; title: string; cover: string };

// A slim, date-rotated "this week" pick: a cheap reason to come back. Picks
// client-side so it rotates weekly without a rebuild.
export function QuizOfTheWeek({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const pick = items[weeklyIndex(items.length)];
  return (
    <div className="mx-auto mt-8 max-w-3xl px-6">
      <Link
        href={`/q/${pick.slug}`}
        className="flex items-center gap-3 rounded-2xl border border-rose/50 bg-cream-1/80 p-3 no-underline shadow-card transition-transform hover:-translate-y-0.5"
      >
        {pick.cover && <img src={pick.cover} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />}
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-mute">This week&rsquo;s quiz</div>
          <div className="truncate font-extrabold text-brown-dark">{pick.title}</div>
        </div>
        <span className="ml-auto shrink-0 text-sm font-semibold text-brown">Take it &rarr;</span>
      </Link>
    </div>
  );
}
