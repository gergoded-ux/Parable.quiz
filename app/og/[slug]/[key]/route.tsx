// app/og/[slug]/[key]/route.tsx
import { ImageResponse } from 'next/og';
import { loadTestBySlug } from '@/lib/test-loader';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const { slug, key } = await params;
  const test = loadTestBySlug(slug);

  let name = test?.title ?? 'Parable';
  let emoji = '📜';
  let line = "What's your parable?";

  if (test?.mode === 'archetype' && test.results[key]) {
    name = test.results[key].name;
    emoji = test.results[key].emoji;
    line = `I got ${name} on Parable`;
  } else if (test?.mode === 'profile' && test.results[key]) {
    name = test.results[key].name;
    line = `My top gift: ${name}`;
  } else if (test?.mode === 'knowledge') {
    name = `${key}%`;
    line = `I scored ${key}% on ${test.title}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, #fdf5ee 0%, #e8c9a7 100%)',
          color: '#4a2f15', fontFamily: 'Inter', padding: 60, justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, color: '#6b4423' }}>Parable</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 120 }}>{emoji}</div>
          <div style={{ fontSize: 72, fontWeight: 800, marginTop: 12 }}>{name}</div>
          <div style={{ fontSize: 28, color: '#4a3c2e', marginTop: 12 }}>{line}</div>
        </div>
        <div style={{ fontSize: 22, color: '#8a6a47' }}>parable.quiz</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
