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
// FEN UChile · Santander grupos adicionales — versión 3h (reemplaza Grupos A+B)
// Mismo curso Ing. de Prompts (24h c/u) en 8 sesiones de 3h.
//   · Grupo 1 · Junio · Online · Mar+Jue 14:00-17:00 (salta jue 11 jun por HC inaug)
//   · Grupo 2 · Agosto · Presencial · Lun+Mié 14:00-17:00
// ──────────────────────────────────────────────────────────────────────────
const santanderJunDates = [
  "2026-06-02","2026-06-04","2026-06-09","2026-06-16",
  "2026-06-18","2026-06-23","2026-06-25","2026-06-30",
];
const santanderAgoDates = [
  "2026-08-03","2026-08-05","2026-08-10","2026-08-12",
  "2026-08-17","2026-08-19","2026-08-24","2026-08-26",
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
// UAI FIC · Sistemas de Información (10 sesiones · Ju 08:30–11:10)
// ──────────────────────────────────────────────────────────────────────────
const sistInfoDates = [
  "2026-05-07","2026-05-14","2026-05-21","2026-05-28",
  "2026-06-04","2026-06-11","2026-06-18","2026-06-25",
  "2026-07-02","2026-07-09",
];

// ──────────────────────────────────────────────────────────────────────────
// Diplomados FEN · Control de Gestión Educacional (18 sesiones c/u)
//   S1 presencial (jornada completa 09:00–17:00)
//   S2–S17: 16 viernes en vivo
//   S18 presencial (cierre, jornada completa)
//   Salta viernes 18 sep (Fiestas Patrias).
// ──────────────────────────────────────────────────────────────────────────
const diplomaFridaysVivo = [
  "2026-06-19","2026-06-26","2026-07-03","2026-07-10","2026-07-17","2026-07-24","2026-07-31","2026-08-07",
  "2026-08-14","2026-08-21","2026-08-28","2026-09-04","2026-09-11","2026-09-25","2026-10-02","2026-10-09",
];

interface DiplomaOpts {
  catId: CatId;
  prefix: string;
  title: string;
  vivoStart: string;
  vivoEnd: string;
  s1Date: string;
  s18Date: string;
  locationPresencial: string;
  locationVivo: string;
}

function diploma(opts: DiplomaOpts): CalEvent[] {
  const out: CalEvent[] = [];
  out.push(
    ev(
      `${opts.prefix}-1`,
      opts.catId,
      opts.title,
      opts.s1Date, "09:00", "17:00",
      opts.locationPresencial,
      "Sesión 1 de 18 · Módulo 1 · Inauguración presencial",
    ),
  );
  diplomaFridaysVivo.forEach((d, i) => {
    const num = i + 2;
    const mod = num <= 9 ? 1 : 2;
    out.push(
      ev(
        `${opts.prefix}-${num}`,
        opts.catId,
        opts.title,
        d, opts.vivoStart, opts.vivoEnd,
        opts.locationVivo,
        `Sesión ${num} de 18 · Módulo ${mod}`,
      ),
    );
  });
  out.push(
    ev(
      `${opts.prefix}-18`,
      opts.catId,
      opts.title,
      opts.s18Date, "09:00", "17:00",
      opts.locationPresencial,
      "Sesión 18 de 18 · Módulo 2 · Cierre presencial",
    ),
  );
  return out;
}

const diplomaHC = diploma({
  catId: "fen_hc",
  prefix: "fen-hc",
  title: "Diplomado Control de Gestión · Educación HC",
  vivoStart: "14:00", vivoEnd: "17:00",
  s1Date: "2026-06-11",  // jueves
  s18Date: "2026-10-15", // jueves
  locationPresencial: "Presencial · SLEP (dirección por confirmar)",
  locationVivo: "En vivo · MS Teams",
});

const diplomaBasica = diploma({
  catId: "fen_basica",
  prefix: "fen-basica",
  title: "Diplomado Control de Gestión · Educación Básica",
  vivoStart: "10:00", vivoEnd: "13:00",
  s1Date: "2026-06-12",  // viernes
  s18Date: "2026-10-16", // viernes
  locationPresencial: "Presencial · SLEP (dirección por confirmar)",
  locationVivo: "En vivo · MS Teams",
});

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
  ...santanderJunDates.map((d, i) =>
    ev(
      `santander-jun-${i + 1}`,
      "fen_santander",
      "Ing. de Prompts — Santander · Grupo Junio",
      d, "14:00", "17:00",
      "Online · MS Teams",
      `Sesión ${i + 1} de 8 · Grupo Junio (online) · Coord. Raysa Castillo`,
    ),
  ),
  ...santanderAgoDates.map((d, i) =>
    ev(
      `santander-ago-${i + 1}`,
      "fen_santander",
      "Ing. de Prompts — Santander · Grupo Agosto",
      d, "14:00", "17:00",
      "Presencial · sede por confirmar (FEN o Casa Matriz)",
      `Sesión ${i + 1} de 8 · Grupo Agosto (presencial) · Coord. Raysa Castillo`,
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
  ...diplomaHC,
  ...diplomaBasica,
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
