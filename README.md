# Calendario Edu

Calendario interactivo de los compromisos docentes de Eduardo Lobos Stevens —
**63 sesiones · 204.7 horas · Mayo a octubre de 2026**.

Construido siguiendo el Awwwards Production System v3.

## Stack

- **Next.js 16** · App Router · React 19 · TypeScript · Turbopack
- **Tailwind CSS v4** · `@theme` tokens en CSS, sin config file
- **shadcn/ui** base + componentes custom con glassmorphism
- **FullCalendar 6** (`@fullcalendar/react`) con vista mes y semana, locale español
- **GSAP** + ScrollTrigger · **Lenis** smooth scroll · **Framer Motion** · **Anime.js**

## Diseño

Mood **Liquid Glass + Editorial**. Inter + Instrument Serif italic + JetBrains Mono.

Cinco efectos awwwards seleccionados:

1. Animated mesh gradient en pasteles de las categorías
2. SVG grain overlay (fractalNoise, multiply blend)
3. Glass cards con `backdrop-filter: blur(24px) saturate(180%)`
4. SplitText reveal de entrada con GSAP stagger
5. Tilt 3D en stat cards (rAF-throttled, ±3.5°)

Respeta `prefers-reduced-motion`. Sin `#000` / `#fff` puros.

## Categorías

| Curso                                       | Categoría             | Sesiones | Horas    |
| ------------------------------------------- | --------------------- | -------- | -------- |
| Herramientas IA para la Productividad       | UAI Postgrado         | 4        | 16       |
| IA para los Negocios (UAI Corporate)        | UAI Postgrado         | 1        | 10       |
| Ing. de Prompts — Banco Santander           | Santander (FEN)       | 12       | 24       |
| Sistemas de Información (Ing. Civil 4°)     | UAI FIC               | 10       | 26.7     |
| Diplomado Control de Gestión · Educación HC | Diplomado HC (FEN)    | 18       | 64       |
| Diplomado Control de Gestión · Ed. Básica   | Diplomado Básica (FEN)| 18       | 64       |
| **Total**                                   | —                     | **63**   | **204.7** |

## Desarrollo

```bash
npm install
npm run dev      # localhost:3000
npm run build    # static export a ./out
```

## Deploy

Despliegue automático a GitHub Pages vía Actions en cada push a `main`
(`.github/workflows/deploy.yml`). Static export con `basePath` ajustado al
nombre del repo.
