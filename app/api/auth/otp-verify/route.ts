import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { get, run } from '@/lib/db';
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyOtpCode,
} from '@/lib/auth';

type VerifyPayload = {
  email?: string;
  code?: string;
  localProgress?: Array<{
    lessonId: number;
    status?: string;
    startedAt?: string | null;
    completedAt?: string | null;
    proofUrl?: string | null;
  }>;
};

type UserRow = {
  id: number;
  otp_code: string | null;
  otp_expires_at: string | null;
};

function migrateProgress(userId: number, progress: VerifyPayload['localProgress']) {
  if (!progress?.length) {
    return;
  }

  for (const lesson of progress) {
    if (!lesson.lessonId) continue;

    run(
      `INSERT INTO progress (user_id, lesson_id, status, started_at, completed_at, proof_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id)
       DO UPDATE SET
         status = excluded.status,
         started_at = COALESCE(excluded.started_at, progress.started_at),
         completed_at = COALESCE(excluded.completed_at, progress.completed_at),
         proof_url = COALESCE(excluded.proof_url, progress.proof_url)`,
      userId,
      lesson.lessonId,
      lesson.status || 'available',
      lesson.startedAt || null,
      lesson.completedAt || null,
      lesson.proofUrl || null,
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as VerifyPayload | null;
  const email = body?.email?.trim().toLowerCase();
  const code = body?.code?.trim();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
  }

  const user = get<UserRow>('SELECT id, otp_code, otp_expires_at FROM users WHERE email = ?', email);

  if (!user?.otp_code || !user.otp_expires_at) {
    return NextResponse.json({ error: 'OTP not found. Request a new code.' }, { status: 401 });
  }

  const isExpired = new Date(user.otp_expires_at).getTime() < Date.now();
  const isValid = verifyOtpCode(code, user.otp_code);

  if (!isValid || isExpired) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }

  run('UPDATE users SET otp_code = NULL, otp_expires_at = NULL, updated_at = datetime(\'now\') WHERE id = ?', user.id);

  migrateProgress(user.id, body?.localProgress);

  const token = createSessionToken({ userId: user.id });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());

  return NextResponse.json({ success: true, userId: user.id });
}
