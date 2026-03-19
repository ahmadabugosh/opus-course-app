type ProgressBarProps = {
  completed: number;
  total?: number;
  title: string;
};

export function ProgressBar({ completed, total = 12, title }: ProgressBarProps) {
  const safeCompleted = Math.max(0, Math.min(completed, total));
  const percent = Math.round((safeCompleted / total) * 100);

  return (
    <div className="rounded-xl border border-[#333355] bg-[#16162b] p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-[#cccccc]">
        <span className="font-medium">Course Progress</span>
        <span>
          {safeCompleted}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#232344]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${percent}%` }}
          aria-label="progress-fill"
        />
      </div>
      <p className="mt-3 text-sm text-[#a8a8d0]">Current title: {title}</p>
    </div>
  );
}
