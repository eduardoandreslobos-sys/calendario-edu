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
// UAI Postgrado · Herramientas IA Productividad — edición septiembre
// 4 sesiones · Ma+Ju 18:00–22:00.
// ──────────────────────────────────────────────────────────────────────────
const herramientasSepDates = ["2026-09-01","2026-09-03","2026-09-08","2026-09-10"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Claude Code & Design — 2da edición (Lun+Mié agosto/sep)
// 4 sesiones · 18:00–22:00. Coord. Antares Luque Vergara.
// ──────────────────────────────────────────────────────────────────────────
const claudeV3Dates = ["2026-08-31","2026-09-02","2026-09-07","2026-09-09"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Claude Code & Design — 3ra edición (segunda mitad octubre)
// 4 sesiones · Ma+Ju 18:00–22:00. Coord. Antares Luque Vergara.
// Desplazada 1 semana por viaje 24 sep – 9 oct.
// ──────────────────────────────────────────────────────────────────────────
const claudeOctDates = ["2026-10-13","2026-10-15","2026-10-20","2026-10-22"];

// ──────────────────────────────────────────────────────────────────────────
// UAI Postgrado · Herramientas IA Productividad — edición noviembre
// 4 sesiones · Ma+Ju 18:00–22:00 (arranca fines de octubre).
// ──────────────────────────────────────────────────────────────────────────
const herramientasNovDates = ["2026-10-27","2026-10-29","2026-11-03","2026-11-05"];

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
  ...herramientasSepDates.map((d, i) =>
    ev(
      `herramientas-sep-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · edición sep · UAI Postgrado`,
    ),
  ),
  ...claudeV3Dates.map((d, i) =>
    ev(
      `claude-v3-${i + 1}`,
      "uai_postgrado",
      "Claude Code & Design",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · 2da edición · Coord. Antares Luque Vergara`,
    ),
  ),
  ...claudeOctDates.map((d, i) =>
    ev(
      `claude-oct-${i + 1}`,
      "uai_postgrado",
      "Claude Code & Design",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · 3ra edición · Coord. Antares Luque Vergara`,
    ),
  ),
  ...herramientasNovDates.map((d, i) =>
    ev(
      `herramientas-nov-${i + 1}`,
      "uai_postgrado",
      "Herramientas IA para la Productividad Profesional",
      d, "18:00", "22:00",
      "En vivo · Zoom",
      `Clase ${i + 1} de 4 · edición nov · UAI Postgrado`,
    ),
  ),
  // ──────────────────────────────────────────────────────────────────────────
  // UAI Capacitación (Personas Viña · Gloria Arellano) — 7 bloques
  // Marketing (Teams · 9 pax): 07-08, 14-08 09:00–13:00 · 21-08 partido 09-11 + 14-16
  // Comercial (Presencial Vitacura · 23 pax): 28-08, 04-09, 11-09 09:00–13:00
  // ──────────────────────────────────────────────────────────────────────────
  ev("uai-cap-marketing-1",  "uai_capacitacion", "UAI Capacitación · Área Marketing", "2026-08-07", "09:00", "13:00", "Online · Teams",             "Clase 1 de 3 · 9 personas · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-marketing-2",  "uai_capacitacion", "UAI Capacitación · Área Marketing", "2026-08-14", "09:00", "13:00", "Online · Teams",             "Clase 2 de 3 · 9 personas · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-marketing-3a", "uai_capacitacion", "UAI Capacitación · Área Marketing", "2026-08-21", "09:00", "11:00", "Online · Teams",             "Clase 3 de 3 · Bloque AM · horario especial · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-marketing-3b", "uai_capacitacion", "UAI Capacitación · Área Marketing", "2026-08-21", "14:00", "16:00", "Online · Teams",             "Clase 3 de 3 · Bloque PM · horario especial · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-comercial-1",  "uai_capacitacion", "UAI Capacitación · Área Comercial", "2026-08-28", "09:00", "13:00", "Presencial · Sede Vitacura", "Clase 1 de 3 · 23 personas · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-comercial-2",  "uai_capacitacion", "UAI Capacitación · Área Comercial", "2026-09-04", "09:00", "13:00", "Presencial · Sede Vitacura", "Clase 2 de 3 · 23 personas · Coord. Gloria Arellano (Personas Viña)"),
  ev("uai-cap-comercial-3",  "uai_capacitacion", "UAI Capacitación · Área Comercial", "2026-09-11", "09:00", "13:00", "Presencial · Sede Vitacura", "Clase 3 de 3 · 23 personas · Coord. Gloria Arellano (Personas Viña)"),
  // ──────────────────────────────────────────────────────────────────────────
  // IACC — Capacitación 7 sesiones Mié+Vie 09:00–12:00 (S4 corto 2 h)
  // Coord. Alejandro. 14 oct – 4 nov 2026. Online.
  // ──────────────────────────────────────────────────────────────────────────
  ev("iacc-1", "iacc", "IACC · Capacitación", "2026-10-14", "09:00", "12:00", "Online", "Clase 1 de 7 · Coord. Alejandro"),
  ev("iacc-2", "iacc", "IACC · Capacitación", "2026-10-16", "09:00", "12:00", "Online", "Clase 2 de 7 · Coord. Alejandro"),
  ev("iacc-3", "iacc", "IACC · Capacitación", "2026-10-21", "09:00", "12:00", "Online", "Clase 3 de 7 · Coord. Alejandro"),
  ev("iacc-4", "iacc", "IACC · Capacitación", "2026-10-23", "09:00", "11:00", "Online", "Clase 4 de 7 · Bloque corto 2h · Coord. Alejandro"),
  ev("iacc-5", "iacc", "IACC · Capacitación", "2026-10-28", "09:00", "12:00", "Online", "Clase 5 de 7 · Coord. Alejandro"),
  ev("iacc-6", "iacc", "IACC · Capacitación", "2026-10-30", "09:00", "12:00", "Online", "Clase 6 de 7 · Coord. Alejandro"),
  ev("iacc-7", "iacc", "IACC · Capacitación", "2026-11-04", "09:00", "12:00", "Online", "Clase 7 de 7 · Coord. Alejandro"),
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
