import type { CatId } from "./cats";

export interface CalEvent {
  id: string;
  title: string;
  start: string; // ISO local "YYYY-MM-DDTHH:mm:00"
  end: string;
  catId: CatId;
  location: string;
  notes: string;
  canceled?: boolean;
  externalId?: string | null;
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

// ──────────────────────────────────────────────────────────────────────────
// FEN UChile · Santander (12 sesiones · L+Mi 11:30–13:30 · 11 may – 1 jul 2026)
// Canceladas: 18, 20 y 27 mayo. Recuperaciones: 22, 24 jun y 1 jul.
// Festivo: lunes 29 jun (San Pedro y San Pablo).
// ──────────────────────────────────────────────────────────────────────────
const santanderDates = [
  "2026-05-11","2026-05-13","2026-05-25",
  "2026-06-01","2026-06-03","2026-06-08","2026-06-10","2026-06-15","2026-06-17",
  "2026-06-22","2026-06-24","2026-07-01",
];

// ──────────────────────────────────────────────────────────────────────────
// FEN UChile · Santander · 2 cursos paralelos Ing. de Prompts (24h c/u)
// Calendarios oficiales de Raysa (Calendario 2 ONLINE + Calendario 3 PRESENCIAL).
// 12 sesiones × 2h cada uno · Lun+Mié · 3 ago – 9 sep 2026.
//   · ONLINE     · 09:00–11:00 · MS Teams
//   · PRESENCIAL · 11:30–13:30 · dependencias Banco Santander
// ──────────────────────────────────────────────────────────────────────────
const santanderAgoDates = [
  "2026-08-03","2026-08-05","2026-08-10","2026-08-12",
  "2026-08-17","2026-08-19","2026-08-24","2026-08-26",
  "2026-08-31","2026-09-02","2026-09-07","2026-09-09",
];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Herramientas IA Productividad (4 sesiones · Ma+Ju 18:00–22:00)
// ──────────────────────────────────────────────────────────────────────────
const herramientasDates = ["2026-05-26","2026-05-28","2026-06-02","2026-06-04"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Herramientas IA Productividad — 2da edición (4 sesiones · Ma+Ju 17:00–21:00)
// Coordinadora: Antares Luque Vergara (Educación Ejecutiva).
// ──────────────────────────────────────────────────────────────────────────
const herramientasJunDates = ["2026-06-23","2026-06-25","2026-06-30","2026-07-02"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Claude Code & Design (4 sesiones · Ma+Ju 18:00–22:00 · 16h online)
// Coordinadora: Antares Luque Vergara (Educación Ejecutiva).
// ──────────────────────────────────────────────────────────────────────────
const claudeCodeDates = ["2026-08-04","2026-08-06","2026-08-11","2026-08-13"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Herramientas IA Productividad — 3ra edición (4 sesiones · Ma+Ju 18:00–22:00)
// ──────────────────────────────────────────────────────────────────────────
const herramientasAgoDates = ["2026-08-18","2026-08-20","2026-08-25","2026-08-27"];

// ──────────────────────────────────────────────────────────────────────────
// UAI FIC · Sistemas de Información (10 sesiones · Ju 08:30–11:10)
// ──────────────────────────────────────────────────────────────────────────
const sistInfoDates = [
  "2026-05-07","2026-05-14","2026-05-21","2026-05-28",
  "2026-06-04","2026-06-11","2026-06-18","2026-06-25",
  "2026-07-02","2026-07-09",
];

// ──────────────────────────────────────────────────────────────────────────
// All events
// ──────────────────────────────────────────────────────────────────────────
export const EVENTS: CalEvent[] = [
  ...santanderDates.map((d, i) =>
    ev(
      `santander-${i + 1}`,
      "fen_santander",
      "Ing. de Prompts — Banco Santander",
      d, "11:30", "13:30",
      "En vivo · MS Teams",
      `Sesión ${i + 1} de 12 · Coord. Nataly Rengifo Torres`,
    ),
  ),
  ...santanderAgoDates.map((d, i) =>
    ev(
      `santander-online-${i + 1}`,
      "fen_santander",
      "Ing. de Prompts — Santander · Online",
      d, "09:00", "11:00",
      "En vivo · MS Teams (desde sala habilitada en Banco Santander)",
      `Sesión ${i + 1} de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo`,
    ),
  ),
  ...santanderAgoDates.map((d, i) =>
    ev(
      `santander-presencial-${i + 1}`,
      "fen_santander",
      "Ing. de Prompts — Santander · Presencial",
      d, "11:30", "13:30",
      "Presencial · dependencias Banco Santander (dirección por definir)",
      `Sesión ${i + 1} de 12 · Grupo Presencial · Coord. Raysa Castillo`,
    ),
  ),
  ...herramientasDates.map((d, i) =>
    ev(
      `herramientas-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4`,
    ),
  ),
  ...herramientasJunDates.map((d, i) =>
    ev(
      `herramientas-jun-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "17:00", "21:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · 2da edición · Coord. Antares Luque Vergara`,
    ),
  ),
  ...claudeCodeDates.map((d, i) =>
    ev(
      `claude-code-design-${i + 1}`,
      "uai_postgrado",
      "Claude Code & Design",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · Coord. Antares Luque Vergara`,
    ),
  ),
  ...herramientasAgoDates.map((d, i) =>
    ev(
      `herramientas-ago-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · UAI Postgrado`,
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
  ev(
    "latam-discovery-may26",
    "personal",
    "Reunión LATAM · Giselle Perey",
    "2026-05-26", "17:00", "18:00",
    "Online · por confirmar",
    "Discovery training IA · VP Personas LATAM · OJO cortar 17:55 sí o sí para alcanzar Herramientas IA UAI 18:00",
  ),
  ev(
    "cine-diablo-jun3",
    "personal",
    "Cine con Cata · El Diablo Viste a la Moda 2",
    "2026-06-03", "20:30", "22:30",
    "Cinemark Alto Las Condes · Sala 1 Premier · Butacas G-10, G-11 · Av. Kennedy 9001, Local 3092",
    "Código retiro: WJQTJWW · Pre NT SUB · pagado con tarjeta ($12.800)",
  ),
  // Muni La Florida · Herramientas IA Productividad · L+Mi 15:00–18:15 · 16h · remoto Zoom
  // Salta lun 29 jun (festivo San Pedro y San Pablo). Última sesión cierra 18:00.
  ...[
    { date: "2026-06-15", end: "18:15" },
    { date: "2026-06-17", end: "18:15" },
    { date: "2026-06-22", end: "18:15" },
    { date: "2026-06-24", end: "18:15" },
    { date: "2026-07-01", end: "18:00" },
  ].map((s, i) =>
    ev(
      `florida-${i + 1}`,
      "muni_florida",
      "Herramientas IA — Muni La Florida",
      s.date, "15:00", s.end,
      "En vivo · Zoom",
      `Sesión ${i + 1} de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo`,
    ),
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

export function calcTotals(events: CalEvent[]) {
  const active = events.filter((e) => !e.canceled);
  const hours = active.reduce((acc, e) => {
    const s = new Date(e.start).getTime();
    const t = new Date(e.end).getTime();
    return acc + Math.max(0, (t - s) / 3600000);
  }, 0);
  return {
    sessions: active.length,
    hours,
    courses: new Set(active.map((e) => e.title)).size,
  };
}

// Pre-computed totals from the static seed (used by layout metadata).
export const STATIC_TOTALS = calcTotals(EVENTS);

export function eventsInRange(events: CalEvent[], start: Date, end: Date) {
  return events
    .map((e) => ({ ...e, _start: new Date(e.start), _end: new Date(e.end) }))
    .filter((e) => e._start >= start && e._start < end)
    .sort((a, b) => a._start.getTime() - b._start.getTime());
}

export type RangedEvent = CalEvent & { _start: Date; _end: Date };
