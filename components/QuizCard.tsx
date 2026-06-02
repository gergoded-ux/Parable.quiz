"use client";
import Link from 'next/link';
import type { Test } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card-2';

function pickEmoji(t: Test): string {
  if (t.mode === 'archetype') {
    const first = Object.values(t.results)[0];
    if (first?.emoji) return first.emoji;
  }
  return t.category === 'spiritual-profile' ? '✨' : t.category === 'bible-iq' ? '📖' : '📜';
}

function describeMeta(t: Test): string {
  const m = `${t.estimatedMinutes} min`;
  if (t.mode === 'knowledge') return `${m} · ${t.questions.length} questions`;
  if (t.mode === 'profile')   return `${m} · ${t.dimensions.length} dimensions`;
  return `${m} · ${Object.keys(t.results).length} results`;
}

export function QuizCard({ test }: { test: Test }) {
  return (
    <Link href={`/q/${test.slug}`} className="block h-full">
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="text-3xl mb-2">{pickEmoji(test)}</div>
          <div className="text-base font-bold text-brown leading-tight">{test.title}</div>
          <div className="text-xs text-ink-mute mt-1">{describeMeta(test)}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
