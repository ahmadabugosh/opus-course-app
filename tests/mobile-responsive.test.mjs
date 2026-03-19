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
  assert.match(sidebar, /overflow-x-auto/);
});

test('dashboard and lesson pages use mobile-friendly content spacing', () => {
  const dashboardPage = readFile('app/dashboard/page.tsx');
  const lessonPage = readFile('app/lessons/[lessonId]/page.tsx');

  assert.match(dashboardPage, /p-4 sm:p-6/);
  assert.match(lessonPage, /p-4 sm:p-6/);
});
