'use client';
// LOCAL-ONLY creative console. Look up a quiz by its cover, then export either:
//   - the COVER CARD: the real homepage QuizCard tile; or
//   - the REWARD CARD: the real live result card (ResultCardLive), the SAME card
//     the webapp shows and shares.
// Both are exported by snapshotting the live DOM to PNG via html-to-image (the
// same library + options ShareBar uses for sharing), so downloads match the site
// pixel-for-pixel and load the .webp art (which the /og Satori route cannot).
// Single or batch. Dev tool, never shipped; the server page 404s it in prod.
import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { rarityFromMatch } from '@/lib/rarity';
import { cardDataFromResult, binaryAffinityStat } from '@/lib/card-data';
import { artUrl } from '@/lib/card-art';
import { QuizCard } from '@/components/QuizCard';
import { ResultCardLive } from '@/components/card/ResultCardLive';
import type { Test } from '@/lib/schema';

export type StudioResult = { key: string; name: string; emoji: string; hasArt: boolean };
export type StudioQuiz = {
  slug: string;
  title: string;
  mode: 'archetype' | 'profile' | 'knowledge';
  published: boolean;
  cover: string; // '' when the quiz has no cover yet
  results: StudioResult[];
};
type AssetType = 'cover' | 'card';
type BatchItem = { kind: AssetType; slug: string; key: string; name: string; title: string; pct: number };

const FAMILY_LABEL: Record<StudioQuiz['mode'], string> = {
  archetype: 'Character',
  profile: 'Profile',
  knowledge: 'Bible IQ',
};
const RARITY_PRESETS = [
  { label: 'Common', pct: 45 },
  { label: 'Rare', pct: 78 },
  { label: 'Epic', pct: 90 },
  { label: 'Legendary', pct: 97 },
];
const SITE = 'https://eikonia.art';
const COVER_W = 360; // cover-card preview/snapshot width; pixelRatio 3 -> ~1080px export

const cardFile = (slug: string, key: string, pct: number) =>
  `eikonia-${slug}-${key}-${rarityFromMatch(pct).tier}-${pct}.png`;
const coverFile = (slug: string) => `eikonia-covercard-${slug}.png`;
const cardId = (slug: string, key: string, pct: number) => `${slug}|${key}|${pct}`;

function triggerDownload(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Wait for every <img> in the node to finish loading, else the snapshot can be blank.
async function waitForImages(node: HTMLElement) {
  await Promise.all(
    Array.from(node.querySelectorAll('img')).map((img) =>
      img.complete && img.naturalWidth > 0
        ? null
        : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); }),
    ),
  );
}

// Snapshot a live DOM node to a PNG data URL. We force transform/transition off so
// a mid-flip ResultCardLive is captured front-facing (the flip has a .7s transition,
// so we also kill the transition and force a reflow before capturing).
async function snapshotNode(node: HTMLElement): Promise<string> {
  await waitForImages(node);
  const prevTransform = node.style.transform;
  const prevTransition = node.style.transition;
  node.style.transition = 'none';
  node.style.transform = 'none';
  void node.offsetHeight; // reflow so the override applies before capture
  try {
    return await toPng(node, { pixelRatio: 3, cacheBust: true, backgroundColor: '#fdf5ee' });
  } finally {
    node.style.transform = prevTransform;
    node.style.transition = prevTransition;
  }
}

// palette (inline so this dev tool never depends on Tailwind token purging)
const C = {
  cream1: '#fdf5ee', cream2: '#f6e7d8', sand: '#f0dcc4',
  rose: '#e8c9a7', roseDark: '#d4a574',
  brown: '#6b4423', brownDark: '#4a2f15',
  ink: '#2d2a26', inkSoft: '#4a3c2e', inkMute: '#8a6a47',
  white: '#fffaf2',
};

