// lib/social/notion.ts
// Minimal Notion REST client for the social cron: read due rows from the Social
// Media Post Tracker and write status / permalink back. Uses a server-side
// integration token (NOTION_TOKEN), separate from any editor integration.
const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;
const BASE = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

export type DueRow = {
  id: string;
  platform: string;
  caption: string;
  postUrl: string | null;
  imageUrl: string | null;
  notes: string;
  title: string;
};

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Notion-Version': VERSION,
    'Content-Type': 'application/json',
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function plain(rich: any): string {
  return Array.isArray(rich) ? rich.map((r: any) => r.plain_text ?? '').join('') : '';
}

/** Rows that are Status = Scheduled and due on or before `today` (YYYY-MM-DD). */
export async function queryDueRows(today: string): Promise<DueRow[]> {
  if (!TOKEN || !DB_ID) throw new Error('NOTION_TOKEN or NOTION_DB_ID is not set');
  const res = await fetch(`${BASE}/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Status', status: { equals: 'Scheduled' } },
          { property: 'Publish date', date: { on_or_before: today } },
        ],
      },
      page_size: 50,
    }),
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  const data: any = await res.json();
  return (data.results ?? []).map((p: any): DueRow => {
    const props = p.properties ?? {};
    return {
      id: p.id,
      platform: props['Platform']?.select?.name ?? '',
      caption: plain(props['Caption']?.rich_text),
      postUrl: props['Post URL']?.url ?? null,
      imageUrl: props['Image']?.url ?? null,
      notes: plain(props['Notes']?.rich_text),
      title: plain(props['Post']?.title),
    };
  });
}

async function patch(id: string, properties: Record<string, unknown>) {
  if (!TOKEN) throw new Error('NOTION_TOKEN is not set');
  const res = await fetch(`${BASE}/pages/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) throw new Error(`Notion update failed: ${res.status} ${await res.text()}`);
}

export async function markPublished(id: string, liveUrl?: string) {
  const props: Record<string, unknown> = { Status: { status: { name: 'Published' } } };
  if (liveUrl) props['Live URL'] = { url: liveUrl };
  await patch(id, props);
}

export async function markFailed(id: string, existingNotes: string, error: string) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const note = `${existingNotes ? existingNotes + '\n' : ''}⚠ ${stamp} auto-post failed: ${error}`.slice(0, 1990);
  await patch(id, {
    Status: { status: { name: 'In review' } },
    Notes: { rich_text: [{ text: { content: note } }] },
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
