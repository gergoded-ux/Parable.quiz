// components/TestRunner.tsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import type { Test } from '@/lib/schema';
import { scoreArchetype, scoreProfile, scoreKnowledge } from '@/lib/scoring';
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
    let resultKey: string;
    if (test.mode === 'archetype') {
      resultKey = scoreArchetype(test, answers);
    } else if (test.mode === 'profile') {
      const r = scoreProfile(test, answers);
      const top = Object.entries(r).sort((a, b) => b[1] - a[1])[0];
      resultKey = top[0];
    } else {
      const r = scoreKnowledge(test, answers);
      resultKey = String(r.percent);
    }
    track('quiz_complete', { slug: test.slug, mode: test.mode, result: resultKey });
    router.push(`/q/${test.slug}/r/${resultKey}`);
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
