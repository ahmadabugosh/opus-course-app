import { all, run } from './db';
import { evaluateAchievementBadges, type BadgeId, type ProgressForAchievement } from './achievements-core';

export { ACHIEVEMENTS, evaluateAchievementBadges } from './achievements-core';
export type { AchievementDefinition } from './achievements-core';
export type { BadgeId, ProgressForAchievement };

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
