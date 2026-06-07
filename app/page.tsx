// app/page.tsx
import { loadPublishedTests } from '@/lib/test-loader';
import { QuizCard } from '@/components/QuizCard';
import { HomeNav } from '@/components/HomeNav';
import { HomeBackground } from '@/components/HomeBackground';
import { AdSlot } from '@/components/AdSlot';
import type { Metadata } from 'next';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Home() {
  // Live quizzes only (content/published.json), in launch-priority order.
  const all = loadPublishedTests();
  const featured = all.slice(0, 6);
  const featuredSlugs = new Set(featured.map(t => t.slug));
  const rest = all.filter(t => !featuredSlugs.has(t.slug));
  const archetype = rest.filter(t => t.mode === 'archetype');
  const profile   = rest.filter(t => t.mode === 'profile');
  const knowledge = rest.filter(t => t.mode === 'knowledge');

  return (
    <>
      <HomeBackground />
      <HomeNav />
      <header className="px-8 py-14 text-center">
        <div className="mx-auto inline-block max-w-2xl rounded-3xl bg-cream-1/75 px-8 py-7 shadow-[0_8px_30px_rgba(80,50,20,0.12)] backdrop-blur-sm">
          <h1 className="mb-3 text-4xl font-extrabold -tracking-wide text-brown-dark md:text-5xl">
            What&rsquo;s your reflection?
          </h1>
          <p className="mb-3 text-base text-ink-soft">{all.length} quizzes that reveal what scripture says about you.</p>
          <div className="text-xs uppercase tracking-widest text-ink-mute">{all.length} QUIZZES · ALWAYS FREE · NO SIGN-UP</div>
        </div>
      </header>

      {featured.length > 0 && (
        <Section id="featured" title="Most shared this week">
          {featured.map(t => <QuizCard key={t.slug} test={t} />)}
        </Section>
      )}

      <AdSlot slot="home-mid" />

      {archetype.length > 0 && (
        <Section id="archetype" title="Bible character quizzes">
          {archetype.map(t => <QuizCard key={t.slug} test={t} />)}
        </Section>
      )}

      {profile.length > 0 && (
        <Section id="profile" title="Spiritual profiles · deeper dives">
          {profile.map(t => <QuizCard key={t.slug} test={t} />)}
        </Section>
      )}

      {knowledge.length > 0 && (
        <Section id="knowledge" title="Bible IQ · how well do you know scripture?">
          {knowledge.map(t => <QuizCard key={t.slug} test={t} />)}
        </Section>
      )}

    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-6 mt-8">
      <h2 className="text-xs uppercase tracking-widest text-brown my-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{children}</div>
    </section>
  );
}
