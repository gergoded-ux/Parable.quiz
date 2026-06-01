// components/QuizCard.tsx
import Link from 'next/link';
import type { Test } from '@/lib/schema';

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
    <Link
      href={`/q/${test.slug}`}
      className="block bg-white border border-rose/60 rounded-card p-5 card-hover shadow-card"
    >
      <div className="text-3xl mb-2">{pickEmoji(test)}</div>
      <div className="text-base font-bold text-brown leading-tight">{test.title}</div>
      <div className="text-xs text-ink-mute mt-1">{describeMeta(test)}</div>
    </Link>
  );
}
