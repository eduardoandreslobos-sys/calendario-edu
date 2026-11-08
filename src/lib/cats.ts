export type CatId =
  | "uai_postgrado"
  | "uai_fic"
  | "uai_capacitacion"
  | "iacc"
  | "fen_santander"
  | "fen_hc"
  | "fen_basica"
  | "fen_starken"
  | "muni_florida"
  | "nodo"
  | "personal"
  | "banco_central"
  | "ext_fen";

export interface Cat {
  name: string;
  dot: string;
  bg: string;
  text: string;
}

export const CATS: Record<CatId, Cat> = {
  uai_postgrado:    { name: "UAI Postgrado",         dot: "#2563eb", bg: "#dbeafe", text: "#1e40af" },
  uai_fic:          { name: "UAI FIC",               dot: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
  uai_capacitacion: { name: "UAI Capacitación",      dot: "#4f46e5", bg: "#e0e7ff", text: "#3730a3" },
  iacc:             { name: "IACC",                  dot: "#c026d3", bg: "#fae8ff", text: "#86198f" },
  fen_santander: { name: "Santander (FEN)",       dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  fen_hc:        { name: "Diplomado HC (FEN)",    dot: "#e11d48", bg: "#ffe4e6", text: "#9f1239" },
  fen_basica:    { name: "Diplomado Básica (FEN)",dot: "#0d9488", bg: "#ccfbf1", text: "#115e59" },
  fen_starken:   { name: "Starken (FEN)",        dot: "#4d7c0f", bg: "#ecfccb", text: "#3f6212" },
  muni_florida:  { name: "Muni La Florida",       dot: "#0891b2", bg: "#cffafe", text: "#155e75" },
  nodo:          { name: "nodo.",                 dot: "#d97706", bg: "#fef3c7", text: "#92400e" },
  personal:      { name: "Personal",              dot: "#6b7280", bg: "#f3f4f6", text: "#374151" },
  banco_central: { name: "Banco Central",        dot: "#ea580c", bg: "#ffedd5", text: "#9a3412" },
  ext_fen:       { name: "Mi calendario FEN (Google)", dot: "#0040a0", bg: "#e6ecf7", text: "#0a2a6b" },
};

export const CAT_ORDER: CatId[] = [
  "uai_postgrado",
  "uai_fic",
  "uai_capacitacion",
  "iacc",
  "fen_santander",
  "fen_starken",
  "muni_florida",
  "nodo",
  "personal",
  "banco_central",
  "ext_fen",
];

const UNKNOWN_CAT: Cat = { name: "Otro", dot: "#6b7280", bg: "#f3f4f6", text: "#374151" };

/**
 * Categoría de un evento. La base de datos puede traer un cat_id que este código aún
 * no conoce (por ejemplo, cargado a mano); en ese caso se muestra como "Otro" en vez de
 * romper la página entera, que es lo que pasaba al abrir septiembre.
 */
export function catOf(id: string): Cat {
  return (CATS as Record<string, Cat | undefined>)[id] ?? UNKNOWN_CAT;
}
