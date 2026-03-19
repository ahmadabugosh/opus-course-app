import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDefaultProgress,
  loadProgress,
  saveProgress,
  markLessonComplete,
  isLessonComplete,
  getTotalCompleted,
  PROGRESS_STORAGE_KEY,
} from '../lib/progress.ts';

class MemoryStorage {
  #map = new Map();

  getItem(key) {
    return this.#map.has(key) ? this.#map.get(key) : null;
  }

  setItem(key, value) {
    this.#map.set(key, value);
  }
}

test('getDefaultProgress creates 12 lessons and no completion', () => {
  const progress = getDefaultProgress();

  assert.equal(Object.keys(progress.lessons).length, 12);
  assert.equal(getTotalCompleted(progress), 0);
  assert.equal(isLessonComplete(progress, 1), false);
});

test('markLessonComplete updates lesson status and totals', () => {
  const progress = getDefaultProgress();
  const updated = markLessonComplete(progress, 3, '2026-03-19T00:00:00.000Z');

  assert.equal(updated.lessons[3].status, 'completed');
  assert.equal(updated.lessons[3].challengeMarked, true);
  assert.equal(updated.lessons[3].completedAt, '2026-03-19T00:00:00.000Z');
  assert.equal(getTotalCompleted(updated), 1);
  assert.equal(isLessonComplete(updated, 3), true);
});

test('saveProgress and loadProgress round-trip with storage', () => {
  const storage = new MemoryStorage();
  const progress = markLessonComplete(getDefaultProgress(), 1, '2026-03-19T00:00:00.000Z');

  saveProgress(progress, storage, PROGRESS_STORAGE_KEY);
  const loaded = loadProgress(storage, PROGRESS_STORAGE_KEY);

  assert.equal(loaded.lessons[1].status, 'completed');
  assert.equal(loaded.lessons[1].challengeMarked, true);
  assert.equal(getTotalCompleted(loaded), 1);
});

test('loadProgress falls back to defaults on invalid json', () => {
  const storage = new MemoryStorage();
  storage.setItem(PROGRESS_STORAGE_KEY, '{not-valid-json');

  const loaded = loadProgress(storage, PROGRESS_STORAGE_KEY);

  assert.equal(getTotalCompleted(loaded), 0);
  assert.equal(Object.keys(loaded.lessons).length, 12);
});
