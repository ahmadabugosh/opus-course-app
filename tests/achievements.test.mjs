import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateAchievementBadges } from '../lib/achievements.ts';

test('awards agent + lesson-specific + opus-master badges from completion data', () => {
  const progress = Array.from({ length: 12 }, (_, index) => ({
    lesson_id: index + 1,
    started_at: `2026-03-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
    completed_at: `2026-03-${String(index + 1).padStart(2, '0')}T09:30:00.000Z`,
  }));

  const badges = evaluateAchievementBadges(progress);

  assert.ok(badges.includes('agent-whisperer'));
  assert.ok(badges.includes('human-touch'));
  assert.ok(badges.includes('integrator'));
  assert.ok(badges.includes('code-warrior'));
  assert.ok(badges.includes('opus-master'));
  assert.ok(badges.includes('speed-builder'));
});

test('awards streak-master for 3 consecutive completion days', () => {
  const progress = [
    { lesson_id: 1, started_at: '2026-03-01T09:00:00.000Z', completed_at: '2026-03-01T11:00:00.000Z' },
    { lesson_id: 2, started_at: '2026-03-02T09:00:00.000Z', completed_at: '2026-03-02T11:30:00.000Z' },
    { lesson_id: 3, started_at: '2026-03-03T09:00:00.000Z', completed_at: '2026-03-03T10:30:00.000Z' },
  ];

  const badges = evaluateAchievementBadges(progress);

  assert.ok(badges.includes('streak-master'));
  assert.ok(!badges.includes('speed-builder'));
});
