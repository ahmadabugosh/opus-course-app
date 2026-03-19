#!/usr/bin/env node

import dns from 'node:dns/promises';
import { buildCloudflareHeaders, inferZoneNameFromHostname, normalizeHost } from '../lib/domain.js';

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
  return value.toLowerCase().replace(/\.+$/, '');
}

export function matchesExpectedTarget(result, target) {
  const expected = normalize(target);
  return result.kind === 'CNAME' && result.records.map(normalize).includes(expected);
}

function isAddressKind(kind) {
  return kind === 'A' || kind === 'AAAA';
}

export function matchesFlattenedTarget(domainResult, targetResult) {
  if (!isAddressKind(domainResult.kind) || !isAddressKind(targetResult.kind)) return false;

  const domainIps = new Set(domainResult.records.map(normalize));
  return targetResult.records.map(normalize).some((ip) => domainIps.has(ip));
}

async function resolveTarget(domain) {
  try {
    const records = await dns.resolveCname(domain);
    return { kind: 'CNAME', records: records.map(normalize) };
  } catch {
    try {
      const records = await dns.resolve4(domain);
      return { kind: 'A', records };
    } catch {
      const records = await dns.resolve6(domain);
      return { kind: 'AAAA', records };
    }
  }
}

async function resolveZoneId(zoneId, zoneName, headers, fetchFn) {
  if (zoneId) return zoneId;
  if (!zoneName) return undefined;

  const response = await fetchFn(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}&status=active`, { headers });
  const data = await response.json();

  if (!data.success) return undefined;

  const zone = data.result?.find((item) => item.name === zoneName) ?? data.result?.[0];
  return zone?.id;
}

export async function verifyWithCloudflareApi({ domain, target, token, apiKey, apiEmail, zoneId, zoneName, fetchFn = fetch }) {
  const headers = buildCloudflareHeaders({ token, apiKey, apiEmail });
  if (!headers) return false;

  const resolvedZoneId = await resolveZoneId(zoneId, zoneName, headers, fetchFn);
  if (!resolvedZoneId) return false;

  const response = await fetchFn(
    `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records?name=${encodeURIComponent(domain)}&type=CNAME`,
    { headers },
  );

  const data = await response.json();
  if (!data.success) return false;

  return data.result?.some((record) => normalize(record.name) === normalize(domain) && normalize(record.content) === normalize(target));
}

export async function run(argv = args, env = process.env, deps = {}) {
  const domain = resolveDomainInput(
    getArg(argv, '--domain', env.CUSTOM_DOMAIN || env.NEXT_PUBLIC_APP_URL),
  );
  const target = resolveDomainInput(
    getArg(argv, '--target', env.CF_TARGET_CNAME || env.CLOUDFLARE_TARGET_CNAME || env.RAILWAY_PUBLIC_DOMAIN),
  );
  const waitSeconds = toWaitSeconds(getArg(argv, '--wait-seconds', '0'));
  const token = getArg(argv, '--token', env.CF_API_TOKEN || env.CLOUDFLARE_API_TOKEN);
  const apiKey = getArg(argv, '--api-key', env.CF_API_KEY || env.CLOUDFLARE_API_KEY);
  const apiEmail = getArg(
    argv,
    '--api-email',
    env.CF_API_EMAIL || env.CLOUDFLARE_API_EMAIL || env.CLOUDFLARE_EMAIL,
  );
  const zoneId = getArg(argv, '--zone-id', env.CF_ZONE_ID || env.CLOUDFLARE_ZONE_ID);
  const zoneName = getArg(argv, '--zone-name', env.CF_ZONE_NAME || env.CLOUDFLARE_ZONE_NAME || inferZoneNameFromHostname(domain));

  const dnsResolver = deps.resolveTarget ?? resolveTarget;
  const fetchFn = deps.fetchFn ?? fetch;
  const sleep = deps.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  if (!domain || !target) {
    console.error('Usage: node scripts/verify-custom-domain.mjs --domain=opus-course.learnopenclaw.ai --target=<railway-domain> [--wait-seconds=300] [--token=... | --api-key=... --api-email=...] [--zone-id=...|--zone-name=...]');
    process.exit(1);
  }

  const deadline = Date.now() + waitSeconds * 1000;

  while (true) {
    const result = await dnsResolver(domain);
    const matches = matchesExpectedTarget(result, target);

    if (matches) {
      console.log(`✅ DNS verified: ${domain} -> ${target}`);
      return;
    }

    if (isAddressKind(result.kind)) {
      const targetResult = await dnsResolver(target);
      if (matchesFlattenedTarget(result, targetResult)) {
        console.log(`✅ DNS verified via flattened IP records: ${domain} -> ${target}`);
        return;
      }
    }

    const rendered = result.records.join(', ') || '(none)';
    const remainingMs = deadline - Date.now();

    if (remainingMs <= 0) {
      const apiVerified = await verifyWithCloudflareApi({
        domain,
        target,
        token,
        apiKey,
        apiEmail,
        zoneId,
        zoneName,
        fetchFn,
      });

      if (apiVerified) {
        console.log(`✅ DNS record verified in Cloudflare API: ${domain} -> ${target} (proxied records may hide public CNAME)`);
        return;
      }

      console.error(`❌ DNS mismatch for ${domain}. Expected CNAME -> ${target}, got ${result.kind}: ${rendered}`);
      process.exit(1);
    }

    const waitMs = Math.min(5000, Math.max(500, remainingMs));
    console.log(`⏳ Waiting for DNS propagation (${Math.ceil(remainingMs / 1000)}s left). Current ${result.kind}: ${rendered}`);
    await sleep(waitMs);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(`❌ Unable to verify DNS: ${error.message}`);
    process.exit(1);
  });
}
