import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('railway.toml defines nixpacks build and health check deploy settings', () => {
  const railway = read('railway.toml');

  assert.match(railway, /builder\s*=\s*"NIXPACKS"/);
  assert.doesNotMatch(railway, /startCommand\s*=\s*"npm run start"/);
  assert.match(railway, /healthcheckPath\s*=\s*"\/api\/health"/);
});

test('nixpacks.toml defines setup, install, build, and start commands', () => {
  const nixpacks = read('nixpacks.toml');

  assert.match(nixpacks, /\[phases\.setup\]/);
  assert.match(nixpacks, /nodejs_20/);
  assert.match(nixpacks, /\[phases\.install\]/);
  assert.match(nixpacks, /npm ci/);
  assert.match(nixpacks, /\[phases\.build\]/);
  assert.match(nixpacks, /npm run build/);
  assert.match(nixpacks, /\[start\]/);
  assert.match(nixpacks, /npm run start/);
});
