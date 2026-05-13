import "server-only";
import { google, type calendar_v3 } from "googleapis";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const CALENDAR_ID = "primary";

interface StoredTokens {
  accessToken: string;
  refreshToken: string | null;
}

async function loadTokens(uid: string): Promise<StoredTokens | null> {
  const snap = await adminDb().collection("users").doc(uid).get();
  const data = snap.data();
  const g = data?.google;
  if (!g?.accessToken) return null;
  return { accessToken: g.accessToken, refreshToken: g.refreshToken ?? null };
}

async function persistTokens(uid: string, accessToken: string, refreshToken: string | null) {
  await adminDb()
    .collection("users")
    .doc(uid)
    .set(
      {
        google: {
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
          tokenUpdatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
}

async function getCalendarClient(uid: string): Promise<calendar_v3.Calendar | null> {
  const tokens = await loadTokens(uid);
  if (!tokens) return null;

  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? undefined,
  });
  oauth2.on("tokens", (t) => {
    if (t.access_token) {
      void persistTokens(uid, t.access_token, t.refresh_token ?? tokens.refreshToken);
    }
  });

  return google.calendar({ version: "v3", auth: oauth2 });
}

export interface CalendarEventPayload {
  title: string;
  startISO: string; // RFC3339 with offset
  endISO: string;
  location: string;
  notes: string;
}

export async function pushEvent(
  uid: string,
  payload: CalendarEventPayload,
  existingGoogleId: string | null,
): Promise<string | null> {
  try {
    const cal = await getCalendarClient(uid);
    if (!cal) return existingGoogleId;

    const body: calendar_v3.Schema$Event = {
      summary: payload.title,
      description: payload.notes,
      location: payload.location,
      start: { dateTime: payload.startISO, timeZone: "America/Santiago" },
      end: { dateTime: payload.endISO, timeZone: "America/Santiago" },
    };

    if (existingGoogleId) {
      const r = await cal.events.update({
        calendarId: CALENDAR_ID,
        eventId: existingGoogleId,
        requestBody: body,
      });
      return r.data.id ?? existingGoogleId;
    }
    const r = await cal.events.insert({ calendarId: CALENDAR_ID, requestBody: body });
    return r.data.id ?? null;
  } catch (err) {
    console.error("pushEvent:", err);
    return existingGoogleId;
  }
}

export async function setEventStatus(
  uid: string,
  googleId: string,
  canceled: boolean,
): Promise<void> {
  try {
    const cal = await getCalendarClient(uid);
    if (!cal) return;
    await cal.events.patch({
      calendarId: CALENDAR_ID,
      eventId: googleId,
      requestBody: { status: canceled ? "cancelled" : "confirmed" },
    });
  } catch (err) {
    console.error("setEventStatus:", err);
  }
}

export async function deleteEventFromGoogle(uid: string, googleId: string): Promise<void> {
  try {
    const cal = await getCalendarClient(uid);
    if (!cal) return;
    await cal.events.delete({ calendarId: CALENDAR_ID, eventId: googleId });
  } catch (err) {
    console.error("deleteEventFromGoogle:", err);
  }
}

export async function isConnected(uid: string): Promise<boolean> {
  return (await loadTokens(uid)) !== null;
}
