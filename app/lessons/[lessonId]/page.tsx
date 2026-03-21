"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import LessonContent from '@/components/lesson-content';
import { LessonVerification } from '@/components/lesson-verification';
import { RobotAssembly } from '@/components/robot-assembly/robot-assembly';
import VideoEmbed from '@/components/video-embed';
import { useProgress } from '@/components/progress-provider';
import { getLearnerTitle } from '@/lib/course-progression';
import { getAllLessons, getLessonById } from '@/lib/lessons';

type LessonPageProps = {
  params: {
    lessonId: string;
  };
};

const lessons = getAllLessons();

function getStatusLabel(status: 'not_started' | 'in_progress' | 'completed', isCurrent: boolean) {
  if (status === 'completed') return '✅';
  if (isCurrent) return '→';
  return '○';
}

export default function LessonPage({ params }: LessonPageProps) {
  const lessonId = Number.parseInt(params.lessonId, 10);
  const lesson = getLessonById(lessonId);

  const { getProgress, getTotalCompleted } = useProgress();
  const progress = getProgress();
  const totalCompleted = getTotalCompleted();

  const [lessonMarkdown, setLessonMarkdown] = useState<string>('');

  useEffect(() => {
    if (!lesson) return;

    const currentLessonId = lesson.id;
    let cancelled = false;

    async function loadContent() {
      const response = await fetch(`/api/lessons/content/${currentLessonId}`);
      const payload = (await response.json()) as { markdown?: string };

      if (!cancelled) {
        setLessonMarkdown(payload.markdown ?? '');
      }
    }

    loadContent().catch(() => {
      if (!cancelled) {
        setLessonMarkdown('');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lesson]);

  const currentTitle = getLearnerTitle(totalCompleted);

  const sortedLessons = useMemo(() => lessons, []);

  if (!lesson) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 text-white">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[minmax(320px,38%),1fr]">
      <aside className="rounded-2xl border border-[#2a2a4a] bg-[#12122a] p-4 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">🤖 Opus Robot Assembly Hatch</h2>
        <p className="mt-1 text-sm text-[#9ca3cf]">Build one part per completed lesson. Stage {totalCompleted}/12.</p>

        <div className="mt-4">
          <RobotAssembly stage={totalCompleted} className="w-full" />
        </div>

        <div className="mt-4 rounded-xl border border-[#2a2a4a] bg-[#1a1a36] p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#d4d4ef]">Progress</span>
            <span className="font-semibold text-white">{totalCompleted}/12</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#2a2a4a]">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(totalCompleted / 12) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[#9ca3cf]">{currentTitle}</p>
        </div>

        <details className="mt-4 rounded-xl border border-[#2a2a4a] bg-[#1a1a36] p-3 lg:open" open>
          <summary className="cursor-pointer text-sm font-semibold text-white">Lesson navigation</summary>
          <ul className="mt-3 space-y-1">
            {sortedLessons.map((listLesson) => {
              const progressEntry = progress.find((entry) => entry.lessonId === listLesson.id);
              const status = progressEntry?.status ?? 'not_started';
              const isCurrent = lesson.id === listLesson.id;

              return (
                <li key={listLesson.id}>
                  <Link
                    href={`/lessons/${listLesson.id}`}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                      isCurrent ? 'bg-[#2a2a52] text-white' : 'text-[#d4d4ef] hover:bg-[#26264a]'
                    }`}
                  >
                    <span className="mt-0.5">{getStatusLabel(status, isCurrent)}</span>
                    <span>
                      {listLesson.id}. {listLesson.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </aside>

      <section className="space-y-5 rounded-2xl border border-[#333355] bg-[#1a1a33] p-4 sm:p-6 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-300">Opus Course Lesson {lesson.id}</p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{lesson.title}</h1>
          <p className="text-[#cccccc]">{lesson.description}</p>
        </header>

        <VideoEmbed url={lesson.videoUrl} title={lesson.title} />

        <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
          <h2 className="text-xl font-semibold text-white">📝 Written guide</h2>
          {lessonMarkdown ? (
            <LessonContent markdown={lessonMarkdown} />
          ) : (
            <p className="mt-2 text-sm text-[#a8a8d0]">Loading lesson guide...</p>
          )}
        </article>

        <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
          <h2 className="text-xl font-semibold text-white">🛠 Challenge</h2>
          <p className="mt-2">{lesson.challenge.description}</p>
          <p className="mt-2 text-sm text-[#a8a8d0]">Hint: {lesson.challenge.hint}</p>
        </article>

        <LessonVerification lesson={lesson} />
      </section>
    </main>
  );
}
