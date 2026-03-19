#!/usr/bin/env node

// BLOCKED: Requires Cloudflare API credentials + target Railway host before DNS can be applied automatically.
// TODO: revisit once CF_API_TOKEN and either CF_ZONE_ID or CF_ZONE_NAME are available in deployment secrets.

import { execSync } from 'node:child_process';
import { expandRecordName, inferZoneNameFromHostname, isSelfReferentialCname, normalizeHost, parseRailwayTargetFromJson } from '../lib/domain.js';

const argList = process.argv.slice(2);
const args = new Set(argList);

// Supported flags (either --key value or --key=value):
// --token=... --app-url=... --zone-id=... --zone-name=... --target=... --record-name=... --proxied=true|false --dry-run

function getArgValue(name) {
  const prefix = `${name}=`;
  const direct = argList.find((arg) => arg.startsWith(prefix));

  if (direct) {
    return direct.slice(prefix.length);
  }

  const idx = argList.findIndex((arg) => arg === name);
  if (idx !== -1) {
    return argList[idx + 1];
  }

  return undefined;
}

const isDryRun = args.has('--dry-run');
const token = getArgValue('--token') || process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const appUrlRaw = getArgValue('--app-url') || process.env.NEXT_PUBLIC_APP_URL;

const missing = [];
if (!token) missing.push('CF_API_TOKEN/CLOUDFLARE_API_TOKEN (or --token)');
if (!appUrlRaw) missing.push('NEXT_PUBLIC_APP_URL (or --app-url)');

if (missing.length) {
  console.error(`Missing required configuration: ${missing.join(', ')}`);
  console.error('Expected NEXT_PUBLIC_APP_URL like https://opus-course.learnopenclaw.ai');
  process.exit(1);
}

let zoneId = getArgValue('--zone-id') || process.env.CF_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID;
const domain = normalizeHost(appUrlRaw);

if (!domain) {
  console.error(`Invalid NEXT_PUBLIC_APP_URL/--app-url value: ${appUrlRaw}`);
  process.exit(1);
}

const inferredZoneName = inferZoneNameFromHostname(domain);
const zoneName = getArgValue('--zone-name') || process.env.CF_ZONE_NAME || process.env.CLOUDFLARE_ZONE_NAME || inferredZoneName;
const rawRecordName = getArgValue('--record-name') || process.env.CF_RECORD_NAME || domain;
const recordName = expandRecordName(rawRecordName, zoneName) || domain;
const proxiedArg = getArgValue('--proxied');
const proxied = proxiedArg ? proxiedArg === 'true' : process.env.CF_PROXIED ? process.env.CF_PROXIED === 'true' : true;

function getRailwayTargetFromCli() {
  try {
    const raw = execSync('railway domain --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return null;

    return parseRailwayTargetFromJson(raw);
  } catch {
    return null;
  }
}

const target =
  getArgValue('--target') ||
  process.env.CF_TARGET_CNAME ||
  process.env.RAILWAY_PUBLIC_DOMAIN ||
  getRailwayTargetFromCli();

if (!target) {
  console.error('Missing target host. Set CF_TARGET_CNAME or RAILWAY_PUBLIC_DOMAIN, or run in a linked Railway project so `railway domain --json` can resolve it.');
  process.exit(1);
}

if (isSelfReferentialCname(recordName, target)) {
  console.error(`Self-referential CNAME detected: ${recordName} -> ${target}. Resolve a Railway service domain (*.railway.app) before applying DNS.`);
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function resolveZoneId() {
  if (zoneId) return zoneId;

  if (!zoneName) {
    throw new Error('Missing Cloudflare zone. Set CF_ZONE_ID directly or provide CF_ZONE_NAME. (Auto-inference from NEXT_PUBLIC_APP_URL failed.)');
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}&status=active`, { headers });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare zone lookup failed: ${JSON.stringify(data.errors)}`);
  }

  const zone = data.result?.find((item) => item.name === zoneName) ?? data.result?.[0];

  if (!zone?.id) {
    throw new Error(`No active Cloudflare zone found for ${zoneName}.`);
  }

  zoneId = zone.id;
  return zoneId;
}

async function fetchRecordByName(name) {
  const resolvedZoneId = await resolveZoneId();
  const url = `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`;
  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare lookup failed: ${JSON.stringify(data.errors)}`);
  }

  return data.result?.[0] ?? null;
}

async function upsertCname(name, content) {
  const resolvedZoneId = await resolveZoneId();
  const existing = await fetchRecordByName(name);
  const payload = {
    type: 'CNAME',
    name,
    content,
    proxied,
    ttl: 1,
  };

  if (isDryRun) {
    return {
      action: existing ? 'would-update' : 'would-create',
      record: {
        name,
        content,
        proxied,
      },
    };
  }

  if (existing) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare update failed: ${JSON.stringify(data.errors)}`);
    }

    return { action: 'updated', record: data.result };
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare create failed: ${JSON.stringify(data.errors)}`);
  }

  return { action: 'created', record: data.result };
}

const run = async () => {
  const result = await upsertCname(recordName, target);
  const dryRunPrefix = isDryRun ? '[dry-run] ' : '';
  console.log(`${dryRunPrefix}Custom domain ${result.action}: ${recordName} -> ${target}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
