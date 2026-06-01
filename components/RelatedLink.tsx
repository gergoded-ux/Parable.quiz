// components/RelatedLink.tsx
'use client';
import Link from 'next/link';
import { track } from '@vercel/analytics';

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
      className="block bg-white border border-rose/60 rounded-card p-5 card-hover shadow-card"
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-base font-bold text-brown leading-tight">{title}</div>
      <div className="text-xs text-ink-mute mt-1">{estimatedMinutes} min</div>
    </Link>
  );
}
