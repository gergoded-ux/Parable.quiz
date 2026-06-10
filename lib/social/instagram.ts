// lib/social/instagram.ts
// Instagram poster (graph.facebook.com, IG endpoints). Two-step container +
// publish. IG requires a public JPEG image (no text-only posts) on a Business or
// Creator account linked to the Facebook Page; it publishes with the Page token.
const BASE = 'https://graph.facebook.com/v21.0';
const IG = process.env.IG_USER_ID;
const TOKEN = process.env.META_PAGE_TOKEN;

async function call(path: string, params: Record<string, string>): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    body: new URLSearchParams({ ...params, access_token: TOKEN ?? '' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Instagram ${path}: ${res.status} ${JSON.stringify(data)}`);
  return data as { id: string };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function postInstagram(opts: { caption: string; imageUrl: string }): Promise<{ permalink?: string }> {
  if (!IG || !TOKEN) throw new Error('IG_USER_ID or META_PAGE_TOKEN is not set');

  const container = await call(`${IG}/media`, { image_url: opts.imageUrl, caption: opts.caption });
  await wait(8000); // let IG fetch + process the image
  const published = await call(`${IG}/media_publish`, { creation_id: container.id });

  let permalink: string | undefined;
  try {
    const meta = await fetch(`${BASE}/${published.id}?fields=permalink&access_token=${TOKEN}`);
    if (meta.ok) permalink = (await meta.json()).permalink;
  } catch {
    /* permalink is optional */
  }
  return { permalink };
}
