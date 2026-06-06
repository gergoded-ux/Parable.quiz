"use client";
import Link from 'next/link';
import type { Test } from '@/lib/schema';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card-2';
import { FitText } from '@/components/FitText';
import { track } from '@vercel/analytics';
import { hasQuizCover, quizCoverUrl } from '@/lib/card-art';

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
    <Link href={`/q/${test.slug}`} onClick={() => track('quiz_card_click', { slug: test.slug })} className="block h-full">
      <Card className="flex h-full flex-col">
        <CardHeader className="gap-2.5 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-2 text-base">{emoji}</div>
          <div className="min-w-0 flex-1">
            <CardTitle><FitText text={test.title} max={15} min={5} /></CardTitle>
            <CardDescription className="mt-0.5 text-[11px]">{categoryLabel(test)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {/* Real cover art if present (public/quizzes/<slug>.jpg), else a warm
              gradient + emoji placeholder. */}
          {hasQuizCover(test.slug) ? (
            <img
              src={quizCoverUrl(test.slug)}
              alt=""
              className="w-full object-cover"
              style={{ aspectRatio: '3 / 2' }}
            />
          ) : (
            <div
              className={`flex w-full items-center justify-center bg-gradient-to-br ${coverGradient(test)}`}
              style={{ aspectRatio: '3 / 2' }}
            >
              <span className="text-5xl drop-shadow-sm">{emoji}</span>
            </div>
          )}
          <div className="px-3 py-2.5">
            <p className="text-xs font-medium text-ink-soft">{describeMeta(test)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
