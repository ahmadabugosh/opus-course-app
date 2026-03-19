import { ImageResponse } from 'next/og';

import { all, get } from '@/lib/db';
import { getLearnerTitle } from '@/lib/course-progression';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{ username: string }>;
};

type UserRow = {
  id: number;
  username: string;
  display_name: string | null;
};

type CountRow = {
  total: number;
};

export async function GET(_request: Request, context: Context) {
  const { username } = await context.params;
  const user = get<UserRow>('SELECT id, username, display_name FROM users WHERE username = ?', username);

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const completed = get<CountRow>(
    "SELECT COUNT(*) as total FROM progress WHERE user_id = ? AND status = 'completed'",
    user.id,
  )?.total ?? 0;

  const achievements = all<{ badge_id: string }>('SELECT badge_id FROM achievements WHERE user_id = ?', user.id).length;
  const title = getLearnerTitle(completed);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1e1e3a 50%, #312e81 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 2, color: '#a5b4fc' }}>Opus Mastery</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 56, fontWeight: 700 }}>{user.display_name || `@${user.username}`}</div>
          <div style={{ fontSize: 36, color: '#e0e7ff' }}>{title}</div>
          <div style={{ fontSize: 24, color: '#c7d2fe' }}>
            {completed}/12 lessons • {achievements} achievements
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#cbd5e1' }}>
          <span>opus-course.learnopenclaw.ai</span>
          <span>Earn your badge ⚡</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
