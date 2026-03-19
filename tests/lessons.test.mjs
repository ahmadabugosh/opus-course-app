import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LESSONS,
  LESSON_COUNT,
  getLessonById,
  getAllLessons,
  getLessonIds,
} from '../lib/lessons.ts';

test('lesson catalog includes all 12 lessons in order', () => {
  assert.equal(LESSON_COUNT, 12);
  assert.equal(LESSONS.length, 12);
  assert.deepEqual(getLessonIds(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('each lesson has required metadata fields', () => {
  for (const lesson of getAllLessons()) {
    assert.equal(typeof lesson.id, 'number');
    assert.equal(typeof lesson.title, 'string');
    assert.equal(typeof lesson.description, 'string');
    assert.equal(typeof lesson.duration, 'string');
    assert.equal(typeof lesson.videoUrl, 'string');
    assert.equal(typeof lesson.challenge.title, 'string');
    assert.equal(typeof lesson.challenge.description, 'string');
    assert.ok(['text_output', 'url', 'json_output', 'mixed'].includes(lesson.challenge.verificationType));
    assert.equal(typeof lesson.challenge.verificationPrompt, 'string');
    assert.equal(typeof lesson.challenge.verificationMinLength, 'number');
    assert.ok(lesson.challenge.verificationMinLength >= 20);
    assert.match(lesson.contentPath, /^content\/lesson-\d{2}\.md$/);
  }
});

test('getLessonById returns lesson when found and null when missing', () => {
  const lesson = getLessonById(3);
  assert.ok(lesson);
  assert.equal(lesson?.title, 'The Opus Agent');

  assert.equal(getLessonById(999), null);
});
