import "server-only";
import { cookies } from "next/headers";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { adminDb, verifySessionCookie, SESSION_COOKIE } from "@/lib/firebase/admin";

export const OWNER_EMAIL = (
  process.env.OWNER_EMAIL ?? "eduardoandres.lobos@gmail.com"
).toLowerCase();

export const CALENDAR_ID = "main";

export type Role = "owner" | "editor" | "viewer";

export interface CollaboratorEntry {
  role: Exclude<Role, "owner">;
  addedAt?: FirebaseFirestore.Timestamp;
  lastSeenUid?: string | null;
}

export interface CalendarDoc {
  ownerEmail: string;
  name: string;
  collaborators: Record<string, CollaboratorEntry>;
}

export interface AccessGrant {
  uid: string;
  email: string;
  role: Role;
}

export function calendarRef(): DocumentReference {
  return adminDb().collection("calendars").doc(CALENDAR_ID);
}

/**
 * Read the calendar doc, creating it lazily the first time.
 */
export async function loadCalendar(): Promise<CalendarDoc> {
  const ref = calendarRef();
  const snap = await ref.get();
  if (snap.exists) return snap.data() as CalendarDoc;

  const seed: CalendarDoc = {
    ownerEmail: OWNER_EMAIL,
    name: "Calendario Edu",
    collaborators: {},
  };
  await ref.set(
    {
      ...seed,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return seed;
}

export function roleFor(email: string | null | undefined, cal: CalendarDoc): Role | null {
  if (!email) return null;
  const e = email.toLowerCase();
  if (cal.ownerEmail.toLowerCase() === e) return "owner";
  const c = cal.collaborators?.[e];
  return c ? c.role : null;
}

export function isWriter(role: Role | null): boolean {
  return role === "owner" || role === "editor";
}

/**
 * Read session cookie + verify + resolve role against the calendar doc.
 */
export async function getAccess(): Promise<AccessGrant | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  const decoded = await verifySessionCookie(cookie);
  if (!decoded) return null;

  const cal = await loadCalendar();
  const role = roleFor(decoded.email, cal);
  if (!role) return null;

  return {
    uid: decoded.uid,
    email: decoded.email!.toLowerCase(),
    role,
  };
}

export async function requireAccess(): Promise<AccessGrant> {
  const a = await getAccess();
  if (!a) throw new Error("No autenticado");
  return a;
}

export async function requireWriter(): Promise<AccessGrant> {
  const a = await requireAccess();
  if (!isWriter(a.role)) throw new Error("Sin permiso de edición");
  return a;
}

export async function requireOwner(): Promise<AccessGrant> {
  const a = await requireAccess();
  if (a.role !== "owner") throw new Error("Solo el dueño puede hacer esto");
  return a;
}
