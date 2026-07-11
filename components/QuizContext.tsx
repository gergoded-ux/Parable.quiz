// components/QuizContext.tsx
// Keeps the quiz's cover image, verse(s), and possible-results list visible
// WHILE answering questions (not just on the pre-quiz QuizIntro screen).
// QuizRail: a sticky desktop column beside the question, always expanded.
// QuizStrip: a mobile bar flush under the header that expands on tap and
// auto-collapses on the next question, so it never buries the next answer.
'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { hasQuizCover, quizCoverUrl } from '@/lib/card-art';
import type { Test } from '@/lib/schema';

function Verses({ test }: { test: Test }) {
  if (!test.verses?.length) return null;
  return (
    <div className="space-y-3">
      {test.verses.map((v) => (
        <blockquote key={v.reference} className="border-l-2 border-rose-dark/50 pl-3 text-sm italic text-ink-soft">
          &ldquo;{v.text}&rdquo;
          <footer className="mt-1 text-xs not-italic text-ink-mute">{v.reference} ({v.translation ?? 'ASV'})</footer>
        </blockquote>
      ))}
    </div>
  );
}

function ResultsToggle({ test }: { test: Test }) {
  const [listOpen, setListOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  if (test.mode === 'knowledge') return null;
  const entries = Object.entries(test.results);
  const openDescription = entries.find(([key]) => key === openKey)?.[1].description;
  return (
    <div className="mt-4 border-t border-rose/40 pt-3">
      <button
        type="button"
        onClick={() => setListOpen((o) => !o)}
        aria-expanded={listOpen}
        className="text-xs font-semibold uppercase tracking-widest text-brown hover:underline"
      >
        Who could I get? ({entries.length}) {listOpen ? '−' : '+'}
      </button>
      {listOpen && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5">
            {entries.map(([key, r]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOpenKey((k) => (k === key ? null : key))}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  openKey === key ? 'border-brown bg-cream-1 text-brown-dark' : 'border-rose/50 bg-white text-ink-soft hover:border-rose-dark'
                )}
              >
                {'emoji' in r && <>{r.emoji as string} </>}{r.name}
              </button>
            ))}
          </div>
          {openDescription && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{openDescription}</p>}
        </div>
      )}
    </div>
  );
}

function hasAnyContent(test: Test, cover: string | null): boolean {
  return !!cover || !!test.about || !!test.verses?.length;
}

/** Sticky desktop rail: cover, about, verses, and a collapsed results toggle. Always expanded. */
export function QuizRail({ test }: { test: Test }) {
  const cover = hasQuizCover(test.slug) ? quizCoverUrl(test.slug) : null;
  if (!hasAnyContent(test, cover)) return null;
  return (
    <aside className="hidden lg:sticky lg:top-[96px] lg:block lg:h-fit lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto">
      <div className="rounded-card border border-rose/50 bg-white p-4">
        {cover && <img src={cover} alt="" className="mb-3 w-full rounded-lg object-cover" style={{ aspectRatio: '3 / 2' }} />}
        {test.about && <p className="mb-3 text-sm leading-relaxed text-ink-soft">{test.about}</p>}
        <Verses test={test} />
        <ResultsToggle test={test} />
      </div>
    </aside>
  );
}

/** Mobile-only bar flush under the sticky header; expands on tap, collapses when `step` changes. */
export function QuizStrip({ test, step }: { test: Test; step: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [step]);

  const cover = hasQuizCover(test.slug) ? quizCoverUrl(test.slug) : null;
  const firstVerse = test.verses?.[0];
  if (!hasAnyContent(test, cover)) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 border-b border-rose/50 bg-cream-1/90 px-4 py-2 text-left"
      >
        {cover && <img src={cover} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
        <span className="min-w-0 flex-1 truncate text-xs italic text-ink-soft">
          {firstVerse ? `“${firstVerse.text}”` : 'About this quiz'}
        </span>
        <span className="shrink-0 text-ink-mute" aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      <div aria-hidden={!open} style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 300ms ease' }}>
        <div className="overflow-hidden">
          <div className="border-b border-rose/50 bg-cream-1/60 px-4 py-3">
            {test.about && <p className="mb-3 text-sm leading-relaxed text-ink-soft">{test.about}</p>}
            <Verses test={test} />
            <ResultsToggle test={test} />
          </div>
        </div>
      </div>
    </div>
  );
}
