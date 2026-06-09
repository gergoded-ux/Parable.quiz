// app/blog/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadPublishedPosts } from '@/lib/blog';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Honest, hopeful reads on faith, identity, and everyday life. Each one pairs with a quiz.',
  alternates: { canonical: '/blog' },
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
            {posts.map((p) => (
              <li key={p.slug} className="rounded-2xl border border-rose/40 bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5">
                <Link href={`/blog/${p.slug}`} className="block no-underline">
                  <h2 className="text-xl font-extrabold text-brown-dark">{p.title}</h2>
                  <p className="mt-1 text-ink-soft">{p.description}</p>
                  <div className="mt-2 text-sm font-semibold text-brown">Read &rarr;</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
