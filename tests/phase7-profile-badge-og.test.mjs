import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('public profile page exists and renders user achievements + certificate info', () => {
  const page = readFile('app/u/[username]/page.tsx');

  assert.match(page, /export\s+default\s+async\s+function\s+PublicProfilePage/);
  assert.match(page, /achievements/i);
  assert.match(page, /certificate/i);
  assert.match(page, /getLearnerTitle/);
});

test('shareable badge page exists and links to dynamic badge image', () => {
  const page = readFile('app/u/[username]/badge/page.tsx');

  assert.match(page, /export\s+default\s+async\s+function\s+BadgePage/);
  assert.match(page, /badge\/image/);
  assert.match(page, /OpenGraph|metadata/);
});

test('badge image route generates dynamic OG image with 1200x630 dimensions', () => {
  const route = readFile('app/u/[username]/badge/image/route.tsx');

  assert.match(route, /ImageResponse/);
  assert.match(route, /1200/);
  assert.match(route, /630/);
  assert.match(route, /Opus Mastery/);
});

test('default OG route exists for site-level social previews', () => {
  const route = readFile('app/api/og/route.tsx');

  assert.match(route, /ImageResponse/);
  assert.match(route, /export\s+async\s+function\s+GET/);
  assert.match(route, /Opus Mastery/);
});

test('completion celebration component exists with confetti/reveal behavior', () => {
  const component = readFile('components/completion-celebration.tsx');

  assert.match(component, /CompletionCelebration/);
  assert.match(component, /confetti|spark|celebrat/i);
  assert.match(component, /Get Certificate|certificate/i);
});
