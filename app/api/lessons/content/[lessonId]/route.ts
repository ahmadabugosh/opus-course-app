import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { getLessonById } from '@/lib/lessons';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const parsedLessonId = Number.parseInt(lessonId, 10);
  const lesson = getLessonById(parsedLessonId);

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const contentPath = path.join(process.cwd(), lesson.contentPath);

  try {
    const markdown = await fs.readFile(contentPath, 'utf8');
    return NextResponse.json({ markdown });
  } catch {
    return NextResponse.json({ markdown: '' });
  }
}
