#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { normalizeHost } from '../lib/domain.js';

export function getArg(args, name, fallback) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = args.indexOf(name);
  if (idx !== -1) return args[idx + 1];
  return fallback;
}

export function resolveDomain(appUrl) {
  if (!appUrl) return undefined;

  const normalized = normalizeHost(appUrl);
  if (normalized) return normalized;

  try {
    return new URL(appUrl).hostname;
  } catch {
    return undefined;
  }
}

export function run(argv = process.argv.slice(2), env = process.env) {
  const isDryRun = argv.includes('--dry-run');
  const appUrl = getArg(argv, '--app-url', env.NEXT_PUBLIC_APP_URL);
  const domain = getArg(argv, '--domain', resolveDomain(appUrl));
  const target = getArg(argv, '--target', env.CF_TARGET_CNAME || env.RAILWAY_PUBLIC_DOMAIN);
  const waitSeconds = getArg(argv, '--wait-seconds', env.DOMAIN_VERIFY_WAIT_SECONDS || '300');

  if (!appUrl) {
    console.error('Missing NEXT_PUBLIC_APP_URL (or --app-url).');
    process.exit(1);
  }

  const passArgs = [];

  const flagMap = [
    '--token',
    '--app-url',
    '--zone-id',
    '--zone-name',
    '--target',
    '--record-name',
    '--proxied',
  ];

  for (const flag of flagMap) {
    const value = getArg(argv, flag);
    if (value) {
      passArgs.push(`${flag}=${value}`);
    }
  }

  if (isDryRun) {
    passArgs.push('--dry-run');
  }

  const configureArgs = ['scripts/configure-cloudflare-domain.mjs', ...passArgs];

  console.log(`\n▶ node ${configureArgs.join(' ')}`);
  execFileSync('node', configureArgs, { stdio: 'inherit' });

  if (isDryRun) {
    console.log('\n✅ Dry run complete (DNS was not changed).');
    return;
  }

  if (!domain || !target) {
    console.log('\nℹ️ Skipping DNS verification: provide --domain and --target (or env vars) to run verification automatically.');
    return;
  }

  const verifyArgs = ['scripts/verify-custom-domain.mjs', `--domain=${domain}`, `--target=${target}`, `--wait-seconds=${waitSeconds}`];
  console.log(`\n▶ node ${verifyArgs.join(' ')}`);
  execFileSync('node', verifyArgs, { stdio: 'inherit' });

  console.log('\n✅ Custom domain setup + verification complete.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
