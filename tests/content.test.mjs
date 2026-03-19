import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.resolve(process.cwd(), 'content');

test('all 12 lesson markdown files exist', () => {
  for (let i = 1; i <= 12; i += 1) {
    const filename = `lesson-${String(i).padStart(2, '0')}.md`;
    const filePath = path.join(contentDir, filename);
    assert.equal(fs.existsSync(filePath), true, `${filename} should exist`);
  }
});

test('lesson markdown files include frontmatter and challenge section', () => {
  for (let i = 1; i <= 12; i += 1) {
    const filename = `lesson-${String(i).padStart(2, '0')}.md`;
    const filePath = path.join(contentDir, filename);
    const file = fs.readFileSync(filePath, 'utf8');

    assert.match(file, /^---[\s\S]*?---\n\n# /, `${filename} must include frontmatter and heading`);
    assert.match(file, /## Challenge/, `${filename} must include challenge section`);
  }
});
