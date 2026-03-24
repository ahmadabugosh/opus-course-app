"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { RobotAssembly } from '@/components/robot-assembly/robot-assembly';

type CertificateCelebrationProps = {
  isOpen: boolean;
  onComplete: () => void;
};

// Web Audio API sound generator — no external audio files needed
function playBuildingSound(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  // Mechanical assembly beeps
  for (let i = 0; i < 6; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'square';
    osc.frequency.value = 200 + i * 80;
    gain.gain.setValueAtTime(0.08, now + i * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.35 + 0.15);

    osc.start(now + i * 0.35);
    osc.stop(now + i * 0.35 + 0.2);
  }

  // Whir sound
  const whir = audioCtx.createOscillator();
  const whirGain = audioCtx.createGain();
  whir.connect(whirGain);
  whirGain.connect(audioCtx.destination);
  whir.type = 'sawtooth';
  whir.frequency.setValueAtTime(80, now + 0.5);
  whir.frequency.linearRampToValueAtTime(300, now + 2);
  whirGain.gain.setValueAtTime(0.03, now + 0.5);
  whirGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
  whir.start(now + 0.5);
  whir.stop(now + 2.5);
}

function playCelebrationSound(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);

    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.5);
  });
}

export function CertificateCelebration({ isOpen, onComplete }: CertificateCelebrationProps) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<'building' | 'complete'>('building');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fireConfetti = useCallback(() => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    confetti({ ...defaults, particleCount: 50, origin: { x: 0.3, y: 0.6 } });
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.7, y: 0.6 } });

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } });
    }, 200);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      setPhase('building');
      return;
    }

    // Start audio context on user interaction
    try {
      audioCtxRef.current = new AudioContext();
      playBuildingSound(audioCtxRef.current);
    } catch {
      // Audio not available — continue silently
    }

    // Animate robot building from stage 0 → 12
    let currentStage = 0;
    timerRef.current = setInterval(() => {
      currentStage += 1;
      setStage(currentStage);

      if (currentStage >= 12) {
        if (timerRef.current) clearInterval(timerRef.current);

        // Robot complete! Celebrate!
        setPhase('complete');

        if (audioCtxRef.current) {
          playCelebrationSound(audioCtxRef.current);
        }

        fireConfetti();

        // Transition to OTP modal after celebration
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 180); // ~2.2s total for 12 stages

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, onComplete, fireConfetti]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex flex-col items-center text-center">
        <div className={`w-48 h-48 transition-transform duration-500 ${phase === 'complete' ? 'scale-110' : ''}`}>
          <RobotAssembly stage={stage} className="w-full" />
        </div>

        <div className="mt-6 space-y-2">
          {phase === 'building' ? (
            <>
              <p className="text-lg font-semibold text-indigo-300 animate-pulse">
                🔧 Assembling your Opus Robot...
              </p>
              <p className="text-sm text-slate-400">Stage {stage}/12</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-emerald-300 animate-bounce">
                🎉 Robot Complete!
              </p>
              <p className="text-sm text-slate-300">
                You&apos;ve mastered Opus! Time to claim your certificate.
              </p>
            </>
          )}
        </div>

        {/* Skip button for accessibility */}
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip animation →
        </button>
      </div>
    </div>
  );
}
