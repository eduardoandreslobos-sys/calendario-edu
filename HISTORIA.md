# Calendario Edu — Historia del proyecto

Bitácora completa de cómo se construyó esto, qué decisiones se tomaron y por qué.
De un PDF de especificación a una app SSR multi-usuario en GCP en una sola sesión.

**Live:** https://calendario-edu-770391066863.southamerica-east1.run.app
**Repo:** https://github.com/eduardoandreslobos-sys/calendario-edu
**GCP project:** `nodo-build` · **Costo real:** $0/mes (free tier)

---

## Estado final (lo que existe hoy)

- **Stack:** Next.js 16.2 · React 19.2 · TypeScript · Tailwind v4 · Turbopack
- **Hosting:** Cloud Run en `southamerica-east1` (build vía Cloud Build, Dockerfile multi-stage Node 22)
- **Auth:** Firebase Auth · sign-in con email magic link · session cookies via Firebase Admin
- **DB:** Firestore Native · `/calendars/main` + `/calendars/main/events/{eventId}` + `/users/{uid}`
- **Animación:** GSAP + ScrollTrigger · Lenis smooth scroll · Framer Motion (modales) · Anime.js v4
- **Calendar engine:** FullCalendar 6 React (dayGrid + timeGrid + interaction plugins, locale español)
- **Diseño:** Mood "Liquid Glass + Editorial" del Awwwards Production System v3
  - Inter + Instrument Serif italic + JetBrains Mono
  - Mesh gradient animado · SVG grain overlay · glass cards (backdrop-filter)
  - SplitText reveal de entrada · tilt 3D en stat cards
  - Respeta `prefers-reduced-motion` · sin `#000`/`#fff` puros

## Datos (al cierre)

| Curso                                       | Categoría             | Sesiones | Horas    |
| ------------------------------------------- | --------------------- | -------- | -------- |
| Herramientas IA para la Productividad       | UAI Postgrado         | 4        | 16       |
| IA para los Negocios (UAI Corporate)        | UAI Postgrado         | 1        | 10       |
| Ing. de Prompts — Banco Santander (actual)  | Santander (FEN)       | 12       | 24       |
| Ing. de Prompts — Santander Grupo A *       | Santander (FEN)       | 12       | 24       |
| Ing. de Prompts — Santander Grupo B *       | Santander (FEN)       | 12       | 24       |
| Sistemas de Información (Ing. Civil 4°)     | UAI FIC               | 10       | 26.7     |
| Diplomado Control de Gestión · Educación HC | Diplomado HC (FEN)    | 18       | 64       |
| Diplomado Control de Gestión · Ed. Básica   | Diplomado Básica (FEN)| 18       | 64       |
| **Total**                                   | —                     | **87**   | **252.7** |

\* Propuesta enviada a Raysa, pendiente confirmación.

---

## Línea de tiempo de decisiones

### Fase 0 — Spec
Input: `calendario edu spec.pdf` (FullCalendar v6 standalone, 26 sesiones mayo–julio 2026,
mood Apple Calendar). Restricciones: un solo `.html`, sin frameworks, vanilla JS, abrir
directo en Chrome.

### Fase 1 — Vanilla HTML standalone (commit inicial)
- Un archivo `.html` con FullCalendar v6 vía CDN, locale español
- 26 eventos hardcoded · 4 categorías con colores spec-locked
- Vista mes con píldoras pastel + dot · vista semana con gradientes
- Modal Framer-style con backdrop-filter, glass cards
- Stats reactivas + agenda list + today circle animado

### Fase 2 — Awwwards production system
Input: `ClaudeMD awwws.pdf` (50 págs · sistema de producción nivel Awwwards SOTD).
Sobre el archivo standalone se agregaron:
- Mesh gradient atmosférico animado (28s drift)
- SVG grain overlay (fractalNoise + multiply blend, 6%)
- 5 efectos seleccionados según el spec ("cada efecto comunica algo del DNA")
- SplitText reveal cinemático orquestado (eyebrow → title words → subtitle → secciones)
- Tilt 3D en stat cards (rAF-throttled, máx ±3.5°)
- `clamp()` en h1, letter-spacing -0.038em, variable font weight hover
- Font pairing Inter + Instrument Serif italic + JetBrains Mono uppercase

