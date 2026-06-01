// app/not-found.tsx
import { HomeNav } from '@/components/HomeNav';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <HomeNav />
      <main className="max-w-xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl font-extrabold text-brown-dark mb-3">Lost like a sheep.</h1>
        <p className="text-ink-soft mb-6">We couldn&rsquo;t find that page.</p>
        <Link href="/" className="bg-brown text-white px-6 py-3 rounded-full font-semibold text-sm">
          Back home
        </Link>
      </main>
    </>
  );
}
