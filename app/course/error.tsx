"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
        <h1 className="text-2xl font-bold text-white">Dashboard unavailable right now</h1>
        <p className="mt-2 text-sm text-rose-100">Please retry loading your lesson progress.</p>
        <button type="button" onClick={reset} className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Retry</button>
      </section>
    </main>
  );
}
