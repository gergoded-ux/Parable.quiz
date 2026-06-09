// app/page.tsx
import { isPublished, loadTestBySlug } from '@/lib/test-loader';
import { COLLECTIONS, FEATURED, PUBLISHED_SLUGS } from '@/lib/collections';
import { QuizCard } from '@/components/QuizCard';
import { HomeNav } from '@/components/HomeNav';
import { HomeBackground } from '@/components/HomeBackground';
import { AdSlot } from '@/components/AdSlot';
import type { Metadata } from 'next';
import type { Test } from '@/lib/schema';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Resolve a list of slugs to live Test objects, preserving order.
function tests(slugs: string[]): Test[] {
  return slugs
    .map((s) => loadTestBySlug(s))
    .filter((t): t is Test => !!t && isPublished(t.slug));
}

export default function Home() {
  const total = PUBLISHED_SLUGS.length;
  const featured = tests(FEATURED);

  return (
    <>
      <HomeBackground />
      <HomeNav />
      <header className="px-8 py-14 text-center">
        <div className="mx-auto inline-block max-w-2xl rounded-3xl bg-cream-1/75 px-8 py-7 shadow-[0_8px_30px_rgba(80,50,20,0.12)] backdrop-blur-sm">
          <h1 className="mb-3 text-4xl font-extrabold -tracking-wide text-brown-dark md:text-5xl">
            What&rsquo;s your reflection?
          </h1>
          <p className="mb-3 text-base text-ink-soft">{total} quizzes that reveal what scripture says about you.</p>
          <div className="text-xs uppercase tracking-widest text-ink-mute">{total} QUIZZES &middot; ALWAYS FREE &middot; NO SIGN-UP</div>
        </div>
      </header>

      {featured.length > 0 && (
        <Section id="start-here" title="Start here">
          {featured.map((t) => <QuizCard key={t.slug} test={t} />)}
        </Section>
      )}

      <AdSlot slot="home-mid" />

      {COLLECTIONS.map((c) => {
        const items = tests(c.slugs);
        if (!items.length) return null;
        return (
          <Section key={c.id} id={c.id} title={c.title} blurb={c.blurb}>
            {items.map((t) => <QuizCard key={t.slug} test={t} />)}
          </Section>
        );
      })}
    </>
  );
}

function Section({ id, title, blurb, children }: { id: string; title: string; blurb?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 px-6 scroll-mt-20">
      <h2 className="text-lg font-extrabold text-brown-dark">{title}</h2>
      {blurb && <p className="mb-3 mt-0.5 text-sm text-ink-mute">{blurb}</p>}
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>
    </section>
  );
}
