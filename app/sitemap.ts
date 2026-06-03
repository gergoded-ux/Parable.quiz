// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { loadPublishedTests } from '@/lib/test-loader';

const BASE = 'https://parable.quiz';

export default function sitemap(): MetadataRoute.Sitemap {
  const tests = loadPublishedTests();
  const out: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/about`, changeFrequency: 'yearly', priority: 0.3 },
  ];
  for (const t of tests) {
    out.push({ url: `${BASE}/q/${t.slug}`, changeFrequency: 'monthly', priority: 0.8 });
    if (t.mode === 'archetype' || t.mode === 'profile') {
      Object.keys(t.results).forEach(key => {
        out.push({ url: `${BASE}/q/${t.slug}/r/${key}`, changeFrequency: 'monthly', priority: 0.6 });
      });
    } else {
      for (let p = 0; p <= 100; p += 10) {
        out.push({ url: `${BASE}/q/${t.slug}/r/${p}`, changeFrequency: 'monthly', priority: 0.4 });
      }
    }
  }
  return out;
}
