// components/TestRunner.tsx
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import type { Test } from '@/lib/schema';
import { scoreArchetypeDetailed, scoreProfileDetailed, scoreKnowledge } from '@/lib/scoring';
import { hasQuizCover, quizCoverUrl } from '@/lib/card-art';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuizIntro } from './QuizIntro';
import { QuizRail, QuizStrip } from './QuizContext';
import { Wordmark } from './Wordmark';
import { AdSlot } from './AdSlot';

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
};

export function TestRunner({ test }: { test: Test }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<number[]>([]);
  const totalQuestions = test.questions.length;
  const hasCover = hasQuizCover(test.slug);

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const furthestRef = useRef(1);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { furthestRef.current = Math.max(furthestRef.current, step + 1); }, [step]);

  // Fire quiz_abandon on unmount if the quiz was started but not finished.
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (startedRef.current && !completedRef.current) {
      track('quiz_abandon', { slug: test.slug, mode: test.mode, question: furthestRef.current, total: totalQuestions });
    }
  }, [test.slug, test.mode, totalQuestions]);

  function begin() {
    startedRef.current = true;
    setStarted(true);
    track('quiz_start', { slug: test.slug, mode: test.mode });
  }

  const currentAnswer = answers[step] ?? null;
  const isLast = step === totalQuestions - 1;

  function finish(allAnswers: number[]) {
    // Guarantee one valid answer per question before scoring. An interrupted flow
    // (or a browser extension swallowing a tap) could otherwise leave a gap, which
    // crashed the scorer. Any missing/invalid answer defaults to the first option.
    const safe = test.questions.map((q, i) => {
      const a = allAnswers[i];
      return Number.isInteger(a) && a >= 0 && a < q.options.length ? a : 0;
    });
    let resultKey: string; let m = 0;
    if (test.mode === 'archetype') {
      const d = scoreArchetypeDetailed(test, safe); resultKey = d.winner; m = d.matchPct;
    } else if (test.mode === 'profile') {
      const d = scoreProfileDetailed(test, safe); resultKey = d.top; m = d.matchPct;
    } else {
      const r = scoreKnowledge(test, safe); resultKey = String(r.percent); m = r.percent;
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    completedRef.current = true;
    setCalculating(true); // brief anticipation beat before the result
    const url = `/q/${test.slug}/r/${resultKey}?m=${m}`;
    revealTimer.current = setTimeout(() => router.push(url), 1100);
  }

  // Auto-advance: picking an answer records it, briefly shows the selection, then
  // moves on. Re-tapping within the window changes the answer and resets the timer.
  function pick(idx: number) {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      if (isLast) { finish(next); return; }
      setDirection(1);
      setStep(s => s + 1);
    }, 400);
  }

  function goBack() {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    if (step > 0) { setDirection(-1); setStep(step - 1); }
  }

  // Keyboard: 1-9 pick an option, ArrowLeft goes back.
  useEffect(() => {
    if (!started || calculating) return;
    function onKey(e: KeyboardEvent) {
      const n = test.questions[step]?.options.length ?? 0;
      if (/^[1-9]$/.test(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        if (i < n) { e.preventDefault(); pick(i); }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); goBack();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, calculating, step, answers]); // eslint-disable-line react-hooks/exhaustive-deps

  const showMidAd = useMemo(() => step === 2 && totalQuestions >= 6, [step, totalQuestions]);

  if (!started) return <QuizIntro test={test} onStart={begin} />;

  if (calculating) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[78vh] flex-col items-center justify-center px-6 text-center">
        {hasCover && (
          <motion.img
            src={quizCoverUrl(test.slug)}
            alt=""
            className="mb-6 h-28 w-28 rounded-2xl object-cover shadow-[0_10px_30px_rgba(80,50,20,0.18)]"
            animate={{ scale: [1, 1.06, 1], opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <p className="text-lg font-semibold text-brown-dark">Calculating your result</p>
        <p className="mt-1 text-sm text-ink-soft">{test.mode === 'knowledge' ? 'Tallying your score…' : 'Matching you to scripture…'}</p>
      </div>
    );
  }

  const encouragement = isLast
    ? 'Last question. Pick to reveal your result'
    : step >= totalQuestions - 2
      ? 'Almost there'
      : 'Tap an answer to continue';

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-5 border-b border-rose/50 bg-cream-1/80 px-8 py-4 backdrop-blur">
        <Wordmark size="sm" />
        <ProgressBar current={step + 1} total={totalQuestions} label={test.title} />
      </div>
      <QuizStrip test={test} step={step} />
      <div className="relative">
        {hasCover && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 overflow-hidden lg:hidden">
            <img
              src={quizCoverUrl(test.slug)}
              alt=""
              className="h-full w-full scale-110 object-cover opacity-25 blur-2xl"
              style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }}
            />
          </div>
        )}
        <main className="relative mx-auto max-w-5xl px-6 py-12 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10">
          <QuizRail test={test} />
          <div className="max-w-2xl">
            <div aria-live="polite">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <QuestionCard
                  questionNumber={step + 1}
                  questionText={test.questions[step].text}
                  options={test.questions[step].options.map(o => ({ text: o.text }))}
                  selectedIndex={currentAnswer}
                  onSelect={pick}
                />
              </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button onClick={goBack} disabled={step === 0} className="rounded-full border border-rose-dark/60 px-4 py-2 text-sm font-medium text-brown transition-colors hover:bg-cream-1 disabled:opacity-30">
                ← Back
              </button>
              <span className="text-xs text-ink-mute">{encouragement}</span>
            </div>
          </div>
        </main>
      </div>
      {showMidAd && <AdSlot slot="mid-quiz" />}
    </>
  );
}
