import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('dashboard uses split-screen robot hatch layout with in-page lesson navigation', () => {
  const dashboard = readFile('app/dashboard/page.tsx');

  assert.match(dashboard, /RobotAssembly/);
  assert.match(dashboard, /lg:grid-cols-\[minmax\(320px,38%\),1fr\]/);
  assert.match(dashboard, /setSelectedLessonId/);
  assert.match(dashboard, /aria-label=\{`Open lesson \$\{lesson.id\}`\}/);
});

test('lesson verification component replaces legacy proof submit form in dashboard and lesson page', () => {
  const dashboard = readFile('app/dashboard/page.tsx');
  const lessonPage = readFile('app/lessons/[lessonId]/page.tsx');
  const verifier = readFile('components/lesson-verification.tsx');

  assert.match(verifier, /textarea/);
  assert.match(verifier, /verificationPrompt/);
  assert.match(verifier, /verificationMinLength/);
  assert.match(verifier, /robot-checkmark-pop/);

  assert.doesNotMatch(dashboard, /ProofSubmitForm/);
  assert.doesNotMatch(lessonPage, /ProofSubmitForm/);
  assert.match(dashboard, /LessonVerification/);
  assert.match(lessonPage, /LessonVerification/);
});

test('lesson page uses split-screen robot hatch layout and no legacy proof component file remains', () => {
  const lessonPage = readFile('app/lessons/[lessonId]/page.tsx');

  assert.match(lessonPage, /RobotAssembly/);
  assert.match(lessonPage, /lg:grid-cols-\[minmax\(320px,38%\),1fr\]/);
  assert.match(lessonPage, /lg:h-\[calc\(100dvh-3rem\)\] lg:overflow-y-auto/);

  assert.equal(fs.existsSync(path.join(root, 'components/proof-submit-form.tsx')), false);
});
