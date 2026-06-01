// lib/test-loader.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from './schema';
import type { Test as TestType } from './schema';

const ROOT = join(process.cwd(), 'content', 'tests');
const BUCKETS = ['archetype', 'profile', 'knowledge'] as const;

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
