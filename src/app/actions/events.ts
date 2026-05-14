"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { chileISO } from "@/lib/tz";
import { pushEvent, deleteEventFromGoogle } from "@/lib/google-calendar";
import { calendarRef, requireAccess, requireWriter } from "@/lib/calendar-access";

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

function eventsCol() {
  return calendarRef().collection("events");
}

export async function upsertEvent(formData: FormData) {
  const access = await requireWriter();

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

  const col = eventsCol();
  const docRef = d.id ? col.doc(d.id) : col.doc();
  const existing = d.id ? (await docRef.get()).data() : null;
  const existingGoogleId: string | null = existing?.googleEventId ?? null;

  // Google Calendar sync against the owner's account (only owner has Google tokens stored).
  const ownerAccess = await getOwnerAccessForSync();
  const googleEventId = ownerAccess
    ? await pushEvent(
        ownerAccess.uid,
        { title: d.title, startISO, endISO, location: d.location, notes: d.notes },
        existingGoogleId,
      )
    : existingGoogleId;

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
      ...(existing ? { lastEditedBy: access.uid } : { createdAt: FieldValue.serverTimestamp(), createdBy: access.uid }),
    },
    { merge: true },
  );

  revalidatePath("/");
  return { ok: true as const, id: docRef.id };
}

export async function setCanceled(id: string, canceled: boolean) {
  await requireWriter();
  const ref = eventsCol().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false as const, error: "Evento no existe" };

  const data = snap.data()!;
  const googleId: string | null = data.googleEventId ?? null;

  await ref.update({ canceled, updatedAt: FieldValue.serverTimestamp() });

  const ownerAccess = await getOwnerAccessForSync();
  if (ownerAccess && googleId && canceled) {
    await deleteEventFromGoogle(ownerAccess.uid, googleId);
    await ref.update({ googleEventId: null });
  } else if (ownerAccess && !canceled) {
    const newGoogleId = await pushEvent(
      ownerAccess.uid,
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
  await requireWriter();
  const ref = eventsCol().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false as const, error: "Evento no existe" };
  const googleId: string | null = snap.data()?.googleEventId ?? null;
  const ownerAccess = await getOwnerAccessForSync();
  if (ownerAccess && googleId) await deleteEventFromGoogle(ownerAccess.uid, googleId);
  await ref.delete();
  revalidatePath("/");
  return { ok: true as const };
}

export async function pushAllToGoogle() {
  await requireAccess();
  const ownerAccess = await getOwnerAccessForSync();
  if (!ownerAccess) return { ok: true as const, pushed: 0 };

  const snap = await eventsCol().where("googleEventId", "==", null).get();
  let pushed = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const startISO = (d.startAt as Timestamp).toDate().toISOString();
    const endISO = (d.endAt as Timestamp).toDate().toISOString();
    const googleId = await pushEvent(
      ownerAccess.uid,
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

/**
 * Find the owner's uid (whoever owns the calendar by email) to use their
 * stored Google tokens for sync. Returns null if no Google connection.
 */
async function getOwnerAccessForSync(): Promise<{ uid: string } | null> {
  try {
    const calSnap = await calendarRef().get();
    const ownerEmail = (calSnap.data()?.ownerEmail ?? "").toLowerCase();
    if (!ownerEmail) return null;
    // Find the user doc with matching email.
    const usersSnap = await adminDb()
      .collection("users")
      .where("profile.email", "==", ownerEmail)
      .limit(1)
      .get();
    const userDoc = usersSnap.docs[0];
    if (!userDoc) return null;
    const hasTokens = userDoc.data()?.google?.accessToken;
    if (!hasTokens) return null;
    return { uid: userDoc.id };
  } catch (err) {
    console.error("getOwnerAccessForSync:", err);
    return null;
  }
}