### Fase 3 — Migración a Next.js 16
Razón: el sistema Awwwards está pensado para Next 16 + Tailwind v4 + shadcn. Vanilla HTML
no permitía 21st.dev components, real-time, ni features futuras.

- `npx create-next-app@latest` con TypeScript, Tailwind v4, App Router, src-dir, Turbopack
- Instaladas: `gsap @gsap/react lenis framer-motion animejs @fullcalendar/react clsx tailwind-merge`
- `npx shadcn@latest add card dialog badge button` (base; mayoría custom con glass)
- Componentes refactor: `src/components/{effects,sections,ui}/`
- `src/lib/{cats,events,format,gsap,utils}.ts`
- next/font/google para Inter + Instrument Serif + JetBrains Mono → CSS variables
- Tailwind v4 con `@theme` en CSS (sin config file)

### Fase 4 — Despliegue inicial a GitHub Pages
- `output: 'export'` en next.config.ts
- `.github/workflows/deploy.yml` con actions/configure-pages + upload-pages-artifact
- `public/.nojekyll` para que Pages no rompa `_next/`
- `basePath: /calendario-edu` en producción
- Repo público creado vía `gh repo create` con username `eduardoandreslobos-sys`
- Primer deploy 1m1s · live en https://eduardoandreslobos-sys.github.io/calendario-edu/

### Fase 5 — Rectificación calendario Santander
Cambio en el cliente: el curso Ing. de Prompts pasó de 11 a 12 sesiones.
- Canceladas: 18, 20 y 27 mayo
- Recuperaciones: 22 jun, 24 jun y 1 jul
- Festivo: lun 29 jun (San Pedro y San Pablo)

### Fase 6 — Sumar 2 diplomados FEN + 3 colores
Input: dos xlsx (`Calendario HC.xlsx`, `Calendario Educación Básica v3.xlsx`).
Dos diplomados nuevos de Control de Gestión Educacional:
- HC: 18 sesiones · jue inaugural + 16 viernes 14–17 + jue cierre
- Básica: 18 sesiones · vie inaugural + 16 viernes 10–13 + vie cierre

