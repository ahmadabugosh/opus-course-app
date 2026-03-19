#!/usr/bin/env node

// BLOCKED: Requires Cloudflare API credentials + target Railway host before DNS can be applied automatically.
// TODO: revisit once Cloudflare auth credentials (API token or API key/email) and zone access are available in deployment secrets.

import { execSync } from 'node:child_process';
import { buildCloudflareHeaders, expandRecordName, inferZoneNameFromHostname, isEquivalentCnameRecord, isSelfReferentialCname, normalizeHost, parseRailwayTargetFromJson, resolveCnameTarget } from '../lib/domain.js';

const argList = process.argv.slice(2);
const args = new Set(argList);

// Supported flags (either --key value or --key=value):
// --token=... --api-key=... --api-email=... --app-url=... --zone-id=... --zone-name=... --target=... --record-name=... --proxied=true|false --dry-run

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
const apiKey = getArgValue('--api-key') || process.env.CF_API_KEY || process.env.CLOUDFLARE_API_KEY;
const apiEmail =
  getArgValue('--api-email') ||
  process.env.CF_API_EMAIL ||
  process.env.CLOUDFLARE_API_EMAIL ||
  process.env.CLOUDFLARE_EMAIL;
const appUrlRaw = getArgValue('--app-url') || process.env.NEXT_PUBLIC_APP_URL;

const headers = buildCloudflareHeaders({ token, apiKey, apiEmail });

const missing = [];
if (!headers) missing.push('CF_API_TOKEN/CLOUDFLARE_API_TOKEN (or --token) OR CF_API_KEY+CF_API_EMAIL/CLOUDFLARE_API_KEY+CLOUDFLARE_EMAIL');
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
const rawRecordName = getArgValue('--record-name') || process.env.CF_RECORD_NAME || process.env.CLOUDFLARE_RECORD_NAME || domain;
const recordName = expandRecordName(rawRecordName, zoneName) || domain;
const proxiedArg = getArgValue('--proxied');
const proxiedEnv = process.env.CF_PROXIED ?? process.env.CLOUDFLARE_PROXIED;
const proxied = proxiedArg ? proxiedArg === 'true' : proxiedEnv ? proxiedEnv === 'true' : true;

function getRailwayTargetFromCli() {
  try {
    const raw = execSync('railway domain --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return null;

    return parseRailwayTargetFromJson(raw);
  } catch {
    return null;
  }
}

const targetCandidate =
  getArgValue('--target') ||
  process.env.CF_TARGET_CNAME ||
  process.env.RAILWAY_PUBLIC_DOMAIN ||
  getRailwayTargetFromCli();

const target = resolveCnameTarget(targetCandidate);

if (!target) {
  console.error('Missing or invalid target host. Set CF_TARGET_CNAME/RAILWAY_PUBLIC_DOMAIN (hostname only) or run in a linked Railway project so `railway domain --json` can resolve a valid Railway hostname.');
  process.exit(1);
}

if (isSelfReferentialCname(recordName, target)) {
  console.error(`Self-referential CNAME detected: ${recordName} -> ${target}. Resolve a Railway service domain (*.railway.app) before applying DNS.`);
  process.exit(1);
}


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

async function fetchRecordsByName(name) {
  const resolvedZoneId = await resolveZoneId();
  const url = `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records?name=${encodeURIComponent(name)}`;
  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare lookup failed: ${JSON.stringify(data.errors)}`);
  }

  return data.result ?? [];
}

async function deleteRecord(zoneId, recordId) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare delete failed: ${JSON.stringify(data.errors)}`);
  }
}

async function upsertCname(name, content) {
  const resolvedZoneId = await resolveZoneId();
  const existingRecords = await fetchRecordsByName(name);
  const existingCname = existingRecords.find((record) => record.type === 'CNAME');
  const conflictingRecords = existingRecords.filter((record) => record.type !== 'CNAME');
  const payload = {
    type: 'CNAME',
    name,
    content,
    proxied,
    ttl: 1,
  };

  const alreadyMatches = isEquivalentCnameRecord(existingCname, { name, content, proxied });

  if (isDryRun) {
    return {
      action: alreadyMatches
        ? 'would-skip-unchanged'
        : existingCname
          ? 'would-update'
          : conflictingRecords.length
            ? 'would-replace-conflicting-records'
            : 'would-create',
      record: {
        name,
        content,
        proxied,
      },
      conflicts: conflictingRecords.map((record) => ({ id: record.id, type: record.type })),
    };
  }

  if (alreadyMatches) {
    return {
      action: 'skipped-unchanged',
      record: existingCname,
    };
  }

  if (existingCname) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records/${existingCname.id}`, {
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

  for (const record of conflictingRecords) {
    await deleteRecord(resolvedZoneId, record.id);
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

  return { action: conflictingRecords.length ? 'replaced-conflicting-records' : 'created', record: data.result };
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
