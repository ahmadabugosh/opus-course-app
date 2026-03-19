import { isIP } from 'node:net';

export function normalizeHost(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const hostname = new URL(candidate).hostname || '';
    const normalized = hostname.toLowerCase().replace(/\.+$/, '');
    return normalized || null;
  } catch {
    return null;
  }
}

const SECOND_LEVEL_PUBLIC_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'gov.uk',
  'ac.uk',
  'net.uk',
  'sch.uk',
  'co.jp',
  'com.au',
  'net.au',
  'org.au',
  'edu.au',
  'gov.au',
  'co.nz',
  'co.in',
  'com.sg',
  'co.za',
  'org.za',
  'co.il',
  'com.tr',
  'co.id',
  'com.my',
  'com.br',
  'com.mx',
  'com.ar',
  'co.th',
  'com.hk',
  'com.ph',
  'co.kr',
  'or.kr',
]);

export function inferZoneNameFromHostname(hostname) {
  const normalized = normalizeHost(hostname);
  if (!normalized) return null;

  const parts = normalized.split('.').filter(Boolean);
  if (parts.length < 2) return null;

  const tail = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;

  if (SECOND_LEVEL_PUBLIC_SUFFIXES.has(tail)) {
    if (parts.length < 3) return null;
    return `${parts[parts.length - 3]}.${tail}`;
  }

  return tail;
}

export function expandRecordName(recordName, zoneName) {
  if (!recordName || typeof recordName !== 'string') return null;

  const zone = normalizeHost(zoneName);
  const trimmed = recordName.trim().replace(/\.$/, '');

  if (!trimmed) return null;

  if (trimmed === '@') {
    return zone;
  }

  const normalized = normalizeHost(trimmed);
  if (normalized && (trimmed.includes('.') || !zone)) return normalized;

  if (!zone) return normalized || trimmed;
  if (trimmed.endsWith(`.${zone}`) || trimmed === zone) return trimmed;

  return `${trimmed}.${zone}`;
}

export function isSelfReferentialCname(recordName, target) {
  const recordHost = normalizeHost(recordName);
  const targetHost = normalizeHost(target);

  if (!recordHost || !targetHost) return false;

  return recordHost.toLowerCase() === targetHost.toLowerCase();
}

export function resolveCnameTarget(value) {
  const host = normalizeHost(value);
  if (!host) return null;
  if (isIP(host) !== 0) return null;
  return host;
}

export function isEquivalentCnameRecord(record, { name, content, proxied } = {}) {
  if (!record || record.type !== 'CNAME') return false;

  const recordName = normalizeHost(record.name);
  const recordTarget = normalizeHost(record.content);
  const desiredName = normalizeHost(name);
  const desiredTarget = normalizeHost(content);

  if (!recordName || !recordTarget || !desiredName || !desiredTarget) {
    return false;
  }

  const proxiedStateMatches = Boolean(record.proxied) === Boolean(proxied);

  return recordName === desiredName && recordTarget === desiredTarget && proxiedStateMatches;
}

export function buildCloudflareHeaders({ token, apiKey, apiEmail } = {}) {
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  if (apiKey && apiEmail) {
    return {
      'X-Auth-Key': apiKey,
      'X-Auth-Email': apiEmail,
      'Content-Type': 'application/json',
    };
  }

  return null;
}

export function parseRailwayTargetFromJson(raw) {
  if (!raw || typeof raw !== 'string') return null;

  try {
    const parsed = JSON.parse(raw);

    const keepHostnameCandidate = (candidate) => {
      if (!candidate) return false;
      return isIP(candidate) === 0;
    };

    const extractCandidates = (entry) =>
      [
        normalizeHost(entry),
        normalizeHost(entry?.domain),
        normalizeHost(entry?.hostname),
        normalizeHost(entry?.target),
        normalizeHost(entry?.serviceDomain),
        normalizeHost(entry?.publicDomain),
        normalizeHost(entry?.cnameTarget),
        normalizeHost(entry?.dns_name),
      ].filter(keepHostnameCandidate);

    const visited = new Set();
    const candidates = [];

    const walk = (node) => {
      candidates.push(...extractCandidates(node));

      if (!node || typeof node !== 'object') return;
      if (visited.has(node)) return;
      visited.add(node);

      if (Array.isArray(node)) {
        for (const entry of node) {
          walk(entry);
        }
        return;
      }

      for (const value of Object.values(node)) {
        walk(value);
      }
    };

    walk(parsed);

    const unique = [...new Set(candidates)];
    const railwayHost = unique.find((candidate) => candidate.includes('railway.app'));

    return railwayHost || unique[0] || null;
  } catch {
    return null;
  }
}
