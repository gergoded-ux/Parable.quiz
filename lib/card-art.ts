// lib/card-art.ts
import manifest from '@/content/generated/art-manifest.json';
import coverManifest from '@/content/generated/cover-manifest.json';

// '' => same-origin (served from /public). Set CARD_ART_BASE to a Cloudflare
// base URL later (e.g. https://cdn.example.com) with no trailing slash.
const BASE = (process.env.CARD_ART_BASE ?? '').replace(/\/$/, '');
const HAVE = new Set(manifest as string[]);
const HAVE_COVERS = new Set(coverManifest as string[]);

export function hasIllustration(slug: string, key: string): boolean {
  return HAVE.has(`${slug}/${key}`);
}

// Quiz-pick cover image at public/quizzes/<slug>.jpg (landscape). Cards fall
// back to a gradient + emoji when a quiz has no cover yet.
export function hasQuizCover(slug: string): boolean {
  return HAVE_COVERS.has(slug);
}

export function quizCoverUrl(slug: string, ext: 'jpg' | 'webp' = 'jpg'): string {
  return `${BASE}/quizzes/${slug}.${ext}`;
}

export function artUrl(slug: string, key: string, ext: 'jpg' | 'webp' = 'jpg'): string {
  return `${BASE}/results/${slug}/${key}.${ext}`;
}

export function frameUrl(frameFile: string): string {
  return `${BASE}/cards/frames/${frameFile}`;
}
