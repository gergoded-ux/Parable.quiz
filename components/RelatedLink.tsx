// components/RelatedLink.tsx
'use client';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { Card, CardContent } from '@/components/ui/card-2';

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
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="text-3xl mb-2">{emoji}</div>
          <div className="text-base font-bold text-brown leading-tight">{title}</div>
          <div className="text-xs text-ink-mute mt-1">{estimatedMinutes} min</div>
        </CardContent>
      </Card>
    </Link>
  );
}
