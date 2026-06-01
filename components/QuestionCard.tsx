// components/QuestionCard.tsx
'use client';
import { cn } from '@/lib/cn';

interface Option { text: string }

export function QuestionCard({
  questionNumber,
  questionText,
  options,
  selectedIndex,
  onSelect,
}: {
  questionNumber: number;
  questionText: string;
  options: Option[];
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ink-mute mb-2">Question {questionNumber}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-brown-dark leading-snug mb-6">{questionText}</h2>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'text-left bg-white border-2 rounded-card px-5 py-4 text-base transition-colors',
              selectedIndex === i
                ? 'border-brown bg-cream-1'
                : 'border-rose/50 hover:border-rose-dark hover:bg-cream-1/40'
            )}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}
