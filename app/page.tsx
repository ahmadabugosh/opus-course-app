import type { Metadata } from "next";
import Link from "next/link";
import { RobotAssemblyAnimated } from "@/components/robot-assembly/robot-assembly-animated";

export const metadata: Metadata = {
  title: "Opus Mastery Course - Master AI Automation Workflow",
  description:
    "Master AI workflow automation with Opus in 12 hands-on lessons.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Opus Mastery Course - Master AI Automation Workflow",
    description:
      "Master AI workflow automation with Opus in 12 hands-on lessons.",
    url: "/",
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opus Mastery Course - Master AI Automation Workflow",
    description:
      "Master AI workflow automation with Opus in 12 hands-on lessons.",
    images: ["/api/og"],
  },
};

export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] overflow-hidden bg-[#0A0A1A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.18),transparent_38%),radial-gradient(circle_at_85%_75%,rgba(16,185,129,0.08),transparent_45%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-between px-5 py-6 sm:px-8 sm:py-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300 sm:text-lg">
            Opus (flagship platform of AppliedAI) Mastery Course
          </p>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Master AI Workflow Automation with Opus in 12 Hands-On Lessons
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[#B8B8D8] sm:text-base">
            Learn practical Opus automation by building real workflows lesson by
            lesson. Finish all 12 and unlock your completion certificate.
          </p>

          <div className="mt-8 w-48 sm:w-56">
            <RobotAssemblyAnimated />
          </div>

          <Link
            href="/course"
            className="group relative mt-6 inline-flex items-center justify-center rounded-xl px-8 py-3 text-base font-semibold"
          >
            <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-85 blur transition duration-300 group-hover:opacity-100 group-hover:blur-md motion-safe:animate-pulse" />
            <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
            <span className="relative">Start Learning</span>
          </Link>
        </div>

        <footer className="text-center text-xs text-[#8D8DB8] sm:text-sm">
          Built by{' '}
          <a href="https://www.linkedin.com/in/ahmadabugosh/" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors underline underline-offset-2">
            Ahmad Abugosh
          </a>
        </footer>
      </section>
    </main>
  );
}
