// Validation helpers for hackathon events. Shared by client and server.

/** Accepts only well-formed http/https URLs. */
export function isValidEventLink(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize a date input to ISO 'YYYY-MM-DD', or null if it can't be parsed.
 * A plain 'YYYY-MM-DD' is returned untouched to avoid timezone drift.
 */
export function normalizeEventDate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export type DateRangeResolution =
  | { ok: true; eventDate: string; endDate: string | null }
  | { ok: false; error: string };

/**
 * Resolve a start/end date pair. The start is required; the end is optional
 * (single-day events). When both are present, the end must not precede the start.
 */
export function resolveDateRange(startInput: string, endInput: string): DateRangeResolution {
  const eventDate = normalizeEventDate(startInput);
  if (!eventDate) return { ok: false, error: 'A valid event start date is required.' };

  if (!endInput.trim()) return { ok: true, eventDate, endDate: null };

  const endDate = normalizeEventDate(endInput);
  if (!endDate) return { ok: false, error: 'The end date is invalid.' };
  if (endDate < eventDate) {
    return { ok: false, error: 'The end date cannot be before the start date.' };
  }
  // A single-day range collapses to just the start.
  return { ok: true, eventDate, endDate: endDate === eventDate ? null : endDate };
}

export type LocationResolution =
  | { ok: true; location: string | null }
  | { ok: false; error: string };

/**
 * Enforce online/location coherence: online events carry no location;
 * in-person events require a non-empty one.
 */
export function resolveLocation(isOnline: boolean, location: string): LocationResolution {
  if (isOnline) return { ok: true, location: null };
  const trimmed = location.trim();
  if (!trimmed) return { ok: false, error: 'Location is required for in-person events.' };
  return { ok: true, location: trimmed };
}
