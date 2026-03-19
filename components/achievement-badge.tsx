import type { AchievementDefinition } from '@/lib/achievements';

type AchievementBadgeProps = {
  achievement: AchievementDefinition;
  earned: boolean;
};

export function AchievementBadge({ achievement, earned }: AchievementBadgeProps) {
  return (
    <div
      title={achievement.description}
      className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-xs transition ${
        earned
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          : 'border-[#333355] bg-[#202042] text-[#a8a8d0]'
      }`}
    >
      <span aria-hidden>{achievement.icon}</span>
      <span className="font-medium">{achievement.name}</span>
      <span className="sr-only">{achievement.description}</span>
    </div>
  );
}
