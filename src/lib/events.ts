import type { CatId } from "./cats";

export interface CalEvent {
  id: string;
  title: string;
  start: string; // ISO local "YYYY-MM-DDTHH:mm:00"
  end: string;
  catId: CatId;
  location: string;
  notes: string;
}

function ev(
  id: string,
  catId: CatId,
  title: string,
  date: string,
  start: string,
  end: string,
  location: string,
  notes: string,
): CalEvent {
  return {
    id,
    title,
    start: `${date}T${start}:00`,
    end: `${date}T${end}:00`,
    catId,
    location,
    notes,
  };
}

// 12 sesiones · L+Mi 11:30–13:30 · 11 may – 1 jul 2026
// Canceladas: 18, 20 y 27 mayo. Recuperaciones: 22, 24 jun y 1 jul.
// Festivo: lunes 29 jun (San Pedro y San Pablo).
const santanderDates = [
  "2026-05-11","2026-05-13","2026-05-25",
  "2026-06-01","2026-06-03","2026-06-08","2026-06-10","2026-06-15","2026-06-17",
  "2026-06-22","2026-06-24","2026-07-01",
];

const herramientasDates = ["2026-05-26","2026-05-28","2026-06-02","2026-06-04"];

const sistInfoDates = [
  "2026-05-07","2026-05-14","2026-05-21","2026-05-28",
  "2026-06-04","2026-06-11","2026-06-18","2026-06-25",
  "2026-07-02","2026-07-09",
];

export const EVENTS: CalEvent[] = [
  ...santanderDates.map((d, i) =>
    ev(
      `santander-${i + 1}`,
      "fen_uchile",
      "Ing. de Prompts — Banco Santander",
      d, "11:30", "13:30",
      "Online · Teams",
      `Sesión ${i + 1} de 12 · Coord. Nataly Rengifo Torres`,
    ),
  ),
  ...herramientasDates.map((d, i) =>
    ev(
      `herramientas-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "18:00", "22:00",
      "Online · Zoom",
      `Clase ${i + 1} de 4`,
    ),
  ),
  ev(
    "ia-negocios",
    "uai_postgrado",
    "IA para los Negocios",
    "2026-05-27", "08:00", "18:00",
    "Presencial · UAI Corporate",
    "Jornada completa · UAI Corporate",
  ),
  ...sistInfoDates.map((d, i) =>
    ev(
      `sistinfo-${i + 1}`,
      "uai_fic",
      "Sistemas de Información",
      d, "08:30", "11:10",
      "Presencial · UAI Peñalolén · FIC",
      `Sesión ${i + 1} de 10 · Ing. Civil 4° año`,
    ),
  ),
];

export function eventsInRange(start: Date, end: Date) {
  return EVENTS
    .map((e) => ({ ...e, _start: new Date(e.start), _end: new Date(e.end) }))
    .filter((e) => e._start >= start && e._start < end)
    .sort((a, b) => a._start.getTime() - b._start.getTime());
}

export type RangedEvent = CalEvent & { _start: Date; _end: Date };
