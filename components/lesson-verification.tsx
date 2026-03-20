"use client";

import { useMemo, useState, type FormEvent } from 'react';

import { useProgress } from '@/components/progress-provider';
import type { LessonMeta } from '@/lib/lessons';

function useIsAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  } catch {
    return false;
  }
}

type LessonVerificationProps = {
  lesson: LessonMeta;
};

export function LessonVerification({ lesson }: LessonVerificationProps) {
  const { markComplete, isComplete } = useProgress();
  const completed = isComplete(lesson.id);
  const isAdmin = useIsAdmin();

  const [proofText, setProofText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(completed);

  const remainingChars = useMemo(() => {
    const remaining = lesson.challenge.verificationMinLength - proofText.trim().length;
    return remaining > 0 ? remaining : 0;
  }, [lesson.challenge.verificationMinLength, proofText]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedProof = proofText.trim();

    if (cleanedProof.length < lesson.challenge.verificationMinLength) {
      setError(
        `Proof is too short. Add at least ${lesson.challenge.verificationMinLength} characters so verification is meaningful.`,
      );
      return;
    }

    markComplete(lesson.id, cleanedProof);
    setSubmitted(true);
    setError(null);
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[#333355] bg-[#1e1e3a] p-4 sm:p-5">
      <h3 className="text-base font-semibold text-white">Submit lesson verification</h3>
      <p className="mt-1 text-sm text-[#c9c9e6]">{lesson.challenge.verificationPrompt}</p>

      <label className="mt-4 block text-sm text-[#cccccc]" htmlFor={`lesson-proof-${lesson.id}`}>
        Paste your proof
        <textarea
          id={`lesson-proof-${lesson.id}`}
          value={proofText}
          onChange={(event) => {
            if (error) {
              setError(null);
            }
            setProofText(event.target.value);
          }}
          placeholder="Paste command output, workflow URL, or JSON verification here..."
          className="mt-2 min-h-40 w-full rounded-md border border-[#3a3a64] bg-[#121226] px-3 py-2 text-sm text-white outline-none ring-indigo-500 focus:ring-2"
        />
      </label>

      <div className="mt-2 flex items-center justify-between text-xs text-[#a8a8d0]">
        <span>Type: {lesson.challenge.verificationType.replace('_', ' ')}</span>
        <span>
          {remainingChars === 0
            ? 'Minimum length reached'
            : `${remainingChars} more characters required`}
        </span>
      </div>

      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}

      <button
        type="submit"
        className="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        Verify & mark lesson complete
      </button>

      {submitted && (
        <p className="robot-checkmark-pop mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <span className="text-base">✅</span>
          Verification accepted. Robot assembly advanced.
        </p>
      )}

      {isAdmin && !submitted && (
        <button
          type="button"
          onClick={() => {
            markComplete(lesson.id, '[admin bypass]');
            setSubmitted(true);
            setError(null);
          }}
          className="mt-3 inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
        >
          ⚡ Admin: Mark complete (skip verification)
        </button>
      )}
    </form>
  );
}
