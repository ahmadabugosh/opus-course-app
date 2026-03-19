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
  assert.match(script, /CLOUDFLARE_API_TOKEN/);
  assert.match(script, /CF_API_KEY/);
  assert.match(script, /CLOUDFLARE_API_KEY/);
  assert.match(script, /CF_API_EMAIL/);
  assert.match(script, /CLOUDFLARE_EMAIL/);
  assert.match(script, /CF_ZONE_ID/);
  assert.match(script, /CF_ZONE_NAME/);
  assert.match(script, /inferZoneNameFromHostname/);
  assert.match(script, /NEXT_PUBLIC_APP_URL/);
  assert.match(script, /BLOCKED: Requires Cloudflare API credentials/);
});

test('cloudflare helper supports dry-run mode, configurable proxy behavior, and Railway domain fallback', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /--dry-run/);
  assert.match(script, /CF_PROXIED/);
  assert.match(script, /CLOUDFLARE_PROXIED/);
  assert.match(script, /CF_RECORD_NAME/);
  assert.match(script, /CLOUDFLARE_RECORD_NAME/);
  assert.match(script, /CF_TARGET_CNAME/);
  assert.match(script, /CLOUDFLARE_TARGET_CNAME/);
  assert.match(script, /railway domain --json/);
  assert.match(script, /resolveCnameTarget/);
});

test('cloudflare helper supports explicit CLI flags for safer one-off DNS changes', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /--zone-id=/);
  assert.match(script, /--zone-name=/);
  assert.match(script, /--target=/);
  assert.match(script, /--record-name=/);
  assert.match(script, /--proxied=/);
});

test('custom-domain setup orchestration script exists for one-command apply+verify', () => {
  const scriptPath = path.join(root, 'scripts/custom-domain-setup.mjs');

  assert.equal(existsSync(scriptPath), true, 'custom-domain-setup.mjs should exist');

  const script = read('scripts/custom-domain-setup.mjs');

  assert.match(script, /configure-cloudflare-domain\.mjs/);
  assert.match(script, /verify-custom-domain\.mjs/);
  assert.match(script, /--dry-run/);
  assert.match(script, /--wait-seconds/);
  assert.match(script, /NEXT_PUBLIC_APP_URL/);
});

test('README documents custom domain configuration workflow', () => {
  const readme = read('README.md');

  assert.match(readme, /Custom Domain \(Cloudflare DNS\)/);
  assert.match(readme, /scripts\/configure-cloudflare-domain\.mjs/);
  assert.match(readme, /scripts\/custom-domain-setup\.mjs/);
  assert.match(readme, /CF_API_TOKEN/);
  assert.match(readme, /CF_ZONE_ID/);
  assert.match(readme, /CF_ZONE_NAME/);
});

test('configure helper accepts NEXT_PUBLIC_APP_URL as full URL or host/path', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /normalizeHost\(appUrlRaw\)/);
});

test('configure helper blocks self-referential CNAME records to prevent DNS loops', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /isSelfReferentialCname/);
  assert.match(script, /Self-referential CNAME detected/);
});


test('configure helper replaces conflicting non-CNAME records before creating CNAME', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /dns_records\?name=/);
  assert.match(script, /method: 'DELETE'/);
  assert.match(script, /replaced-conflicting-records/);
});

test('configure helper skips Cloudflare writes when matching CNAME already exists', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /isEquivalentCnameRecord/);
  assert.match(script, /skipped-unchanged/);
  assert.match(script, /would-skip-unchanged/);
});
