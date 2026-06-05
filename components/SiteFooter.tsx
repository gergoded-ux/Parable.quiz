// components/SiteFooter.tsx
// Shared site footer, rendered on every page via app/layout.tsx.
import Link from 'next/link';

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-rose/50 px-8 py-10 text-center text-xs text-ink-mute">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/quizzes" className="hover:text-brown">All Quizzes</Link>
        <Link href="/about" className="hover:text-brown">About</Link>
        <Link href="/faq" className="hover:text-brown">FAQ</Link>
        <Link href="/contact" className="hover:text-brown">Contact</Link>
        <Link href="/privacy" className="hover:text-brown">Privacy</Link>
        <Link href="/terms" className="hover:text-brown">Terms</Link>
      </nav>
      <p>© {YEAR} Eikonia · Free Christian quizzes for reflection. Made with care.</p>
    </footer>
  );
}
