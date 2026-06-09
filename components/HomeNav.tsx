// components/HomeNav.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';

const LINKS = [
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/quizzes#profile', label: 'Spiritual Profiles' },
  { href: '/quizzes#knowledge', label: 'Bible IQ' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

export function HomeNav() {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav className="relative z-30 border-b border-rose/50">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 md:py-5">
        <Wordmark size="lg" />

        {/* desktop links */}
        <div className="hidden gap-7 text-base text-ink-soft md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brown">{l.label}</Link>
          ))}
        </div>

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-brown transition-colors hover:bg-rose/40 md:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      {/* mobile menu: tap-outside backdrop + dropdown panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-20 md:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-full z-30 border-b border-rose/40 bg-cream-1 shadow-lg md:hidden">
            <div className="flex flex-col px-6 py-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-rose/20 py-3 text-base font-medium text-ink-soft transition-colors last:border-b-0 hover:text-brown"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
