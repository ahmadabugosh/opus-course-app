"use client";

import Link from 'next/link';
import { useMemo } from 'react';

type CompletionCelebrationProps = {
  totalCompleted: number;
};

export function CompletionCelebration({ totalCompleted }: CompletionCelebrationProps) {
  const isComplete = totalCompleted >= 12;

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        delay: `${(index % 6) * 0.18}s`,
      })),
    [],
  );

  if (!isComplete) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-indigo-500/15 to-violet-500/20 p-6">
      <div className="pointer-events-none absolute inset-0">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="absolute top-0 text-lg opacity-75 motion-safe:animate-bounce"
            style={{ left: sparkle.left, animationDelay: sparkle.delay }}
            aria-hidden
          >
            ✨
          </span>
        ))}
      </div>

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Completion unlocked</p>
        <h2 className="mt-2 text-2xl font-bold text-white">🎉 You completed Opus Mastery!</h2>
        <p className="mt-2 text-sm text-emerald-100/90">
          All 12 lessons are complete. Reveal your certificate and share your Opus Master title.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/certificate"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-100"
          >
            Get Certificate
          </Link>
          <Link
            href="/course"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:border-white/60"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
