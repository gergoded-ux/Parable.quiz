'use client';
import { useEffect } from 'react';
import { saveCard } from '@/lib/collection';

// Drops the viewed result into the visitor's localStorage collection.
// (prop is resultKey, not key, since React reserves the key prop.)
export function SaveToCollection({ slug, resultKey, artKey, name, matchPct }: {
  slug: string; resultKey: string; artKey: string; name: string; matchPct: number | null;
}) {
  useEffect(() => {
    saveCard({ slug, key: resultKey, artKey, name, matchPct });
  }, [slug, resultKey, artKey, name, matchPct]);
  return null;
}