export function CreativeStudio({ catalog, tests }: { catalog: StudioQuiz[]; tests: Test[] }) {
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<'all' | StudioQuiz['mode']>('all');
  const [liveOnly, setLiveOnly] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [asset, setAsset] = useState<AssetType>('cover');
  const [pct, setPct] = useState(97);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const coverPreviewRef = useRef<HTMLDivElement | null>(null);
  const rewardPreviewRef = useRef<HTMLDivElement | null>(null);
  const batchCoverRefs = useRef<Map<string, HTMLElement>>(new Map());
  const batchCardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const bySlug = useMemo(() => new Map(catalog.map((q) => [q.slug, q])), [catalog]);
  const testBySlug = useMemo(() => new Map(tests.map((t) => [t.slug, t])), [tests]);
  const quiz = slug ? bySlug.get(slug) ?? null : null;
  const selectedTest = slug ? testBySlug.get(slug) ?? null : null;
  const result = quiz && key ? quiz.results.find((r) => r.key === key) ?? null : null;
  const rarity = rarityFromMatch(pct);
  const liveCount = useMemo(() => catalog.filter((q) => q.published).length, [catalog]);

  // Build the real live-card data (same path /mockup uses), so the preview and the
  // PNG are the actual webapp card with its illustration.
  const rewardCardData = useMemo(() => {
    if (!selectedTest || !key) return null;
    const stat = binaryAffinityStat(selectedTest, key, pct);
    return cardDataFromResult(selectedTest, key, pct, stat);
  }, [selectedTest, key, pct]);

  function cardDataFor(s: string, k: string, p: number) {
    const t = testBySlug.get(s);
    if (!t) return null;
    return cardDataFromResult(t, k, p, binaryAffinityStat(t, k, p));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((it) => {
      if (liveOnly && !it.published) return false;
      if (family !== 'all' && it.mode !== family) return false;
      if (q && !it.title.toLowerCase().includes(q) && !it.slug.includes(q)) return false;
      return true;
    });
  }, [catalog, query, family, liveOnly]);

  const batchCoverSlugs = useMemo(
    () => [...new Set(batch.filter((b) => b.kind === 'cover').map((b) => b.slug))],
    [batch],
  );
  const batchCardItems = useMemo(() => {
    const seen = new Set<string>();
    const out: BatchItem[] = [];
    for (const b of batch) {
      if (b.kind !== 'card') continue;
      const id = cardId(b.slug, b.key, b.pct);
      if (!seen.has(id)) { seen.add(id); out.push(b); }
    }
    return out;
  }, [batch]);

  function selectQuiz(q: StudioQuiz) {
    setSlug(q.slug);
    setKey(q.results[0]?.key ?? null);
  }
  function addCardToBatch() {
    if (!quiz || !result) return;
    const item: BatchItem = { kind: 'card', slug: quiz.slug, key: result.key, name: result.name, title: quiz.title, pct };
    setBatch((b) => (b.some((x) => x.kind === 'card' && x.slug === item.slug && x.key === item.key && x.pct === item.pct) ? b : [...b, item]));
  }
  function addAllResults() {
    if (!quiz) return;
    setBatch((b) => {
      const next = [...b];
      for (const r of quiz.results) {
        if (!next.some((x) => x.kind === 'card' && x.slug === quiz.slug && x.key === r.key && x.pct === pct))
          next.push({ kind: 'card', slug: quiz.slug, key: r.key, name: r.name, title: quiz.title, pct });
      }
      return next;
    });
  }
  function addCoverToBatch() {
    if (!quiz) return;
    setBatch((b) => (b.some((x) => x.kind === 'cover' && x.slug === quiz.slug) ? b : [...b, { kind: 'cover', slug: quiz.slug, key: 'cover', name: quiz.title, title: quiz.title, pct: 0 }]));
  }
  async function downloadCoverCard() {
    const node = coverPreviewRef.current;
    if (!node || !quiz) return;
    setBusy(true);
    try { triggerDownload(await snapshotNode(node), coverFile(quiz.slug)); }
    finally { setBusy(false); }
  }
  async function downloadRewardCard() {
    const node = rewardPreviewRef.current;
    if (!node || !quiz || !key) return;
    setBusy(true);
    try { triggerDownload(await snapshotNode(node), cardFile(quiz.slug, key, pct)); }
    finally { setBusy(false); }
  }
  async function downloadBatch() {
    if (batch.length === 0) return;
    setBusy(true);
    try {
      for (const it of batch) {
        const node = it.kind === 'cover'
          ? batchCoverRefs.current.get(it.slug)
          : batchCardRefs.current.get(cardId(it.slug, it.key, it.pct));
        const name = it.kind === 'cover' ? coverFile(it.slug) : cardFile(it.slug, it.key, it.pct);
        if (node) triggerDownload(await snapshotNode(node), name);
        await delay(450); // stagger so the browser keeps every file
      }
    } finally {
      setBusy(false);
    }
  }
  function copyLink() {
    if (!quiz) return;
    navigator.clipboard?.writeText(`${SITE}/q/${quiz.slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg,${C.cream1},${C.cream2})`, padding: '20px 24px 40px', color: C.ink, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1500, margin: '0 auto' }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.brownDark, margin: 0 }}>Creative studio</h1>
          <p style={{ fontSize: 13, color: C.inkMute, margin: '4px 0 0' }}>
            Dev only. Look up a quiz, then download the whole <b>cover card</b> (homepage tile) or the <b>reward card</b> (the live result card, art and all). Single or batch.
          </p>
        </header>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* LEFT: cover library */}
          <section style={{ flex: '1 1 540px', minWidth: 320 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quizzes by title or slug…"
                style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.roseDark}`, background: C.white, color: C.ink, fontSize: 14, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {(['all', 'archetype', 'profile', 'knowledge'] as const).map((f) => {
                  const on = family === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFamily(f)}
                      style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${on ? C.brown : C.roseDark}`, background: on ? C.brown : C.white, color: on ? C.white : C.brown, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >
                      {f === 'all' ? 'All' : FAMILY_LABEL[f]}
                    </button>
                  );
                })}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.inkSoft, cursor: 'pointer', marginLeft: 4 }}>
                  <input type="checkbox" checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} />
                  Live only
                </label>
                <span style={{ fontSize: 12, color: C.inkMute, marginLeft: 'auto' }}>
                  {filtered.length} shown · {liveCount} live / {catalog.length} total
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: 10 }}>
              {filtered.map((q) => {
                const selected = q.slug === slug;
                return (
                  <button
                    key={q.slug}
                    onClick={() => selectQuiz(q)}
                    title={`${q.title}${q.published ? '' : ' (backlog)'}`}
                    style={{ display: 'flex', flexDirection: 'column', padding: 0, textAlign: 'left', cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: C.sand, border: `2px solid ${selected ? C.brown : 'transparent'}`, boxShadow: selected ? '0 4px 14px rgba(74,47,21,.25)' : '0 1px 4px rgba(74,47,21,.1)' }}
                  >
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', background: `linear-gradient(160deg,${C.rose},${C.sand})` }}>
                      {q.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={q.cover} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.brown, fontSize: 11, fontWeight: 700, padding: 8, textAlign: 'center' }}>
                          no cover
                        </div>
                      )}
                      {!q.published && (
                        <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(74,47,21,.82)', color: C.cream1, fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: '2px 6px', borderRadius: 6 }}>BACKLOG</span>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px 8px' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{q.title}</div>
                      <div style={{ fontSize: 9.5, color: C.inkMute, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{FAMILY_LABEL[q.mode]} · {q.results.length}{q.mode === 'knowledge' ? ' score' : ' results'}</div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: C.inkMute, fontSize: 13 }}>No quizzes match.</div>
              )}
            </div>
          </section>

          {/* RIGHT: selected quiz */}
          <section style={{ flex: '0 0 420px', position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
            {!quiz ? (
              <div style={{ border: `2px dashed ${C.roseDark}`, borderRadius: 14, padding: 40, textAlign: 'center', color: C.inkMute, fontSize: 14, background: 'rgba(255,255,255,.5)' }}>
                Pick a cover to start.
              </div>
            ) : (
              <div style={{ background: C.white, border: `1px solid ${C.rose}`, borderRadius: 14, padding: 18, boxShadow: '0 4px 18px rgba(74,47,21,.12)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: C.brownDark, margin: 0, lineHeight: 1.2 }}>{quiz.title}</h2>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: quiz.published ? '#3d9b4a' : C.inkMute, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {FAMILY_LABEL[quiz.mode].toUpperCase()} · {quiz.published ? 'LIVE' : 'BACKLOG'}
                  </span>
                </div>

                {/* asset toggle */}
                <div style={{ display: 'flex', marginBottom: 14, border: `1px solid ${C.roseDark}`, borderRadius: 9, overflow: 'hidden' }}>
                  {(['cover', 'card'] as const).map((a) => {
                    const on = asset === a;
                    return (
                      <button
                        key={a}
                        onClick={() => setAsset(a)}
                        style={{ flex: 1, padding: '8px 0', border: 'none', background: on ? C.brown : C.white, color: on ? C.white : C.brown, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}
                      >
                        {a === 'cover' ? 'Cover card' : 'Reward card'}
                      </button>
                    );
                  })}
                </div>

                {asset === 'cover' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                      {selectedTest ? (
                        <div ref={coverPreviewRef} style={{ width: COVER_W, pointerEvents: 'none' }}>
                          <QuizCard test={selectedTest} />
                        </div>
                      ) : (
                        <div style={{ color: C.inkMute, fontSize: 12 }}>No tile data.</div>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: C.inkMute, textAlign: 'center', margin: '0 0 12px' }}>The exact homepage tile, exported at ~1080px wide.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button onClick={downloadCoverCard} disabled={busy || !selectedTest} style={{ ...btn(C.brown, C.white), cursor: busy ? 'wait' : 'pointer', opacity: busy || !selectedTest ? 0.7 : 1 }}>{busy ? 'Working…' : '⬇ Cover card PNG'}</button>
                      <button onClick={addCoverToBatch} style={{ ...btn(C.sand, C.brownDark), cursor: 'pointer' }}>+ Add to batch</button>
                      <button onClick={copyLink} style={{ ...btn(C.white, C.brown, C.roseDark), cursor: 'pointer' }}>{copied ? '✓ Copied' : '⧉ Copy quiz link'}</button>
                      {quiz.cover ? (
                        <a href={quiz.cover} download={`eikonia-coverart-${quiz.slug}.${quiz.cover.split('.').pop() || 'webp'}`} style={btn(C.white, C.brown, C.roseDark)}>⬇ Cover art only</a>
                      ) : (
                        <span style={{ ...btn(C.cream1, C.inkMute, C.rose), cursor: 'not-allowed' }}>No cover art</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* result picker */}
                    {quiz.mode !== 'knowledge' && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: C.inkMute, marginBottom: 6 }}>RESULT</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
                          {quiz.results.map((r) => {
                            const on = r.key === key;
                            return (
                              <button
                                key={r.key}
                                onClick={() => setKey(r.key)}
                                title={r.hasArt ? r.name : `${r.name} (no illustration yet — emoji fallback)`}
                                style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${on ? C.brown : C.rose}`, background: on ? C.brown : C.cream1, color: on ? C.white : C.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                              >
                                <span style={{ marginRight: 4 }}>{r.emoji}</span>{r.name}{!r.hasArt && <span style={{ opacity: 0.6 }}> · no art</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* rarity / match */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: C.inkMute }}>MATCH</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: rarity.accent, letterSpacing: 1 }}>{rarity.label.toUpperCase()} · {pct}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(parseInt(e.target.value, 10))} style={{ flex: 1, accentColor: rarity.accent }} />
                        <input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))} style={{ width: 56, padding: '4px 6px', borderRadius: 6, border: `1px solid ${C.roseDark}`, fontSize: 13, textAlign: 'right' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {RARITY_PRESETS.map((p) => (
                          <button key={p.label} onClick={() => setPct(p.pct)} style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: `1px solid ${C.rose}`, background: rarityFromMatch(p.pct).tier === rarity.tier ? C.sand : C.cream1, color: C.inkSoft, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* reward-card preview = the real live card (ResultCardLive) */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, minHeight: 412 }}>
                      {rewardCardData ? (
                        <ResultCardLive data={rewardCardData} cardRef={rewardPreviewRef} />
                      ) : (
                        <div style={{ color: C.inkMute, fontSize: 12, alignSelf: 'center' }}>Pick a result.</div>
                      )}
                    </div>
                    {result && !result.hasArt && (
                      <p style={{ fontSize: 11, color: '#a05a2c', textAlign: 'center', margin: '0 0 10px' }}>No illustration for this result yet; the card shows the emoji fallback.</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button onClick={downloadRewardCard} disabled={busy || !rewardCardData} style={{ ...btn(C.brown, C.white), cursor: busy ? 'wait' : 'pointer', opacity: busy || !rewardCardData ? 0.7 : 1 }}>{busy ? 'Working…' : '⬇ Reward card PNG'}</button>
                      <button onClick={addCardToBatch} disabled={!result} style={{ ...btn(C.sand, C.brownDark), cursor: result ? 'pointer' : 'not-allowed', opacity: result ? 1 : 0.5 }}>+ Add to batch</button>
                      <button onClick={copyLink} style={{ ...btn(C.white, C.brown, C.roseDark), cursor: 'pointer' }}>{copied ? '✓ Copied' : '⧉ Copy quiz link'}</button>
                      <button onClick={addAllResults} style={{ ...btn(C.cream1, C.brown, C.rose), cursor: 'pointer' }}>+ All {quiz.results.length} @ {rarity.label}</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* BATCH TRAY */}
        {batch.length > 0 && (
          <div style={{ marginTop: 22, background: C.white, border: `1px solid ${C.rose}`, borderRadius: 14, padding: 16, boxShadow: '0 4px 18px rgba(74,47,21,.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.brownDark, margin: 0 }}>Batch ({batch.length})</h3>
              <button onClick={downloadBatch} disabled={busy} style={{ ...btn(C.brown, C.white), cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                {busy ? 'Downloading…' : `⬇ Download all (${batch.length})`}
              </button>
              <button onClick={() => setBatch([])} disabled={busy} style={{ ...btn(C.white, C.brown, C.roseDark), cursor: 'pointer' }}>Clear</button>
              <span style={{ fontSize: 11, color: C.inkMute, marginLeft: 'auto' }}>Every card is snapshotted from the live DOM, staggered so the browser keeps them all.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {batch.map((it, i) => {
                const r = rarityFromMatch(it.pct);
                const thumb = it.kind === 'cover' ? bySlug.get(it.slug)?.cover : artUrl(it.slug, it.key);
                return (
                  <div key={`${it.kind}/${it.slug}/${it.key}/${it.pct}/${i}`} style={{ flex: '0 0 auto', width: 96, position: 'relative' }}>
                    <div style={{ width: 96, aspectRatio: it.kind === 'cover' ? '4 / 3' : '1 / 1', borderRadius: 8, overflow: 'hidden', background: C.sand, border: `1px solid ${C.rose}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <span style={{ fontSize: 9, color: C.brown, padding: 4, textAlign: 'center' }}>{it.kind === 'cover' ? 'cover card' : 'no art'}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setBatch((b) => b.filter((_, j) => j !== i))}
                      aria-label="Remove"
                      style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, border: 'none', background: C.brownDark, color: C.cream1, fontSize: 13, lineHeight: '22px', cursor: 'pointer' }}
                    >×</button>
                    <div style={{ fontSize: 9.5, color: C.inkMute, marginTop: 4, lineHeight: 1.25 }}>
                      {it.kind === 'cover' ? (
                        <><span style={{ color: C.brown, fontWeight: 800 }}>COVER</span><br />{it.title}</>
                      ) : (
                        <><span style={{ color: r.accent, fontWeight: 800 }}>{r.label}</span> {it.pct}%<br />{it.name}</>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* OFFSCREEN: live cards for batch items, mounted so they can be snapshotted.
          No opacity:0 (html-to-image would bake transparency in); left:-99999 hides it. */}
      <div aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
        {batchCoverSlugs.map((s) => {
          const t = testBySlug.get(s);
          if (!t) return null;
          return (
            <div key={`c:${s}`} ref={(el) => { if (el) batchCoverRefs.current.set(s, el); else batchCoverRefs.current.delete(s); }} style={{ width: COVER_W }}>
              <QuizCard test={t} />
            </div>
          );
        })}
        {batchCardItems.map((it) => {
          const cd = cardDataFor(it.slug, it.key, it.pct);
          if (!cd) return null;
          const id = cardId(it.slug, it.key, it.pct);
          return (
            <ResultCardLive
              key={`r:${id}`}
              data={cd}
              cardRef={(el) => { if (el) batchCardRefs.current.set(id, el as HTMLElement); else batchCardRefs.current.delete(id); }}
            />
          );
        })}
      </div>
    </div>
  );
}

function btn(bg: string, color: string, border?: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '9px 12px', borderRadius: 9, border: `1px solid ${border ?? bg}`,
    background: bg, color, fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
  };
}
