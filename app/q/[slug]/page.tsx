// app/q/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadPublishedTests, loadTestBySlug, isPublished } from '@/lib/test-loader';
import { TestRunner } from '@/components/TestRunner';
import { hasQuizCover, quizCoverUrl } from '@/lib/card-art';

// Only the live (published) quizzes exist as routes; backlog slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return loadPublishedTests().map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = loadTestBySlug(slug);
  if (!test || !isPublished(slug)) return {};
  // Compose a full-length meta description: keep the punchy subtitle as-is when it
  // is already substantial, otherwise pad it with a value sentence. Cap at ~158.
  const sub = test.subtitle?.trim();
  const tail = test.mode === 'knowledge'
    ? 'Free Bible IQ quiz: answer the questions, get your score and a shareable scorecard with a verse.'
    : 'Free Christian quiz: answer a few questions for your result, a verse, and a collectible card to share.';
  let description = sub && sub.length >= 110 ? sub : (sub ? `${sub} ${tail}` : tail);
  if (description.length > 158) description = description.slice(0, 155).trimEnd() + '…';
  const cover = hasQuizCover(slug) ? quizCoverUrl(slug) : undefined;
  return {
    title: test.title,
    description,
    alternates: { canonical: `/q/${slug}` },
    openGraph: { title: test.title, description, type: 'website', images: cover ? [cover] : undefined },
    twitter: cover ? { card: 'summary_large_image', title: test.title, description, images: [cover] } : undefined,
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
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://eikonia.art' },
      { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://eikonia.art/quizzes' },
      { '@type': 'ListItem', position: 3, name: test.title, item: `https://eikonia.art/q/${test.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <TestRunner test={test} />
    </>
  );
}
