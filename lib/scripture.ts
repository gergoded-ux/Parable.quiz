// lib/scripture.ts
import scriptures from '@/content/shared/scriptures.json';

export interface Scripture {
  text: string;
  reference: string;
}

const map: Record<string, Scripture> = scriptures as Record<string, Scripture>;

export function getScripture(ref: string): Scripture {
  const s = map[ref];
  if (!s) throw new Error(`Unknown scriptureRef: ${ref}`);
  return s;
}

export function allScriptures(): Record<string, Scripture> {
  return map;
}
