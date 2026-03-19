import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-sm text-muted">The page you requested does not exist yet.</p>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Go to dashboard
        </Link>
      </section>
    </div>
  );
}
