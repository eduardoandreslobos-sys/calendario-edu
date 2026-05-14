import "server-only";
import { loadCalendar, OWNER_EMAIL } from "@/lib/calendar-access";

/**
 * Allowed emails are now sourced from Firestore (calendars/main): the owner
 * plus all collaborators. Server-only — never reach the client.
 */
export async function isAllowed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const e = email.toLowerCase();
  if (e === OWNER_EMAIL) return true;
  try {
    const cal = await loadCalendar();
    if (cal.ownerEmail.toLowerCase() === e) return true;
    return Boolean(cal.collaborators?.[e]);
  } catch (err) {
    // If Firestore is unreachable, only the owner gets in.
    console.error("isAllowed:", err);
    return false;
  }
}
