import { all, run } from './db.ts';

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

export function evaluateAchievementBadges(progress: ProgressForAchievement[]): BadgeId[] {
  const badges = new Set<BadgeId>();

  for (const row of progress) {
    if (!row.completed_at) continue;
    if (!row.started_at) continue;

    const started = new Date(row.started_at).getTime();
    const completed = new Date(row.completed_at).getTime();

    if (Number.isFinite(started) && Number.isFinite(completed) && completed - started <= 60 * 60 * 1000) {
      badges.add('speed-builder');
      break;
    }
  }

  if (calculateConsecutiveDayStreak(progress) >= 3) {
    badges.add('streak-master');
  }

  if ([3, 4, 5].every((lessonId) => hasCompleted(progress, lessonId))) {
    badges.add('agent-whisperer');
  }

  if (hasCompleted(progress, 6)) badges.add('human-touch');
  if (hasCompleted(progress, 8)) badges.add('integrator');
  if (hasCompleted(progress, 10)) badges.add('code-warrior');

  const completedCount = progress.filter((row) => Boolean(row.completed_at)).length;
  if (completedCount >= 12) {
    badges.add('opus-master');
  }

  return [...badges];
}

export function syncAchievementsForUser(userId: number): BadgeId[] {
  const progress = all<ProgressForAchievement>(
    'SELECT lesson_id, started_at, completed_at FROM progress WHERE user_id = ? ORDER BY lesson_id ASC',
    userId,
  );

  const earned = evaluateAchievementBadges(progress);

  for (const badgeId of earned) {
    run(
      `INSERT INTO achievements (user_id, badge_id)
       VALUES (?, ?)
       ON CONFLICT(user_id, badge_id) DO NOTHING`,
      userId,
      badgeId,
    );
  }

  return earned;
}
