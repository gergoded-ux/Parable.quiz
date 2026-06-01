// app/q/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';
import { TestRunner } from '@/components/TestRunner';

export function generateStaticParams() {
  return loadAllTests().map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = loadTestBySlug(slug);
  if (!test) return {};
  return {
    title: test.title,
    description: test.subtitle ?? `Take the ${test.title} quiz on Parable.`,
    openGraph: { title: test.title, type: 'website' },
  };
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = loadTestBySlug(slug);
  if (!test) notFound();
  return <TestRunner test={test} />;
}
