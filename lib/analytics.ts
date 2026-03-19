import { all, get, run } from '@/lib/db';

export type AnalyticsEvent =
  | 'page_view'
  | 'lesson_start'
  | 'lesson_complete'
  | 'achievement_earned'
  | 'certificate_generated';

export type AnalyticsSummary = {
  totalUsers: number;
  totalEvents: number;
  lessonStarts: number;
  lessonCompletions: number;
  completionRate: number;
  popularLessons: Array<{ lessonId: number; completions: number }>;
};

export function trackEvent(event: AnalyticsEvent, data: Record<string, unknown> = {}, userId?: number | null) {
  run('INSERT INTO analytics (user_id, event, data) VALUES (?, ?, ?)', userId ?? null, event, JSON.stringify(data));
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const users = get<{ total: number }>('SELECT COUNT(*) as total FROM users');
  const events = get<{ total: number }>('SELECT COUNT(*) as total FROM analytics');
  const lessonStarts = get<{ total: number }>("SELECT COUNT(*) as total FROM analytics WHERE event = 'lesson_start'");
  const lessonCompletions = get<{ total: number }>("SELECT COUNT(*) as total FROM analytics WHERE event = 'lesson_complete'");

  const popularLessons = all<{ lessonId: number; completions: number }>(
    `SELECT CAST(json_extract(data, '$.lessonId') AS INTEGER) as lessonId, COUNT(*) as completions
     FROM analytics
     WHERE event = 'lesson_complete'
       AND json_extract(data, '$.lessonId') IS NOT NULL
     GROUP BY lessonId
     ORDER BY completions DESC
     LIMIT 5`,
  );

  const startCount = lessonStarts?.total ?? 0;
  const completionCount = lessonCompletions?.total ?? 0;

  return {
    totalUsers: users?.total ?? 0,
    totalEvents: events?.total ?? 0,
    lessonStarts: startCount,
    lessonCompletions: completionCount,
    completionRate: startCount > 0 ? Number(((completionCount / startCount) * 100).toFixed(2)) : 0,
    popularLessons,
  };
}
