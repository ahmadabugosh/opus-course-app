"use client";

import Link from 'next/link';

import type { LessonMeta } from '@/lib/lessons';

import { AchievementBadge } from '@/components/achievement-badge';
import { ProgressBar } from '@/components/progress-bar';
import { ACHIEVEMENTS, type BadgeId } from '@/lib/achievements';

type SidebarLesson = {
  lessonId: number;
  status: 'not_started' | 'in_progress' | 'completed';
};

type LessonSidebarProps = {
  lessons: LessonMeta[];
  progress: SidebarLesson[];
  currentLessonId: number;
  title: string;
  totalCompleted: number;
  earnedBadges: BadgeId[];
};

function getStatusIcon(status: SidebarLesson['status'], isCurrent: boolean) {
  if (status === 'completed') return '✅';
  if (isCurrent) return '→';
  return '○';
}

export function LessonSidebar({
  lessons,
  progress,
  currentLessonId,
  title,
  totalCompleted,
  earnedBadges,
}: LessonSidebarProps) {
  return (
    <aside className="w-full rounded-2xl border border-[#333355] bg-[#1e1e3a] p-5 lg:sticky lg:top-6 lg:h-fit">
      <h2 className="text-xl font-semibold text-white">🎓 Opus Mastery</h2>

      <div className="mt-4">
        <ProgressBar completed={totalCompleted} title={title} />
      </div>

      <ul className="mt-5 space-y-2">
        {lessons.map((lesson) => {
          const progressEntry = progress.find((entry) => entry.lessonId === lesson.id);
          const status = progressEntry?.status ?? 'not_started';
          const isCurrent = currentLessonId === lesson.id;

          return (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.id}`}
                className={`flex items-start gap-2 rounded-md px-2 py-1 text-sm transition ${
                  isCurrent ? 'bg-[#2a2a52] text-white' : 'text-[#d4d4ef] hover:bg-[#26264a]'
                }`}
              >
                <span className="mt-0.5">{getStatusIcon(status, isCurrent)}</span>
                <span>
                  {lesson.id}. {lesson.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-[#333355] bg-[#16162b] p-3 text-sm text-[#cccccc]">
        <h3 className="font-semibold text-white">🏆 Current Rank</h3>
        <p className="mt-1">{title}</p>
      </div>

      <div className="mt-4 rounded-xl border border-[#333355] bg-[#16162b] p-3">
        <h3 className="text-sm font-semibold text-white">🏆 Achievements</h3>
        <div className="mt-2 grid gap-2">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.badgeId}
              achievement={achievement}
              earned={earnedBadges.includes(achievement.badgeId)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
