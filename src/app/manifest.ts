import type { MetadataRoute } from "next";

// Permite instalar la app en la pantalla de inicio del teléfono ("Añadir a pantalla de inicio").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calendario Edu",
    short_name: "Calendario",
    description: "Agenda consolidada de compromisos docentes",
    lang: "es-CL",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f4ef",
    theme_color: "#f5f4ef",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
