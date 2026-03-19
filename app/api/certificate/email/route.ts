import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { get } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

type RequestPayload = {
  certificateId?: string;
};

type EmailTargetRow = {
  email: string;
  certificate_id: string;
  pdf_path: string | null;
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

  const body = (await request.json().catch(() => null)) as RequestPayload | null;
  const certificateId = body?.certificateId?.trim();

  if (!certificateId) {
    return NextResponse.json({ error: 'certificateId is required' }, { status: 400 });
  }

  const row = get<EmailTargetRow>(
    `SELECT u.email, c.certificate_id, c.pdf_path
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     WHERE c.user_id = ? AND c.certificate_id = ?`,
    userId,
    certificateId,
  );

  if (!row) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  if (!process.env.SMTP_HOST || !process.env.FROM_EMAIL) {
    return NextResponse.json(
      {
        error: 'Email delivery is not configured yet. Set SMTP_HOST and FROM_EMAIL.',
      },
      { status: 501 },
    );
  }

  // BLOCKED: SMTP transport dependency is not configured yet - TODO: revisit
  return NextResponse.json({
    success: true,
    message: `Email delivery placeholder accepted for ${row.email}.`,
  });
}
