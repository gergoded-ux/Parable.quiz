// lib/blog.ts
// Markdown-based blog. Each article lives in its own folder:
//   content/blog/<slug>/index.md       the article (frontmatter + Markdown body)
//   content/blog/<slug>/transcripts/   raw source material (gitignored, not built)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const DIR = join(process.cwd(), 'content', 'blog');

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  quiz: string; // related quiz slug to embed
  collection: string;
  published: boolean;
  html: string;
};

function parse(slug: string): Post | null {
  const file = join(DIR, slug, 'index.md');
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, 'utf-8');
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) return null;
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return {
    slug,
    title: fm.title ?? slug,
    description: fm.description ?? '',
    date: fm.date ?? '',
    quiz: fm.quiz ?? '',
    collection: fm.collection ?? '',
    published: fm.published === 'true',
    html: marked.parse(m[2], { async: false }) as string,
  };
}

let cache: Post[] | null = null;

export function loadAllPosts(): Post[] {
  if (cache) return cache;
  let slugs: string[] = [];
  try {
    slugs = readdirSync(DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    slugs = [];
  }
  cache = slugs.map(parse).filter((p): p is Post => !!p);
  return cache;
}

export function loadPostBySlug(slug: string): Post | null {
  return loadAllPosts().find((p) => p.slug === slug) ?? null;
}

export function loadPublishedPosts(): Post[] {
  return loadAllPosts()
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
