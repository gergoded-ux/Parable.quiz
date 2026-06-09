// components/Wordmark.tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';

const TEXT = { sm: 'text-lg', md: 'text-2xl', lg: 'text-2xl md:text-4xl' };
// class-based so the nav size (lg) can scale up only on desktop, keeping mobile compact
const MARK = { sm: 'h-[22px] w-[22px]', md: 'h-[30px] w-[30px]', lg: 'h-[30px] w-[30px] md:h-[44px] md:w-[44px]' };

export function Wordmark({ size = 'md', showMark = true }: { size?: 'sm' | 'md' | 'lg'; showMark?: boolean }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2 font-extrabold tracking-tight text-brown', TEXT[size])}>
      {showMark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.webp" alt="" width={44} height={44} className={cn('shrink-0', MARK[size])} />
      )}
      Eikonia
    </Link>
  );
}
