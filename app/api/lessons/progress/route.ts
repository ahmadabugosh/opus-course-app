import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { all, run } from '@/lib/db';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { LESSON_COUNT } from '@/lib/lessons';

type ProgressRow = {
  lessonId: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  startedAt: string | null;
  completedAt: string | null;
  proofUrl: string | null;
  proofVerified: number;
};

type ProgressPayload = {
  lessonId?: number;
  status?: ProgressRow['status'];
  startedAt?: string | null;
  completedAt?: string | null;
  proofUrl?: string | null;
  proofVerified?: boolean;
};

const validStatuses = new Set(['locked', 'available', 'in_progress', 'completed']);

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

function getDefaultLessons(): ProgressRow[] {
  return Array.from({ length: LESSON_COUNT }, (_, index) => ({
    lessonId: index + 1,
    status: 'available',
    startedAt: null,
    completedAt: null,
    proofUrl: null,
    proofVerified: 0,
  }));
}

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ progress: getDefaultLessons(), source: 'anonymous' });
  }

  const rows = all<{
    lesson_id: number;
    status: ProgressRow['status'];
    started_at: string | null;
    completed_at: string | null;
    proof_url: string | null;
    proof_verified: number;
  }>(
    `SELECT lesson_id, status, started_at, completed_at, proof_url, proof_verified
     FROM progress WHERE user_id = ? ORDER BY lesson_id ASC`,
    userId,
  );

  const byLesson = new Map(rows.map((row) => [row.lesson_id, row]));

  const progress = getDefaultLessons().map((fallback) => {
    const row = byLesson.get(fallback.lessonId);

    if (!row) return fallback;

    return {
      lessonId: row.lesson_id,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      proofUrl: row.proof_url,
      proofVerified: row.proof_verified,
    } satisfies ProgressRow;
  });

  return NextResponse.json({ progress, source: 'database' });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ProgressPayload | null;
  const lessonId = Number(body?.lessonId);

  if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > LESSON_COUNT) {
    return NextResponse.json({ error: 'Valid lessonId is required' }, { status: 400 });
  }

  const status = body?.status ?? 'in_progress';

  if (!validStatuses.has(status)) {
    return NextResponse.json({ error: 'Invalid lesson status' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const startedAt = body?.startedAt ?? (status !== 'available' ? now : null);
  const completedAt = body?.completedAt ?? (status === 'completed' ? now : null);

  run(
    `INSERT INTO progress (user_id, lesson_id, status, started_at, completed_at, proof_url, proof_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, lesson_id)
     DO UPDATE SET
       status = excluded.status,
       started_at = COALESCE(excluded.started_at, progress.started_at),
       completed_at = COALESCE(excluded.completed_at, progress.completed_at),
       proof_url = COALESCE(excluded.proof_url, progress.proof_url),
       proof_verified = COALESCE(excluded.proof_verified, progress.proof_verified)`,
    userId,
    lessonId,
    status,
    startedAt,
    completedAt,
    body?.proofUrl ?? null,
    body?.proofVerified ? 1 : 0,
  );

  return NextResponse.json({
    success: true,
    progress: {
      lessonId,
      status,
      startedAt,
      completedAt,
      proofUrl: body?.proofUrl ?? null,
      proofVerified: body?.proofVerified ? 1 : 0,
    },
  });
}
