export const LESSON_COUNT = 12;
export const PROGRESS_STORAGE_KEY = 'opus-course-progress';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export type LessonProgress = {
  lessonId: number;
  status: LessonStatus;
  startedAt: string | null;
  completedAt: string | null;
  challengeMarked: boolean;
  proofText: string | null;
};

export type ProgressState = {
  lessons: Record<number, LessonProgress>;
  updatedAt: string;
};

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function nowIso() {
  return new Date().toISOString();
}

export function getDefaultProgress(lessonCount = LESSON_COUNT): ProgressState {
  const lessons: Record<number, LessonProgress> = {};

  for (let lessonId = 1; lessonId <= lessonCount; lessonId += 1) {
    lessons[lessonId] = {
      lessonId,
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      challengeMarked: false,
      proofText: null,
    };
  }

  return {
    lessons,
    updatedAt: nowIso(),
  };
}

function normalizeProgress(raw: unknown, lessonCount = LESSON_COUNT): ProgressState {
  const fallback = getDefaultProgress(lessonCount);

  if (!raw || typeof raw !== 'object' || !('lessons' in raw)) {
    return fallback;
  }

  const rawLessons = (raw as { lessons?: Record<string, Partial<LessonProgress>> }).lessons;

  if (!rawLessons || typeof rawLessons !== 'object') {
    return fallback;
  }

  const lessons: Record<number, LessonProgress> = {};

  for (let lessonId = 1; lessonId <= lessonCount; lessonId += 1) {
    const lesson = rawLessons[String(lessonId)] ?? rawLessons[lessonId as unknown as keyof typeof rawLessons];

    lessons[lessonId] = {
      lessonId,
      status: lesson?.status === 'completed' || lesson?.status === 'in_progress' ? lesson.status : 'not_started',
      startedAt: typeof lesson?.startedAt === 'string' ? lesson.startedAt : null,
      completedAt: typeof lesson?.completedAt === 'string' ? lesson.completedAt : null,
      challengeMarked: Boolean(lesson?.challengeMarked),
      proofText: typeof lesson?.proofText === 'string' ? lesson.proofText : null,
    };
  }

  return {
    lessons,
    updatedAt: nowIso(),
  };
}

export function loadProgress(
  storage: StorageLike | undefined,
  key = PROGRESS_STORAGE_KEY,
  lessonCount = LESSON_COUNT,
): ProgressState {
  if (!storage) {
    return getDefaultProgress(lessonCount);
  }

  try {
    const stored = storage.getItem(key);
    if (!stored) {
      return getDefaultProgress(lessonCount);
    }

    return normalizeProgress(JSON.parse(stored), lessonCount);
  } catch {
    return getDefaultProgress(lessonCount);
  }
}

export function saveProgress(
  progress: ProgressState,
  storage: StorageLike | undefined,
  key = PROGRESS_STORAGE_KEY,
): void {
  if (!storage) {
    return;
  }

  storage.setItem(
    key,
    JSON.stringify({
      ...progress,
      updatedAt: nowIso(),
    }),
  );
}

export function markLessonComplete(
  progress: ProgressState,
  lessonId: number,
  completedAt = nowIso(),
  proofText?: string,
): ProgressState {
  const existing = progress.lessons[lessonId] ?? {
    lessonId,
    status: 'not_started' as const,
    startedAt: null,
    completedAt: null,
    challengeMarked: false,
    proofText: null,
  };

  return {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        ...existing,
        status: 'completed',
        challengeMarked: true,
        startedAt: existing.startedAt ?? completedAt,
        completedAt,
        proofText: proofText?.trim() ? proofText.trim() : existing.proofText ?? null,
      },
    },
    updatedAt: nowIso(),
  };
}

export function getProgress(progress: ProgressState): LessonProgress[] {
  return Object.values(progress.lessons).sort((a, b) => a.lessonId - b.lessonId);
}

export function isLessonComplete(progress: ProgressState, lessonId: number): boolean {
  return progress.lessons[lessonId]?.status === 'completed';
}

export function getTotalCompleted(progress: ProgressState): number {
  return getProgress(progress).filter((lesson) => lesson.status === 'completed').length;
}
