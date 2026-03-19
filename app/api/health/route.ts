import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'opus-course-app',
    timestamp: new Date().toISOString(),
  });
}
