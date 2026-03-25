"use client";

import { useEffect, useMemo, useState } from 'react';

import LessonContent from '@/components/lesson-content';
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

  // Handle logout for testing: ?logout=true
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === 'true') {
      // Clear all progress
      window.localStorage.clear();
      // Redirect to course page without query params
      window.location.href = '/course';
    }
  }, []);

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
  const [lessonMarkdown, setLessonMarkdown] = useState<string>('');

  // Auto-advance to next incomplete lesson when a lesson is completed
  useEffect(() => {
    const currentLesson = progress.find((p) => p.lessonId === selectedLessonId);
    if (currentLesson?.status === 'completed') {
      const nextLessonId = getDefaultCurrentLessonId(progress);
      if (nextLessonId !== selectedLessonId) {
        setSelectedLessonId(nextLessonId);
      }
    }
  }, [progress, selectedLessonId]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0],
    [selectedLessonId],
  );

  const currentTitle = getLearnerTitle(totalCompleted);

  // Fetch lesson markdown content when selected lesson changes
  useEffect(() => {
    if (!selectedLesson) return;
    const currentId = selectedLesson.id;
    let cancelled = false;

    async function loadContent() {
      try {
        const response = await fetch(`/api/lessons/content/${currentId}`);
        const payload = (await response.json()) as { markdown?: string };
        if (!cancelled) {
          setLessonMarkdown(payload.markdown ?? '');
        }
      } catch {
        if (!cancelled) {
          setLessonMarkdown('');
        }
      }
    }

    setLessonMarkdown('');
    loadContent();

    return () => {
      cancelled = true;
    };
  }, [selectedLesson]);

  return (
    <div className="flex w-full min-h-[calc(100dvh-4rem)]">
      {/* Left panel — robot + nav */}
      <aside className="hidden w-[380px] shrink-0 flex-col gap-4 border-r border-[#2a2a4a] bg-[#12122a] p-5 lg:flex">
        <div>
          <h2 className="text-xl font-semibold text-white">🤖 Opus Robot Assembly</h2>
          <p className="mt-1 text-sm text-[#9ca3cf]">Stage {totalCompleted}/12</p>
        </div>

        <RobotAssembly stage={totalCompleted} className="w-full" />

        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a36] p-3">
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

        <nav className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3cf]">Lessons</p>
          <ul className="mt-3 space-y-0.5">
            {lessons.map((lesson) => {
              const progressEntry = progress.find((entry) => entry.lessonId === lesson.id);
              const status = progressEntry?.status ?? 'not_started';
              const isCurrent = selectedLesson.id === lesson.id;
              const isCompleted = status === 'completed';

              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    aria-label={`Open lesson ${lesson.id}`}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isCurrent
                        ? 'bg-indigo-500/15 text-white ring-1 ring-indigo-500/30'
                        : 'text-[#d4d4ef] hover:bg-[#26264a]'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-[#2a2a4a] text-[#9ca3cf]'
                    }`}>
                      {isCompleted ? '✓' : lesson.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate ${isCompleted ? 'text-[#9ca3cf]' : ''}`}>
                        {lesson.title}
                      </span>
                      <span className="block text-xs text-[#7a7a9f] mt-0.5">{lesson.description?.slice(0, 50)}{(lesson.description?.length ?? 0) > 50 ? '…' : ''}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Right panel — lesson content */}
      <section className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <CompletionCelebration totalCompleted={totalCompleted} />

          {/* Mobile-only: compact robot + progress */}
          <div className="rounded-2xl border border-[#2a2a4a] bg-[#12122a] p-4 lg:hidden">
            <div className="flex items-center gap-4">
              <div className="w-24 shrink-0">
                <RobotAssembly stage={totalCompleted} className="w-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{currentTitle}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#2a2a4a]">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(totalCompleted / 12) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#9ca3cf]">{totalCompleted}/12 lessons</p>
              </div>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-[#9ca3cf]">Show all lessons</summary>
              <ul className="mt-2 space-y-1">
                {lessons.map((lesson) => {
                  const progressEntry = progress.find((entry) => entry.lessonId === lesson.id);
                  const status = progressEntry?.status ?? 'not_started';
                  const isCurrent = selectedLesson.id === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-xs transition ${
                          isCurrent ? 'bg-[#2a2a52] text-white' : 'text-[#d4d4ef] hover:bg-[#26264a]'
                        }`}
                      >
                        <span>{getStatusLabel(status, isCurrent)}</span>
                        <span>{lesson.id}. {lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>

          <header className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-indigo-300">Opus Course Lesson {selectedLesson.id}</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{selectedLesson.title}</h1>
            <p className="text-[#cccccc]">{selectedLesson.description}</p>
          </header>

          <VideoEmbed url={selectedLesson.videoUrl} title={selectedLesson.title} />

          {/* Written lesson guide */}
          <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
            <h2 className="text-xl font-semibold text-white">📝 Lesson Guide</h2>
            {lessonMarkdown ? (
              <LessonContent markdown={lessonMarkdown} />
            ) : (
              <p className="mt-2 text-sm text-[#a8a8d0]">Loading lesson content...</p>
            )}
          </article>

          <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
            <h2 className="text-xl font-semibold text-white">🛠 Challenge</h2>
            <p className="mt-2">{selectedLesson.challenge.description}</p>
            <p className="mt-2 text-sm text-[#a8a8d0]">Hint: {selectedLesson.challenge.hint}</p>
          </article>

          <LessonVerification lesson={selectedLesson} />
        </div>
      </section>
    </div>
  );
}
