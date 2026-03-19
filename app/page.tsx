import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Opus Mastery — 12-Lesson Gamified Opus Course",
  description:
    "Start Opus Mastery instantly: 12 practical lessons, video walkthroughs, challenge-based progress, and certificate unlock at 12/12.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Opus Mastery — 12-Lesson Gamified Opus Course",
    description:
      "Start Opus Mastery instantly: 12 practical lessons, video walkthroughs, challenge-based progress, and certificate unlock at 12/12.",
    url: "/",
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opus Mastery — 12-Lesson Gamified Opus Course",
    description:
      "Start Opus Mastery instantly: 12 practical lessons, video walkthroughs, challenge-based progress, and certificate unlock at 12/12.",
    images: ["/api/og"],
  },
};

const highlights = [
  "Build real-world workflows from day one",
  "Learn decision agents, integrations, and Opus Code",
  "Track your progress with achievements and milestones",
  "Generate a certificate after completing all 12 lessons",
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-surface p-8 md:p-12">
        <p className="mb-3 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Gamified Course • 100% Free to Learn
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Opus Mastery
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted sm:text-lg">
          A structured 12-lesson journey to master Opus AI workflow automation.
          Learn by building practical automations with videos, written guides, and
          hands-on challenges.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start Learning Free
          </Link>
          <Link
            href="/lessons/1"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background/60"
          >
            Preview Lesson 1
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">12-Lesson Roadmap</h2>
          <span className="text-sm text-muted">Self-paced • Zero signup wall</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="group rounded-xl border border-border bg-surface p-4 transition hover:border-primary/70 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Lesson {lesson.id}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-white">
                {lesson.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{lesson.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-border bg-surface p-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What You&apos;ll Learn</h2>
          <p className="mt-3 text-sm text-muted">
            Each lesson combines video walkthroughs, actionable written guidance,
            and a practical challenge you complete inside Opus.
          </p>
        </div>
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-foreground">
              <span className="mt-0.5 text-success">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-primary/40 bg-primary/10 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Ready to become an Opus Master?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          Learn everything without an account. Sign in only when you complete 12/12 and
          want your personalized certificate.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start the Course
          </Link>
        </div>
      </section>
    </div>
  );
}
