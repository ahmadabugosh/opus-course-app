#!/usr/bin/env node

import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getArg(name, fallback) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = args.indexOf(name);
  if (idx !== -1) return args[idx + 1];
  return fallback;
}

const appUrl = getArg('--app-url', process.env.NEXT_PUBLIC_APP_URL);
const domain = getArg('--domain', appUrl ? new URL(appUrl).hostname : undefined);
const target = getArg('--target', process.env.CF_TARGET_CNAME || process.env.RAILWAY_PUBLIC_DOMAIN);
const waitSeconds = getArg('--wait-seconds', process.env.DOMAIN_VERIFY_WAIT_SECONDS || '300');

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
  const value = getArg(flag);
  if (value) {
    passArgs.push(`${flag}=${value}`);
  }
}

if (isDryRun) {
  passArgs.push('--dry-run');
}

const configureCmd = `node scripts/configure-cloudflare-domain.mjs ${passArgs.join(' ')}`.trim();

console.log(`\n▶ ${configureCmd}`);
execSync(configureCmd, { stdio: 'inherit' });

if (isDryRun) {
  console.log('\n✅ Dry run complete (DNS was not changed).');
  process.exit(0);
}

if (!domain || !target) {
  console.log('\nℹ️ Skipping DNS verification: provide --domain and --target (or env vars) to run verification automatically.');
  process.exit(0);
}

const verifyCmd = `node scripts/verify-custom-domain.mjs --domain=${domain} --target=${target} --wait-seconds=${waitSeconds}`;
console.log(`\n▶ ${verifyCmd}`);
execSync(verifyCmd, { stdio: 'inherit' });

console.log('\n✅ Custom domain setup + verification complete.');
