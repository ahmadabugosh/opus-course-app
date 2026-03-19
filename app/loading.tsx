export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div className="h-6 w-1/3 rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-24 rounded bg-white/5" />
      </div>
    </div>
  );
}
