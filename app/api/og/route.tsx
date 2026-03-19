import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'radial-gradient(circle at top left, #4338ca 0%, #1e1b4b 35%, #0f0f1a 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 6, color: '#a5b4fc' }}>OPUS COURSE</div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 16 }}>Opus Mastery</div>
        <div style={{ fontSize: 32, marginTop: 18, color: '#c7d2fe', maxWidth: '900px', lineHeight: 1.35 }}>
          12 practical lessons. Real automation challenges. Certificate when you finish.
        </div>
        <div style={{ fontSize: 24, marginTop: 30, color: '#e2e8f0' }}>Start free at opus-course.learnopenclaw.ai</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
