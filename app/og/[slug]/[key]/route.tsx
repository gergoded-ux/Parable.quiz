// app/og/[slug]/[key]/route.tsx
import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTestBySlug } from '@/lib/test-loader';
import { cardDataFromResult } from '@/lib/card-data';
import { CARD, PANEL, nameFontSize } from '@/lib/card-layout';
import { artUrl } from '@/lib/card-art';

// nodejs runtime so we can readFileSync fonts/frames; NOT force-static (we read ?m=).
export const runtime = 'nodejs';

const FONT_DIR = join(process.cwd(), 'public', 'cards', 'fonts');
const FRAME_DIR = join(process.cwd(), 'public', 'cards', 'frames');
function font(f: string) {
  return readFileSync(join(FONT_DIR, f));
}
function frameDataUri(file: string) {
  const b = readFileSync(join(FRAME_DIR, file));
  return `data:image/png;base64,${b.toString('base64')}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const { slug, key } = await params;
  const url = new URL(req.url);
  const mRaw = url.searchParams.get('m');
  const matchPct = mRaw != null && mRaw !== '' ? Math.max(0, Math.min(100, parseInt(mRaw, 10) || 0)) : null;

  const W = CARD.width, H = CARD.height;
  const test = loadTestBySlug(slug);
  const d = test ? cardDataFromResult(test, key, matchPct) : null;

  // Missing test/result/archetype key -> blank cream card (don't crash).
  if (!d) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fdf5ee' }} />,
      { width: W, height: H },
    );
  }

  const name = d.baseName;
  const nameSize = nameFontSize(name) * 2.8; // live tokens are ~330px-wide; OG is 1080px

  const a = artUrl(slug, key);
  const artSrc = a.startsWith('http') ? a : url.origin + a;
  const starColor = (on: boolean) => (on ? CARD.star[d.rarity.material].to : 'rgba(107,68,35,0.25)');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex',
        backgroundImage: `url(${frameDataUri(d.rarity.frame)})`, backgroundSize: '1080px 1350px' }}>
        <div style={{ position: 'absolute', left: PANEL.left, right: PANEL.right, top: PANEL.top, bottom: PANEL.bottom,
          background: CARD.panel.bg, border: `3px solid ${CARD.panel.border}`, borderRadius: 34,
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 40px 30px 70px' }}>
          {/* star rail (SVG paths — Satori-safe, no font glyph needed) */}
          <div style={{ position: 'absolute', left: 16, top: 120, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} width={38} height={38} viewBox="0 0 24 24" style={{ display: 'flex' }}>
                <path fill={starColor(i < d.rarity.stars)} d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.9 5.9 20.8l1.2-6.6L2.3 9l6.6-.9z" />
              </svg>
            ))}
          </div>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: 30, letterSpacing: 6, color: CARD.ink.wm, display: 'flex' }}>PARABLE</div>
          {/* image window */}
          <div style={{ width: 560, height: 360, marginTop: 14, borderRadius: 24, overflow: 'hidden', border: '4px solid rgba(212,175,55,.7)', display: 'flex' }}>
            {d.hasArt
              ? <img width={560} height={360} src={artSrc} style={{ objectFit: 'cover' }} />
              : <div style={{ width: 560, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 180, background: 'linear-gradient(160deg,#fff8ed,#f0dcc4)' }}>{d.emoji}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            {d.rarity.tier === 'legendary' && (
              <svg width={24} height={24} viewBox="0 0 24 24" style={{ display: 'flex' }}>
                <path fill={d.rarity.accent} d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.9 5.9 20.8l1.2-6.6L2.3 9l6.6-.9z" />
              </svg>
            )}
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 26, letterSpacing: 6, color: d.rarity.accent, display: 'flex' }}>{d.rarity.label.toUpperCase()}</div>
          </div>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: nameSize, color: CARD.ink.strong, marginTop: 6, textAlign: 'center', display: 'flex' }}>{name}</div>
          {d.epithet && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 34, color: CARD.ink.soft, marginTop: 4, display: 'flex' }}>{d.epithet}</div>}
          {d.traits.length > 0 && <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 2, color: CARD.ink.body, marginTop: 12, textAlign: 'center', display: 'flex' }}>{d.traits.join(' · ').toUpperCase()}</div>}
          {d.verse.text && <div style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', fontSize: 26, color: CARD.ink.body, marginTop: 22, textAlign: 'center', display: 'flex' }}>&ldquo;{d.verse.text}&rdquo; — {d.verse.reference}{d.verse.translation ? ` (${d.verse.translation})` : ''}</div>}
          {d.matchPct !== null && <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 3, color: CARD.ink.mute, marginTop: 'auto', display: 'flex' }}>{d.matchPct}% MATCH</div>}
        </div>
      </div>
    ),
    {
      width: W, height: H,
      fonts: [
        { name: 'Cinzel', data: font('Cinzel-Bold.ttf'), weight: 700, style: 'normal' },
        { name: 'Cinzel', data: font('Cinzel-Black.ttf'), weight: 900, style: 'normal' },
        { name: 'Inter', data: font('Inter-Regular.ttf'), weight: 400, style: 'normal' },
        { name: 'Inter', data: font('Inter-Bold.ttf'), weight: 700, style: 'normal' },
        { name: 'Inter', data: font('Inter-ExtraBold.ttf'), weight: 800, style: 'normal' },
        { name: 'EB Garamond', data: font('EBGaramond-Italic.ttf'), weight: 400, style: 'italic' },
      ],
    },
  );
}
