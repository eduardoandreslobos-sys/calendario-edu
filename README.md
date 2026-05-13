# Calendario Edu

Calendario interactivo de los compromisos docentes de Eduardo Lobos Stevens —
**63 sesiones · 204.7 horas · Mayo a octubre de 2026**, con sincronización
bidireccional a Google Calendar.

Construido siguiendo el Awwwards Production System v3.

## Stack

- **Next.js 16** · App Router · React 19 · TypeScript · Turbopack
- **Tailwind CSS v4** · `@theme` tokens en CSS
- **Firebase Auth** · sign-in con Google (OAuth scope `calendar.events`)
- **Firestore** · NoSQL, RLS por usuario
- **Google Calendar API** vía `googleapis` (push/update/delete bidireccional)
- **Firebase App Hosting** · Cloud Run SSR + global CDN
- **GSAP** + Lenis + Framer Motion + Anime.js · FullCalendar 6

100% en GCP, free tier (Spark + Blaze sin sobrepasar quotas).

## Diseño

Mood **Liquid Glass + Editorial**. Inter + Instrument Serif italic + JetBrains Mono.
Mesh gradient · grain · glass cards · SplitText reveal · tilt 3D · respeta
`prefers-reduced-motion`.

## Categorías y eventos

| Curso                                       | Categoría             | Sesiones | Horas    |
| ------------------------------------------- | --------------------- | -------- | -------- |
| Herramientas IA para la Productividad       | UAI Postgrado         | 4        | 16       |
| IA para los Negocios (UAI Corporate)        | UAI Postgrado         | 1        | 10       |
| Ing. de Prompts — Banco Santander           | Santander (FEN)       | 12       | 24       |
| Sistemas de Información (Ing. Civil 4°)     | UAI FIC               | 10       | 26.7     |
| Diplomado Control de Gestión · Educación HC | Diplomado HC (FEN)    | 18       | 64       |
| Diplomado Control de Gestión · Ed. Básica   | Diplomado Básica (FEN)| 18       | 64       |
| **Total**                                   | —                     | **63**   | **204.7** |

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # rellenar valores
gcloud auth application-default login   # para que firebase-admin funcione
gcloud auth application-default set-quota-project nodo-build
npm run dev
```

Sin `.env.local` el calendario corre en **modo público read-only** (fallback útil
para previews). Con env + login Google, todo el CRUD y la sincronización a Google
Calendar quedan activos.

## Arquitectura de datos (Firestore)

```
users/{uid}                       — perfil + tokens Google (escritos solo desde server)
users/{uid}/events/{eventId}      — eventos del usuario, source of truth
```

Cada evento:
```ts
{
  title, catId, startAt, endAt, location, notes,
  canceled: boolean,
  externalId: string | null,      // "santander-1" si vino del seed
  googleEventId: string | null,   // ID en Google Calendar (si sincronizado)
  createdAt, updatedAt
}
```

RLS: cada usuario solo lee `users/{su-uid}`. Mutaciones siempre via Server Actions
con admin SDK (que bypasea reglas tras verificar la session cookie).

## Despliegue

Cloud Run directo (sin GitHub Actions interactivo), construido con Cloud Build a
partir del `Dockerfile`. Configuración en `apphosting.yaml` para una migración
futura a Firebase App Hosting.

```bash
gcloud run deploy calendario-edu \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --project nodo-build
firebase deploy --only firestore:rules,firestore:indexes
```

**Live:** https://calendario-edu-770391066863.southamerica-east1.run.app

## Google Calendar sync (opcional)

La sincronización Google Calendar está implementada en `src/lib/google-calendar.ts`
pero deshabilitada por defecto. Activarla requiere crear un OAuth 2.0 client en
GCP Console (es la única acción que no puede automatizarse vía CLI — la API IAP
OAuth fue deprecada en marzo 2026).

Pasos para activar:
1. Console → APIs & Services → OAuth consent screen → External · Testing,
   agregar `calendar.events` a scopes, agregarte como test user
2. Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   (Web), copiar Client ID
3. Firebase Console → Auth → Sign-in method → Google → Enable con el Client ID
4. En la app, conectar via botón "Conectar Google Calendar"
