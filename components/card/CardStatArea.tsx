// components/card/CardStatArea.tsx
import { CARD } from '@/lib/card-layout';

export interface StatRow { label: string; value: number } // value 0-100, shown as "value%" or "value"

export function CardStatArea({ rows, suffix = '%', heading }: { rows: StatRow[]; suffix?: string; heading?: string }) {
  return (
    <div style={{ width: '92%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {heading && <div style={{ fontFamily: CARD.fonts.body, fontSize: 9, letterSpacing: 2, color: CARD.ink.mute, fontWeight: 800 }}>{heading}</div>}
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: CARD.fonts.body, fontSize: 11, color: CARD.ink.strong }}>
          <span style={{ width: 70, textAlign: 'left', fontWeight: 600 }}>{r.label}</span>
          <span style={{ flex: 1, height: 6, background: 'rgba(120,74,13,0.18)', borderRadius: 9, overflow: 'hidden', display: 'flex' }}>
            <span style={{ width: `${Math.max(0, Math.min(100, r.value))}%`, height: '100%', borderRadius: 9, background: 'linear-gradient(90deg,#b8932f,#6b4423)' }} />
          </span>
          <span style={{ width: 30, textAlign: 'right', fontWeight: 800 }}>{r.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}
