import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLearnerTitle,
  getProgressPercent,
  getDefaultCurrentLessonId,
} from '../lib/course-progression.ts';

test('getLearnerTitle maps completed lessons to expected title bands', () => {
  assert.equal(getLearnerTitle(0), 'Newcomer');
  assert.equal(getLearnerTitle(1), 'Workflow Rookie');
  assert.equal(getLearnerTitle(2), 'Workflow Rookie');
  assert.equal(getLearnerTitle(3), 'Workflow Builder');
  assert.equal(getLearnerTitle(6), 'Automation Specialist');
  assert.equal(getLearnerTitle(8), 'Integration Expert');
  assert.equal(getLearnerTitle(10), 'Workflow Architect');
  assert.equal(getLearnerTitle(11), 'Production Engineer');
  assert.equal(getLearnerTitle(12), 'Opus Master 🏆');
});

test('getProgressPercent returns bounded percentages', () => {
  assert.equal(getProgressPercent(0), 0);
  assert.equal(getProgressPercent(6), 50);
  assert.equal(getProgressPercent(12), 100);
  assert.equal(getProgressPercent(15), 100);
});

test('getDefaultCurrentLessonId picks first incomplete lesson', () => {
  const allOpen = Array.from({ length: 12 }, (_, idx) => ({
    lessonId: idx + 1,
    status: 'not_started',
    startedAt: null,
    completedAt: null,
    challengeMarked: false,
  }));

  const allDone = allOpen.map((item) => ({ ...item, status: 'completed', challengeMarked: true }));

  const mixed = allOpen.map((item) =>
    item.lessonId <= 3
      ? { ...item, status: 'completed', challengeMarked: true }
      : item,
  );

  assert.equal(getDefaultCurrentLessonId(allOpen), 1);
  assert.equal(getDefaultCurrentLessonId(mixed), 4);
  assert.equal(getDefaultCurrentLessonId(allDone), 12);
});
