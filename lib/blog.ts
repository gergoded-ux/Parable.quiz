// lib/blog.ts
// Markdown-based blog. Each article is content/blog/<slug>.md with frontmatter
// (title, description, date, quiz, collection, published) + a Markdown body.
import { readdirSync, readFileSync } from 'node:fs';
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

function parse(file: string): Post | null {
  const raw = readFileSync(join(DIR, file), 'utf-8');
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
    slug: file.replace(/\.md$/, ''),
    title: fm.title ?? file,
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
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
  } catch {
    files = [];
  }
  cache = files.map(parse).filter((p): p is Post => !!p);
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
