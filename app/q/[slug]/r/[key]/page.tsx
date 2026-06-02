// app/q/[slug]/r/[key]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadAllTests, loadTestBySlug } from '@/lib/test-loader';
import { HomeNav } from '@/components/HomeNav';
import { ResultCard } from '@/components/ResultCard';
import { ShareBar } from '@/components/ShareBar';
import { AdSlot } from '@/components/AdSlot';
import { RelatedQuizzes } from '@/components/RelatedQuizzes';
import { ResultCardLive } from '@/components/card/ResultCardLive';
import { cardDataFromResult } from '@/lib/card-data';

export function generateStaticParams() {
  const params: { slug: string; key: string }[] = [];
  for (const t of loadAllTests()) {
    if (t.mode === 'archetype' || t.mode === 'profile') {
      Object.keys(t.results).forEach(key => params.push({ slug: t.slug, key }));
    } else {
      for (let p = 0; p <= 100; p += 10) params.push({ slug: t.slug, key: String(p) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; key: string }> }): Promise<Metadata> {
  const { slug, key } = await params;
  const test = loadTestBySlug(slug);
  if (!test) return {};
  let title = test.title;
  let description = `Take ${test.title} on Parable.`;
  if (test.mode === 'archetype') {
    const r = test.results[key];
    if (r) {
      title = `You are ${r.name} · ${test.title}`;
      description = r.description;
    }
  } else if (test.mode === 'profile') {
    const r = test.results[key];
    if (r) {
      title = `Your top gift: ${r.name} · ${test.title}`;
      description = r.description;
    }
  } else {
    title = `${key}% · ${test.title}`;
  }
  const ogImage = `/og/${test.slug}/${key}`;
  return {
    title, description,
    openGraph: { title, description, images: [ogImage], type: 'article' },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function ResultPage({ params, searchParams }: { params: Promise<{ slug: string; key: string }>; searchParams: Promise<{ m?: string }> }) {
  const { slug, key } = await params;
  const { m } = await searchParams;
  const test = loadTestBySlug(slug);
  if (!test) notFound();

  const matchPct = m != null && m !== '' ? Math.max(0, Math.min(100, parseInt(m, 10) || 0)) : null;
  const cardData = cardDataFromResult(test, key, matchPct);

  const shareUrl = `https://parable.quiz/q/${test.slug}/r/${key}`;
  const ogImageAbs = `https://parable.quiz/og/${test.slug}/${key}`;

  let cardProps;
  let shareText;

  if (test.mode === 'archetype') {
    const r = test.results[key];
    if (!r) notFound();
    cardProps = { mode: 'archetype' as const, name: r.name, emoji: r.emoji, traits: r.traits, description: r.description, scriptureRef: r.scriptureRef, scripture: r.scripture };
    shareText = `I got "${r.name}" on Parable — what's yours?`;
  } else if (test.mode === 'profile') {
    const r = test.results[key];
    if (!r) notFound();
    cardProps = {
      mode: 'profile' as const, name: r.name, description: r.description,
      scriptureRef: r.scriptureRef, scripture: r.scripture,
      topDimensions: [{ dimension: key, score: 100, label: r.name }],
    };
    shareText = `I got "${r.name}" on Parable — what's yours?`;
  } else {
    const percent = parseInt(key, 10);
    if (isNaN(percent)) notFound();
    const band = test.scoring.gradeBands.find(b => percent >= b.min && percent <= b.max)
      ?? test.scoring.gradeBands[test.scoring.gradeBands.length - 1];
    const total = test.questions.length;
    const correct = Math.round((percent / 100) * total);
    cardProps = { mode: 'knowledge' as const, percent, correct, total, bandLabel: band.label, message: band.message };
    shareText = `I scored ${percent}% on ${test.title}. Try it on Parable!`;
  }

  return (
    <>
      <HomeNav />
      <main className="py-8">
        <ResultCardLive data={cardData} />
        <ResultCard {...cardProps} />
        <ShareBar url={shareUrl} text={shareText} image={ogImageAbs} />
        <AdSlot slot="post-share" />
        <RelatedQuizzes slug={test.slug} />
      </main>
    </>
  );
}
