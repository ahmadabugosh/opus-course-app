import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizeHost } from '../lib/domain.js';
import { resolveDomain } from '../scripts/custom-domain-setup.mjs';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('resolveDomain handles full URLs and host/path inputs', () => {
  assert.equal(resolveDomain('https://opus-course.learnopenclaw.ai/dashboard?x=1'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomain('opus-course.learnopenclaw.ai/path/ignored'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomain('opus-course.learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomain(''), undefined);
});

test('normalizeHost is exported for domain setup helpers', () => {
  assert.equal(normalizeHost('https://example.com/path'), 'example.com');
});

test('custom-domain setup uses execFileSync to avoid shell interpolation issues', () => {
  const script = read('scripts/custom-domain-setup.mjs');

  assert.match(script, /execFileSync\('node'/);
  assert.doesNotMatch(script, /execSync\(/);
});
