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
      <div className="mb-2 text-xs uppercase tracking-widest text-ink-mute">Question {questionNumber}</div>
      <h2 className="mb-6 text-2xl font-bold leading-snug text-brown-dark md:text-3xl">{questionText}</h2>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={questionText}>
        {options.map((o, i) => {
          const selected = selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(i)}
              className={cn(
                'group flex items-center gap-3.5 rounded-card border-2 px-4 py-4 text-left text-base transition-all duration-150',
                'hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(80,50,20,0.10)]',
                selected
                  ? 'border-brown bg-cream-1 shadow-[0_6px_18px_rgba(80,50,20,0.12)]'
                  : 'border-rose/50 bg-white hover:border-rose-dark'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  selected ? 'bg-brown text-white' : 'bg-cream-2 text-brown group-hover:bg-rose/40'
                )}
                aria-hidden
              >
                {selected ? '✓' : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
