import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { run } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

type LocalProgressEntry = {
  lessonId: number;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  proofUrl?: string | null;
};

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const localProgress = body.localProgress as LocalProgressEntry[];

    if (!Array.isArray(localProgress) || localProgress.length === 0) {
      return NextResponse.json({ error: 'No progress data provided' }, { status: 400 });
    }

    let syncedCount = 0;

    for (const entry of localProgress) {
      if (!entry.lessonId || typeof entry.lessonId !== 'number') continue;

      const status = entry.status || 'not_started';
      const startedAt = entry.startedAt || null;
      const completedAt = entry.completedAt || null;
      const proofUrl = entry.proofUrl || null;

      // Upsert into database
      run(
        `INSERT INTO progress (user_id, lesson_id, status, started_at, completed_at, proof_url, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id, lesson_id) DO UPDATE SET
           status = excluded.status,
           started_at = excluded.started_at,
           completed_at = excluded.completed_at,
           proof_url = excluded.proof_url,
           updated_at = datetime('now')`,
        userId,
        entry.lessonId,
        status,
        startedAt,
        completedAt,
        proofUrl,
      );

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} lessons to database`,
      syncedCount,
    });
  } catch (error) {
    console.error('[Progress Sync] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
