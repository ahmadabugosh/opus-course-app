#!/usr/bin/env node

import dns from 'node:dns/promises';
import { normalizeHost } from '../lib/domain.js';

const args = process.argv.slice(2);

export function getArg(argv, name, fallback) {
  const prefix = `${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = argv.indexOf(name);
  if (idx !== -1) return argv[idx + 1];
  return fallback;
}

export function resolveDomainInput(value) {
  const normalized = normalizeHost(value);
  return normalized || undefined;
}

export function toWaitSeconds(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function normalize(value) {
  return value.toLowerCase().replace(/\.$/, '');
}

async function resolveTarget(domain) {
  try {
    const records = await dns.resolveCname(domain);
    return { kind: 'CNAME', records: records.map(normalize) };
  } catch {
    const records = await dns.resolve4(domain);
    return { kind: 'A', records };
  }
}

export async function run(argv = args, env = process.env) {
  const domain = resolveDomainInput(
    getArg(argv, '--domain', env.CUSTOM_DOMAIN || env.NEXT_PUBLIC_APP_URL),
  );
  const target = resolveDomainInput(
    getArg(argv, '--target', env.CF_TARGET_CNAME || env.RAILWAY_PUBLIC_DOMAIN),
  );
  const waitSeconds = toWaitSeconds(getArg(argv, '--wait-seconds', '0'));

  if (!domain || !target) {
    console.error('Usage: node scripts/verify-custom-domain.mjs --domain=opus-course.learnopenclaw.ai --target=<railway-domain> [--wait-seconds=300]');
    process.exit(1);
  }

  const deadline = Date.now() + waitSeconds * 1000;
  const expected = normalize(target);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await resolveTarget(domain);
    const matches = result.kind === 'CNAME' && result.records.includes(expected);

    if (matches) {
      console.log(`✅ DNS verified: ${domain} -> ${target}`);
      return;
    }

    const rendered = result.records.join(', ') || '(none)';
    const remainingMs = deadline - Date.now();

    if (remainingMs <= 0) {
      console.error(`❌ DNS mismatch for ${domain}. Expected CNAME -> ${target}, got ${result.kind}: ${rendered}`);
      process.exit(1);
    }

    const waitMs = Math.min(5000, Math.max(500, remainingMs));
    console.log(`⏳ Waiting for DNS propagation (${Math.ceil(remainingMs / 1000)}s left). Current ${result.kind}: ${rendered}`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(`❌ Unable to verify DNS: ${error.message}`);
    process.exit(1);
  });
}
