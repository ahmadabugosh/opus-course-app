#!/usr/bin/env node

// BLOCKED: Requires Cloudflare API credentials + target Railway host before DNS can be applied automatically.
// TODO: revisit once CF_API_TOKEN and CF_ZONE_ID are available in deployment secrets.

const required = ['CF_API_TOKEN', 'CF_ZONE_ID', 'NEXT_PUBLIC_APP_URL'];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Expected NEXT_PUBLIC_APP_URL like https://opus-course.learnopenclaw.ai');
  process.exit(1);
}

const token = process.env.CF_API_TOKEN;
const zoneId = process.env.CF_ZONE_ID;
const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
const domain = appUrl.hostname;
const target = process.env.CF_TARGET_CNAME || process.env.RAILWAY_PUBLIC_DOMAIN;

if (!target) {
  console.error('Missing target host. Set CF_TARGET_CNAME or RAILWAY_PUBLIC_DOMAIN.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function fetchRecordByName(name) {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`;
  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare lookup failed: ${JSON.stringify(data.errors)}`);
  }

  return data.result?.[0] ?? null;
}

async function upsertCname(name, content) {
  const existing = await fetchRecordByName(name);
  const payload = {
    type: 'CNAME',
    name,
    content,
    proxied: true,
    ttl: 1,
  };

  if (existing) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`, {
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

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
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
  const result = await upsertCname(domain, target);
  console.log(`Custom domain ${result.action}: ${domain} -> ${target}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
