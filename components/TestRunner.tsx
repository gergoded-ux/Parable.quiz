// components/TestRunner.tsx
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import type { Test } from '@/lib/schema';
import { scoreArchetypeDetailed, scoreProfileDetailed, scoreKnowledge } from '@/lib/scoring';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuizIntro } from './QuizIntro';
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
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<number[]>([]);
  const totalQuestions = test.questions.length;

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const furthestRef = useRef(1);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { furthestRef.current = Math.max(furthestRef.current, step + 1); }, [step]);

  // Fire quiz_abandon on unmount if the quiz was started but not finished.
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
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
    let resultKey: string; let m = 0;
    if (test.mode === 'archetype') {
      const d = scoreArchetypeDetailed(test, allAnswers); resultKey = d.winner; m = d.matchPct;
    } else if (test.mode === 'profile') {
      const d = scoreProfileDetailed(test, allAnswers); resultKey = d.top; m = d.matchPct;
    } else {
      const r = scoreKnowledge(test, allAnswers); resultKey = String(r.percent); m = r.percent;
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    completedRef.current = true;
    router.push(`/q/${test.slug}/r/${resultKey}?m=${m}`);
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
    }, 260);
  }

  function goBack() {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    if (step > 0) { setDirection(-1); setStep(step - 1); }
  }

  const showMidAd = useMemo(() => step === 2 && totalQuestions >= 6, [step, totalQuestions]);

  if (!started) return <QuizIntro test={test} onStart={begin} />;

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-5 border-b border-rose/50 bg-cream-1/80 px-8 py-4 backdrop-blur">
        <Wordmark size="sm" />
        <ProgressBar current={step + 1} total={totalQuestions} label={test.title} />
      </div>
      <main className="mx-auto max-w-2xl px-6 py-12">
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
        <div className="mt-6 flex items-center justify-between">
          <button onClick={goBack} disabled={step === 0} className="text-sm text-ink-mute disabled:opacity-30">
            ← Back
          </button>
          <span className="text-xs text-ink-mute">{isLast ? 'Pick an answer to see your result' : 'Tap an answer to continue'}</span>
        </div>
      </main>
      {showMidAd && <AdSlot slot="mid-quiz" />}
    </>
  );
}
