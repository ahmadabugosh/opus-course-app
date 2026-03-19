import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('dns verification helper exists for custom-domain rollout validation', () => {
  const scriptPath = path.join(root, 'scripts/verify-custom-domain.mjs');

  assert.equal(existsSync(scriptPath), true, 'verify-custom-domain.mjs should exist');

  const script = read('scripts/verify-custom-domain.mjs');

  assert.match(script, /--domain=/);
  assert.match(script, /--target=/);
  assert.match(script, /--wait-seconds=/);
  assert.match(script, /dns\.resolveCname/);
  assert.match(script, /dns\.resolve4/);
});

test('README documents domain verification command', () => {
  const readme = read('README.md');

  assert.match(readme, /verify-custom-domain\.mjs/);
  assert.match(readme, /--wait-seconds/);
});
