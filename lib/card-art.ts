// lib/card-art.ts
import manifest from '@/content/generated/art-manifest.json';
import coverManifest from '@/content/generated/cover-manifest.json';

// '' => same-origin (served from /public). Set CARD_ART_BASE to a Cloudflare
// base URL later (e.g. https://cdn.example.com) with no trailing slash.
const BASE = (process.env.CARD_ART_BASE ?? '').replace(/\/$/, '');
// manifest entries are now "slug/key.ext"; map the extensionless key to the file.
const ART_BY_KEY = new Map<string, string>(
  (manifest as string[]).map((rel) => [rel.replace(/\.(jpg|jpeg|webp|png)$/i, ''), rel]),
);
// Map quiz slug -> actual cover filename (with extension), so covers can be
// .png/.jpg/.webp without the renderer guessing the extension.
const COVER_BY_SLUG = new Map<string, string>(
  (coverManifest as string[]).map((f) => [f.replace(/\.(jpg|jpeg|webp|png)$/i, ''), f]),
);

export function hasIllustration(slug: string, key: string): boolean {
  return ART_BY_KEY.has(`${slug}/${key}`);
}

// Quiz-pick cover image at public/quizzes/<slug>.<ext> (landscape). Cards fall
// back to a gradient + emoji when a quiz has no cover yet.
export function hasQuizCover(slug: string): boolean {
  return COVER_BY_SLUG.has(slug);
}

export function quizCoverUrl(slug: string): string {
  const file = COVER_BY_SLUG.get(slug);
  return file ? `${BASE}/quizzes/${file}` : '';
}

export function artUrl(slug: string, key: string): string {
  const rel = ART_BY_KEY.get(`${slug}/${key}`);
  return rel ? `${BASE}/results/${rel}` : '';
}

export function frameUrl(frameFile: string): string {
  return `${BASE}/cards/frames/${frameFile}`;
}
