import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { run } from '@/lib/db';
import { syncAchievementsForUser } from '@/lib/achievements';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { LESSON_COUNT } from '@/lib/lessons';

type VerifyPayload = {
  lessonId?: number;
  proofUrl?: string;
};

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as VerifyPayload | null;
  const lessonId = Number(body?.lessonId);
  const proofUrl = body?.proofUrl?.trim();

  if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > LESSON_COUNT) {
    return NextResponse.json({ error: 'Valid lessonId is required' }, { status: 400 });
  }

  if (!proofUrl) {
    return NextResponse.json({ error: 'proofUrl is required' }, { status: 400 });
  }

  const now = new Date().toISOString();

  run(
    `INSERT INTO progress (user_id, lesson_id, status, started_at, completed_at, proof_url, proof_verified)
     VALUES (?, ?, 'completed', ?, ?, ?, 0)
     ON CONFLICT(user_id, lesson_id)
     DO UPDATE SET
       status = 'completed',
       started_at = COALESCE(progress.started_at, excluded.started_at),
       completed_at = excluded.completed_at,
       proof_url = excluded.proof_url,
       proof_verified = 0`,
    userId,
    lessonId,
    now,
    now,
    proofUrl,
  );

  const earnedBadges = syncAchievementsForUser(userId);

  return NextResponse.json({
    success: true,
    lessonId,
    proofUrl,
    earnedBadges,
  });
}
