// components/RelatedLink.tsx
'use client';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card-2';

export function RelatedLink({
  fromSlug, toSlug, title, emoji, estimatedMinutes,
}: {
  fromSlug: string;
  toSlug: string;
  title: string;
  emoji: string;
  estimatedMinutes: number;
}) {
  return (
    <Link
      href={`/q/${toSlug}`}
      onClick={() => track('related_quiz_click', { from: fromSlug, to: toSlug })}
      className="block h-full"
    >
      <Card className="flex h-full flex-col">
        <CardHeader className="gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-2 text-xl">{emoji}</div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-snug line-clamp-2">{title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">Take another</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="flex w-full items-center justify-center bg-gradient-to-br from-cream-1 to-rose" style={{ aspectRatio: '3 / 2' }}>
            <span className="text-6xl drop-shadow-sm">{emoji}</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-ink-soft">{estimatedMinutes} min</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
