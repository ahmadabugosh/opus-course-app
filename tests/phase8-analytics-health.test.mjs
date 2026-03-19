import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('analytics library defines event types and track helper', () => {
  const file = readFile('lib/analytics.ts');

  assert.match(file, /export\s+type\s+AnalyticsEvent/);
  assert.match(file, /export\s+function\s+trackEvent/);
  assert.match(file, /lesson_start/);
  assert.match(file, /certificate_generated/);
});

test('analytics tracker component sends page view events', () => {
  const file = readFile('components/analytics-tracker.tsx');

  assert.match(file, /'use client'/);
  assert.match(file, /usePathname/);
  assert.match(file, /\/api\/analytics\/track/);
  assert.match(file, /page_view/);
});

test('analytics API routes support tracking and summary', () => {
  const trackRoute = readFile('app/api/analytics/track/route.ts');
  const summaryRoute = readFile('app/api/analytics/summary/route.ts');

  assert.match(trackRoute, /export\s+async\s+function\s+POST/);
  assert.match(trackRoute, /event is required/);
  assert.match(trackRoute, /trackEvent/);

  assert.match(summaryRoute, /export\s+async\s+function\s+GET/);
  assert.match(summaryRoute, /completionRate/);
  assert.match(summaryRoute, /popularLessons/);
});

test('health API route responds with healthy status payload', () => {
  const route = readFile('app/api/health/route.ts');

  assert.match(route, /export\s+async\s+function\s+GET/);
  assert.match(route, /status:\s*'ok'/);
  assert.match(route, /timestamp/);
});
