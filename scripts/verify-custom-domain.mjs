#!/usr/bin/env node

import dns from 'node:dns/promises';

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = args.indexOf(name);
  if (idx !== -1) return args[idx + 1];
  return fallback;
}

const domain = getArg('--domain', process.env.CUSTOM_DOMAIN || process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, ''));
const target = getArg('--target', process.env.CF_TARGET_CNAME || process.env.RAILWAY_PUBLIC_DOMAIN);
const waitSeconds = Number(getArg('--wait-seconds', '0'));

if (!domain || !target) {
  console.error('Usage: node scripts/verify-custom-domain.mjs --domain=opus-course.learnopenclaw.ai --target=<railway-domain> [--wait-seconds=300]');
  process.exit(1);
}

function normalize(value) {
  return value.toLowerCase().replace(/\.$/, '');
}

async function resolveTarget() {
  try {
    const records = await dns.resolveCname(domain);
    return { kind: 'CNAME', records: records.map(normalize) };
  } catch {
    const records = await dns.resolve4(domain);
    return { kind: 'A', records };
  }
}

async function run() {
  const deadline = Date.now() + Math.max(0, waitSeconds) * 1000;
  const expected = normalize(target);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await resolveTarget();
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

run().catch((error) => {
  console.error(`❌ Unable to verify DNS: ${error.message}`);
  process.exit(1);
});
