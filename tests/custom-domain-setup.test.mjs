import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizeHost } from '../lib/domain.js';
import { resolveDomain, resolveVerificationTarget } from '../scripts/custom-domain-setup.mjs';
import { resolveDomainInput, toWaitSeconds } from '../scripts/verify-custom-domain.mjs';

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

test('resolveVerificationTarget prefers explicit target and falls back to Railway JSON parsing', () => {
  assert.equal(resolveVerificationTarget('explicit.up.railway.app', ''), 'explicit.up.railway.app');

  const railwayJson = JSON.stringify({
    domains: [{ serviceDomain: 'https://fallback-target.up.railway.app' }],
  });

  assert.equal(resolveVerificationTarget(undefined, railwayJson), 'fallback-target.up.railway.app');
  assert.equal(resolveVerificationTarget(undefined, ''), undefined);
});

test('normalizeHost is exported for domain setup helpers', () => {
  assert.equal(normalizeHost('https://example.com/path'), 'example.com');
  assert.equal(normalizeHost('EXAMPLE.COM.'), 'example.com');
});

test('verify helper normalizes domain inputs from URL or host/path forms', () => {
  assert.equal(resolveDomainInput('https://opus-course.learnopenclaw.ai/dashboard'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomainInput('opus-course.learnopenclaw.ai/path/ignored'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomainInput('opus-course.learnopenclaw.ai'), 'opus-course.learnopenclaw.ai');
  assert.equal(resolveDomainInput(''), undefined);
});

test('verify helper sanitizes wait-seconds values', () => {
  assert.equal(toWaitSeconds('300'), 300);
  assert.equal(toWaitSeconds('-10'), 0);
  assert.equal(toWaitSeconds('abc'), 0);
});

test('custom-domain setup uses execFileSync to avoid shell interpolation issues', () => {
  const script = read('scripts/custom-domain-setup.mjs');

  assert.match(script, /execFileSync\('node'/);
  assert.doesNotMatch(script, /execSync\(/);
});

test('configure script supports CLOUDFLARE_* env aliases for easier credential reuse', () => {
  const script = read('scripts/configure-cloudflare-domain.mjs');

  assert.match(script, /CLOUDFLARE_API_TOKEN/);
  assert.match(script, /CLOUDFLARE_ZONE_ID/);
  assert.match(script, /CLOUDFLARE_ZONE_NAME/);
  assert.match(script, /CLOUDFLARE_TARGET_CNAME/);
});

test('custom-domain setup forwards Cloudflare auth flags to configure and verify commands', () => {
  const script = read('scripts/custom-domain-setup.mjs');

  assert.match(script, /'--api-key'/);
  assert.match(script, /'--api-email'/);
  assert.match(script, /'--token'/);
  assert.match(script, /verifyArgs\.push\(`--token=\$\{token\}`\)/);
  assert.match(script, /verifyArgs\.push\(`--api-key=\$\{apiKey\}`\)/);
  assert.match(script, /verifyArgs\.push\(`--api-email=\$\{apiEmail\}`\)/);
});
