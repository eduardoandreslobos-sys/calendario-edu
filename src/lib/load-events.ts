import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { EVENTS as STATIC_EVENTS, type CalEvent } from "@/lib/events";
import { chileISO, chileLocalFromISO } from "@/lib/tz";
import type { CatId } from "@/lib/cats";
import {
  calendarRef,
  getAccess,
  loadCalendar,
  type AccessGrant,
  type Role,
} from "@/lib/calendar-access";

interface DbEvent {
  title: string;
  catId: CatId;
  startAt: Timestamp;
  endAt: Timestamp;
  location: string;
  notes: string;
  canceled: boolean;
  externalId: string | null;
  googleEventId: string | null;
}

export interface CollaboratorSummary {
  email: string;
  role: Exclude<Role, "owner">;
}

export interface LoadedEvents {
  events: CalEvent[];
  role: Role | null;
  userEmail: string | null;
  ownerEmail: string;
  collaborators: CollaboratorSummary[];
  googleConnected: boolean;
  configured: boolean;
}

export async function loadEvents(): Promise<LoadedEvents> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      events: STATIC_EVENTS,
      role: null,
      userEmail: null,
      ownerEmail: "",
      collaborators: [],
      googleConnected: false,
      configured: false,
    };
  }

  const access = await getAccess();
  if (!access) {
    return {
      events: STATIC_EVENTS,
      role: null,
      userEmail: null,
      ownerEmail: "",
      collaborators: [],
      googleConnected: false,
      configured: true,
    };
  }

  return await loadForUser(access);
}

async function loadForUser(access: AccessGrant): Promise<LoadedEvents> {
  const cal = await loadCalendar();
  const eventsCol = calendarRef().collection("events");
  let snap = await eventsCol.get();

  // Seed on first owner load.
  if (snap.empty && access.role === "owner") {
    const batch = adminDb().batch();
    for (const e of STATIC_EVENTS) {
      const ref = eventsCol.doc();
      batch.set(ref, {
        title: e.title,
        catId: e.catId,
        startAt: Timestamp.fromDate(new Date(chileISO(e.start))),
        endAt: Timestamp.fromDate(new Date(chileISO(e.end))),
        location: e.location,
        notes: e.notes,
        canceled: false,
        externalId: e.id,
        googleEventId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: access.uid,
      });
    }
    await batch.commit();
    snap = await eventsCol.get();
  }

  const events: CalEvent[] = snap.docs
    .map((d) => {
      const r = d.data() as DbEvent;
      return {
        id: d.id,
        title: r.title,
        start: chileLocalFromISO(r.startAt.toDate().toISOString()),
        end: chileLocalFromISO(r.endAt.toDate().toISOString()),
        catId: r.catId,
        location: r.location ?? "",
        notes: r.notes ?? "",
        canceled: r.canceled ?? false,
        externalId: r.externalId,
      } satisfies CalEvent;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  const collaborators: CollaboratorSummary[] = Object.entries(cal.collaborators ?? {})
    .map(([email, v]) => ({ email, role: v.role }))
    .sort((a, b) => a.email.localeCompare(b.email));

  // Read Google tokens from owner's user doc (per-user, not per-calendar).
  let googleConnected = false;
  try {
    const userSnap = await adminDb().collection("users").doc(access.uid).get();
    googleConnected = Boolean(userSnap.data()?.google?.accessToken);
  } catch {}

  return {
    events,
    role: access.role,
    userEmail: access.email,
    ownerEmail: cal.ownerEmail,
    collaborators,
    googleConnected,
    configured: true,
  };
}
