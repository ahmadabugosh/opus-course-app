#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { normalizeHost, parseRailwayTargetFromJson } from '../lib/domain.js';

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

export function resolveVerificationTarget(explicitTarget, railwayDomainJson) {
  if (explicitTarget) return explicitTarget;

  const inferredTarget = parseRailwayTargetFromJson(railwayDomainJson);
  return inferredTarget || undefined;
}

function getRailwayDomainJson() {
  try {
    return execFileSync('railway', ['domain', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

export function run(argv = process.argv.slice(2), env = process.env) {
  const isDryRun = argv.includes('--dry-run');
  const appUrl = getArg(argv, '--app-url', env.NEXT_PUBLIC_APP_URL);
  const domain = getArg(argv, '--domain', resolveDomain(appUrl));
  const target = getArg(argv, '--target', env.CF_TARGET_CNAME || env.RAILWAY_PUBLIC_DOMAIN);
  const waitSeconds = getArg(argv, '--wait-seconds', env.DOMAIN_VERIFY_WAIT_SECONDS || '300');
  const token = getArg(argv, '--token', env.CF_API_TOKEN || env.CLOUDFLARE_API_TOKEN);
  const apiKey = getArg(argv, '--api-key', env.CF_API_KEY || env.CLOUDFLARE_API_KEY);
  const apiEmail = getArg(argv, '--api-email', env.CF_API_EMAIL || env.CLOUDFLARE_API_EMAIL || env.CLOUDFLARE_EMAIL);
  const resolvedZoneId = getArg(argv, '--zone-id', env.CF_ZONE_ID || env.CLOUDFLARE_ZONE_ID);
  const resolvedZoneName = getArg(argv, '--zone-name', env.CF_ZONE_NAME || env.CLOUDFLARE_ZONE_NAME);

  if (!appUrl) {
    console.error('Missing NEXT_PUBLIC_APP_URL (or --app-url).');
    process.exit(1);
  }

  const passArgs = [];

  const flagMap = [
    '--token',
    '--api-key',
    '--api-email',
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

  const verificationTarget = resolveVerificationTarget(target, getRailwayDomainJson());

  if (!domain || !verificationTarget) {
    console.log('\nℹ️ Skipping DNS verification: provide --domain/--target or run in a linked Railway project so target can be inferred.');
    return;
  }

  const verifyArgs = ['scripts/verify-custom-domain.mjs', `--domain=${domain}`, `--target=${verificationTarget}`, `--wait-seconds=${waitSeconds}`];

  if (token) {
    verifyArgs.push(`--token=${token}`);
  }

  if (apiKey) {
    verifyArgs.push(`--api-key=${apiKey}`);
  }

  if (apiEmail) {
    verifyArgs.push(`--api-email=${apiEmail}`);
  }

  if (resolvedZoneId) {
    verifyArgs.push(`--zone-id=${resolvedZoneId}`);
  } else if (resolvedZoneName) {
    verifyArgs.push(`--zone-name=${resolvedZoneName}`);
  }

  console.log(`\n▶ node ${verifyArgs.join(' ')}`);
  execFileSync('node', verifyArgs, { stdio: 'inherit' });

  console.log('\n✅ Custom domain setup + verification complete.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
