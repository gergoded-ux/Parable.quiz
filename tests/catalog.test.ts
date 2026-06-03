// tests/catalog.test.ts
import { describe, it, expect } from 'vitest';
import { buildCatalog, renderCatalogMarkdown } from '@/lib/catalog';
import type { Test } from '@/lib/schema';

const t = (over: Partial<Test>): Test => ({
  slug: 'x', title: 'X', lang: 'en', category: 'bible-character',
  theme: 'identity', estimatedMinutes: 4, mode: 'archetype',
  questions: [], results: {}, ...over,
} as Test);

describe('buildCatalog', () => {
  const entries = buildCatalog({
    tests: [
      t({ slug: 'a', title: 'A', theme: 'identity' }),
      t({ slug: 'b', title: 'B', theme: 'anxiety', category: 'spiritual-profile', mode: 'profile' }),
    ],
    published: new Set(['a']),
    covers: new Set(['b']),
    virality: new Map([['a', 95]]),
  });

  it('marks live vs backlog', () => {
    expect(entries.find(e => e.slug === 'a')!.status).toBe('live');
    expect(entries.find(e => e.slug === 'b')!.status).toBe('backlog');
  });
  it('reports cover + virality', () => {
    expect(entries.find(e => e.slug === 'b')!.hasCover).toBe(true);
    expect(entries.find(e => e.slug === 'a')!.virality).toBe(95);
    expect(entries.find(e => e.slug === 'b')!.virality).toBeNull();
  });
});

describe('renderCatalogMarkdown', () => {
  it('includes a summary line and a table', () => {
    const md = renderCatalogMarkdown(buildCatalog({
      tests: [t({ slug: 'a', title: 'A' })],
      published: new Set(['a']), covers: new Set(), virality: new Map(),
    }));
    expect(md).toContain('1** quizzes');
    expect(md).toContain('| Title |');
    expect(md).toContain('`a`');
  });
});
