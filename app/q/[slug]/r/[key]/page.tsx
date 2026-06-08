// app/q/[slug]/r/[key]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadPublishedTests, loadTestBySlug, isPublished } from '@/lib/test-loader';
import { HomeNav } from '@/components/HomeNav';
import { ResultCard } from '@/components/ResultCard';
import { AdSlot } from '@/components/AdSlot';
import { RelatedQuizzes } from '@/components/RelatedQuizzes';
import { ShareableCard } from '@/components/card/ShareableCard';
import { TrackResultView } from '@/components/TrackResultView';
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
      title = `You are ${r.name}`;
      description = r.description;
    }
  } else if (test.mode === 'profile') {
    const r = test.results[key];
    if (r) {
      title = `Your top gift: ${r.name}`;
      description = r.description;
    }
  } else {
    title = `${key}% · ${test.title}`;
  }
  if (description.length > 158) description = description.slice(0, 155).trimEnd() + '…';
  const mq = m ? `?m=${encodeURIComponent(m)}` : '';
  // v= forces social platforms + CDN to refetch after the frame-centering fix.
  const ogImage = `/og/${slug}/${key}${mq}${mq ? '&' : '?'}v=2`;
  return {
    title, description,
    alternates: { canonical: `/q/${slug}/r/${key}` },
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
  const ogImageAbs = `https://eikonia.art/og/${test.slug}/${key}${mq}${mq ? '&' : '?'}v=2`;
  const resultName = test.mode === 'knowledge' ? `${key}%` : (test.results[key]?.name ?? key);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://eikonia.art' },
      { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://eikonia.art/quizzes' },
      { '@type': 'ListItem', position: 3, name: test.title, item: `https://eikonia.art/q/${test.slug}` },
      { '@type': 'ListItem', position: 4, name: resultName, item: `https://eikonia.art/q/${test.slug}/r/${key}` },
    ],
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <TrackResultView slug={test.slug} result={key} />
      <HomeNav />
      <main className="px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
          <div className="w-full max-w-sm shrink-0 lg:max-w-md">
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
