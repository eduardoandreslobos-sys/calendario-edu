import "server-only";
import { cookies } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, verifySessionCookie, SESSION_COOKIE } from "@/lib/firebase/admin";
import { EVENTS as STATIC_EVENTS, type CalEvent } from "@/lib/events";
import { chileISO, chileLocalFromISO } from "@/lib/tz";
import type { CatId } from "@/lib/cats";
import { FieldValue } from "firebase-admin/firestore";

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

export interface LoadedEvents {
  events: CalEvent[];
  canEdit: boolean;
  userEmail: string | null;
  googleConnected: boolean;
  configured: boolean;
}

export async function loadEvents(): Promise<LoadedEvents> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      events: STATIC_EVENTS,
      canEdit: false,
      userEmail: null,
      googleConnected: false,
      configured: false,
    };
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  const decoded = await verifySessionCookie(cookie);
  if (!decoded) {
    return {
      events: STATIC_EVENTS,
      canEdit: false,
      userEmail: null,
      googleConnected: false,
      configured: true,
    };
  }

  const userRef = adminDb().collection("users").doc(decoded.uid);
  const eventsCol = userRef.collection("events");

  const [userSnap, eventsSnap] = await Promise.all([userRef.get(), eventsCol.get()]);

  // Auto-seed on first login (no events yet).
  if (eventsSnap.empty) {
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
      });
    }
    await batch.commit();
    const reread = await eventsCol.get();
    return finalize(reread.docs, userSnap, decoded.email ?? null);
  }

  return finalize(eventsSnap.docs, userSnap, decoded.email ?? null);
}

function finalize(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  userSnap: FirebaseFirestore.DocumentSnapshot,
  email: string | null,
): LoadedEvents {
  const events: CalEvent[] = docs
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

  const googleConnected = Boolean(userSnap.data()?.google?.accessToken);

  return {
    events,
    canEdit: true,
    userEmail: email,
    googleConnected,
    configured: true,
  };
}
