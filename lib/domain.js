function normalizeHost(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return new URL(trimmed).hostname || null;
    }
  } catch {
    return null;
  }

  return trimmed.replace(/\/$/, '');
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

    const extractCandidate = (entry) =>
      normalizeHost(entry) ||
      normalizeHost(entry?.domain) ||
      normalizeHost(entry?.hostname) ||
      normalizeHost(entry?.target) ||
      normalizeHost(entry?.serviceDomain);

    const visited = new Set();

    const walk = (node) => {
      const direct = extractCandidate(node);
      if (direct) return direct;

      if (!node || typeof node !== 'object') return null;
      if (visited.has(node)) return null;
      visited.add(node);

      if (Array.isArray(node)) {
        for (const entry of node) {
          const candidate = walk(entry);
          if (candidate) return candidate;
        }
        return null;
      }

      for (const value of Object.values(node)) {
        const candidate = walk(value);
        if (candidate) return candidate;
      }

      return null;
    };

    return walk(parsed);
  } catch {
    return null;
  }
}
