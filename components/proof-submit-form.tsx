"use client";

import { useState, type FormEvent } from 'react';

import { useProgress } from '@/components/progress-provider';

type ProofSubmitFormProps = {
  lessonId: number;
};

export function ProofSubmitForm({ lessonId }: ProofSubmitFormProps) {
  const { markComplete, isComplete } = useProgress();
  const [proofUrl, setProofUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(isComplete(lessonId));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!proofUrl && !fileName) {
      return;
    }

    markComplete(lessonId);
    setSubmitted(true);
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[#333355] bg-[#1e1e3a] p-4">
      <h3 className="text-base font-semibold text-white">Submit your challenge proof</h3>
      <p className="mt-1 text-sm text-[#c9c9e6]">
        Paste a workflow URL or upload a screenshot. This is self-verified for now.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm text-[#cccccc]">
          Workflow URL
          <input
            type="url"
            value={proofUrl}
            onChange={(event) => setProofUrl(event.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-[#3a3a64] bg-[#121226] px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
          />
        </label>

        <label className="block text-sm text-[#cccccc]">
          Screenshot
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
            className="mt-1 block w-full rounded-md border border-[#3a3a64] bg-[#121226] px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-indigo-500 file:px-2 file:py-1 file:text-white"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Mark challenge complete
        </button>

        {submitted && (
          <p className="text-sm text-emerald-400">✅ Lesson marked complete. Nice work.</p>
        )}
      </div>
    </form>
  );
}
