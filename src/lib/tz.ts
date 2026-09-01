/**
 * Chile timezone helpers. Chile (CLT/CLST) switches DST on the first Sunday
 * of April (back to UTC-4) and the first Sunday of September (forward to UTC-3).
 *
 * For 2026: 2026-04-05 → UTC-4 starts; 2026-09-06 → UTC-3 starts. Verified
 * against IANA tzdata (zoneinfo America/Santiago), not derived from a rule
 * of thumb — the previous version of this file said "first Saturday" and
 * used 04-04/09-05, both one day off from the real transition.
 * The calendar range (May–Oct 2026) crosses one DST flip.
 */

function chileOffsetFor(dateISO: string): "-04:00" | "-03:00" {
  // dateISO begins with "YYYY-MM-DD"
  const d = dateISO.slice(0, 10);
  // Winter (UTC-4): from 2026-04-05 to 2026-09-05 inclusive.
  if (d >= "2026-04-05" && d < "2026-09-06") return "-04:00";
  return "-03:00";
}

/**
 * Convert local Chile date-time ("2026-05-11T11:30:00") to a full ISO with
 * the correct Chile offset suffix.
 */
export function chileISO(localDateTime: string): string {
  return `${localDateTime}${chileOffsetFor(localDateTime)}`;
}

/**
 * Inverse: parse a tz-aware ISO and return a plain "YYYY-MM-DDTHH:mm:ss"
 * representing Chile local time. Used to populate edit forms.
 */
export function chileLocalFromISO(iso: string): string {
  const d = new Date(iso);
  const offsetMin = chileOffsetFor(iso) === "-04:00" ? -240 : -180;
  const local = new Date(d.getTime() + offsetMin * 60_000);
  return local.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
}
