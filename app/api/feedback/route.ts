// app/api/feedback/route.ts
// First-party feedback endpoint: forwards a short note to a Discord or Slack
// webhook (set FEEDBACK_WEBHOOK_URL). No data is stored; nothing third-party
// loads on the site itself.
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TYPE_LABEL: Record<string, string> = {
  idea: '\u{1F4A1} Idea',
  bug: '\u{1F41B} Bug',
  praise: '\u{1F64F} Praise',
};

export async function POST(req: Request) {
  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // Honeypot: real users never fill this; bots do. Pretend success and drop.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') return NextResponse.json({ ok: true });

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return NextResponse.json({ error: 'invalid_message' }, { status: 400 });

  const type = typeof body.type === 'string' && TYPE_LABEL[body.type] ? body.type : 'other';
  const label = TYPE_LABEL[type] ?? '\u{1F4DD} Feedback';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '';

  const header = path ? `${label} · ${path}` : label;
  const footer = email ? `\n↩️ ${email}` : '';
  const text = `${header}\n\n${message.slice(0, 1600)}${footer}`.slice(0, 1900);

  // Slack incoming webhooks expect { text }; Discord expects { content }.
  const payload = webhook.includes('hooks.slack.com') ? { text } : { content: text };

  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
  } catch {
    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
