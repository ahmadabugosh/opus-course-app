"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold text-white">We hit an unexpected error.</h1>
        <p className="mt-3 text-sm text-rose-100/90">{error.message || "Please try again."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
