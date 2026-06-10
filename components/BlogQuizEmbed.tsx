// components/BlogQuizEmbed.tsx
// In-article "Take the quiz" card. Renders nothing if the quiz isn't live.
import Link from 'next/link';
import { loadTestBySlug, isPublished } from '@/lib/test-loader';
import { quizCoverUrl } from '@/lib/card-art';

export function BlogQuizEmbed({ slug }: { slug: string }) {
  const t = loadTestBySlug(slug);
  if (!t || !isPublished(slug)) return null;
  const cover = quizCoverUrl(slug);
  return (
    <Link
      href={`/q/${slug}`}
      className="my-8 flex items-center gap-4 rounded-2xl border border-rose/50 bg-cream-1 p-4 no-underline shadow-card transition-transform hover:-translate-y-0.5"
    >
      {cover && <img src={cover} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover sm:h-24 sm:w-36" />}
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-ink-mute">Take the quiz</div>
        <div className="text-lg font-extrabold leading-tight text-brown-dark">{t.title}</div>
        <div className="mt-1 text-sm font-semibold text-brown">Find your result &rarr;</div>
      </div>
    </Link>
  );
}
