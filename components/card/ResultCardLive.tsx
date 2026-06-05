// components/card/ResultCardLive.tsx
'use client';
import { useEffect, useState } from 'react';
import { CARD, PANEL, nameFontSize } from '@/lib/card-layout';
import { StarRail } from './StarRail';
import { CardStatArea } from './CardStatArea';
import { artUrl, frameUrl } from '@/lib/card-art';
import type { CardData } from '@/lib/card-data';

export function ResultCardLive({ data, cardRef }: { data: CardData; cardRef?: React.Ref<HTMLDivElement> }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setRevealed(true); return; }
    const t = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(t);
  }, []);

  const name = data.baseName;
  const nameSize = nameFontSize(name);
  const frame = frameUrl(data.rarity.frame);

  return (
    <div style={{ perspective: 1200, width: 330, margin: '0 auto' }}>
      <div ref={cardRef}
        style={{ position: 'relative', width: 330, height: 412, borderRadius: 14, transition: 'transform .7s',
          transformStyle: 'preserve-3d', transform: revealed ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
        {/* front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 14, overflow: 'hidden',
          backgroundImage: `url(${frame})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', boxShadow: '0 10px 26px rgba(80,50,20,.3)' }}>
          <div style={{ position: 'absolute', left: PANEL.left, right: PANEL.right, top: PANEL.top, bottom: PANEL.bottom,
            background: CARD.panel.bg, border: `1px solid ${CARD.panel.border}`, borderRadius: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9px 11px 9px 22px', textAlign: 'center' }}>
            <StarRail filled={data.rarity.stars} material={data.rarity.material} />
            <div style={{ fontFamily: CARD.fonts.display, fontWeight: 700, fontSize: 10, letterSpacing: 3, color: CARD.ink.wm }}>PARABLE</div>
            <div style={{ width: 130, height: 130, margin: '4px auto 0', borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(212,175,55,.7)' }}>
              {data.hasArt
                ? <img src={artUrl(data.slug, data.artKey)} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, background: 'linear-gradient(160deg,#fff8ed,#f0dcc4)' }}>{data.emoji}</div>}
            </div>
            <div style={{ fontFamily: CARD.fonts.body, fontWeight: 800, fontSize: 9.5, letterSpacing: 2.5, marginTop: 6, color: data.rarity.accent }}>
              {data.rarity.tier === 'legendary' ? '✦ ' : ''}{data.rarity.label.toUpperCase()}
            </div>
            <div style={{ minHeight: 30, maxHeight: 44, display: 'flex', alignItems: 'center' }}>
              <div style={{ fontFamily: CARD.fonts.display, fontWeight: 900, fontSize: nameSize, color: CARD.ink.strong,
                lineHeight: 1.05, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{name}</div>
            </div>
            {data.epithet && <div style={{ fontFamily: CARD.fonts.serifItalic, fontStyle: 'italic', fontSize: 12.5, color: CARD.ink.soft }}>{data.epithet}</div>}
            {data.traits.length > 0 && <div style={{ fontFamily: CARD.fonts.body, fontWeight: 700, fontSize: 8.5, letterSpacing: .8, color: CARD.ink.body, marginTop: 5 }}>{data.traits.join(' · ').toUpperCase()}</div>}
            {data.stat.rows.length > 0 && <CardStatArea rows={data.stat.rows} suffix={data.stat.suffix} heading={data.stat.heading} />}
            {data.verse.text && <div style={{ fontFamily: CARD.fonts.serifItalic, fontStyle: 'italic', fontSize: 9.5, color: CARD.ink.body, marginTop: 5, lineHeight: 1.25 }}>&ldquo;{data.verse.text}&rdquo; — {data.verse.reference}{data.verse.translation ? ` (${data.verse.translation})` : ''}</div>}
            {data.matchPct !== null && <div style={{ fontFamily: CARD.fonts.body, fontSize: 7, letterSpacing: 1.5, color: CARD.ink.mute, marginTop: 4, fontWeight: 700 }}>{data.matchPct}% MATCH</div>}
          </div>
        </div>
        {/* back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 14,
          backgroundImage: `url(${frame})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px rgba(80,50,20,.3)' }}>
          <div style={{ fontFamily: CARD.fonts.display, fontWeight: 900, fontSize: 40, color: 'rgba(253,250,238,.85)' }}>✦</div>
        </div>
      </div>
    </div>
  );
}
