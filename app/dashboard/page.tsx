"use client";

import { useMemo, useState } from 'react';

import { LessonVerification } from '@/components/lesson-verification';
import { RobotAssembly } from '@/components/robot-assembly/robot-assembly';
import VideoEmbed from '@/components/video-embed';
import { useProgress } from '@/components/progress-provider';
import { CompletionCelebration } from '@/components/completion-celebration';
import {
  getDefaultCurrentLessonId,
  getLearnerTitle,
} from '@/lib/course-progression';
import { getAllLessons } from '@/lib/lessons';

const lessons = getAllLessons();

function getStatusLabel(status: 'not_started' | 'in_progress' | 'completed', isCurrent: boolean) {
  if (status === 'completed') return '✅';
  if (isCurrent) return '→';
  return '○';
}

export default function DashboardPage() {
  const { getProgress, getTotalCompleted } = useProgress();

  if (lessons.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="text-2xl font-bold text-white">No lessons available yet</h1>
          <p className="mt-2 text-sm text-muted">Please add lesson content in lib/lessons.ts and refresh.</p>
        </div>
      </main>
    );
  }

  const progress = getProgress();
  const totalCompleted = getTotalCompleted();
  const defaultLessonId = getDefaultCurrentLessonId(progress);
  const [selectedLessonId, setSelectedLessonId] = useState(defaultLessonId);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0],
    [selectedLessonId],
  );

  const currentTitle = getLearnerTitle(totalCompleted);

  return (
    <main className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[minmax(320px,38%),1fr]">
      <aside className="rounded-2xl border border-[#2a2a4a] bg-[#12122a] p-4 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">🤖 Robot Assembly Hatch</h2>
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
            {lessons.map((lesson) => {
              const progressEntry = progress.find((entry) => entry.lessonId === lesson.id);
              const status = progressEntry?.status ?? 'not_started';
              const isCurrent = selectedLesson.id === lesson.id;

              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    aria-label={`Open lesson ${lesson.id}`}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                      isCurrent ? 'bg-[#2a2a52] text-white' : 'text-[#d4d4ef] hover:bg-[#26264a]'
                    }`}
                  >
                    <span className="mt-0.5">{getStatusLabel(status, isCurrent)}</span>
                    <span>
                      {lesson.id}. {lesson.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      </aside>

      <section className="space-y-5 rounded-2xl border border-[#333355] bg-[#1a1a33] p-4 sm:p-6 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto">
        <CompletionCelebration totalCompleted={totalCompleted} />

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-300">Lesson {selectedLesson.id}</p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{selectedLesson.title}</h1>
          <p className="text-[#cccccc]">{selectedLesson.description}</p>
        </header>

        <VideoEmbed url={selectedLesson.videoUrl} title={selectedLesson.title} />

        <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
          <h2 className="text-xl font-semibold text-white">🛠 Challenge</h2>
          <p className="mt-2">{selectedLesson.challenge.description}</p>
          <p className="mt-2 text-sm text-[#a8a8d0]">Hint: {selectedLesson.challenge.hint}</p>
        </article>

        <LessonVerification lesson={selectedLesson} />
      </section>
    </main>
  );
}
