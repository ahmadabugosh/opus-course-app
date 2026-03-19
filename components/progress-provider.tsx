"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  PROGRESS_STORAGE_KEY,
  getDefaultProgress,
  getProgress,
  getTotalCompleted,
  isLessonComplete,
  loadProgress,
  markLessonComplete,
  saveProgress,
  type LessonProgress,
  type ProgressState,
} from '@/lib/progress';

type ProgressContextValue = {
  markComplete: (lessonId: number) => void;
  getProgress: () => LessonProgress[];
  isComplete: (lessonId: number) => boolean;
  getTotalCompleted: () => number;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => {
    if (typeof window === 'undefined') {
      return getDefaultProgress();
    }

    return loadProgress(window.localStorage, PROGRESS_STORAGE_KEY);
  });

  const markComplete = useCallback((lessonId: number) => {
    setProgress((current) => {
      const updated = markLessonComplete(current, lessonId);
      saveProgress(updated, window.localStorage, PROGRESS_STORAGE_KEY);
      return updated;
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      markComplete,
      getProgress: () => getProgress(progress),
      isComplete: (lessonId: number) => isLessonComplete(progress, lessonId),
      getTotalCompleted: () => getTotalCompleted(progress),
    }),
    [markComplete, progress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }

  return context;
}
