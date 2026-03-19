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

    const direct =
      normalizeHost(parsed?.target) ||
      normalizeHost(parsed?.domain) ||
      normalizeHost(parsed?.hostname);

    if (direct) return direct;

    if (Array.isArray(parsed?.domains)) {
      return normalizeHost(parsed.domains[0]);
    }

    return null;
  } catch {
    return null;
  }
}
