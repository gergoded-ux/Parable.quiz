// lib/social/pinterest.ts
// Pinterest API v5 pin creation. A pin requires a public image (image_url media
// source), a board to pin to, a title, and an optional destination link.
const BASE = 'https://api.pinterest.com/v5';
const TOKEN = process.env.PINTEREST_TOKEN;

export async function postPinterest(opts: {
  title: string;
  description: string;
  link?: string | null;
  imageUrl: string;
  boardId: string;
}): Promise<{ permalink?: string }> {
  if (!TOKEN) throw new Error('PINTEREST_TOKEN is not set');
  if (!opts.boardId) throw new Error('No Pinterest board id (set PINTEREST_BOARD_ID)');

  const res = await fetch(`${BASE}/pins`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board_id: opts.boardId,
      title: opts.title.slice(0, 100),
      description: opts.description.slice(0, 800),
      link: opts.link || undefined,
      media_source: { source_type: 'image_url', url: opts.imageUrl },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Pinterest /pins: ${res.status} ${JSON.stringify(data)}`);
  return { permalink: data.id ? `https://www.pinterest.com/pin/${data.id}/` : undefined };
}
