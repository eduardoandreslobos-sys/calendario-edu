"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, verifySessionCookie, SESSION_COOKIE } from "@/lib/firebase/admin";
import { EVENTS as STATIC_EVENTS } from "@/lib/events";
import { chileISO } from "@/lib/tz";
import { pushEvent, deleteEventFromGoogle } from "@/lib/google-calendar";

const CAT_VALUES = [
  "uai_postgrado","uai_fic","fen_santander","fen_hc","fen_basica","geforce","nodo","personal",
] as const;

const upsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  cat_id: z.enum(CAT_VALUES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_start: z.string().regex(/^\d{2}:\d{2}$/),
  time_end: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(500).default(""),
  notes: z.string().max(2000).default(""),
});

async function getUid(): Promise<string> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  const decoded = await verifySessionCookie(cookie);
  if (!decoded) throw new Error("No autenticado");
  return decoded.uid;
}

function eventsCol(uid: string) {
  return adminDb().collection("users").doc(uid).collection("events");
}

export async function upsertEvent(formData: FormData) {
  const uid = await getUid();

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    cat_id: formData.get("cat_id"),
    date: formData.get("date"),
    time_start: formData.get("time_start"),
    time_end: formData.get("time_end"),
    location: formData.get("location") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const d = parsed.data;

  const startISO = chileISO(`${d.date}T${d.time_start}:00`);
  const endISO = chileISO(`${d.date}T${d.time_end}:00`);
  const startAt = Timestamp.fromDate(new Date(startISO));
  const endAt = Timestamp.fromDate(new Date(endISO));

  if (endAt.toMillis() <= startAt.toMillis()) {
    return { ok: false as const, error: "Hora término debe ser posterior a la de inicio" };
  }

  const col = eventsCol(uid);
  const docRef = d.id ? col.doc(d.id) : col.doc();
  const existing = d.id ? (await docRef.get()).data() : null;
  const existingGoogleId: string | null = existing?.googleEventId ?? null;

  const googleEventId = await pushEvent(
    uid,
    {
      title: d.title,
      startISO,
      endISO,
      location: d.location,
      notes: d.notes,
    },
    existingGoogleId,
  );

  await docRef.set(
    {
      title: d.title,
      catId: d.cat_id,
      startAt,
      endAt,
      location: d.location,
      notes: d.notes,
      canceled: existing?.canceled ?? false,
      externalId: existing?.externalId ?? null,
      googleEventId,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );

  revalidatePath("/");
  return { ok: true as const, id: docRef.id };
}

export async function setCanceled(id: string, canceled: boolean) {
  const uid = await getUid();
  const ref = eventsCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false as const, error: "Evento no existe" };

  const data = snap.data()!;
  const googleId: string | null = data.googleEventId ?? null;

  await ref.update({ canceled, updatedAt: FieldValue.serverTimestamp() });

  // Reflect in Google Calendar: cancel = delete; uncancel = re-insert.
  if (googleId && canceled) {
    await deleteEventFromGoogle(uid, googleId);
    await ref.update({ googleEventId: null });
  } else if (!canceled) {
    const newGoogleId = await pushEvent(
      uid,
      {
        title: data.title,
        startISO: (data.startAt as Timestamp).toDate().toISOString(),
        endISO: (data.endAt as Timestamp).toDate().toISOString(),
        location: data.location ?? "",
        notes: data.notes ?? "",
      },
      null,
    );
    if (newGoogleId) await ref.update({ googleEventId: newGoogleId });
  }

  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteEvent(id: string) {
  const uid = await getUid();
  const ref = eventsCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false as const, error: "Evento no existe" };
  const googleId: string | null = snap.data()?.googleEventId ?? null;
  if (googleId) await deleteEventFromGoogle(uid, googleId);
  await ref.delete();
  revalidatePath("/");
  return { ok: true as const };
}

/**
 * Seed the user's calendar with the 63 academic events. Idempotent via externalId.
 */
export async function seedAcademicEvents() {
  const uid = await getUid();
  const col = eventsCol(uid);

  // Skip if any seeded event already exists.
  const existing = await col.where("externalId", "!=", null).limit(1).get();
  if (!existing.empty) return { ok: true as const, inserted: 0 };

  const batch = adminDb().batch();
  let count = 0;
  for (const e of STATIC_EVENTS) {
    const ref = col.doc();
    const startAt = Timestamp.fromDate(new Date(chileISO(e.start)));
    const endAt = Timestamp.fromDate(new Date(chileISO(e.end)));
    batch.set(ref, {
      title: e.title,
      catId: e.catId,
      startAt,
      endAt,
      location: e.location,
      notes: e.notes,
      canceled: false,
      externalId: e.id,
      googleEventId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    count++;
  }
  await batch.commit();
  revalidatePath("/");
  return { ok: true as const, inserted: count };
}

/**
 * Push all seeded events to Google Calendar (one-shot, useful after first login).
 */
export async function pushAllToGoogle() {
  const uid = await getUid();
  const snap = await eventsCol(uid).where("googleEventId", "==", null).get();

  let pushed = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const startISO = (d.startAt as Timestamp).toDate().toISOString();
    const endISO = (d.endAt as Timestamp).toDate().toISOString();
    const googleId = await pushEvent(
      uid,
      {
        title: d.title,
        startISO,
        endISO,
        location: d.location ?? "",
        notes: d.notes ?? "",
      },
      null,
    );
    if (googleId) {
      await doc.ref.update({ googleEventId: googleId });
      pushed++;
    }
  }
  revalidatePath("/");
  return { ok: true as const, pushed };
}
