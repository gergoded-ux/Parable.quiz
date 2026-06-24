import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PUBLISHED_SLUGS } from '@/lib/collections';

const published = JSON.parse(readFileSync('content/published.json', 'utf-8')) as string[];

describe('collections', () => {
  it('has no duplicate slugs', () => {
    expect(PUBLISHED_SLUGS.length).toBe(new Set(PUBLISHED_SLUGS).size);
  });

  it('stays in sync with content/published.json', () => {
    expect(new Set(PUBLISHED_SLUGS)).toEqual(new Set(published));
  });
});
