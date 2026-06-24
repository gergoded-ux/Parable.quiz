// lib/collection.ts
// Client-only collection store: the cards a visitor has earned, kept in
// localStorage keyed by "slug:key" so re-viewing a result updates in place.
// ponytail: no backend, device-bound by design. Accounts/sync = later.
export type SavedCard = { slug: string; key: string; artKey: string; name: string; matchPct: number | null; ts: number };

const STORE = 'eikonia:cards';

// Guard against legacy/foreign values so a stray array/primitive can't make
// saveCard silently drop writes.
const isMap = (v: unknown): v is Record<string, SavedCard> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

export function loadCards(): SavedCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) || '{}');
    return isMap(parsed) ? (Object.values(parsed) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

export function saveCard(c: Omit<SavedCard, 'ts'>): void {
  if (typeof window === 'undefined') return;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) || '{}');
    const map: Record<string, SavedCard> = isMap(parsed) ? parsed : {};
    map[`${c.slug}:${c.key}`] = { ...c, ts: Date.now() };
    localStorage.setItem(STORE, JSON.stringify(map));
  } catch {}
}
