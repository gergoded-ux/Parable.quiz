// components/HomeNav.tsx
import Link from 'next/link';
import { Wordmark } from './Wordmark';

export function HomeNav() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-rose/50">
      <Wordmark />
      <div className="flex gap-6 text-sm text-ink-soft">
        <Link href="/quizzes">Quizzes</Link>
        <Link href="/quizzes#profile">Spiritual Profiles</Link>
        <Link href="/quizzes#knowledge">Bible IQ</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/about">About</Link>
      </div>
    </nav>
  );
}
