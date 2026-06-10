// lib/social/facebook.ts
// Facebook Page poster (graph.facebook.com). A text/link post via /feed, or a
// photo post via /photos when an image is supplied (the link is appended to the
// caption, where Facebook makes it clickable).
const BASE = 'https://graph.facebook.com/v21.0';
const PAGE = process.env.META_PAGE_ID;
const TOKEN = process.env.META_PAGE_TOKEN;

async function call(path: string, params: Record<string, string>): Promise<{ id?: string; post_id?: string }> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    body: new URLSearchParams({ ...params, access_token: TOKEN ?? '' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Facebook ${path}: ${res.status} ${JSON.stringify(data)}`);
  return data as { id?: string; post_id?: string };
}

export async function postFacebook(opts: {
  text: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
}): Promise<{ permalink?: string }> {
  if (!PAGE || !TOKEN) throw new Error('META_PAGE_ID or META_PAGE_TOKEN is not set');

  if (opts.imageUrl) {
    const caption = opts.linkUrl ? `${opts.text}\n\n${opts.linkUrl}` : opts.text;
    const data = await call(`${PAGE}/photos`, { url: opts.imageUrl, caption });
    const id = data.post_id ?? data.id;
    return { permalink: id ? `https://www.facebook.com/${id}` : undefined };
  }

  const data = await call(`${PAGE}/feed`, opts.linkUrl ? { message: opts.text, link: opts.linkUrl } : { message: opts.text });
  return { permalink: data.id ? `https://www.facebook.com/${data.id}` : undefined };
}
