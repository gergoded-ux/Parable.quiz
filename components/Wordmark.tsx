// components/Wordmark.tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';

const TEXT = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
const MARK = { sm: 22, md: 30, lg: 44 };

export function Wordmark({ size = 'md', showMark = true }: { size?: 'sm' | 'md' | 'lg'; showMark?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2 font-extrabold tracking-tight text-brown', TEXT[size])}>
      {showMark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.webp" alt="" width={MARK[size]} height={MARK[size]} className="shrink-0" style={{ width: MARK[size], height: MARK[size] }} />
      )}
      Eikonia
    </Link>
  );
}
