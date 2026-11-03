import "server-only";
import { parseIcsEvents } from "@/lib/ics-parse";
import type { CalEvent } from "@/lib/events";

// Calendario externo de solo lectura (hoy: eloboss@fen.uchile.cl en Google Calendar).
// EXTERNAL_ICS_FEN = "Dirección secreta en formato iCal" del calendario. Es un secreto:
// vive solo en el entorno del servidor y nunca se imprime ni se envía al navegador.
const WINDOW_START = new Date("2026-05-01T00:00:00Z");
const WINDOW_DAYS_AHEAD = 400;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 8 * 1024 * 1024;

export async function loadExternalEvents(): Promise<CalEvent[]> {
  const url = process.env.EXTERNAL_ICS_FEN;
  if (!url) return [];
  if (!url.startsWith("https://")) {
    console.error("[external-calendars] EXTERNAL_ICS_FEN debe ser https");
    return [];
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "text/calendar" },
    });
    if (!res.ok) {
      console.error(`[external-calendars] el calendario respondió ${res.status}`);
      return [];
    }
    const text = await res.text();
    if (text.length > MAX_BYTES) {
      console.error("[external-calendars] el calendario es demasiado grande");
      return [];
    }
    const to = new Date(Date.now() + WINDOW_DAYS_AHEAD * 86_400_000);
    return parseIcsEvents(text, WINDOW_START, to, "fen");
  } catch (err) {
    console.error("[external-calendars] no se pudo leer el calendario:", err instanceof Error ? err.name : "error");
    return [];
  }
}
