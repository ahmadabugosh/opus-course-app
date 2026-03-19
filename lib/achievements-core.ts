export type BadgeId =
  | 'speed-builder'
  | 'streak-master'
  | 'agent-whisperer'
  | 'human-touch'
  | 'integrator'
  | 'code-warrior'
  | 'opus-master';

export type ProgressForAchievement = {
  lesson_id: number;
  started_at: string | null;
  completed_at: string | null;
};

export type AchievementDefinition = {
  badgeId: BadgeId;
  name: string;
  description: string;
  icon: string;
  check: (progress: ProgressForAchievement[]) => boolean;
};

function hasCompleted(progress: ProgressForAchievement[], lessonId: number) {
  return progress.some((row) => row.lesson_id === lessonId && Boolean(row.completed_at));
}

function calculateConsecutiveDayStreak(progress: ProgressForAchievement[]) {
  const completionDays = progress
    .map((row) => row.completed_at)
    .filter((value): value is string => Boolean(value))
    .map((iso) => new Date(iso).toISOString().slice(0, 10))
    .sort();

  if (!completionDays.length) {
    return 0;
  }

  const uniqueDays = [...new Set(completionDays)];
  let best = 1;
  let current = 1;

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prev = new Date(`${uniqueDays[i - 1]}T00:00:00.000Z`).getTime();
    const next = new Date(`${uniqueDays[i]}T00:00:00.000Z`).getTime();
    const dayDiff = (next - prev) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    badgeId: 'speed-builder',
    name: 'Speed Builder',
    description: 'Complete any lesson within 1 hour of starting it.',
    icon: '⚡',
    check: (progress) =>
      progress.some((row) => {
        if (!row.completed_at || !row.started_at) return false;

        const started = new Date(row.started_at).getTime();
        const completed = new Date(row.completed_at).getTime();

        return Number.isFinite(started) && Number.isFinite(completed) && completed - started <= 60 * 60 * 1000;
      }),
  },
  {
    badgeId: 'streak-master',
    name: 'Streak Master',
    description: 'Complete 3 lessons across 3 consecutive days.',
    icon: '🔥',
    check: (progress) => calculateConsecutiveDayStreak(progress) >= 3,
  },
  {
    badgeId: 'agent-whisperer',
    name: 'Agent Whisperer',
    description: 'Complete all agent-focused lessons (3, 4, and 5).',
    icon: '🧠',
    check: (progress) => [3, 4, 5].every((lessonId) => hasCompleted(progress, lessonId)),
  },
  {
    badgeId: 'human-touch',
    name: 'Human Touch',
    description: 'Complete the Human-in-the-Loop lesson (Lesson 6).',
    icon: '🤝',
    check: (progress) => hasCompleted(progress, 6),
  },
  {
    badgeId: 'integrator',
    name: 'Integrator',
    description: 'Complete the Integrations lesson (Lesson 8).',
    icon: '🔌',
    check: (progress) => hasCompleted(progress, 8),
  },
  {
    badgeId: 'code-warrior',
    name: 'Code Warrior',
    description: 'Complete the Opus Code lesson (Lesson 10).',
    icon: '🐍',
    check: (progress) => hasCompleted(progress, 10),
  },
  {
    badgeId: 'opus-master',
    name: 'Opus Master',
    description: 'Complete all 12 lessons in Opus Mastery.',
    icon: '🎓',
    check: (progress) => progress.filter((row) => Boolean(row.completed_at)).length >= 12,
  },
];

export function evaluateAchievementBadges(progress: ProgressForAchievement[]): BadgeId[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.check(progress)).map((achievement) => achievement.badgeId);
}
