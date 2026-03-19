import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('landing page includes hero, roadmap, and learning outcomes sections', () => {
  const page = readFile('app/page.tsx');

  assert.match(page, /Opus Mastery/i);
  assert.match(page, /12-Lesson Roadmap/i);
  assert.match(page, /What You(?:\u2019|'|&apos;)ll Learn/i);
  assert.match(page, /Start Learning Free/i);
});

test('root layout includes course metadata, navigation, and footer', () => {
  const layout = readFile('app/layout.tsx');

  assert.match(layout, /title:\s*["']Opus Mastery/i);
  assert.match(layout, /openGraph/i);
  assert.match(layout, /<header/i);
  assert.match(layout, /<footer/i);
});

test('global styles define dark theme tokens and accent colors', () => {
  const css = readFile('app/globals.css');

  assert.match(css, /--background:\s*#0f0f1a/i);
  assert.match(css, /--primary:\s*#6366f1/i);
  assert.match(css, /--success:\s*#10b981/i);
});
