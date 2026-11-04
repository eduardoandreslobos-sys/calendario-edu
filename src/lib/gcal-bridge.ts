import "server-only";
import type { CalEvent } from "@/lib/events";

// Puente con Google Calendar (Google Apps Script desplegado en la cuenta del dueño).
// GCAL_BRIDGE_URL es la URL del despliegue y GCAL_BRIDGE_SECRET el secreto compartido:
// ambos son secretos de servidor y nunca se envían al navegador ni se imprimen.
// Código del lado de Google: docs/google-apps-script/Code.gs.
const TIMEOUT_MS = 25_000;
const WINDOW_START = "2026-05-01T00:00:00";
const WINDOW_DAYS_AHEAD = 400;
const CACHE_TTL_MS = 60_000;

export function bridgeEnabled(): boolean {
  return Boolean(process.env.GCAL_BRIDGE_URL && process.env.GCAL_BRIDGE_SECRET);
}

type BridgeResult<T> = ({ ok: true } & T) | { ok: false; error: string };

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<BridgeResult<T>> {
  const url = process.env.GCAL_BRIDGE_URL;
  const secret = process.env.GCAL_BRIDGE_SECRET;
  if (!url || !secret) return { ok: false, error: "El puente con Google Calendar no está configurado" };
  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow", // Apps Script responde con una redirección
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, action, ...payload }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `Google respondió ${res.status}` };
    return (await res.json()) as BridgeResult<T>;
  } catch (err) {
    console.error("[gcal-bridge]", action, err instanceof Error ? err.name : "error");
    return { ok: false, error: "No se pudo contactar a Google Calendar" };
  }
}

interface BridgeEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  recurring: boolean;
  owned: boolean;
  private: boolean;
  transparent: boolean;
}

let cache: { at: number; events: CalEvent[] } | null = null;

export function clearBridgeCache() {
  cache = null;
}

/** Eventos del calendario de Google en vivo, o null si el puente falla (la app usa entonces el feed iCal). */
export async function listBridgeEvents(): Promise<CalEvent[] | null> {
  if (!bridgeEnabled()) return null;
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.events;

  const to = new Date(Date.now() + WINDOW_DAYS_AHEAD * 86_400_000).toISOString().slice(0, 19);
  const r = await call<{ events: BridgeEvent[] }>("list", { from: WINDOW_START, to });
  if (!r.ok) {
    console.error("[gcal-bridge] list:", r.error);
    return null;
  }

  const events: CalEvent[] = r.events
    .filter((e) => !e.transparent)
    .map((e) => {
      const allDay = e.allDay;
      return {
        id: `fen:${e.id}:${e.start}`,
        title: e.private ? "Ocupado" : e.title || "(Sin título)",
        start: allDay ? `${e.start.slice(0, 10)}T00:00:00` : e.start,
        end: allDay
          ? `${new Date(new Date(`${e.end.slice(0, 10)}T00:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10)}T23:59:00`
          : e.end,
        catId: "ext_fen" as const,
        location: e.private ? "" : e.location,
        notes: "",
        external: true,
        externalId: e.id,
        allDay,
        // Solo se pueden mover los eventos propios, únicos y con hora.
        editable: e.owned && !e.recurring && !allDay,
      };
    });
  cache = { at: Date.now(), events };
  return events;
}

export interface ExternalFields {
  title: string;
  start: string; // YYYY-MM-DDTHH:mm:ss, hora de Chile
  end: string;
  location: string;
}

export async function updateBridgeEvent(id: string, f: ExternalFields) {
  const r = await call<{ id: string }>("update", { id, ...f });
  clearBridgeCache();
  return r;
}

export async function createBridgeEvent(f: ExternalFields) {
  const r = await call<{ id: string }>("create", { ...f });
  clearBridgeCache();
  return r;
}

export async function deleteBridgeEvent(id: string) {
  const r = await call<Record<string, never>>("delete", { id });
  clearBridgeCache();
  return r;
}
