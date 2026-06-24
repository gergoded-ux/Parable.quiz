'use client';
import { useEffect } from 'react';
import { saveCard } from '@/lib/collection';
import type { CardData } from '@/lib/card-data';

// Drops the viewed result (full card data) into the visitor's localStorage binder.
export function SaveToCollection({ data }: { data: CardData }) {
  useEffect(() => {
    saveCard(data);
  }, [data.slug, data.key]); // re-save only when the card identity changes
  return null;
}
