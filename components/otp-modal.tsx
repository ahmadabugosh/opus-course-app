"use client";

import { useState } from 'react';

type CertificateResult = {
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

type OtpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function OtpModal({ isOpen, onClose }: OtpModalProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'name' | 'generating' | 'certificate'>('email');
  const [status, setStatus] = useState('');
  const [certificate, setCertificate] = useState<CertificateResult | null>(null);

  if (!isOpen) {
    return null;
  }

  async function sendOtp() {
    setStatus('Sending code...');

    const response = await fetch('/api/auth/otp-send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setStatus('Could not send OTP. Try again.');
      return;
    }

    setStatus('OTP sent. Check your inbox.');
    setStep('code');
  }

  async function generateCertificate() {
    setStep('generating');
    setStatus('Generating your certificate...');

    try {
      const response = await fetch('/api/certificate/generate', { method: 'POST' });
      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.error || 'Failed to generate certificate. Please try again.');
        setStep('name');
        return;
      }

      setCertificate(payload as CertificateResult);
      setStep('certificate');
      setStatus('');
    } catch {
      setStatus('Failed to generate certificate. Please try again.');
      setStep('name');
    }
  }

  async function verifyOtp() {
    setStatus('Verifying...');

    const response = await fetch('/api/auth/otp-verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      setStatus('Invalid OTP. Please retry.');
      return;
    }

    const data = (await response.json()) as { success: boolean; hasDisplayName?: boolean };

    if (data.hasDisplayName) {
      // User already has a name — go straight to certificate generation
      await generateCertificate();
    } else {
      // Prompt for display name first
      setStatus('');
      setStep('name');
    }
  }

  async function submitName() {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setStatus('Please enter your name.');
      return;
    }

    setStatus('Saving name...');

    const response = await fetch('/api/user/update-name', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: trimmedName }),
    });

    if (!response.ok) {
      setStatus('Could not save name. Try again.');
      return;
    }

    // Name saved — now generate certificate immediately
    await generateCertificate();
  }

  async function skipName() {
    // Generate certificate even without name
    await generateCertificate();
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = 'I just completed Opus Mastery — 12 hands-on AI workflow automation lessons 🚀';
  const certificateUrl = certificate?.downloadUrl ? `${origin}${certificate.downloadUrl}` : null;
  const profileUrl = certificate?.profileUrl ? `${origin}${certificate.profileUrl}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-indigo-500/40 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold">
            {step === 'certificate'
              ? '🎉 Certificate Ready!'
              : step === 'generating'
                ? 'Generating...'
                : step === 'name'
                  ? 'Almost there!'
                  : 'Get your certificate'}
          </h2>
          <button className="text-sm text-slate-300 hover:text-white" onClick={onClose} type="button">
            Close
          </button>
        </div>

        {step === 'certificate' && certificate ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold text-lg">Certificate ready ✅</p>
              <p className="mt-2">Completed lessons: {certificate.stats.completedLessons}/12</p>
              {certificate.stats.achievementsCount > 0 && (
                <p className="mt-1">Achievements earned: {certificate.stats.achievementsCount}</p>
              )}
              <p className="mt-1">Completion date: {certificate.completionDate}</p>
            </div>

            <a
              href={certificate.downloadUrl}
              className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              ⬇️ Download Certificate PDF
            </a>

            <div className="flex gap-2">
              {certificateUrl && (
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-md border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  Share on LinkedIn
                </a>
              )}
              {(profileUrl || certificateUrl) && (
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl || certificateUrl || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-md border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  Share on Twitter/X
                </a>
              )}
            </div>
          </div>
        ) : step === 'generating' ? (
          <div className="flex flex-col items-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-300">Generating your certificate...</p>
          </div>
        ) : step === 'name' ? (
          <>
            <p className="mb-4 text-sm text-slate-300">
              Enter your full name — this will appear on your certificate.
            </p>

            <label className="mb-2 block text-sm">Full Name</label>
            <input
              className="mb-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Ahmad Abugosh"
              maxLength={100}
              autoFocus
            />

            <button
              className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              type="button"
              onClick={submitName}
              disabled={!displayName.trim()}
            >
              Generate Certificate
            </button>

            <button
              className="mt-2 w-full rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
              type="button"
              onClick={skipName}
            >
              Skip — use email instead
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-300">
              Verify your email with a one-time password to generate your certificate.
            </p>

            <label className="mb-2 block text-sm">Email</label>
            <input
              className="mb-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={step === 'code'}
            />

            {step === 'code' && (
              <>
                <label className="mb-2 block text-sm">OTP Code</label>
                <input
                  className="mb-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm tracking-[0.3em]"
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </>
            )}

            <button
              className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              type="button"
              onClick={step === 'email' ? sendOtp : verifyOtp}
              disabled={!email || (step === 'code' && code.length !== 6)}
            >
              {step === 'email' ? 'Send OTP' : 'Verify OTP'}
            </button>
          </>
        )}

        {status ? <p className="mt-3 text-sm text-slate-300">{status}</p> : null}
      </div>
    </div>
  );
}
