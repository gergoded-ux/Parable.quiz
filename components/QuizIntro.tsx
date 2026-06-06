// components/QuizIntro.tsx
// Start screen shown before the first question: cover art, title, what to expect,
// and a Begin button. Gives each quiz context instead of dropping straight into Q1.
'use client';
import { Wordmark } from './Wordmark';
import { hasQuizCover, quizCoverUrl } from '@/lib/card-art';
import type { Test } from '@/lib/schema';

function categoryLabel(test: Test): string {
  return test.category === 'spiritual-profile' ? 'Spiritual Profile'
    : test.category === 'bible-iq' ? 'Bible IQ'
    : 'Bible Character';
}

export function QuizIntro({ test, onStart }: { test: Test; onStart: () => void }) {
  const hasCover = hasQuizCover(test.slug);
  return (
    <>
      <div className="flex items-center border-b border-rose/50 px-8 py-4">
        <Wordmark size="sm" />
      </div>
      <main className="mx-auto max-w-lg px-6 py-10 sm:py-14">
        <div className="overflow-hidden rounded-card border-2 border-rose/50 bg-white shadow-[0_10px_30px_rgba(80,50,20,0.12)]">
          {hasCover ? (
            <img src={quizCoverUrl(test.slug)} alt="" className="w-full object-cover" style={{ aspectRatio: '3 / 2' }} />
          ) : (
            <div className="flex w-full items-center justify-center bg-gradient-to-br from-cream-1 to-rose" style={{ aspectRatio: '3 / 2' }}>
              <span className="text-6xl drop-shadow-sm">{test.mode === 'knowledge' ? '📖' : '✨'}</span>
            </div>
          )}
          <div className="px-6 py-7 text-center">
            <div className="mb-2 text-xs uppercase tracking-widest text-ink-mute">{categoryLabel(test)}</div>
            <h1 className="mb-2 text-2xl font-extrabold leading-tight text-brown-dark sm:text-3xl">{test.title}</h1>
            {test.subtitle && <p className="mx-auto mb-4 max-w-md text-ink-soft">{test.subtitle}</p>}
            <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-ink-mute">
              <span>{test.questions.length} questions</span>
              <span aria-hidden>·</span>
              <span>about {test.estimatedMinutes} min</span>
              <span aria-hidden>·</span>
              <span>{test.mode === 'knowledge' ? 'Scored' : 'Instant result'}</span>
            </div>
            <p className="mx-auto mb-6 max-w-md text-sm text-ink-soft">
              {test.mode === 'knowledge'
                ? 'A quick, scored check of how well you know this passage or topic.'
                : 'Answer honestly. Your choices map you to the biblical figure or theme you most reflect.'}
            </p>
            <button
              onClick={onStart}
              className="w-full rounded-full bg-brown px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Begin
            </button>
            <p className="mt-3 text-xs text-ink-mute">Free · No sign-up · For reflection, not a diagnosis</p>
          </div>
        </div>
      </main>
    </>
  );
}
