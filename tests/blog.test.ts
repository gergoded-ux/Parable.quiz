import { describe, it, expect } from 'vitest';
import { loadAllPosts, loadPublishedPosts } from '@/lib/blog';

describe('blog', () => {
  it('loads every article folder', () => {
    expect(loadAllPosts().length).toBeGreaterThanOrEqual(16);
  });

  it('published articles parse cleanly', () => {
    const posts = loadPublishedPosts();
    expect(posts.length).toBeGreaterThanOrEqual(16);
    for (const p of posts) {
      expect(p.published).toBe(true);
      expect(p.quiz).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.html).toContain('<'); // frontmatter stripped, body rendered to HTML
    }
  });
});
