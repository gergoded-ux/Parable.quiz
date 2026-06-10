// app/collections/[id]/page.tsx
// Per-collection hub page (real page = good SEO + a clean browse target for the nav).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COLLECTIONS } from '@/lib/collections';
import { isPublished, loadTestBySlug } from '@/lib/test-loader';
import { QuizCard } from '@/components/QuizCard';
import { HomeNav } from '@/components/HomeNav';
import { HomeBackground } from '@/components/HomeBackground';
import type { Test } from '@/lib/schema';

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = COLLECTIONS.find((x) => x.id === id);
  if (!c) return {};
  return {
    title: c.title,
    description: c.blurb,
    alternates: { canonical: `/collections/${id}` },
    openGraph: { title: `${c.title} · Eikonia`, description: c.blurb },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = COLLECTIONS.find((x) => x.id === id);
  if (!c) notFound();

  const items = c.slugs
    .map((s) => loadTestBySlug(s))
    .filter((t): t is Test => !!t && isPublished(t.slug));

  return (
    <>
      <HomeBackground />
      <HomeNav />
      <main className="px-6 py-10">
        <header className="mx-auto mb-7 max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark md:text-4xl">{c.title}</h1>
          <p className="mt-2 text-base text-ink-soft">{c.blurb}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-ink-mute">{items.length} quizzes</p>
        </header>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((t) => <QuizCard key={t.slug} test={t} />)}
        </div>
      </main>
    </>
  );
}
