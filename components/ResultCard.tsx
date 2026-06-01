// components/ResultCard.tsx
import { getScripture, type Scripture } from '@/lib/scripture';

// A result's verse can come inline or via a ref into shared/scriptures.json.
function resolveVerse(scripture?: Scripture, scriptureRef?: string): Scripture | null {
  if (scripture) return scripture;
  if (scriptureRef) return getScripture(scriptureRef);
  return null;
}

interface ArchetypeResultProps {
  mode: 'archetype';
  name: string;
  emoji: string;
  traits: string[];
  description: string;
  scriptureRef?: string;
  scripture?: Scripture;
}

interface ProfileResultProps {
  mode: 'profile';
  name: string;
  description: string;
  scriptureRef?: string;
  scripture?: Scripture;
  topDimensions: Array<{ dimension: string; score: number; label: string }>;
}

interface KnowledgeResultProps {
  mode: 'knowledge';
  percent: number;
  correct: number;
  total: number;
  bandLabel: string;
  message: string;
}

type Props = ArchetypeResultProps | ProfileResultProps | KnowledgeResultProps;

export function ResultCard(props: Props) {
  if (props.mode === 'archetype') {
    const verse = resolveVerse(props.scripture, props.scriptureRef);
    return (
      <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
        <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">You are</div>
        <div className="text-4xl font-extrabold text-brown-dark mb-2 -tracking-wide">{props.name}</div>
        <div className="text-6xl my-3">{props.emoji}</div>
        <div className="text-base text-ink-soft leading-relaxed mb-4">{props.description}</div>
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {props.traits.map(t => (
            <span key={t} className="bg-white text-brown rounded-full px-3 py-1 text-xs font-semibold">{t}</span>
          ))}
        </div>
        {verse && (
          <div className="border-t border-brown/15 pt-3 italic text-sm text-ink-soft">
            &ldquo;{verse.text}&rdquo; — {verse.reference}
          </div>
        )}
      </div>
    );
  }

  if (props.mode === 'profile') {
    const verse = resolveVerse(props.scripture, props.scriptureRef);
    return (
      <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
        <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">Your result</div>
        <div className="text-4xl font-extrabold text-brown-dark mb-3">{props.name}</div>
        <div className="text-base text-ink-soft leading-relaxed mb-4">{props.description}</div>
        <div className="space-y-2 text-left mt-4">
          {props.topDimensions.map(d => (
            <div key={d.dimension}>
              <div className="flex justify-between text-xs text-ink-soft mb-1">
                <span>{d.label}</span><span>{d.score}%</span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div className="h-full bg-brown" style={{ width: `${d.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        {verse && (
          <div className="border-t border-brown/15 pt-3 mt-4 italic text-sm text-ink-soft">
            &ldquo;{verse.text}&rdquo; — {verse.reference}
          </div>
        )}
      </div>
    );
  }

  // knowledge
  return (
    <div className="bg-gradient-to-br from-cream-1 to-rose border border-rose-dark/40 rounded-2xl shadow-card max-w-xl mx-auto p-8 text-center">
      <div className="text-xs uppercase tracking-[2px] text-ink-mute mb-2">Your score</div>
      <div className="text-6xl font-extrabold text-brown-dark mb-1">{props.percent}%</div>
      <div className="text-base text-ink-mute mb-3">{props.correct} of {props.total} correct</div>
      <div className="text-xl font-bold text-brown mb-2">{props.bandLabel}</div>
      <div className="text-base text-ink-soft">{props.message}</div>
    </div>
  );
}
