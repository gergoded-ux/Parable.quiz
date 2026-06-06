// components/RelatedQuizzes.tsx
import { getRelated } from '@/lib/related';
import { RelatedLink } from './RelatedLink';
import type { Test } from '@/lib/schema';

function pickEmoji(t: Test): string {
  if (t.mode === 'archetype') {
    const first = Object.values(t.results)[0];
    if (first?.emoji) return first.emoji;
  }
  return t.category === 'spiritual-profile' ? '✨' : t.category === 'bible-iq' ? '📖' : '📜';
}

export function RelatedQuizzes({ slug }: { slug: string }) {
  const related = getRelated(slug);
  if (related.length === 0) return null;
  return (
    <section className="px-8 pb-8">
      <h3 className="text-xs uppercase tracking-widest text-brown my-6">Take another</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {related.map(t => (
          <RelatedLink
            key={t.slug}
            fromSlug={slug}
            toSlug={t.slug}
            title={t.title}
            emoji={pickEmoji(t)}
            category={t.category}
            estimatedMinutes={t.estimatedMinutes}
          />
        ))}
      </div>
    </section>
  );
}
