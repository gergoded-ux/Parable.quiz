// app/api/social-image/route.tsx
// Renders Meta-ready JPEGs from existing assets, on demand, so the social cron can
// hand Instagram / Threads / Facebook a public image URL (they fetch from a URL, not
// an upload). No temp files: each response is computed and CDN-cached.
//
//   ?type=tile&slug=<slug>                  -> titled cover-card tile (Satori, 1080x1350)
//   ?type=cover&slug=<slug>                 -> bare cover art as JPEG (landscape)
//   ?type=card&slug=<slug>&key=<key>&m=NN   -> full reward card (reuses /og) as JPEG
//
// Cover art is decoded to a PNG data URI before going into Satori, so it always
// renders regardless of Satori's webp support.
import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { loadTestBySlug } from '@/lib/test-loader';
import { quizCoverUrl } from '@/lib/card-art';
import { STAR_PATH } from '@/lib/card-layout';
import type { Test } from '@/lib/schema';

export const runtime = 'nodejs';

const FONT_DIR = join(process.cwd(), 'public', 'cards', 'fonts');
const font = (f: string) => readFileSync(join(FONT_DIR, f));
const FONTS = {
  cinzelBlack: font('Cinzel-Black.ttf'),
  cinzelBold: font('Cinzel-Bold.ttf'),
  interBold: font('Inter-Bold.ttf'),
  interExtraBold: font('Inter-ExtraBold.ttf'),
};

const JPEG_HEADERS = { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400, s-maxage=86400' };

function categoryLabel(t: Test): string {
  return t.category === 'spiritual-profile' ? 'Spiritual Profile'
    : t.category === 'bible-iq' ? 'Bible IQ' : 'Bible Character';
}
function describeMeta(t: Test): string {
  const m = `${t.estimatedMinutes} min`;
  if (t.mode === 'knowledge') return `${m} · ${t.questions.length} questions`;
  if (t.mode === 'profile') return `${m} · ${t.dimensions.length} dimensions`;
  return `${m} · ${Object.keys(t.results).length} results`;
}

// Read the cover webp from disk; return it as a PNG data URI (Satori-safe).
async function coverPngDataUri(slug: string): Promise<string | null> {
  const path = quizCoverUrl(slug); // "/quizzes/<file>"
  if (!path) return null;
  try {
    const file = path.replace(/^\/quizzes\//, '');
    const raw = readFileSync(join(process.cwd(), 'public', 'quizzes', file));
    const png = await sharp(raw).resize(980, 654, { fit: 'cover', position: 'centre' }).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'tile';
  const slug = url.searchParams.get('slug') ?? '';
  const test = loadTestBySlug(slug);
  if (!test) return new Response('quiz not found', { status: 404 });

  // COVER: bare cover art -> JPEG
  if (type === 'cover') {
    const path = quizCoverUrl(slug);
    if (!path) return new Response('no cover', { status: 404 });
    const file = path.replace(/^\/quizzes\//, '');
    const raw = readFileSync(join(process.cwd(), 'public', 'quizzes', file));
    const jpg = await sharp(raw).resize(1200).jpeg({ quality: 86 }).toBuffer();
    return new Response(new Uint8Array(jpg), { headers: JPEG_HEADERS });
  }

  // CARD: reuse the existing /og reward-card render -> JPEG
  if (type === 'card') {
    const key = url.searchParams.get('key') ?? '';
    const m = url.searchParams.get('m') ?? '96';
    const og = `${url.origin}/og/${encodeURIComponent(slug)}/${encodeURIComponent(key)}?m=${m}`;
    const res = await fetch(og);
    if (!res.ok) return new Response('card render failed', { status: 502 });
    const png = Buffer.from(await res.arrayBuffer());
    const jpg = await sharp(png).jpeg({ quality: 90 }).toBuffer();
    return new Response(new Uint8Array(jpg), { headers: JPEG_HEADERS });
  }

  // TILE: titled cover-card, rebuilt in Satori at 1080x1350 (IG portrait)
  const W = 1080, H = 1350;
  const coverSrc = await coverPngDataUri(slug);
  const title = test.title;
  const titleSize = title.length > 40 ? 50 : title.length > 28 ? 60 : title.length > 18 ? 72 : 84;

  const image = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#fdf5ee,#f6e7d8)', padding: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#fffaf2', border: '3px solid rgba(212,175,55,.55)', borderRadius: 40, padding: '46px 48px', boxShadow: '0 20px 60px rgba(74,47,21,.18)' }}>
          {/* header: gold star + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: '#f6e7d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={40} height={40} viewBox="0 0 24 24" style={{ display: 'flex' }}><path fill="#c8961f" d={STAR_PATH} /></svg>
            </div>
            <div style={{ display: 'flex', fontFamily: 'Inter', fontWeight: 800, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#a9762e' }}>{categoryLabel(test)}</div>
          </div>
          {/* title */}
          <div style={{ display: 'flex', fontFamily: 'Cinzel', fontWeight: 900, fontSize: titleSize, color: '#3a2410', lineHeight: 1.06, marginBottom: 30 }}>{title}</div>
          {/* cover art */}
          <div style={{ display: 'flex', width: '100%', flex: 1, borderRadius: 28, overflow: 'hidden', border: '4px solid rgba(212,175,55,.6)' }}>
            {coverSrc
              ? <img width={880} height={520} src={coverSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#f0dcc4,#e8c9a7)' }}>
                  <svg width={160} height={160} viewBox="0 0 24 24"><path fill="#c8961f" d={STAR_PATH} /></svg>
                </div>}
          </div>
          {/* footer: meta + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
            <div style={{ display: 'flex', fontFamily: 'Inter', fontWeight: 700, fontSize: 26, color: '#7a5a2a' }}>{describeMeta(test)}</div>
            <div style={{ display: 'flex', fontFamily: 'Cinzel', fontWeight: 700, fontSize: 30, letterSpacing: 6, color: '#6b4423' }}>EIKONIA</div>
          </div>
        </div>
      </div>
    ),
    {
      width: W, height: H,
      fonts: [
        { name: 'Cinzel', data: FONTS.cinzelBlack, weight: 900, style: 'normal' },
        { name: 'Cinzel', data: FONTS.cinzelBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: FONTS.interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: FONTS.interExtraBold, weight: 800, style: 'normal' },
      ],
    },
  );
  const png = Buffer.from(await image.arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: JPEG_HEADERS });
}
