import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

test('app router includes loading/error/not-found UI states', () => {
  assert.equal(exists('app/loading.tsx'), true);
  assert.equal(exists('app/error.tsx'), true);
  assert.equal(exists('app/not-found.tsx'), true);
  assert.equal(exists('app/dashboard/loading.tsx'), true);
  assert.equal(exists('app/lessons/[lessonId]/loading.tsx'), true);
  assert.equal(exists('app/certificate/loading.tsx'), true);
});

test('SEO metadata is defined for key nested routes', () => {
  const dashboardLayout = readFile('app/dashboard/layout.tsx');
  const lessonsLayout = readFile('app/lessons/[lessonId]/layout.tsx');
  const certificateLayout = readFile('app/certificate/layout.tsx');
  const profilePage = readFile('app/u/[username]/page.tsx');

  assert.match(dashboardLayout, /export const metadata/i);
  assert.match(lessonsLayout, /generateMetadata/i);
  assert.match(certificateLayout, /export const metadata/i);
  assert.match(profilePage, /generateMetadata/i);
});
