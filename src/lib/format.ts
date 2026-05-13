export const MONTHS_FULL = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
export const MONTHS_SHORT = [
  "ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic",
];
export const DAYS_FULL = [
  "domingo","lunes","martes","miércoles","jueves","viernes","sábado",
];

export const fmtHM = (d: Date) =>
  `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

export const fmtFullDate = (d: Date) =>
  `${DAYS_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()}`;

export const diffHours = (start: Date, end: Date) =>
  Math.max(0, (end.getTime() - start.getTime()) / 3600000);

export const fmtHours = (h: number) =>
  h % 1 === 0 ? `${h}` : h.toFixed(1);
