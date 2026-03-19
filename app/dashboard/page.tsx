"use client";

import { LessonSidebar } from '@/components/lesson-sidebar';
import { ProofSubmitForm } from '@/components/proof-submit-form';
import VideoEmbed from '@/components/video-embed';
import { useProgress } from '@/components/progress-provider';
import { CompletionCelebration } from '@/components/completion-celebration';
import { evaluateAchievementBadges } from '@/lib/achievements';
import {
  getDefaultCurrentLessonId,
  getLearnerTitle,
} from '@/lib/course-progression';
import { getAllLessons } from '@/lib/lessons';

const lessons = getAllLessons();

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
  const currentLessonId = getDefaultCurrentLessonId(progress);
  const currentLesson = lessons.find((lesson) => lesson.id === currentLessonId) ?? lessons[0];
  const currentTitle = getLearnerTitle(totalCompleted);
  const earnedBadges = evaluateAchievementBadges(
    progress.map((lesson) => ({
      lesson_id: lesson.lessonId,
      started_at: lesson.startedAt,
      completed_at: lesson.completedAt,
    })),
  );

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[340px,1fr]">
      <LessonSidebar
        lessons={lessons}
        progress={progress}
        currentLessonId={currentLesson.id}
        title={currentTitle}
        totalCompleted={totalCompleted}
        earnedBadges={earnedBadges}
      />

      <section className="space-y-5 rounded-2xl border border-[#333355] bg-[#1a1a33] p-4 sm:p-6">
        <CompletionCelebration totalCompleted={totalCompleted} />
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-300">Current lesson</p>
          <h1 className="text-3xl font-bold text-white">
            Lesson {currentLesson.id}: {currentLesson.title}
          </h1>
          <p className="text-[#cccccc]">{currentLesson.description}</p>
        </header>

        <VideoEmbed url={currentLesson.videoUrl} title={currentLesson.title} />

        <div className="rounded-xl border border-[#333355] bg-[#16162b] p-4">
          <h2 className="text-xl font-semibold text-white">🛠 Challenge</h2>
          <p className="mt-2 text-[#d4d4ef]">{currentLesson.challenge.description}</p>
          <p className="mt-2 text-sm text-[#a8a8d0]">Hint: {currentLesson.challenge.hint}</p>
        </div>

        <ProofSubmitForm lessonId={currentLesson.id} />
      </section>
    </main>
  );
}
