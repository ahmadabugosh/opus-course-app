import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('achievements library exports achievement definitions with metadata + check functions', async () => {
  const lib = await import('../lib/achievements.ts');

  assert.ok(Array.isArray(lib.ACHIEVEMENTS));
  assert.equal(lib.ACHIEVEMENTS.length, 7);

  for (const achievement of lib.ACHIEVEMENTS) {
    assert.ok(achievement.badgeId);
    assert.ok(achievement.name);
    assert.ok(achievement.description);
    assert.ok(achievement.icon);
    assert.equal(typeof achievement.check, 'function');
  }
});

test('achievements API route exists with authenticated GET handler', () => {
  const route = readFile('app/api/achievements/route.ts');

  assert.match(route, /export\s+async\s+function\s+GET/);
  assert.match(route, /Unauthorized/);
  assert.match(route, /earnedBadges/);
});

test('sidebar renders achievements section using achievement badge component', () => {
  const sidebar = readFile('components/lesson-sidebar.tsx');

  assert.match(sidebar, /🏆\s*Achievements/);
  assert.match(sidebar, /AchievementBadge/);
});
