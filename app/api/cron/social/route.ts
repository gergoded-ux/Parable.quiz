// app/api/cron/social/route.ts
// Daily cron: posts the Social Media Post Tracker's due "Scheduled" rows to
// Threads / Facebook / Instagram via the Graph APIs, then writes the result back
// (Published + Live URL on success, In review + error note on failure).
//
// Secured by CRON_SECRET (Vercel Cron sends it as `Authorization: Bearer <secret>`).
// Inert until the platform credentials are set AND a row is moved to Scheduled, so
// nothing posts by accident. See docs/marketing/social-cron-setup.md.
import { NextResponse } from 'next/server';
import { queryDueRows, markPublished, markFailed, type DueRow } from '@/lib/social/notion';
import { postThreads } from '@/lib/social/threads';
import { postFacebook } from '@/lib/social/facebook';
import { postInstagram } from '@/lib/social/instagram';
import { postPinterest } from '@/lib/social/pinterest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE = process.env.SITE_URL ?? 'https://eikonia.art';

function slugFromQuiz(url: string | null): string | null {
  const m = url?.match(/\/q\/([^/?#]+)/);
  return m ? m[1] : null;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  let rows: DueRow[];
  try {
    rows = await queryDueRows(today);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  const summary = { date: today, posted: 0, skipped: 0, failed: 0, details: [] as Record<string, unknown>[] };

  for (const row of rows) {
    try {
      // Instagram needs an image; for a quiz row we derive the titled tile from the slug.
      const tile = (() => {
        const slug = slugFromQuiz(row.postUrl);
        return slug ? `${SITE}/api/social-image?type=tile&slug=${encodeURIComponent(slug)}` : null;
      })();

      let result: { permalink?: string };
      switch (row.platform) {
        case 'Threads':
          result = await postThreads({ text: row.caption, imageUrl: row.imageUrl, linkUrl: row.postUrl });
          break;
        case 'Facebook':
          result = await postFacebook({ text: row.caption, imageUrl: row.imageUrl, linkUrl: row.postUrl });
          break;
        case 'Instagram': {
          const image = row.imageUrl ?? tile;
          if (!image) {
            summary.skipped++;
            summary.details.push({ title: row.title, platform: row.platform, status: 'skipped: Instagram needs an image (set Image, or use a quiz link)' });
            continue;
          }
          result = await postInstagram({ caption: row.caption, imageUrl: image });
          break;
        }
        case 'Pinterest': {
          const image = row.imageUrl ?? tile;
          const board = process.env.PINTEREST_BOARD_ID;
          if (!image || !board) {
            summary.skipped++;
            summary.details.push({ title: row.title, platform: row.platform, status: `skipped: Pinterest needs ${!image ? 'an image' : 'PINTEREST_BOARD_ID'}` });
            continue;
          }
          result = await postPinterest({
            title: row.title.replace(/^Pin\s*·\s*/i, ''),
            description: row.caption,
            link: row.postUrl,
            imageUrl: image,
            boardId: board,
          });
          break;
        }
        default:
          summary.skipped++;
          summary.details.push({ title: row.title, platform: row.platform, status: 'skipped: not a Meta platform (Pinterest/Reddit/etc. handled elsewhere)' });
          continue;
      }

      await markPublished(row.id, result.permalink);
      summary.posted++;
      summary.details.push({ title: row.title, platform: row.platform, status: 'posted', permalink: result.permalink ?? null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      try { await markFailed(row.id, row.notes, msg); } catch { /* ignore secondary failure */ }
      summary.failed++;
      summary.details.push({ title: row.title, platform: row.platform, status: 'failed', error: msg });
    }
  }

  return NextResponse.json(summary);
}
