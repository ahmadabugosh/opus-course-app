"use client";

import { useEffect, useState } from 'react';

import { PROGRESS_STORAGE_KEY } from '@/lib/progress';

type ProgressState = {
  lessons: Record<
    number,
    {
      lessonId: number;
      status: 'completed' | 'in_progress' | 'not_started';
      completedAt: string | null;
    }
  >;
};

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setIsVisible(true);
      loadProgress();
    }
  }, []);

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  };

  const clearProgress = () => {
    if (confirm('Clear all progress and start fresh?')) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      setProgress(null);
      window.location.reload();
    }
  };

  const markAllComplete = () => {
    if (confirm('Mark all 12 lessons as complete?')) {
      const now = new Date().toISOString();
      const allComplete: ProgressState = {
        lessons: {},
      };

      for (let i = 1; i <= 12; i++) {
        allComplete.lessons[i] = {
          lessonId: i,
          status: 'completed',
          completedAt: now,
        };
      }

      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allComplete));
      window.location.reload();
    }
  };

  const markUpToLesson = (lessonId: number) => {
    const now = new Date().toISOString();
    const updated: ProgressState = {
      lessons: {},
    };

    for (let i = 1; i <= 12; i++) {
      updated.lessons[i] = {
        lessonId: i,
        status: i <= lessonId ? 'completed' : 'not_started',
        completedAt: i <= lessonId ? now : null,
      };
    }

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    window.location.reload();
  };

  const syncToDatabase = async () => {
    setSyncStatus('Syncing...');
    
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!stored) {
        setSyncStatus('❌ No progress in localStorage');
        return;
      }

      const progressData = JSON.parse(stored) as ProgressState;
      const localProgress = Object.values(progressData.lessons).map((lesson) => ({
        lessonId: lesson.lessonId,
        status: lesson.status,
        completedAt: lesson.completedAt,
        startedAt: null,
        proofUrl: null,
      }));

      const response = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localProgress }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSyncStatus(`❌ ${result.error || 'Sync failed'}`);
        return;
      }

      setSyncStatus(`✅ ${result.message}`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (error) {
      setSyncStatus(`❌ ${error instanceof Error ? error.message : 'Sync failed'}`);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-amber-500 bg-amber-950 p-4 text-sm text-amber-100">
      <h3 className="font-bold text-amber-300">🐛 Debug Panel</h3>

      <div className="mt-3 space-y-2">
        <div className="rounded bg-amber-900/50 p-2">
          <p className="text-xs text-amber-200">
            <strong>Current progress:</strong>
          </p>
          {progress ? (
            <p className="text-xs mt-1">
              {Object.values(progress.lessons).filter((l) => l.status === 'completed').length}/12 completed
            </p>
          ) : (
            <p className="text-xs mt-1">No progress saved</p>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={clearProgress}
            className="block w-full rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
          >
            Clear all progress
          </button>
          <button
            onClick={markAllComplete}
            className="block w-full rounded bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
          >
            Mark all 12 complete
          </button>
          <button
            onClick={syncToDatabase}
            className="block w-full rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700"
          >
            🔄 Sync localStorage → Database
          </button>
        </div>

        {syncStatus && (
          <div className="rounded bg-amber-900/50 p-2 text-xs text-amber-100">
            {syncStatus}
          </div>
        )}

        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((lessonId) => (
            <button
              key={lessonId}
              onClick={() => markUpToLesson(lessonId)}
              className="rounded bg-indigo-600 px-1 py-0.5 text-xs hover:bg-indigo-700"
            >
              Up to {lessonId}
            </button>
          ))}
        </div>

        <p className="text-xs text-amber-300 mt-3">
          💡 Tip: Add <code className="bg-amber-900 px-1">?admin=true</code> to lesson URL to see admin bypass button
        </p>
      </div>
    </div>
  );
}
