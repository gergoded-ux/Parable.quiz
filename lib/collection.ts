// lib/collection.ts
// Client-only collection store: the full card a visitor earned, kept in
// localStorage keyed by "slug:key" so re-viewing a result updates in place.
// We store the whole CardData so the binder can render the real card without
// reloading quiz data on the client.
// ponytail: no backend, device-bound by design. Accounts/sync later.
import type { CardData } from './card-data';
import { COLLECTIONS } from './collections';

export type SavedCard = CardData & { ts: number };

const STORE = 'eikonia:cards';
const FAVS = 'eikonia:favorites';

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

export function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const p = JSON.parse(localStorage.getItem(FAVS) || '[]');
    return Array.isArray(p) ? (p as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string): string[] {
  if (typeof window === 'undefined') return [];
  const set = new Set(loadFavorites());
  if (set.has(slug)) set.delete(slug);
  else set.add(slug);
  const arr = [...set];
  try {
    localStorage.setItem(FAVS, JSON.stringify(arr));
  } catch {}
  return arr;
}

// The collection closest to completion (started but not finished), for nudges.
export function nextGap(ownedSlugs: Set<string>): { id: string; title: string; remaining: number } | null {
  let best: { id: string; title: string; remaining: number } | null = null;
  for (const c of COLLECTIONS) {
    const have = c.slugs.filter((s) => ownedSlugs.has(s)).length;
    if (have > 0 && have < c.slugs.length) {
      const remaining = c.slugs.length - have;
      if (!best || remaining < best.remaining) best = { id: c.id, title: c.title, remaining };
    }
  }
  return best;
}

// Deterministic weekly index (rotates once a week, no backend needed).
export function weeklyIndex(len: number, now: number = Date.now()): number {
  if (len <= 0) return 0;
  return Math.floor(now / (7 * 86400000)) % len;
}
