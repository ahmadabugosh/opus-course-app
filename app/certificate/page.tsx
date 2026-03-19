"use client";

import { useMemo, useState } from 'react';

type GenerateResponse = {
  success: boolean;
  certificateId: string;
  completionDate: string;
  downloadUrl: string;
  stats: {
    completedLessons: number;
    achievementsCount: number;
  };
};

export default function CertificatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const latestDownloadUrl = useMemo(() => result?.downloadUrl ?? null, [result]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setEmailStatus(null);

    try {
      const response = await fetch('/api/certificate/generate', { method: 'POST' });
      const payload = (await response.json()) as GenerateResponse | { error?: string };

      if (!response.ok) {
        throw new Error((payload as { error?: string }).error || 'Failed to generate certificate');
      }

      setResult(payload as GenerateResponse);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailCertificate() {
    if (!result?.certificateId) {
      setEmailStatus('Generate a certificate first.');
      return;
    }

    const response = await fetch('/api/certificate/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateId: result.certificateId }),
    });

    const payload = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string; message?: string };

    if (!response.ok || !payload.success) {
      setEmailStatus(payload.error || 'Email delivery is not ready yet.');
      return;
    }

    setEmailStatus(payload.message || 'Certificate email queued.');
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <section className="rounded-2xl border border-white/10 bg-[#1E1E3A] p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Opus Mastery</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Get your Opus Mastery certificate</h1>
        <p className="mt-3 text-sm text-slate-300">
          Finish all 12 lessons, then generate your personalized completion PDF.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating…' : 'Generate Certificate'}
          </button>

          {latestDownloadUrl ? (
            <a
              href={latestDownloadUrl}
              className="rounded-lg border border-indigo-400/40 px-4 py-2 text-sm font-semibold text-indigo-200 hover:border-indigo-300 hover:text-white"
            >
              Download Latest PDF
            </a>
          ) : null}

          <button
            type="button"
            onClick={handleEmailCertificate}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/40 hover:text-white"
          >
            Email Certificate
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {emailStatus ? <p className="mt-2 text-sm text-slate-300">{emailStatus}</p> : null}

        {result ? (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-semibold">Certificate ready ✅</p>
            <p className="mt-1">Certificate ID: {result.certificateId}</p>
            <p className="mt-1">Completed lessons: {result.stats.completedLessons}/12</p>
            <p className="mt-1">Achievements earned: {result.stats.achievementsCount}</p>
            <p className="mt-1">Completion date: {result.completionDate}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
