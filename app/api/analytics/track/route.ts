import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics';

const ALLOWED_EVENTS: AnalyticsEvent[] = [
  'page_view',
  'lesson_start',
  'lesson_complete',
  'achievement_earned',
  'certificate_generated',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body?.event as AnalyticsEvent | undefined;

    if (!event) {
      return NextResponse.json({ error: 'event is required' }, { status: 400 });
    }

    if (!ALLOWED_EVENTS.includes(event)) {
      return NextResponse.json({ error: 'invalid event type' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;

    trackEvent(event, body?.data ?? {}, session?.userId ?? null);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }
}
