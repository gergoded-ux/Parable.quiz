// app/q/[slug]/r/[key]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadPublishedTests, loadTestBySlug, isPublished } from '@/lib/test-loader';
import { HomeNav } from '@/components/HomeNav';
import { ResultCard } from '@/components/ResultCard';
import { AdSlot } from '@/components/AdSlot';
import { RelatedQuizzes } from '@/components/RelatedQuizzes';
import { ShareableCard } from '@/components/card/ShareableCard';
import { cardDataFromResult, binaryAffinityStat } from '@/lib/card-data';

export function generateStaticParams() {
  const params: { slug: string; key: string }[] = [];
  for (const t of loadPublishedTests()) {
    if (t.mode === 'archetype' || t.mode === 'profile') {
      Object.keys(t.results).forEach(key => params.push({ slug: t.slug, key }));
    } else {
      for (let p = 0; p <= 100; p += 10) params.push({ slug: t.slug, key: String(p) });
    }
  }
  return params;
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string; key: string }>; searchParams: Promise<{ m?: string }> }): Promise<Metadata> {
  const { slug, key } = await params;
  const { m } = await searchParams;
  const test = loadTestBySlug(slug);
  if (!test || !isPublished(slug)) return {};
  let title = test.title;
  let description = `Take ${test.title} on Eikonia.`;
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
  const mq = m ? `?m=${encodeURIComponent(m)}` : '';
  const ogImage = `/og/${slug}/${key}${mq}`;
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
  if (!test || !isPublished(slug)) notFound();

  const matchPct = m != null && m !== '' ? Math.max(0, Math.min(100, parseInt(m, 10) || 0)) : null;
  const stat = binaryAffinityStat(test, key, matchPct);
  const cardData = cardDataFromResult(test, key, matchPct, stat);
  if (!cardData) notFound();

  const mq = matchPct !== null ? `?m=${matchPct}` : '';
  const shareUrl = `https://eikonia.art/q/${test.slug}/r/${key}${mq}`;
  const ogImageAbs = `https://eikonia.art/og/${test.slug}/${key}${mq}`;

  let cardProps;
  let shareText;

  if (test.mode === 'archetype') {
    const r = test.results[key];
    if (!r) notFound();
    cardProps = { mode: 'archetype' as const, name: r.name, emoji: r.emoji, traits: r.traits, description: r.description, scriptureRef: r.scriptureRef, scripture: r.scripture };
    shareText = `I got "${r.name}" on Eikonia. What's yours?`;
  } else if (test.mode === 'profile') {
    const r = test.results[key];
    if (!r) notFound();
    cardProps = {
      mode: 'profile' as const, name: r.name, description: r.description,
      scriptureRef: r.scriptureRef, scripture: r.scripture,
      topDimensions: [{ dimension: key, score: 100, label: r.name }],
    };
    shareText = `I got "${r.name}" on Eikonia. What's yours?`;
  } else {
    const percent = parseInt(key, 10);
    if (isNaN(percent)) notFound();
    const band = test.scoring.gradeBands.find(b => percent >= b.min && percent <= b.max)
      ?? test.scoring.gradeBands[test.scoring.gradeBands.length - 1];
    const total = test.questions.length;
    const correct = Math.round((percent / 100) * total);
    cardProps = { mode: 'knowledge' as const, percent, correct, total, bandLabel: band.label, message: band.message };
    shareText = `I scored ${percent}% on ${test.title}. Try it on Eikonia!`;
  }

  return (
    <>
      <HomeNav />
      <main className="px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
          <div className="w-full max-w-sm shrink-0">
            <ShareableCard data={cardData} shareUrl={shareUrl} shareText={shareText} ogImage={ogImageAbs} />
          </div>
          <div className="w-full max-w-xl lg:pt-1">
            <ResultCard {...cardProps} />
          </div>
        </div>
        <AdSlot slot="post-share" />
        <RelatedQuizzes slug={test.slug} />
      </main>
    </>
  );
}
