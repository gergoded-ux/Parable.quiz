// lib/social/threads.ts
// Threads API poster (graph.threads.net). Two-step container + publish, with the
// optional link posted as the first reply (Threads suppresses links in the body,
// so the "link in first reply" convention is automated here).
const BASE = 'https://graph.threads.net/v1.0';
const USER = process.env.THREADS_USER_ID;
const TOKEN = process.env.THREADS_TOKEN;

async function call(path: string, params: Record<string, string>): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    body: new URLSearchParams({ ...params, access_token: TOKEN ?? '' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Threads ${path}: ${res.status} ${JSON.stringify(data)}`);
  return data as { id: string };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function postThreads(opts: {
  text: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
}): Promise<{ permalink?: string }> {
  if (!USER || !TOKEN) throw new Error('THREADS_USER_ID or THREADS_TOKEN is not set');

  const container = await call(
    `${USER}/threads`,
    opts.imageUrl
      ? { media_type: 'IMAGE', image_url: opts.imageUrl, text: opts.text }
      : { media_type: 'TEXT', text: opts.text },
  );
  if (opts.imageUrl) await wait(8000); // let the image container process
  const published = await call(`${USER}/threads_publish`, { creation_id: container.id });

  // Best-effort link reply (the main post is already out if this fails).
  if (opts.linkUrl) {
    try {
      const reply = await call(`${USER}/threads`, { media_type: 'TEXT', text: opts.linkUrl, reply_to_id: published.id });
      await call(`${USER}/threads_publish`, { creation_id: reply.id });
    } catch {
      /* ignore reply failure */
    }
  }

  let permalink: string | undefined;
  try {
    const meta = await fetch(`${BASE}/${published.id}?fields=permalink&access_token=${TOKEN}`);
    if (meta.ok) permalink = (await meta.json()).permalink;
  } catch {
    /* permalink is optional */
  }
  return { permalink };
}
