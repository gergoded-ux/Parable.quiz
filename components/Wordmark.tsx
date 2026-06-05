// components/Wordmark.tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  return (
    <Link href="/" className={cn('font-extrabold tracking-tight text-brown', sizes[size])}>
      Eikonia
    </Link>
  );
}
