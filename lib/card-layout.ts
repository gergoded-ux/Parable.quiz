// lib/card-layout.ts
// Single source of truth for card colors/fonts so the live DOM card and the
// server next/og card render identically.
export const CARD = {
  width: 1080,
  height: 1350,
  fonts: { display: 'Cinzel', body: 'Inter', serifItalic: 'EB Garamond' },
  panel: { bg: 'rgba(253,250,238,0.95)', border: 'rgba(212,175,55,0.6)' },
  ink: { strong: '#3a2410', body: '#4a2f15', soft: '#7a5a2a', mute: '#a9762e', wm: '#6b4423' },
  star: {
    green:    { from: '#bff0a0', to: '#3d9b4a' },
    sapphire: { from: '#a6d6f2', to: '#2f7fc0' },
    purple:   { from: '#dcb6f7', to: '#7c3aa0' },
    gold:     { from: '#f6d97a', to: '#c8961f' },
  },
} as const;

// Panel inset geometry, shared by the live DOM card and the next/og renderer.
export const PANEL = { left: '16.5%', right: '16.5%', top: '18.5%', bottom: '12%' } as const;

// Banded auto-fit for the result name. Profile names are full sentences
// (up to ~48 chars), so a single fixed size overflows the title box.
export function nameFontSize(name: string): number {
  const n = name.length;
  if (n <= 8) return 30;
  if (n <= 14) return 24;
  if (n <= 22) return 19;
  if (n <= 34) return 16;
  return 13;
}
