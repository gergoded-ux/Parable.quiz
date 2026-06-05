// app/q/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadPublishedTests, loadTestBySlug, isPublished } from '@/lib/test-loader';
import { TestRunner } from '@/components/TestRunner';

// Only the live (published) quizzes exist as routes; backlog slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return loadPublishedTests().map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = loadTestBySlug(slug);
  if (!test || !isPublished(slug)) return {};
  return {
    title: test.title,
    description: test.subtitle ?? `Take the ${test.title} quiz on Eikonia.`,
    openGraph: { title: test.title, type: 'website' },
  };
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = loadTestBySlug(slug);
  if (!test || !isPublished(slug)) notFound();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: test.title,
    about: test.subtitle ?? test.title,
    educationalLevel: 'beginner',
    numberOfQuestions: test.questions.length,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TestRunner test={test} />
    </>
  );
}
