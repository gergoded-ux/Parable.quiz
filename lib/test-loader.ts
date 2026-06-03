// lib/test-loader.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from './schema';
import type { Test as TestType } from './schema';
import publishedSlugs from '@/content/published.json';

const ROOT = join(process.cwd(), 'content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'] as const;

// content/published.json is the allowlist of quizzes that are LIVE on the site.
// Everything else stays in the repo as backlog (still loadable + validated) but
// is hidden from the homepage/sitemap/related and returns 404. Order = launch
// priority (from the autoresearch top-70), used to feature the most viral first.
const PUBLISHED = new Set(publishedSlugs as string[]);
const PUBLISHED_ORDER = new Map((publishedSlugs as string[]).map((s, i) => [s, i] as const));

let cache: TestType[] | null = null;

export function loadAllTests(): TestType[] {
  if (cache) return cache;
  const out: TestType[] = [];
  for (const bucket of BUCKETS) {
    const dir = join(ROOT, bucket);
    let files: string[];
    try {
      files = readdirSync(dir).filter(f => f.endsWith('.json'));
    } catch {
      continue;
    }
    for (const file of files) {
      const raw = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
      const parsed = Test.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`Invalid test JSON ${bucket}/${file}: ${parsed.error.message}`);
      }
      out.push(parsed.data);
    }
  }
  cache = out;
  return out;
}

export function loadTestBySlug(slug: string): TestType | null {
  return loadAllTests().find(t => t.slug === slug) ?? null;
}

/** True if a quiz is on the live allowlist (content/published.json). */
export function isPublished(slug: string): boolean {
  return PUBLISHED.has(slug);
}

/** Live quizzes only, sorted by launch priority (published.json order). */
export function loadPublishedTests(): TestType[] {
  return loadAllTests()
    .filter(t => PUBLISHED.has(t.slug))
    .sort((a, b) => (PUBLISHED_ORDER.get(a.slug)! - PUBLISHED_ORDER.get(b.slug)!));
}
