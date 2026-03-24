"use client";

import { useMemo, useState } from 'react';

import { PROGRESS_STORAGE_KEY } from '@/lib/progress';

type GenerateResponse = {
  success: boolean;
  certificateId: string;
  completionDate: string;
  downloadUrl: string;
  profileUrl: string | null;
  stats: {
    completedLessons: number;
    achievementsCount: number;
  };
};

type LocalProgressEntry = {
  lessonId: number;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  proofText?: string | null;
};

function getLocalProgressForMigration(): Array<{
  lessonId: number;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  proofUrl?: string | null;
}> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { lessons?: Record<string, LocalProgressEntry> };
    const lessons = parsed.lessons ?? {};

    return Object.values(lessons)
      .filter((lesson) => lesson && typeof lesson.lessonId === 'number')
      .map((lesson) => ({
        lessonId: lesson.lessonId,
        status: lesson.status,
        startedAt: lesson.startedAt ?? null,
        completedAt: lesson.completedAt ?? null,
        proofUrl: lesson.proofText ?? null,
      }));
  } catch {
    return [];
  }
}

export default function CertificatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [emailStatus] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOtpGate, setShowOtpGate] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const latestDownloadUrl = useMemo(() => result?.downloadUrl ?? null, [result]);
  const absoluteCertificateUrl = useMemo(() => {
    if (!result?.downloadUrl || !origin) return null;
    return `${origin}${result.downloadUrl}`;
  }, [origin, result?.downloadUrl]);

  const absoluteProfileUrl = useMemo(() => {
    if (!result?.profileUrl || !origin) return null;
    return `${origin}${result.profileUrl}`;
  }, [origin, result?.profileUrl]);

  const shareText = 'I just completed Opus Mastery — 12 hands-on AI workflow automation lessons 🚀';

  const linkedinShareUrl = useMemo(() => {
    if (!absoluteCertificateUrl) return null;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteCertificateUrl)}`;
  }, [absoluteCertificateUrl]);

  const twitterShareUrl = useMemo(() => {
    const targetUrl = absoluteProfileUrl || absoluteCertificateUrl;
    if (!targetUrl) return null;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(targetUrl)}`;
  }, [absoluteCertificateUrl, absoluteProfileUrl]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/certificate/generate', { method: 'POST' });
      const payload = (await response.json()) as GenerateResponse | { error?: string };

      if (response.status === 401) {
        setShowOtpGate(true);
        setError('Sign in with your email OTP first, then generate your certificate.');
        return;
      }

      if (!response.ok) {
        throw new Error((payload as { error?: string }).error || 'Failed to generate certificate');
      }

      setShowOtpGate(false);
      setResult(payload as GenerateResponse);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (!email.trim()) {
      setOtpStatus('Enter your email first.');
      return;
    }

    setOtpStatus('Sending OTP…');

    try {
      const response = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setOtpStatus('OTP sent. Check your inbox (or server logs in local dev).');
    } catch (sendError) {
      setOtpStatus(sendError instanceof Error ? sendError.message : 'Failed to send OTP');
    }
  }

  async function handleVerifyOtp() {
    if (!email.trim() || !otpCode.trim()) {
      setOtpStatus('Email and OTP code are required.');
      return;
    }

    setOtpStatus('Verifying OTP…');

    try {
      const response = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          localProgress: getLocalProgressForMigration(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to verify OTP');
      }

      setIsAuthenticated(true);
      setShowOtpGate(false);
      setOtpStatus('Signed in! You can now generate your certificate.');
    } catch (verifyError) {
      setOtpStatus(verifyError instanceof Error ? verifyError.message : 'Failed to verify OTP');
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <section className="rounded-2xl border border-white/10 bg-[#1E1E3A] p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Opus Mastery</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Get your Opus Mastery certificate</h1>
        <p className="mt-3 text-sm text-slate-300">
          Finish all 12 lessons, then verify your email with OTP to generate your personalized completion PDF.
        </p>

        {!isAuthenticated ? (
          <div className="mt-5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4">
            <p className="text-sm font-semibold text-indigo-100">Verify your email to continue</p>
            <p className="mt-1 text-xs text-indigo-200">Flow: enter email → send OTP → verify code → Get Certificate.</p>

            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-indigo-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-indigo-300/30 bg-[#101027] px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-300"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSendOtp}
                className="rounded-lg border border-indigo-300/40 px-3 py-2 text-sm font-semibold text-indigo-100 hover:border-indigo-200 hover:text-white"
              >
                Send OTP
              </button>
            </div>

            {otpSent ? (
              <>
                <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-indigo-200">OTP Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="6-digit code"
                  className="mt-1 w-full rounded-lg border border-indigo-300/30 bg-[#101027] px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-300"
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                >
                  Verify OTP
                </button>
              </>
            ) : null}

            {otpStatus ? <p className="mt-3 text-sm text-indigo-100">{otpStatus}</p> : null}
          </div>
        ) : (
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


          </div>
        )}

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {emailStatus ? <p className="mt-2 text-sm text-slate-300">{emailStatus}</p> : null}

        {result ? (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-semibold">Certificate ready ✅</p>
            <p className="mt-1">Certificate ID: {result.certificateId}</p>
            <p className="mt-1">Completed lessons: {result.stats.completedLessons}/12</p>
            {result.stats.achievementsCount > 0 && (
              <p className="mt-1">Achievements earned: {result.stats.achievementsCount}</p>
            )}
            <p className="mt-1">Completion date: {result.completionDate}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              {linkedinShareUrl ? (
                <a
                  href={linkedinShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-emerald-300/50 px-3 py-2 font-semibold text-emerald-100 hover:border-emerald-200 hover:text-white"
                >
                  Share on LinkedIn
                </a>
              ) : null}

              {twitterShareUrl ? (
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-emerald-300/50 px-3 py-2 font-semibold text-emerald-100 hover:border-emerald-200 hover:text-white"
                >
                  Share on Twitter/X
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
