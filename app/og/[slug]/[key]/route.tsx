// app/og/[slug]/[key]/route.tsx
import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTestBySlug, isPublished } from '@/lib/test-loader';
import { cardDataFromResult, binaryAffinityStat } from '@/lib/card-data';
import { CARD, PANEL, nameFontSizeOg, STAR_PATH } from '@/lib/card-layout';
import { artUrl } from '@/lib/card-art';

// nodejs runtime so we can readFileSync fonts/frames; NOT force-static (we read ?m=).
export const runtime = 'nodejs';

const FONT_DIR = join(process.cwd(), 'public', 'cards', 'fonts');
const FRAME_DIR = join(process.cwd(), 'public', 'cards', 'frames');

// Read each font once at module load instead of on every request.
function font(f: string) {
  return readFileSync(join(FONT_DIR, f));
}
const FONTS = {
  cinzelBold: font('Cinzel-Bold.ttf'),
  cinzelBlack: font('Cinzel-Black.ttf'),
  interBold: font('Inter-Bold.ttf'),
  interExtraBold: font('Inter-ExtraBold.ttf'),
  ebGaramondItalic: font('EBGaramond-Italic.ttf'),
} as const;

// Memoize frame data URIs; each frame PNG is base64-encoded once, then reused.
const frameCache: Record<string, string> = {};
function frameDataUri(file: string) {
  if (!frameCache[file]) {
    const b = readFileSync(join(FRAME_DIR, file));
    frameCache[file] = `data:image/png;base64,${b.toString('base64')}`;
  }
  return frameCache[file];
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const { slug, key } = await params;
  const url = new URL(req.url);
  const mRaw = url.searchParams.get('m');
  const matchPct = mRaw != null && mRaw !== '' ? Math.max(0, Math.min(100, parseInt(mRaw, 10) || 0)) : null;

  const W = CARD.width, H = CARD.height;
  // Backlog quizzes have no live card (falls through to the blank-card guard).
  const test = isPublished(slug) ? loadTestBySlug(slug) : null;
  const stat = test ? binaryAffinityStat(test, key, matchPct) : undefined;
  const d = test ? cardDataFromResult(test, key, matchPct, stat) : null;

  // Missing test/result/archetype key -> blank cream card (don't crash).
  if (!d) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fdf5ee' }} />,
      { width: W, height: H },
    );
  }

  const name = d.baseName;
  const nameSize = nameFontSizeOg(name); // OG-tuned; node wraps inside the panel

  const a = artUrl(slug, d.artKey);
  const artSrc = a.startsWith('http') ? a : url.origin + a;
  const starColor = (on: boolean) => (on ? CARD.star[d.rarity.material].to : 'rgba(107,68,35,0.25)');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex',
        backgroundImage: `url(${frameDataUri(d.rarity.frame)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div style={{ position: 'absolute', left: PANEL.left, right: PANEL.right, top: PANEL.top, bottom: PANEL.bottom,
          background: CARD.panel.bg, border: `3px solid ${CARD.panel.border}`, borderRadius: 34,
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 40px 30px 70px' }}>
          {/* star rail (SVG paths — Satori-safe, no font glyph needed) */}
          <div style={{ position: 'absolute', left: 16, top: 120, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} width={38} height={38} viewBox="0 0 24 24" style={{ display: 'flex' }}>
                <path fill={starColor(i < d.rarity.stars)} d={STAR_PATH} />
              </svg>
            ))}
          </div>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: 30, letterSpacing: 6, color: CARD.ink.wm, display: 'flex' }}>EIKONIA</div>
          {/* image window */}
          <div style={{ width: 470, height: 470, marginTop: 14, borderRadius: 24, overflow: 'hidden', border: '4px solid rgba(212,175,55,.7)', display: 'flex' }}>
            {d.hasArt
              ? <img width={470} height={470} src={artSrc} style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
              : <div style={{ width: 470, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 180, background: 'linear-gradient(160deg,#fff8ed,#f0dcc4)' }}>{d.emoji}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            {d.rarity.tier === 'legendary' && (
              <svg width={24} height={24} viewBox="0 0 24 24" style={{ display: 'flex' }}>
                <path fill={d.rarity.accent} d={STAR_PATH} />
              </svg>
            )}
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 26, letterSpacing: 6, color: d.rarity.accent, display: 'flex' }}>{d.rarity.label.toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, marginTop: 6 }}>
            <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: nameSize, color: CARD.ink.strong, textAlign: 'center', lineHeight: 1.05 }}>{name}</div>
          </div>
          {d.epithet && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 34, color: CARD.ink.soft, marginTop: 4, display: 'flex' }}>{d.epithet}</div>}
          {d.traits.length > 0 && <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 2, color: CARD.ink.body, marginTop: 12, textAlign: 'center', display: 'flex' }}>{d.traits.join(' · ').toUpperCase()}</div>}
          {/* affinity bars — mirror the live CardStatArea, scaled for the 1080 canvas */}
          {d.stat.rows.length > 0 && (
            <div style={{ width: 560, marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 22, letterSpacing: 4, color: CARD.ink.mute, display: 'flex' }}>{d.stat.heading}</div>
              {d.stat.rows.map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter', fontSize: 26, color: CARD.ink.strong }}>
                  <div style={{ width: 170, textAlign: 'left', fontWeight: 600, display: 'flex' }}>{row.label}</div>
                  <div style={{ flex: 1, height: 16, background: 'rgba(120,74,13,0.18)', borderRadius: 20, overflow: 'hidden', display: 'flex', marginLeft: 16, marginRight: 16 }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, row.value))}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg,#b8932f,#6b4423)', display: 'flex' }} />
                  </div>
                  <div style={{ width: 70, textAlign: 'right', fontWeight: 800, display: 'flex', justifyContent: 'flex-end' }}>{row.value}{d.stat.suffix}</div>
                </div>
              ))}
            </div>
          )}
          {d.verse.text && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 26, color: CARD.ink.body, marginTop: 22, textAlign: 'center', display: 'flex' }}>&ldquo;{d.verse.text}&rdquo; — {d.verse.reference}{d.verse.translation ? ` (${d.verse.translation})` : ''}</div>}
          {d.matchPct !== null && <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 3, color: CARD.ink.mute, marginTop: 'auto', display: 'flex' }}>{d.matchPct}% MATCH</div>}
        </div>
      </div>
    ),
    {
      width: W, height: H,
      fonts: [
        { name: 'Cinzel', data: FONTS.cinzelBold, weight: 700, style: 'normal' },
        { name: 'Cinzel', data: FONTS.cinzelBlack, weight: 900, style: 'normal' },
        { name: 'Inter', data: FONTS.interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: FONTS.interExtraBold, weight: 800, style: 'normal' },
        { name: 'EB Garamond', data: FONTS.ebGaramondItalic, weight: 400, style: 'italic' },
      ],
    },
  );
}
