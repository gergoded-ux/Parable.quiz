// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadAllPosts, loadPostBySlug } from '@/lib/blog';
import { HomeNav } from '@/components/HomeNav';
import { BlogQuizEmbed } from '@/components/BlogQuizEmbed';

export function generateStaticParams() {
  return loadAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = loadPostBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: 'article', title: p.title, description: p.description },
    // Drafts are reachable by URL (for preview) but kept out of search until launch.
    robots: p.published ? undefined : { index: false, follow: false },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = loadPostBySlug(slug);
  if (!p) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    datePublished: p.date || undefined,
    author: { '@type': 'Organization', name: 'Eikonia', url: 'https://eikonia.art' },
    publisher: { '@type': 'Organization', name: 'Eikonia', url: 'https://eikonia.art' },
    mainEntityOfPage: `https://eikonia.art/blog/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <HomeNav />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <article>
          <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark md:text-4xl">{p.title}</h1>
          {p.quiz && <BlogQuizEmbed slug={p.quiz} />}
          <div className="prose-eikonia mt-6" dangerouslySetInnerHTML={{ __html: p.html }} />
          {p.quiz && <BlogQuizEmbed slug={p.quiz} />}
        </article>
        <div className="mt-10 text-center">
          <a href="/blog" className="text-sm font-semibold text-brown">&larr; All articles</a>
        </div>
      </main>
    </>
  );
}
