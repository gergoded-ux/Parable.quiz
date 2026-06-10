// app/blog/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadPublishedPosts } from '@/lib/blog';
import { HomeNav } from '@/components/HomeNav';
import { quizCoverUrl } from '@/lib/card-art';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Honest, hopeful reads on faith, identity, and everyday life. Each one pairs with a quiz.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Articles',
    description: 'Honest, hopeful reads on faith, identity, and everyday life. Each one pairs with a quiz.',
    images: [{ url: '/og-blog.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-blog.png'] },
};

export default function BlogIndex() {
  const posts = loadPublishedPosts();
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold -tracking-wide text-brown-dark md:text-4xl">Articles</h1>
          <p className="mt-2 text-ink-soft">Honest, hopeful reads on faith and life. Each one pairs with a quiz.</p>
        </header>
        {posts.length === 0 ? (
          <p className="text-center text-ink-mute">New articles are on the way.</p>
        ) : (
          <ul className="space-y-5">
            {posts.map((p) => {
              const cover = quizCoverUrl(p.quiz);
              return (
                <li key={p.slug} className="overflow-hidden rounded-2xl border border-rose/40 bg-white shadow-card transition-transform hover:-translate-y-0.5">
                  <Link href={`/blog/${p.slug}`} className="flex gap-4 p-4 no-underline sm:gap-5">
                    {cover && (
                      <img src={cover} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover sm:h-24 sm:w-40" />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold leading-tight text-brown-dark sm:text-xl">{p.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft sm:text-base">{p.description}</p>
                      <div className="mt-2 text-sm font-semibold text-brown">Read &rarr;</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
