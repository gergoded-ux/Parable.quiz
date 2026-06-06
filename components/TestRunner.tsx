// components/TestRunner.tsx
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import type { Test } from '@/lib/schema';
import { scoreArchetypeDetailed, scoreProfileDetailed, scoreKnowledge } from '@/lib/scoring';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { Wordmark } from './Wordmark';
import { AdSlot } from './AdSlot';

export function TestRunner({ test }: { test: Test }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const totalQuestions = test.questions.length;

  useEffect(() => {
    track('quiz_start', { slug: test.slug, mode: test.mode });
  }, [test.slug, test.mode]);

  // Drop-off tracking: remember the furthest question reached, then on unmount
  // fire quiz_abandon if they left the quiz before finishing.
  const completedRef = useRef(false);
  const furthestRef = useRef(1);
  useEffect(() => { furthestRef.current = Math.max(furthestRef.current, step + 1); }, [step]);
  useEffect(() => {
    return () => {
      if (!completedRef.current) {
        track('quiz_abandon', { slug: test.slug, mode: test.mode, question: furthestRef.current, total: totalQuestions });
      }
    };
  }, [test.slug, test.mode, totalQuestions]);

  const currentAnswer = answers[step] ?? null;
  const isLast = step === totalQuestions - 1;

  function pick(idx: number) {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
  }

  function goNext() {
    if (currentAnswer === null) return;
    if (!isLast) { setStep(step + 1); return; }
    let resultKey: string; let m = 0;
    if (test.mode === 'archetype') {
      const d = scoreArchetypeDetailed(test, answers); resultKey = d.winner; m = d.matchPct;
    } else if (test.mode === 'profile') {
      const d = scoreProfileDetailed(test, answers); resultKey = d.top; m = d.matchPct;
    } else {
      const r = scoreKnowledge(test, answers); resultKey = String(r.percent); m = r.percent;
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    completedRef.current = true; // so the unmount handler does not log an abandon
    router.push(`/q/${test.slug}/r/${resultKey}?m=${m}`);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  const showMidAd = useMemo(() => step === 2 && totalQuestions >= 6, [step, totalQuestions]);

  return (
    <>
      <div className="flex items-center gap-5 px-8 py-4 border-b border-rose/50 sticky top-0 bg-cream-1/80 backdrop-blur">
        <Wordmark size="sm" />
        <ProgressBar current={step + 1} total={totalQuestions} label={test.title} />
      </div>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <QuestionCard
          questionNumber={step + 1}
          questionText={test.questions[step].text}
          options={test.questions[step].options.map(o => ({ text: o.text }))}
          selectedIndex={currentAnswer}
          onSelect={pick}
        />
        <div className="flex justify-between mt-6">
          <button onClick={goBack} disabled={step === 0} className="text-ink-mute disabled:opacity-30 text-sm">
            ← Back
          </button>
          <button
            onClick={goNext}
            disabled={currentAnswer === null}
            className="bg-brown text-white px-6 py-3 rounded-full font-semibold text-sm disabled:opacity-40"
          >
            {isLast ? 'See result →' : 'Next →'}
          </button>
        </div>
      </main>
      {showMidAd && <AdSlot slot="mid-quiz" />}
    </>
  );
}