Renombré `fen_uchile` → `fen_santander` y agregué dos categorías:
- `fen_hc` · rose (#e11d48 / #ffe4e6 / #9f1239)
- `fen_basica` · teal (#0d9488 / #ccfbf1 / #115e59)

TOTALS pasó a calcularse dinámicamente desde `EVENTS`. Período del calendario:
mayo → octubre 2026.

### Fase 7 — Migración a backend con CRUD
Usuario eligió "Backend con login + Google Calendar sync · sin Google Cal por ahora".
Implementación con Supabase (primer intento):
- Schema SQL + RLS, magic link auth, Server Actions, EventModal con Edit/Cancel/Borrar
- Migración planificada GH Pages → Vercel

### Fase 8 — Pivot a Firebase + Cloud Run en GCP
Usuario pidió: "Llévalo todo a GCP (`nodo-build`), usa free tier, no quiero crear un
proyecto nuevo." También: "hazlo todo tú, no necesito ejecutar algo yo."

Migración completa:
- Drop `@supabase/*`, instaladas `firebase firebase-admin googleapis`
- `src/lib/firebase/{client,admin}.ts` + `src/lib/google-calendar.ts`
- `src/proxy.ts` con session cookie verify
- APIs habilitadas en `nodo-build`: App Hosting + Calendar API + Cloud Build + Secret Manager
- Firestore Native ya existía (us-central1, free tier)
- Web app "Calendario Edu" registrada en Firebase (config bajado vía `firebase apps:sdkconfig`)
- `firestore.rules` + `firestore.indexes.json` desplegados

**Decisión clave:** intenté habilitar Google sign-in vía API (Identity Toolkit Admin
+ IAP OAuth) pero la API IAP OAuth se deprecó en marzo 2026 y crear un OAuth Client
Web requiere consola. Pivoté a **email magic link** que sí se habilita 100% por API:
```
PATCH /admin/v2/projects/nodo-build/config?updateMask=signIn.email.enabled
{"signIn":{"email":{"enabled":true}}}
```

**Deploy autonómo a Cloud Run:**
- `output: 'standalone'` en next.config.ts
- Dockerfile multi-stage (deps → builder → runner, usuario `nextjs` no-root, puerto 8080)
- Firebase Web config hardcodeado como fallback en `firebase/client.ts` (es público anyway)
- `gcloud run deploy --source .` → Cloud Build + Artifact Registry + Cloud Run en
  southamerica-east1 (Sao Paulo)
- 512MiB, max 3 instancias, scale-to-zero, allow-unauthenticated
- Env vars seteados vía `gcloud run services update`
- Authorized domains incluye URL `.run.app` vía Identity Toolkit Admin API
- Proxy redirige `/` → `/login` correctamente

### Fase 9 — Seguridad: allowlist
Usuario preguntó: "¿otra persona puede entrar para ver mi calendario? ¿pueden sumarme
eventos?"

Estado previo: cualquiera podía pedir magic link, Firebase creaba la cuenta, RLS evitaba
ver eventos de otros pero veía una copia del seed académico en su cuenta. Solución:
- `src/lib/firebase/allowlist.ts` con `ALLOWED_EMAILS`
- `/api/auth/session` verifica idToken → chequea email → si no autorizado: `deleteUser` + 403
- `proxy.ts` defense-in-depth: revisa email del session cookie contra allowlist; limpia
  cookie si quedó stale
- `/login` muestra "Acceso restringido. Solo el dueño puede acceder."

### Fase 10 — Calendario compartido con roles
Usuario pidió: "quiero poder entrar sólo yo y a quienes explícitamente autorice."
Modelo elegido (vía AskUserQuestion): **calendario compartido + UI in-app + roles**.

Rediseño completo del modelo de datos:
```
/calendars/main {
  ownerEmail: "eduardoandres.lobos@gmail.com",
  collaborators: { [email]: { role: "editor"|"viewer", addedAt } },
  name: "Calendario Edu"
}
/calendars/main/events/{eventId}    ← antes /users/{uid}/events/
/users/{uid}                         ← solo perfil + Google tokens (futuro)
```

- `src/lib/calendar-access.ts`: `getAccess()` resuelve `email → role`
- Allowlist ahora dinámico desde Firestore (`calendars/main.collaborators`)
- `requireWriter()` / `requireOwner()` para gating en Server Actions
- Nueva acción `actions/collaborators.ts` (add/remove/updateRole, owner only)
- UI: `ShareModal` con lista de colabs, form de invitar, owner-only
- Header badge: `Dueño` / `Editor` / `Lectura`
- UI gated por rol: viewer no ve `+ Nuevo evento` ni botones edit/cancel/delete

### Fase 11 — Propuesta Santander 2 grupos adicionales
Cliente Santander pidió a Raysa abrir 2 grupos más del mismo curso de Ing. de Prompts.
Análisis de disponibilidad: lunes y miércoles desde 3 ago 100% libres (Santander actual
termina 1 jul, Sist. Info UAI FIC termina 9 jul, los diplomados son los viernes).

**Ventana propuesta:** lun 3 ago – mié 9 sept 2026 (6 semanas limpias, sin feriados,
antes de Fiestas Patrias). Calendar idéntico para ambos grupos:
- Grupo A · Lun+Mié 09:00–11:00
- Grupo B · Lun+Mié 11:30–13:30

Borrador de email enviado al cliente (correcciones aplicadas: framing como "profesor
permanente · tal como me pediste · pendiente tu confirmación", sin promesas de cosas
fuera del rol docente).

24 sesiones agregadas al seed con flag `Propuesta enviada a Raysa, pendiente confirmación`
en el campo notes. Cuando Raysa confirme, se edita la nota desde el modal.

---

## Arquitectura final detallada

```
src/
├── app/
│   ├── layout.tsx              fonts + MeshBg + GrainOverlay + SmoothScroll
│   ├── page.tsx                async server component: loadEvents → CalendarApp
│   ├── globals.css             @theme tokens + FullCalendar overrides + mesh/grain CSS
│   ├── login/page.tsx          email magic link
│   ├── actions/
│   │   ├── events.ts           upsert/setCanceled/delete/pushAllToGoogle (gated)
│   │   └── collaborators.ts    add/remove/updateRole (owner only)
│   └── api/auth/
│       ├── session/route.ts    POST: mint session cookie · allowlist check · 403 + deleteUser
│       └── signout/route.ts    POST: clear cookie + redirect
├── components/
│   ├── effects/
│   │   ├── MeshBg.tsx          radial-gradient mesh, drift animation
│   │   ├── GrainOverlay.tsx    inline SVG fractalNoise, multiply blend
│   │   ├── SmoothScroll.tsx    Lenis + GSAP ticker sync
│   │   ├── SplitReveal.tsx     split text into spans + GSAP stagger
│   │   ├── Tilt.tsx            rAF-throttled mousemove tilt
│   │   └── Reveal.tsx          Framer Motion entry transition
│   ├── sections/
│   │   ├── Header.tsx          eyebrow + h1 + subtitle + role badge + signout
│   │   ├── Stats.tsx           4 glass cards (sesiones, horas, días, por categoría)
│   │   ├── Legend.tsx          8 categories with colored dots
│   │   ├── CalendarView.tsx    FullCalendar wrapper with custom event content
│   │   ├── Agenda.tsx          chronological list of visible events
│   │   ├── EventModal.tsx      view + edit/cancel/delete (writer only)
│   │   ├── EventForm.tsx       create/edit form with category picker
│   │   ├── ShareModal.tsx      manage collaborators (owner only)
│   │   ├── LoginForm.tsx       magic link form + completion handler
│   │   └── CalendarApp.tsx     client orchestrator (state + mode)
│   └── ui/                     shadcn (card, dialog, badge, button)
├── lib/
│   ├── cats.ts                 8 category palette
│   ├── events.ts               87 events seed + CalEvent type + calcTotals + eventsInRange
│   ├── format.ts               Spanish date/time helpers
│   ├── tz.ts                   Chile DST helpers (UTC-4 / UTC-3)
│   ├── gsap.ts                 GSAP + ScrollTrigger registration
│   ├── utils.ts                cn() — clsx + tailwind-merge
│   ├── load-events.ts          server: read calendars/main/events + auto-seed
│   ├── google-calendar.ts      OAuth + push/update/delete via googleapis (gated)
│   ├── calendar-access.ts      getAccess/requireWriter/requireOwner + roleFor
│   └── firebase/
│       ├── client.ts           Web SDK + Google provider with Calendar scope
│       ├── admin.ts            Admin SDK + session cookie helpers
│       └── allowlist.ts        dynamic from Firestore (owner + collaborators)
├── proxy.ts                    Next 16 middleware: session check + role-based access
└── ...

firebase.json                   Firestore rules + indexes config + emulators
firestore.rules                 RLS: read own, write only from server
firestore.indexes.json          (empty — Firestore auto-handles single-field)
apphosting.yaml                 (preparado para migración futura a App Hosting)
.firebaserc                     project: nodo-build
Dockerfile                      multi-stage Node 22, standalone Next.js output
.dockerignore                   excluye .env.local, node_modules, .git, .next
supabase/                       (eliminado — pivot a Firebase)
```

## Modelo de seguridad

| Capa | Qué verifica | Dónde |
|---|---|---|
| 1. Allowlist (mint) | Email del idToken vs `calendars/main.collaborators` + ownerEmail | `/api/auth/session/route.ts` |
| 2. Allowlist (proxy) | Email del session cookie vs Firestore | `src/proxy.ts` |
| 3. Role check (read) | `getAccess()` retorna role o null | `src/lib/load-events.ts` |
| 4. Role check (write) | `requireWriter()` lanza si no es owner/editor | `src/app/actions/events.ts` |
| 5. Owner check | `requireOwner()` para gestión de collaborators | `src/app/actions/collaborators.ts` |
| 6. Firestore Rules | Reads gated por uid, writes denied → solo server | `firestore.rules` |
| 7. UI gating | Botones edit/cancel/delete/share aparecen según role | componentes |

Si llega un email no autorizado:
1. Firebase Auth crea la cuenta (no podemos evitarlo client-side)
2. `/api/auth/session` verifica idToken
3. `isAllowed(email)` retorna `false`
4. Server llama `adminAuth().deleteUser(uid)` — borra la cuenta
5. Server retorna 403 sin setear cookie
6. Cliente ve el error en el form

## Decisiones de arquitectura

**¿Por qué Firebase Auth y no NextAuth/Clerk/Auth.js?**
Cliente pidió "todo en GCP". Firebase Auth es el único auth-as-a-service nativo GCP.
Free tier muy generoso (50k MAU). Cookie sync via `createSessionCookie` + Admin SDK.

**¿Por qué Firestore y no Cloud SQL Postgres?**
Cloud SQL no tiene free tier real (mínimo $10/mo). Firestore free tier (50k reads/día,
20k writes/día, 1GB storage) sobra 1000x para uso personal. NoSQL es fine porque el
data model es naturalmente jerárquico (calendarios → eventos).

**¿Por qué Cloud Run directo y no Firebase App Hosting?**
App Hosting requiere conexión OAuth a GitHub (interactiva). Cloud Run con `--source .`
construye + deploya sin interacción. `apphosting.yaml` está preparado por si queremos
migrar después.

**¿Por qué email magic link y no Google sign-in?**
Habilitar Google sign-in vía Identity Toolkit Admin API requiere un OAuth 2.0 Client ID
+ secret. Crear OAuth Web clients vía CLI requería la IAP OAuth Admin API que se
**deprecó en marzo 2026**. Crear OAuth clients ahora es web-console only.
Email magic link se habilita 100% por API y no necesita OAuth client.

**¿Por qué se mantiene el código de Google Calendar sync si no está activo?**
Está completamente implementado en `src/lib/google-calendar.ts` y los Server Actions
ya hacen push/update/delete. Solo está gateado hasta que se cree un OAuth client en
consola y se habilite Google sign-in en Firebase Auth. Una vez hechos esos 2 pasos
manuales (~5 min), todo funciona.

**¿Por qué se rediseñó el modelo de datos de `/users/{uid}/events` a `/calendars/main/events`?**
Usuario eligió "calendario compartido con roles" en vez de "calendarios separados por
usuario". El primer modelo no permitía que dos personas vieran/editaran el MISMO
calendario; el segundo sí. El cambio es retrocompatible con el flujo de seed (la app
detecta calendario vacío y siembra al primer login del owner).

---

## Comandos relevantes

```bash
# Desarrollo local
cp .env.example .env.local
gcloud auth application-default login
gcloud auth application-default set-quota-project nodo-build
npm run dev

# Re-deploy a Cloud Run
gcloud run deploy calendario-edu \
  --source . \
  --region southamerica-east1 \
  --project nodo-build

# Actualizar env vars en producción
gcloud run services update calendario-edu \
  --region southamerica-east1 \
  --project nodo-build \
  --update-env-vars KEY=VALUE

# Deploy reglas Firestore
firebase deploy --only firestore:rules,firestore:indexes --project nodo-build

# Ver logs en vivo
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=calendario-edu" \
  --project nodo-build

# Inspeccionar Firestore
TOKEN=$(gcloud auth application-default print-access-token)
curl -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: nodo-build" \
  "https://firestore.googleapis.com/v1/projects/nodo-build/databases/(default)/documents/calendars/main"
```

## Para activar Google Calendar sync (no automatizable)

Único paso manual pendiente. Si lo quieres:
1. [GCP Console → APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=nodo-build)
   - User type: External
   - Publishing status: Testing
   - Agregar scope `https://www.googleapis.com/auth/calendar.events`
   - Test users: `eduardoandres.lobos@gmail.com`
2. [Credentials → Create OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials?project=nodo-build)
   - Tipo: Web application
   - Authorized JS origin: `https://calendario-edu-770391066863.southamerica-east1.run.app`
   - Authorized redirect URI: `https://nodo-build.firebaseapp.com/__/auth/handler`
3. [Firebase Console → Auth → Google → Enable](https://console.firebase.google.com/project/nodo-build/authentication/providers)
   - Pegar Client ID + secret
4. Cambiar el botón de login a Google sign-in (descomentar `googleProvider()` en `LoginForm.tsx`)

## Commits en orden cronológico

| SHA | Resumen |
|---|---|
| `5dfe4e8` | Initial nodo. landing (no relacionado al calendario) |
| `bootstrap` | Spec PDF → v1 HTML standalone con FullCalendar |
| `awwwards` | v2 con sistema Awwwards (mesh, grain, glass, splittext, tilt) |
| `96798d4` | Initial Next.js commit |
| `c42f8e1` | Migración a Next.js 16 + componentes refactoreados |
| `e1604bd` | Santander schedule final: 12 sesiones (cancela 3, recupera 3) |
| `5f51a76` | 2 diplomados FEN + 3 colores · totales dinámicos |
| `a435eb8` | Supabase auth + Postgres + CRUD (luego revertido) |
| `9042b47` | Pivot a Firebase + Cloud Run · email magic link |
| `2f46d36` | Email allowlist · server + proxy + UI |
| `b28afa6` | Shared calendar con roles + ShareModal UI |
| `d46735f` | Santander Grupos A y B (propuesta a Raysa) |

## Costos

| Recurso | Free tier | Uso real estimado | Costo |
|---|---|---|---|
| Cloud Run | 2M req/mo, 360k GB-sec compute | ~1k req/mo personal | $0 |
| Firestore | 50k reads/día, 20k writes/día, 1GB | ~500 reads/día, ~50 writes/día | $0 |
| Firebase Auth | 50k MAU | 1 MAU (yo) | $0 |
| Cloud Build | 120 build-min/día | ~5 min/deploy | $0 |
| Artifact Registry | 0.5GB free | ~250MB usado | $0 |
| Firebase Hosting | 10GB transfer/mo | (no se usa, todo es Cloud Run) | $0 |
| Identity Platform | Free para SAML/OAuth básico | — | $0 |
| **Total mensual** | — | — | **$0** |

Con un Budget Alert de $1 en el proyecto, te llega notificación si algo se descontrola.

---

## Lecciones aprendidas

- **Firebase Web config es público.** Hardcodearlo en `firebase/client.ts` está OK
  y simplifica el build. La seguridad real está en Auth + Firestore Rules.
- **El proxy.ts gating debe revisar env en build vs runtime.** `NEXT_PUBLIC_*` se
  inlinean en build; vars que solo importan al server (como `OWNER_EMAIL`) se leen
  en runtime y deben setearse vía `gcloud run services update`.
- **IAP OAuth Admin API se deprecó en marzo 2026.** Cualquier creación programática
  de OAuth Web clients murió con ella. Para sign-in con Google ahora requiere
  consola, sí o sí.
- **Firebase Auth con email enumeration protection:** si lo activan, magic links no
  se envían a emails nuevos (anti enumeración). En nodo-build lo dejé apagado para
  que el flujo funcione para el primer login del owner.
- **Cloud Run `--source .` con Dockerfile es la forma más limpia de deploy automático
  sin GitHub Actions.** No requiere OAuth de GitHub, no requiere interactivo, deploya
  desde cualquier máquina con `gcloud auth`.
- **Tailwind v4 `@theme` directive** es CSS-first y elimina el config file. Variables
  se exponen automáticamente como utilidades (`bg-cream`, `text-ink`, etc.).
- **`prefers-reduced-motion` no es opcional** en sitios con tantas animaciones.
  Todas las entradas, el mesh drift, el tilt y los hover effects respetan la
  media query.
