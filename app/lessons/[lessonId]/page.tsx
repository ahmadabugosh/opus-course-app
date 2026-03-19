"use client";

import { LessonSidebar } from '@/components/lesson-sidebar';
import { ProofSubmitForm } from '@/components/proof-submit-form';
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

export default function LessonPage({ params }: LessonPageProps) {
  const lessonId = Number.parseInt(params.lessonId, 10);
  const lesson = getLessonById(lessonId);

  const { getProgress, getTotalCompleted } = useProgress();
  const progress = getProgress();
  const totalCompleted = getTotalCompleted();

  if (!lesson) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 text-white">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[340px,1fr]">
      <LessonSidebar
        lessons={lessons}
        progress={progress}
        currentLessonId={lesson.id}
        title={getLearnerTitle(totalCompleted)}
        totalCompleted={totalCompleted}
      />

      <section className="space-y-5 rounded-2xl border border-[#333355] bg-[#1a1a33] p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-300">Lesson {lesson.id}</p>
          <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          <p className="text-[#cccccc]">{lesson.description}</p>
        </header>

        <VideoEmbed url={lesson.videoUrl} title={lesson.title} />

        <article className="rounded-xl border border-[#333355] bg-[#16162b] p-5 text-[#d4d4ef]">
          <h2 className="text-xl font-semibold text-white">What you'll build</h2>
          <p className="mt-2">{lesson.challenge.description}</p>
          <p className="mt-2 text-sm text-[#a8a8d0]">Verification type: {lesson.challenge.verificationType}</p>
          <p className="mt-2 text-sm text-[#a8a8d0]">Hint: {lesson.challenge.hint}</p>
        </article>

        <ProofSubmitForm lessonId={lesson.id} />
      </section>
    </main>
  );
}
