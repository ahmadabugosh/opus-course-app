import { NextResponse } from 'next/server';

import { getAnalyticsSummary } from '@/lib/analytics';

export async function GET() {
  const summary = getAnalyticsSummary();

  return NextResponse.json({
    ...summary,
    popularLessons: summary.popularLessons,
    completionRate: summary.completionRate,
  });
}
