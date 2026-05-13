/**
 * Server-side allowlist of emails authorized to use this calendar.
 * Override via env var ALLOWED_EMAILS (comma-separated).
 */
const DEFAULT = "eduardoandres.lobos@gmail.com";

export const ALLOWED_EMAILS: ReadonlySet<string> = new Set(
  (process.env.ALLOWED_EMAILS ?? DEFAULT)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.has(email.toLowerCase());
}
