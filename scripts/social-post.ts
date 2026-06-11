// scripts/social-post.ts
// LOCAL on-demand trigger for the social poster, running the SAME logic as the
// /api/cron/social route so you can test and post by hand. Reads credentials from
// .env.local (gitignored); the deployed cron reads them from Vercel instead.
//
//   pnpm exec tsx scripts/social-post.ts --check   validate every credential, post nothing
//   pnpm exec tsx scripts/social-post.ts           DRY (default): show what's due, post nothing
//   pnpm exec tsx scripts/social-post.ts --live    actually post the due "Scheduled" rows
import { readFileSync } from 'node:fs';

// Load .env.local into process.env BEFORE importing the lib modules (they read
// env at module load). Manual parse, so there's no extra dependency.
function loadEnv(path: string) {
  let text = '';
  try { text = readFileSync(path, 'utf8'); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv('.env.local');

const mode = process.argv.includes('--live') ? 'live' : process.argv.includes('--check') ? 'check' : 'dry';
const SITE = process.env.SITE_URL ?? 'https://eikonia.art';
const slugFromQuiz = (url: string | null) => url?.match(/\/q\/([^/?#]+)/)?.[1] ?? null;

// Read-only credential check: confirms each token works without posting anything.
async function check() {
  const lines: string[] = [];
  const ping = async (name: string, url: string, headers?: Record<string, string>) => {
    try {
      const r = await fetch(url, headers ? { headers } : undefined);
      const d = await r.json().catch(() => ({}));
      lines.push(r.ok ? `✓ ${name}: ${JSON.stringify(d).slice(0, 120)}` : `✗ ${name}: ${r.status} ${JSON.stringify(d).slice(0, 200)}`);
    } catch (e) { lines.push(`✗ ${name}: ${e instanceof Error ? e.message : String(e)}`); }
  };
  await ping('Notion', `https://api.notion.com/v1/databases/${process.env.NOTION_DB_ID}`, { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' });
  await ping('Threads', `https://graph.threads.net/v1.0/me?fields=username&access_token=${process.env.THREADS_TOKEN}`);
  await ping('Facebook Page', `https://graph.facebook.com/v21.0/${process.env.META_PAGE_ID}?fields=name&access_token=${process.env.META_PAGE_TOKEN}`);
  await ping('Instagram', `https://graph.facebook.com/v21.0/${process.env.IG_USER_ID}?fields=username&access_token=${process.env.META_PAGE_TOKEN}`);
  await ping('Pinterest', 'https://api.pinterest.com/v5/user_account', { Authorization: `Bearer ${process.env.PINTEREST_TOKEN}` });
  console.log(lines.join('\n'));
}

async function run(live: boolean) {
  const { queryDueRows, markPublished, markFailed } = await import('../lib/social/notion');
  const { postThreads } = await import('../lib/social/threads');
  const { postFacebook } = await import('../lib/social/facebook');
  const { postInstagram } = await import('../lib/social/instagram');
  const { postPinterest } = await import('../lib/social/pinterest');

  const today = new Date().toISOString().slice(0, 10);
  const rows = await queryDueRows(today);
  console.log(`${rows.length} due "Scheduled" row(s) for ${today} — mode: ${live ? 'LIVE (posting)' : 'DRY (no posts)'}\n`);

  for (const row of rows) {
    const tile = (() => { const s = slugFromQuiz(row.postUrl); return s ? `${SITE}/api/social-image?type=tile&slug=${encodeURIComponent(s)}` : null; })();
    const label = `[${row.platform}] ${row.title}`;
    if (!live) {
      const skip = row.platform === 'Instagram' && !(row.imageUrl ?? tile) ? '  (would SKIP: Instagram needs an image)' : '';
      console.log(`• ${label}${skip}\n    ${row.caption.slice(0, 100)}${row.caption.length > 100 ? '…' : ''}`);
      continue;
    }
    try {
      let result: { permalink?: string };
      switch (row.platform) {
        case 'Threads': result = await postThreads({ text: row.caption, imageUrl: row.imageUrl, linkUrl: row.postUrl }); break;
        case 'Facebook': result = await postFacebook({ text: row.caption, imageUrl: row.imageUrl, linkUrl: row.postUrl }); break;
        case 'Instagram': {
          const image = row.imageUrl ?? tile;
          if (!image) { console.log(`⊘ SKIP ${label} (Instagram needs an image)`); continue; }
          result = await postInstagram({ caption: row.caption, imageUrl: image }); break;
        }
        case 'Pinterest': {
          const image = row.imageUrl ?? tile;
          const board = process.env.PINTEREST_BOARD_ID;
          if (!image || !board) { console.log(`⊘ SKIP ${label} (Pinterest needs ${!image ? 'an image' : 'PINTEREST_BOARD_ID'})`); continue; }
          result = await postPinterest({ title: row.title.replace(/^Pin\s*·\s*/i, ''), description: row.caption, link: row.postUrl, imageUrl: image, boardId: board }); break;
        }
        default: console.log(`⊘ SKIP ${label} (platform not handled)`); continue;
      }
      await markPublished(row.id, result.permalink);
      console.log(`✓ POSTED ${label}  ${result.permalink ?? ''}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      try { await markFailed(row.id, row.notes, msg); } catch { /* ignore secondary failure */ }
      console.log(`✗ FAILED ${label}  ${msg}`);
    }
  }
}

async function main() {
  if (mode === 'check') await check();
  else await run(mode === 'live');
}
main().catch((e) => { console.error(e); process.exit(1); });
