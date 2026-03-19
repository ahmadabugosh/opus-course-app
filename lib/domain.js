export function normalizeHost(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    return new URL(candidate).hostname || null;
  } catch {
    return null;
  }
}

export function inferZoneNameFromHostname(hostname) {
  const normalized = normalizeHost(hostname);
  if (!normalized) return null;

  const parts = normalized.split('.').filter(Boolean);
  if (parts.length < 2) return null;

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}

export function parseRailwayTargetFromJson(raw) {
  if (!raw || typeof raw !== 'string') return null;

  try {
    const parsed = JSON.parse(raw);

    const extractCandidates = (entry) =>
      [
        normalizeHost(entry),
        normalizeHost(entry?.domain),
        normalizeHost(entry?.hostname),
        normalizeHost(entry?.target),
        normalizeHost(entry?.serviceDomain),
      ].filter(Boolean);

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
