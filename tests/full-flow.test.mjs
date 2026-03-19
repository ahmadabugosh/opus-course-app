import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('auth flow routes exist for OTP send + verify', () => {
  const sendRoute = readFile('app/api/auth/otp-send/route.ts');
  const verifyRoute = readFile('app/api/auth/otp-verify/route.ts');

  assert.match(sendRoute, /export\s+async\s+function\s+POST/);
  assert.match(verifyRoute, /export\s+async\s+function\s+POST/);
  assert.match(verifyRoute, /migrateProgress/);
});

test('lesson completion route supports marking challenge proof complete', () => {
  const verifyRoute = readFile('app/api/lessons/verify/route.ts');

  assert.match(verifyRoute, /proofUrl/);
  assert.match(verifyRoute, /status\s*=\s*'completed'/);
  assert.match(verifyRoute, /syncAchievementsForUser/);
});

test('certificate generation is gated until all 12 lessons are complete', () => {
  const certificateRoute = readFile('app/api/certificate/generate/route.ts');

  assert.match(certificateRoute, /completedLessons\s*<\s*12/);
  assert.match(certificateRoute, /Complete all 12 lessons before generating a certificate/);
});
