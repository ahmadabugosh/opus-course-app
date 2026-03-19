import type { LessonProgress } from '@/lib/progress';

export type LearnerTitle =
  | 'Newcomer'
  | 'Workflow Rookie'
  | 'Workflow Builder'
  | 'Automation Specialist'
  | 'Integration Expert'
  | 'Workflow Architect'
  | 'Production Engineer'
  | 'Opus Master 🏆';

export function getLearnerTitle(totalCompleted: number): LearnerTitle {
  if (totalCompleted >= 12) return 'Opus Master 🏆';
  if (totalCompleted >= 11) return 'Production Engineer';
  if (totalCompleted >= 9) return 'Workflow Architect';
  if (totalCompleted >= 7) return 'Integration Expert';
  if (totalCompleted >= 5) return 'Automation Specialist';
  if (totalCompleted >= 3) return 'Workflow Builder';
  if (totalCompleted >= 1) return 'Workflow Rookie';
  return 'Newcomer';
}

export function getProgressPercent(totalCompleted: number, totalLessons = 12): number {
  if (totalLessons <= 0) return 0;
  const boundedCompleted = Math.min(Math.max(totalCompleted, 0), totalLessons);
  return Math.round((boundedCompleted / totalLessons) * 100);
}

export function getDefaultCurrentLessonId(progress: LessonProgress[]): number {
  const firstIncomplete = progress.find((lesson) => lesson.status !== 'completed');
  return firstIncomplete?.lessonId ?? 12;
}
