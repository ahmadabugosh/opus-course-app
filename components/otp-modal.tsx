"use client";

import { useState } from 'react';

type OtpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function OtpModal({ isOpen, onClose }: OtpModalProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [status, setStatus] = useState('');

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

    setStatus('Signed in successfully.');
    setTimeout(onClose, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-indigo-500/40 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold">Get your certificate</h2>
          <button className="text-sm text-slate-300 hover:text-white" onClick={onClose} type="button">
            Close
          </button>
        </div>

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

        {status ? <p className="mt-3 text-sm text-slate-300">{status}</p> : null}
      </div>
    </div>
  );
}
