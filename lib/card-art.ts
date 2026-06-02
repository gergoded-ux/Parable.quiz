// lib/card-art.ts
import manifest from '@/content/generated/art-manifest.json';

// '' => same-origin (served from /public). Set CARD_ART_BASE to a Cloudflare
// base URL later (e.g. https://cdn.example.com) with no trailing slash.
const BASE = (process.env.CARD_ART_BASE ?? '').replace(/\/$/, '');
const HAVE = new Set(manifest as string[]);

export function hasIllustration(slug: string, key: string): boolean {
  return HAVE.has(`${slug}/${key}`);
}

export function artUrl(slug: string, key: string, ext: 'jpg' | 'webp' = 'jpg'): string {
  return `${BASE}/results/${slug}/${key}.${ext}`;
}

export function frameUrl(frameFile: string): string {
  return `${BASE}/cards/frames/${frameFile}`;
}
