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

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        const candidate = extractCandidate(entry);
        if (candidate) return candidate;
      }
      return null;
    }

    const direct = extractCandidate(parsed);
    if (direct) return direct;

    if (Array.isArray(parsed?.domains)) {
      for (const entry of parsed.domains) {
        const candidate = extractCandidate(entry);
        if (candidate) return candidate;
      }
    }

    return null;
  } catch {
    return null;
  }
}
