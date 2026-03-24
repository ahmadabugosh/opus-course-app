import fs from 'node:fs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { get } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { createAndStoreCertificate, getUserSummary } from '@/lib/certificate';
import { sendCourseCompletionEvent, addOrUpdateContact } from '@/lib/loops';

type CertificateRow = {
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

export async function POST() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserSummary(userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const completedLessons = userId
    ? Number(
        get<{ total: number }>(
          "SELECT COUNT(*) as total FROM progress WHERE user_id = ? AND status = 'completed'",
          userId,
        )?.total ?? 0,
      )
    : 0;

  if (completedLessons < 12) {
    return NextResponse.json(
      { 
        error: 'Complete all 12 lessons before generating a certificate',
        completedLessons,
        required: 12
      },
      { status: 400 },
    );
  }

  const displayName = user.display_name || user.username || user.email;
  const certificate = createAndStoreCertificate({ userId, displayName });

  // Send completion event to Loops (async, non-blocking)
  Promise.all([
    sendCourseCompletionEvent({
      email: user.email,
      attestationUid: certificate.certificateId,
      courseCompletedAt: certificate.completionDate,
      questsCompletedCount: certificate.stats.completedLessons,
    }),
    addOrUpdateContact({
      email: user.email,
      userId: String(userId),
      firstName: user.display_name || user.username || undefined,
      questsCompletedCount: certificate.stats.completedLessons,
      courseCompleted: true,
      courseCompletedAt: certificate.completionDate,
      attestationUid: certificate.certificateId,
      source: 'learn-opus',
      userGroup: 'opus-mastery',
    }),
  ]).catch((error) => console.error('[Certificate] Loops sync failed:', error));

  return NextResponse.json({
    success: true,
    certificateId: certificate.certificateId,
    completionDate: certificate.completionDate,
    stats: certificate.stats,
    downloadUrl: `/api/certificate/generate?certificateId=${certificate.certificateId}`,
    profileUrl: user.username ? `/u/${user.username}` : null,
  });
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get('certificateId');

  if (!certificateId) {
    return NextResponse.json({ error: 'certificateId is required' }, { status: 400 });
  }

  const row = get<CertificateRow>(
    'SELECT certificate_id, pdf_path FROM certificates WHERE user_id = ? AND certificate_id = ?',
    userId,
    certificateId,
  );

  if (!row?.pdf_path || !fs.existsSync(row.pdf_path)) {
    return NextResponse.json({ error: 'Certificate file not found' }, { status: 404 });
  }

  const pdf = fs.readFileSync(row.pdf_path);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="opus-certificate-${row.certificate_id}.pdf"`,
    },
  });
}
