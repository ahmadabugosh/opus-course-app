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
  const homePage = readFile('app/page.tsx');
  const dashboardLayout = readFile('app/dashboard/layout.tsx');
  const lessonsLayout = readFile('app/lessons/[lessonId]/layout.tsx');
  const certificateLayout = readFile('app/certificate/layout.tsx');
  const profilePage = readFile('app/u/[username]/page.tsx');
  const badgePage = readFile('app/u/[username]/badge/page.tsx');

  assert.match(homePage, /export const metadata/i);
  assert.match(dashboardLayout, /export const metadata/i);
  assert.match(lessonsLayout, /generateMetadata/i);
  assert.match(certificateLayout, /export const metadata/i);
  assert.match(profilePage, /generateMetadata/i);
  assert.match(badgePage, /generateMetadata/i);
});

test('route metadata includes canonical urls and social image cards', () => {
  const homePage = readFile('app/page.tsx');
  const dashboardLayout = readFile('app/dashboard/layout.tsx');
  const certificateLayout = readFile('app/certificate/layout.tsx');
  const lessonsLayout = readFile('app/lessons/[lessonId]/layout.tsx');
  const profilePage = readFile('app/u/[username]/page.tsx');
  const badgePage = readFile('app/u/[username]/badge/page.tsx');

  assert.match(homePage, /alternates:\s*{\s*canonical:/i);
  assert.match(homePage, /twitter:\s*{[\s\S]*summary_large_image/i);

  assert.match(dashboardLayout, /alternates:\s*{\s*canonical:/i);
  assert.match(dashboardLayout, /twitter:\s*{[\s\S]*summary_large_image/i);

  assert.match(certificateLayout, /alternates:\s*{\s*canonical:/i);
  assert.match(certificateLayout, /twitter:\s*{[\s\S]*summary_large_image/i);

  assert.match(lessonsLayout, /alternates:\s*{\s*canonical:/i);
  assert.match(lessonsLayout, /twitter:\s*{[\s\S]*summary_large_image/i);

  assert.match(profilePage, /alternates:\s*{\s*canonical:/i);
  assert.match(profilePage, /images:\s*\[\s*`\/u\/\$\{username\}\/badge\/image`/i);

  assert.match(badgePage, /alternates:\s*{\s*canonical:/i);
  assert.match(badgePage, /images:\s*\[\s*`\/u\/\$\{username\}\/badge\/image`/i);
});
