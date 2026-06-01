// components/ProgressBar.tsx
export function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  return (
    <div className="flex-1">
      <div className="h-1.5 bg-sand rounded-full overflow-hidden">
        <div className="h-full bg-brown transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-ink-mute mt-1">
        Question {current} of {total}{label ? ` · ${label}` : ''}
      </div>
    </div>
  );
}
