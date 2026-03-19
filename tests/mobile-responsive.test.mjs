import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('lesson sidebar supports mobile collapsible navigation and desktop sticky view', () => {
  const sidebar = readFile('components/lesson-sidebar.tsx');

  assert.match(sidebar, /lg:hidden/);
  assert.match(sidebar, /<details/);
  assert.match(sidebar, /hidden lg:block/);
  assert.match(sidebar, /overflow-x-auto[^"]*md:overflow-visible/);
  assert.match(sidebar, /md:flex-wrap/);
});

test('dashboard and lesson pages use mobile-friendly content spacing and typography', () => {
  const dashboardPage = readFile('app/dashboard/page.tsx');
  const lessonPage = readFile('app/lessons/[lessonId]/page.tsx');

  assert.match(dashboardPage, /p-4 sm:p-6/);
  assert.match(lessonPage, /p-4 sm:p-6/);
  assert.match(dashboardPage, /text-2xl font-bold text-white sm:text-3xl/);
  assert.match(lessonPage, /text-2xl font-bold text-white sm:text-3xl/);
});

test('landing page uses single viewport layout with mobile-safe typography and spacing', () => {
  const landingPage = readFile('app/page.tsx');

  assert.match(landingPage, /min-h-\[100dvh\]/);
  assert.match(landingPage, /text-3xl[^\"]*sm:text-5xl[^\"]*lg:text-6xl/);
  assert.match(landingPage, /px-5 py-6 sm:px-8 sm:py-8/);
});
