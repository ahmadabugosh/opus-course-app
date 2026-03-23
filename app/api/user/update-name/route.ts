import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { run } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

type UpdateNamePayload = {
  displayName?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UpdateNamePayload | null;
  const displayName = body?.displayName?.trim();

  if (!displayName || displayName.length === 0) {
    return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
  }

  if (displayName.length > 100) {
    return NextResponse.json({ error: 'Display name must be 100 characters or less' }, { status: 400 });
  }

  run(
    'UPDATE users SET display_name = ?, updated_at = datetime(\'now\') WHERE id = ?',
    displayName,
    payload.userId,
  );

  return NextResponse.json({ success: true, displayName });
}
