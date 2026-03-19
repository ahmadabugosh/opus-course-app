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
  assert.match(script, /--token=/);
  assert.match(script, /--zone-id=/);
  assert.match(script, /--zone-name=/);
  assert.match(script, /CF_API_KEY/);
  assert.match(script, /CF_API_EMAIL/);
  assert.match(script, /verifyWithCloudflareApi/);
});

test('verify script helpers normalize/match targets and support Cloudflare API fallback', async () => {
  const mod = await import(path.join(root, 'scripts/verify-custom-domain.mjs'));

  assert.equal(mod.toWaitSeconds('-5'), 0);
  assert.equal(mod.toWaitSeconds('abc'), 0);
  assert.equal(mod.toWaitSeconds('12'), 12);

  assert.equal(mod.matchesExpectedTarget({ kind: 'CNAME', records: ['Example.Railway.App.'] }, 'example.railway.app'), true);
  assert.equal(mod.matchesExpectedTarget({ kind: 'A', records: ['1.1.1.1'] }, 'example.railway.app'), false);
  assert.equal(mod.matchesFlattenedTarget({ kind: 'A', records: ['1.1.1.1', '2.2.2.2'] }, { kind: 'A', records: ['2.2.2.2'] }), true);
  assert.equal(mod.matchesFlattenedTarget({ kind: 'A', records: ['1.1.1.1'] }, { kind: 'A', records: ['9.9.9.9'] }), false);
  assert.equal(mod.matchesFlattenedTarget({ kind: 'AAAA', records: ['2606:4700:4700::1111'] }, { kind: 'AAAA', records: ['2606:4700:4700::1111'] }), true);
  assert.equal(mod.matchesFlattenedTarget({ kind: 'AAAA', records: ['2606:4700:4700::1111'] }, { kind: 'AAAA', records: ['2606:4700:4700::2222'] }), false);

  const apiOk = await mod.verifyWithCloudflareApi({
    domain: 'opus-course.learnopenclaw.ai',
    target: 'service.up.railway.app',
    token: 'token',
    zoneId: 'zone123',
    fetchFn: async () => ({
      async json() {
        return {
          success: true,
          result: [{ name: 'opus-course.learnopenclaw.ai', content: 'service.up.railway.app' }],
        };
      },
    }),
  });

  assert.equal(apiOk, true);
});

test('run() accepts flattened AAAA matches', async () => {
  const mod = await import(path.join(root, 'scripts/verify-custom-domain.mjs'));

  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));

  try {
    await mod.run(
      ['--domain=opus-course.learnopenclaw.ai', '--target=service.up.railway.app'],
      {},
      {
        resolveTarget: async (host) => {
          if (host === 'opus-course.learnopenclaw.ai') {
            return { kind: 'AAAA', records: ['2606:4700:4700::1111'] };
          }

          return { kind: 'AAAA', records: ['2606:4700:4700::1111', '2606:4700:4700::2222'] };
        },
      },
    );
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  assert.equal(errors.length, 0);
  assert.match(logs.join('\n'), /flattened IP records/);
});

test('README documents domain verification command', () => {
  const readme = read('README.md');

  assert.match(readme, /verify-custom-domain\.mjs/);
  assert.match(readme, /--wait-seconds/);
});
