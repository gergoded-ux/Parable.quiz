// app/quizzes/page.tsx
// Full quiz directory (the IDRlabs tests.php equivalent): every live quiz,
// grouped by type and sorted A-Z, using the same cover cards as the homepage.
import type { Metadata } from 'next';
import { loadPublishedTests } from '@/lib/test-loader';
import type { Test } from '@/lib/schema';
import { QuizCard } from '@/components/QuizCard';
import { HomeNav } from '@/components/HomeNav';
import { HomeBackground } from '@/components/HomeBackground';

export const metadata: Metadata = {
  title: 'All Quizzes',
  alternates: { canonical: '/quizzes' },
  description: 'Browse every Eikonia quiz: Bible character quizzes, spiritual profiles, and Bible IQ tests. Always free, no sign-up.',
};

const byTitle = (a: Test, b: Test) => a.title.localeCompare(b.title);

export default function QuizzesPage() {
  const all = loadPublishedTests();
  const archetype = all.filter(t => t.mode === 'archetype').sort(byTitle);
  const profile = all.filter(t => t.mode === 'profile').sort(byTitle);
  const knowledge = all.filter(t => t.mode === 'knowledge').sort(byTitle);

  return (
    <>
      <HomeBackground />
      <HomeNav />
      <header className="px-8 pt-12 pb-2 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-brown-dark">All quizzes</h1>
        <p className="text-sm text-ink-soft">{all.length} free quizzes. No sign-up. Pick one and see yourself reflected in scripture.</p>
      </header>

      <Section id="archetype" title={`Bible character quizzes (${archetype.length})`} tests={archetype} />
      <Section id="profile" title={`Spiritual profiles (${profile.length})`} tests={profile} />
      <Section id="knowledge" title={`Bible IQ (${knowledge.length})`} tests={knowledge} />

      <div className="h-6" />
    </>
  );
}

function Section({ id, title, tests }: { id: string; title: string; tests: Test[] }) {
  if (tests.length === 0) return null;
  return (
    <section id={id} className="mt-8 scroll-mt-24 px-6">
      <h2 className="my-3 text-xs uppercase tracking-widest text-brown">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tests.map(t => <QuizCard key={t.slug} test={t} />)}
      </div>
    </section>
  );
}
