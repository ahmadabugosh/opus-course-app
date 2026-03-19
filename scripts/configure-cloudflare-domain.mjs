#!/usr/bin/env node

// BLOCKED: Requires Cloudflare API credentials + target Railway host before DNS can be applied automatically.
// TODO: revisit once CF_API_TOKEN and either CF_ZONE_ID or CF_ZONE_NAME are available in deployment secrets.

import { execSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const required = ['CF_API_TOKEN', 'NEXT_PUBLIC_APP_URL'];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Expected NEXT_PUBLIC_APP_URL like https://opus-course.learnopenclaw.ai');
  process.exit(1);
}

const token = process.env.CF_API_TOKEN;
let zoneId = process.env.CF_ZONE_ID;
const zoneName = process.env.CF_ZONE_NAME;
const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
const domain = appUrl.hostname;
const recordName = process.env.CF_RECORD_NAME || domain;
const proxied = process.env.CF_PROXIED ? process.env.CF_PROXIED === 'true' : true;

function getRailwayTargetFromCli() {
  try {
    const raw = execSync('railway domain --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return parsed.target || parsed.domain || parsed.hostname || null;
  } catch {
    return null;
  }
}

const target = process.env.CF_TARGET_CNAME || process.env.RAILWAY_PUBLIC_DOMAIN || getRailwayTargetFromCli();

if (!target) {
  console.error('Missing target host. Set CF_TARGET_CNAME or RAILWAY_PUBLIC_DOMAIN, or run in a linked Railway project so `railway domain --json` can resolve it.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function resolveZoneId() {
  if (zoneId) return zoneId;

  if (!zoneName) {
    throw new Error('Missing Cloudflare zone. Set CF_ZONE_ID directly or provide CF_ZONE_NAME to resolve it automatically.');
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
