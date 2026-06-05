export type CatId =
  | "uai_postgrado"
  | "uai_fic"
  | "fen_santander"
  | "fen_hc"
  | "fen_basica"
  | "muni_florida"
  | "geforce"
  | "nodo"
  | "personal";

export interface Cat {
  name: string;
  dot: string;
  bg: string;
  text: string;
}

export const CATS: Record<CatId, Cat> = {
  uai_postgrado: { name: "UAI Postgrado",         dot: "#2563eb", bg: "#dbeafe", text: "#1e40af" },
  uai_fic:       { name: "UAI FIC",               dot: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
  fen_santander: { name: "Santander (FEN)",       dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  fen_hc:        { name: "Diplomado HC (FEN)",    dot: "#e11d48", bg: "#ffe4e6", text: "#9f1239" },
  fen_basica:    { name: "Diplomado Básica (FEN)",dot: "#0d9488", bg: "#ccfbf1", text: "#115e59" },
  muni_florida:  { name: "Muni La Florida",       dot: "#0891b2", bg: "#cffafe", text: "#155e75" },
  geforce:       { name: "GeForce NOW",           dot: "#059669", bg: "#d1fae5", text: "#065f46" },
  nodo:          { name: "nodo.",                 dot: "#d97706", bg: "#fef3c7", text: "#92400e" },
  personal:      { name: "Personal",              dot: "#6b7280", bg: "#f3f4f6", text: "#374151" },
};

export const CAT_ORDER: CatId[] = [
  "uai_postgrado",
  "uai_fic",
  "fen_santander",
  "muni_florida",
  "geforce",
  "nodo",
  "personal",
];
