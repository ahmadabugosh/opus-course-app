import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('cloudflare custom domain helper script exists and validates required env vars', () => {
  const scriptPath = path.join(root, 'scripts/configure-cloudflare-domain.mjs');

  assert.equal(existsSync(scriptPath), true, 'configure-cloudflare-domain.mjs should exist');

  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /CF_API_TOKEN/);
  assert.match(script, /CF_ZONE_ID/);
  assert.match(script, /NEXT_PUBLIC_APP_URL/);
  assert.match(script, /BLOCKED: Requires Cloudflare API credentials/);
});

test('cloudflare helper supports dry-run mode, configurable proxy behavior, and Railway domain fallback', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /--dry-run/);
  assert.match(script, /CF_PROXIED/);
  assert.match(script, /CF_RECORD_NAME/);
  assert.match(script, /railway domain --json/);
});

test('README documents custom domain configuration workflow', () => {
  const readme = read('README.md');

  assert.match(readme, /Custom Domain \(Cloudflare DNS\)/);
  assert.match(readme, /scripts\/configure-cloudflare-domain\.mjs/);
  assert.match(readme, /CF_API_TOKEN/);
  assert.match(readme, /CF_ZONE_ID/);
});
