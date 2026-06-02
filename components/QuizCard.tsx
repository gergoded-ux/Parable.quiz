"use client";
import Link from 'next/link';
import type { Test } from '@/lib/schema';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card-2';

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

function categoryLabel(t: Test): string {
  return t.category === 'spiritual-profile' ? 'Spiritual Profile'
    : t.category === 'bible-iq' ? 'Bible IQ'
    : 'Bible Character';
}

// Subtle per-category gradient so the placeholder covers aren't monotonous.
function coverGradient(t: Test): string {
  if (t.category === 'spiritual-profile') return 'from-cream-1 to-sand';
  if (t.category === 'bible-iq') return 'from-cream-2 to-rose';
  return 'from-cream-1 to-rose';
}

export function QuizCard({ test }: { test: Test }) {
  const emoji = pickEmoji(test);
  return (
    <Link href={`/q/${test.slug}`} className="block h-full">
      <Card className="flex h-full flex-col">
        <CardHeader className="gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-2 text-xl">{emoji}</div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-snug line-clamp-2">{test.title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">{categoryLabel(test)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {/* Placeholder cover — swap for per-quiz art later (public/quizzes/<slug>.jpg). */}
          <div
            className={`flex w-full items-center justify-center bg-gradient-to-br ${coverGradient(test)}`}
            style={{ aspectRatio: '3 / 2' }}
          >
            <span className="text-6xl drop-shadow-sm">{emoji}</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-ink-soft">{describeMeta(test)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
