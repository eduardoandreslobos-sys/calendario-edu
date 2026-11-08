import "server-only";
import { parseIcsEvents } from "@/lib/ics-parse";
import type { CalEvent } from "@/lib/events";
import type { CatId } from "@/lib/cats";
import { listBridgeEvents } from "@/lib/gcal-bridge";

// Calendarios externos de solo lectura:
//  - FEN (Google Calendar, eloboss@fen.uchile.cl): EXTERNAL_ICS_FEN o el puente de Apps Script.
//  - UAI (Microsoft 365 / Outlook): EXTERNAL_ICS_UAI = enlace ICS del calendario publicado.
// Las direcciones son secretos: viven solo en el entorno del servidor y nunca se imprimen ni van al navegador.
const WINDOW_START = new Date("2026-05-01T00:00:00Z");
const WINDOW_DAYS_AHEAD = 400;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 8 * 1024 * 1024;

/** Lee un calendario iCal publicado (solo lectura). La dirección es un secreto: nunca se imprime. */
async function loadIcs(envName: string, idPrefix: string, catId: CatId): Promise<CalEvent[]> {
  const url = process.env[envName];
  if (!url) return [];
  if (!url.startsWith("https://")) {
    console.error(`[external-calendars] ${envName} debe ser https`);
    return [];
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "text/calendar" },
    });
    if (!res.ok) {
      console.error(`[external-calendars] ${envName}: el calendario respondió ${res.status}`);
      return [];
    }
    const text = await res.text();
    if (text.length > MAX_BYTES) {
      console.error(`[external-calendars] ${envName}: el calendario es demasiado grande`);
      return [];
    }
    const to = new Date(Date.now() + WINDOW_DAYS_AHEAD * 86_400_000);
    return parseIcsEvents(text, WINDOW_START, to, idPrefix, catId);
  } catch (err) {
    console.error(`[external-calendars] ${envName}: no se pudo leer:`, err instanceof Error ? err.name : "error");
    return [];
  }
}

export async function loadExternalEvents(): Promise<CalEvent[]> {
  // FEN (Google): con el puente configurado se lee en vivo (y se puede editar); si falla, el feed iCal.
  const fen = async () => (await listBridgeEvents()) ?? (await loadIcs("EXTERNAL_ICS_FEN", "fen", "ext_fen"));
  // UAI (Microsoft 365 / Outlook): feed iCal publicado, solo lectura.
  const uai = () => loadIcs("EXTERNAL_ICS_UAI", "uai", "ext_uai");
  const [a, b] = await Promise.all([fen(), uai()]);
  return [...a, ...b];
}
