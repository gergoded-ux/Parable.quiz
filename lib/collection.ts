// lib/collection.ts
// Client-only collection store: the full card a visitor earned, kept in
// localStorage keyed by "slug:key" so re-viewing a result updates in place.
// We store the whole CardData so the binder can render the real card without
// reloading quiz data on the client.
// ponytail: no backend, device-bound by design. Accounts/sync later.
import type { CardData } from './card-data';

export type SavedCard = CardData & { ts: number };

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

export function saveCard(card: CardData): void {
  if (typeof window === 'undefined') return;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) || '{}');
    const map: Record<string, SavedCard> = isMap(parsed) ? parsed : {};
    map[`${card.slug}:${card.key}`] = { ...card, ts: Date.now() };
    localStorage.setItem(STORE, JSON.stringify(map));
  } catch {}
}
