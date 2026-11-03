import ICAL from "ical.js";
import { chileLocalFromISO } from "@/lib/tz";
import type { CalEvent } from "@/lib/events";

// Los eventos que este mismo calendario publica en /api/calendar.ics llevan este
// sufijo en el UID. Si el calendario externo los incluye (por ejemplo porque se
// suscribió a nuestro feed y se copiaron), se descartan para no duplicarlos.
const OWN_UID_SUFFIX = "@calendario-edu.eloboss";

const MAX_OCCURRENCES_PER_EVENT = 600;

function isoOf(t: ICAL.Time): string {
  return chileLocalFromISO(t.toJSDate().toISOString());
}

/**
 * Convierte un archivo .ics (el feed secreto de Google Calendar u otro) en eventos
 * del calendario, expandiendo las recurrencias dentro de [from, to). Solo lectura.
 *
 * Se omiten: cancelados, "disponible" (TRANSP:TRANSPARENT) y los de otro origen
 * que ya son nuestros. Los eventos privados se muestran como "Ocupado".
 */
export function parseIcsEvents(text: string, from: Date, to: Date, idPrefix = "ext"): CalEvent[] {
  const root = new ICAL.Component(ICAL.parse(text));

  for (const vtz of root.getAllSubcomponents("vtimezone")) {
    const tz = new ICAL.Timezone(vtz);
    if (!ICAL.TimezoneService.has(tz.tzid)) ICAL.TimezoneService.register(tz);
  }

  const mains = new Map<string, ICAL.Event>();
  const exceptions: ICAL.Event[] = [];
  for (const vevent of root.getAllSubcomponents("vevent")) {
    const ev = new ICAL.Event(vevent);
    if (ev.uid?.endsWith(OWN_UID_SUFFIX)) continue;
    if (vevent.hasProperty("recurrence-id")) exceptions.push(ev);
    else mains.set(ev.uid, ev);
  }
  for (const ex of exceptions) mains.get(ex.uid)?.relateException(ex);

  const out: CalEvent[] = [];
  const fromT = ICAL.Time.fromJSDate(from, true);
  const toMs = to.getTime();

  const push = (uid: string, ev: ICAL.Event, start: ICAL.Time, end: ICAL.Time) => {
    const status = String(ev.component.getFirstPropertyValue("status") ?? "").toUpperCase();
    const transp = String(ev.component.getFirstPropertyValue("transp") ?? "").toUpperCase();
    if (status === "CANCELLED" || transp === "TRANSPARENT") return;

    const allDay = start.isDate;
    const startJs = start.toJSDate();
    const endJs = end.toJSDate();
    if (endJs.getTime() <= from.getTime() || startJs.getTime() >= toMs) return;

    const klass = String(ev.component.getFirstPropertyValue("class") ?? "").toUpperCase();
    const isPrivate = klass === "PRIVATE" || klass === "CONFIDENTIAL";

    // Un evento de día completo (viaje, feriado, licencia) queda de 00:00 a 23:59.
    const startIso = allDay ? `${start.toString().slice(0, 10)}T00:00:00` : isoOf(start);
    const endIso = allDay
      ? `${new Date(endJs.getTime() - 86_400_000).toISOString().slice(0, 10)}T23:59:00`
      : isoOf(end);

    out.push({
      id: `${idPrefix}:${uid}:${startIso}`,
      title: isPrivate ? "Ocupado" : ev.summary || "(Sin título)",
      start: startIso,
      end: endIso,
      catId: "ext_fen",
      location: isPrivate ? "" : ev.location ?? "",
      notes: "",
      external: true,
      allDay,
    });
  };

  for (const ev of mains.values()) {
    if (!ev.isRecurring()) {
      push(ev.uid, ev, ev.startDate, ev.endDate);
      continue;
    }
    const it = ev.iterator();
    let next: ICAL.Time | null;
    let n = 0;
    while ((next = it.next()) && n++ < MAX_OCCURRENCES_PER_EVENT) {
      if (next.toJSDate().getTime() >= toMs) break;
      const occ = ev.getOccurrenceDetails(next);
      if (occ.endDate.compare(fromT) < 0) continue;
      push(ev.uid, occ.item, occ.startDate, occ.endDate);
    }
  }

  return out.sort((a, b) => a.start.localeCompare(b.start));
}

/** Marca como `conflict` los eventos (de cualquier origen) que se pisan con otro de distinto origen. */
export function markConflicts(events: CalEvent[]): CalEvent[] {
  const own = events.filter((e) => !e.external && !e.canceled);
  const ext = events.filter((e) => e.external && !e.allDay);
  const hit = new Set<string>();
  for (const x of ext) {
    for (const o of own) {
      if (o.start < x.end && x.start < o.end) {
        hit.add(x.id);
        hit.add(o.id);
      }
    }
  }
  return events.map((e) => (hit.has(e.id) ? { ...e, conflict: true } : e));
}
