# calendario-edu · Handoff completo

Documento de traspaso pensado para que otro modelo de Claude retome el trabajo desde cero con contexto completo. Lee todo antes de tomar decisiones.

**Última actualización:** 2026-08-03
**Commit vigente:** `54ee7a9` (rama `main`)
**Sitio en vivo:** https://calendario.nodo.build
**Estado:** Producción estable · 76 eventos en DB · deploy limpio

---

## 1. Qué es esto

Aplicación web personal para el dueño (**Eduardo Lobos Stevens** — `eduardoandreslobos@gmail.com`) para llevar su calendario académico consolidado: cursos que dicta en distintas instituciones (UAI Postgrado, UAI FIC, UAI Capacitación, FEN UChile, Muni La Florida, IACC, GeForce NOW, etc.).

Cumple dos funciones:
1. **Vista propia** — Eduardo entra, ve su agenda, crea/edita/borra eventos.
2. **Vista compartida** — colaboradores autorizados (owner/editor/viewer) pueden leer o editar.

No es SaaS. No hay signup público. Es un tenant único con allowlist explícita.

---

## 2. Arquitectura

### Frontend / backend web
- **Next.js 16.2.6** (App Router · React 19.2 · TypeScript · Turbopack)
- **Tailwind CSS v4** — sin `tailwind.config.js`, todo con `@theme` tokens en `globals.css`
- **shadcn/ui** para primitivas cuando aplica
- **FullCalendar 6 React** para el calendario en sí
- **GSAP + Lenis + Framer Motion** para animaciones (efecto "Awwwards Production System v3")

### Auth
- **Firebase Auth** con Google sign-in (`signInWithPopup`)
- Owner fijo: `eduardoandreslobos@gmail.com`
- Colaboradores adicionales cargados en Firestore (colección `collaborators`) o allowlist local, con roles `editor` / `viewer`
- Preloaded: `catarusconi@gmail.com` como editor

### Datos
- **PostgreSQL** en VPS (contenedor Docker `core-postgres-1` en la red `core_core`)
- Tabla principal: `events` (con `id`, `title`, `start_at`, `end_at`, `cat_id`, `location`, `notes`, `canceled`)
- Tabla auxiliar: `collaborators` (para roles compartidos)
- Cliente SQL: paquete `postgres` en Node (`src/lib/db.ts`)
- Semilla inicial: `src/lib/events.ts` (auto-seed vía `src/lib/load-events.ts` si la tabla está vacía)

### Infra / deploy
- **VPS:** `core-prod-scl-01` (`190.114.252.198:58532`, alias SSH configurado)
- **Docker:** contenedor `calendario` levantado con `--network core_core --env-file /opt/sites/calendario/calendario.env`
- **Reverse proxy TLS:** Caddy (parte del stack "core")
- **DNS:** `calendario.nodo.build`
- **Repo git en el VPS:** `/opt/sites/calendario/repo`
- **Firebase (Auth):** proyecto `nodo-build` en plan Spark (billing CERRADO — no usar Cloud Run ni Functions)

### Repo
- **GitHub:** `github.com/eduardoandreslobos-sys/calendario-edu`
- **Rama principal:** `main`

---

## 3. Ciclo de deploy (patrón usado durante toda la sesión)

Al hacer un cambio de código y/o datos:

1. **Actualizar DB** (si aplica) con `psql` remoto vía SSH:
```bash
ssh core-prod-scl-01 "docker exec core-postgres-1 psql -U calendario -d calendario -c \"<SQL>\""
```

2. **Actualizar seed** (`src/lib/events.ts` y/o `src/lib/cats.ts`) para que la DB pueda regenerarse desde cero si se perdiera. El seed y la DB deben mantenerse sincronizados en paralelo.

3. **Commit + push:**
```bash
git add -A && git commit -m "<mensaje>" && git push
```

4. **Deploy al VPS:**
```bash
ssh core-prod-scl-01 "
cd /opt/sites/calendario/repo && git pull --ff-only
docker build -q -t calendario:vps .
docker rm -f calendario 2>/dev/null
docker run -d --name calendario --restart unless-stopped --network core_core --env-file /opt/sites/calendario/calendario.env calendario:vps
sleep 5
docker inspect calendario --format 'estado: {{.State.Status}}'
"
```

5. **Verificar en vivo:**
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 12 "https://calendario.nodo.build/login"
```

**IMPORTANTE:** No levantar un preview server local para "verificar" — la superficie observable de este proyecto es el sitio en producción. El deploy tarda ~30–60 s.

---

## 4. Estructura de archivos clave

```
calendario-edu/
├── src/
│   ├── app/
│   │   ├── login/page.tsx              # Pantalla de login (Google sign-in)
│   │   ├── page.tsx                    # Home autenticada — renderiza CalendarApp
│   │   ├── api/auth/login/route.ts     # POST · setea cookie de sesión
│   │   └── actions/collaborators.ts    # Server actions: add/remove/updateRole
│   ├── components/
│   │   ├── effects/{MeshBg,GrainOverlay,Reveal}.tsx  # Efectos visuales
│   │   └── sections/
│   │       ├── LoginForm.tsx           # Form login
│   │       ├── CalendarApp.tsx         # Orquestador principal (client)
│   │       ├── CalendarView.tsx        # Wrapper de FullCalendar
│   │       ├── Agenda.tsx              # Lista lateral
│   │       ├── Stats.tsx               # KPIs
│   │       ├── Legend.tsx              # Categorías como filtros clickables
│   │       ├── EventModal.tsx          # Ver evento
│   │       ├── EventForm.tsx           # Crear/editar
│   │       └── ShareModal.tsx          # Gestionar colaboradores (solo owner)
│   └── lib/
│       ├── cats.ts                     # Categorías (fuente única de verdad)
│       ├── events.ts                   # Semilla — 76 eventos
│       ├── load-events.ts              # Server loader (con auto-seed si DB vacía)
│       ├── db.ts                       # Cliente PostgreSQL
│       ├── auth.ts                     # Verificación de sesión
│       ├── access.ts                   # requireOwner, requireCanWrite
│       └── firebase/allowlist.ts       # Chequeo de allowlist
├── firestore.rules                     # Reglas legacy (Firebase cuando estaba activo)
├── .env.local                          # Config local (Firebase pub keys)
├── .env.example                        # Referencia
├── Dockerfile                          # Multi-stage build para producción
└── package.json
```

---

## 5. Modelo de datos

### `CalEvent` (TypeScript)
```ts
interface CalEvent {
  id: string;
  title: string;
  start: string;   // ISO local "YYYY-MM-DDTHH:mm:00"
  end: string;
  catId: CatId;
  location: string;
  notes: string;
  canceled?: boolean;
  externalId?: string | null;
}
```

### Tabla `events` en Postgres
Columnas: `id` (pk), `title`, `start_at` (timestamptz), `end_at` (timestamptz), `cat_id`, `location`, `notes`, `canceled`, `external_id`.

**Ojo con timezones:** los inserts históricos usaron offset `-04` (invierno Chile). Con DST (primer domingo de septiembre) Chile pasa a `-03`. Algunos eventos de sep/oct fueron insertados con offset "incorrecto" para su fecha real. Como el seed usa strings ISO locales sin TZ y FullCalendar los interpreta como local, en la práctica se ven bien en la UI. **No es urgente corregir**, pero si alguna vez migras al app-flow de crear eventos, usar TZ correcta.

### Categorías (`src/lib/cats.ts`)
| CatId | Nombre | Color |
|-|-|-|
| `uai_postgrado` | UAI Postgrado | Azul `#2563eb` |
| `uai_fic` | UAI FIC | Violeta `#7c3aed` |
| `uai_capacitacion` | UAI Capacitación | Indigo `#4f46e5` |
| `iacc` | IACC | Fucsia `#c026d3` |
| `fen_santander` | Santander (FEN) | Rojo `#dc2626` |
| `fen_hc` | Diplomado HC (FEN) | Rosa `#e11d48` |
| `fen_basica` | Diplomado Básica (FEN) | Teal `#0d9488` |
| `muni_florida` | Muni La Florida | Cian `#0891b2` |
| `geforce` | GeForce NOW | Verde `#059669` |
| `nodo` | nodo. | Ámbar `#d97706` |
| `personal` | Personal | Gris `#6b7280` |

---

## 6. Estado actual del calendario (76 eventos totales)

### Distribución por categoría
| Categoría | Sesiones | Horas |
|-|-|-|
| UAI Postgrado | 33 | 138.0 h |
| UAI FIC | 10 | 26.7 h |
| UAI Capacitación | 7 | 24.0 h |
| IACC | 7 | 20.0 h |
| FEN Santander | 12 | 24.0 h |
| Muni La Florida | 5 | 16.0 h |
| Personal | 2 | 3.0 h |

### Compromisos activos ago → nov 2026 (10 cursos · 38 sesiones · 140 h)

| Curso | Fechas | Días · Horario | Modalidad |
|-|-|-|-|
| Claude Code & Design · 1ra ed. | 4, 6, 11, 13 ago | Ma+Ju · 18:00–22:00 | Zoom |
| UAI Cap · Marketing | 7, 14 ago | Vie · 09:00–13:00 | Teams |
| Herramientas IA · ed. agosto | 18, 20, 25, 27 ago | Ma+Ju · 18:00–22:00 | Zoom |
| UAI Cap · Marketing | 21 ago | Vie · 09:00–11:00 + 14:00–16:00 | Teams |
| UAI Cap · Comercial | 28 ago + 4, 11 sep | Vie · 09:00–13:00 | Vitacura (pres.) |
| Claude Code & Design · 2da ed. | 31 ago + 2, 7, 9 sep | Lun+Mié · 18:00–22:00 | Zoom |
| Herramientas IA · ed. sep | 1, 3, 8, 10 sep | Ma+Ju · 18:00–22:00 | Zoom |
| Claude Code & Design · 3ra ed. | 13, 15, 20, 22 oct | Ma+Ju · 18:00–22:00 | Zoom |
| IACC · Capacitación | 14, 16, 21, 23, 28, 30 oct + 4 nov | Mié+Vie · 09:00–12:00 (S4 09–11) | Online |
| Herramientas IA · ed. nov | 27, 29 oct + 3, 5 nov | Ma+Ju · 18:00–22:00 | Zoom |

**Viaje personal Eduardo:** 24 sep → 9 oct 2026. Actualmente **NO está registrado como evento** en la DB. Debería agregarse si otro modelo lo considera importante para bloqueo explícito. Categoría sugerida: `personal`.

---

## 7. Modelo económico

- **Tarifa general:** $130.000 CLP/h
- **Tarifa IACC:** $80.000 CLP/h (preferencial)
- **Regla de pago:** cada curso se cobra el mes en que cae su última clase.

### Flujo esperado (ago → nov 2026)
| Mes | Horas | Monto |
|-|-|-|
| Agosto | 44 | $5.720.000 |
| Septiembre | 44 | $5.720.000 |
| Octubre | 16 | $2.080.000 |
| Noviembre | 36 | $3.680.000 |
| **Total** | **140** | **$17.200.000** |

UAI representa 82% de la facturación del período ($14.040.000 en 7 cursos).

---

## 8. Contactos activos (para contextualizar decisiones)

- **Antares Luque Vergara** — Coordinadora UAI Postgrado para cursos Claude Code & Design y Herramientas IA.
- **Gloria Arellano Pereira** — Jefa Beneficios, Capacitación y Personas Viña UAI. Coordina UAI Capacitación (Marketing + Comercial).
- **Carolina Arrieta Nunez** — Subdirectora Admisión Postgrado UAI. Consolida la agenda global UAI y valida cohortes.
- **José** — Apoyo operativo UAI (cc en emails de Carolina).
- **Alejandro** — Contraparte externa que coordina IACC.
- **Mauricio Alejandro Arteaga Manieu** — Contacto en cc de UAI (rol operacional).
- **Cata Rusconi** — Editor autorizado en el calendario.

---

## 9. Preferencias de trabajo del usuario

Estas son directrices críticas que Claude debe respetar en toda interacción:

- **Directo y autónomo.** "Hazlo todo tú, no necesito ejecutar algo yo." No pedir permisos innecesarios ni pausar por confirmaciones triviales.
- **No dar problemas, dar soluciones.** Si algo no funciona (billing cerrado, servicio caído, conflicto), buscar alternativa autónomamente y presentar solución, no la lista de obstáculos.
- **Concreto y compacto.** Preferir listas y tablas a párrafos. Nada de resúmenes largos al final. Nada de recapitular pasos ya conocidos.
- **Formato pulido para respuestas de coordinación.** Cuando redactas emails, dejarlos listos para copiar/pegar.
- **En cambios al calendario:** siempre reflejar el cambio en DB + seed + commit + deploy. Verificar en vivo con curl. No dejar seed y DB desincronizados.
- **En cambios al calendario compartido:** informar conflictos explícitamente antes de aplicar; dar opciones cuando hay ambigüedad.

---

## 10. Decisiones históricas relevantes

- **Auth:** partió con IAP OAuth Admin → migró a magic link (fallaba entrega) → aterrizó en Google sign-in `signInWithPopup` (funciona).
- **Hosting:** Cloud Run en `nodo-build` GCP → billing cerrado → migró a VPS `core-prod-scl-01` con Docker + Caddy. **No intentar volver a GCP sin verificar billing.**
- **DB:** Firestore para auth/allowlist mientras GCP estaba activo → después de la caída, la data del calendario vive en Postgres del VPS. Firestore ya no es fuente de verdad para eventos.
- **Backend legacy:** `firebase/allowlist.ts` sigue en el repo pero puede quedar como fallback. Fuente de verdad actual = tabla `collaborators` en Postgres.
- **Numeración de ediciones Claude:** hubo un swap correctivo (usuario notó que 2da/3ra estaban invertidas). Ahora sí siguen orden cronológico.
- **Categoría IACC:** creada recientemente porque IACC no encajaba en ninguna categoría UAI/FEN existente.
- **Swap oct/nov UAI:** los slots oct 6-15 (originalmente Herramientas) pasaron a ser Claude 2da ed.; luego se movió Claude a fines de oct por viaje del usuario y esos oct 6-15 volvieron a ser Herramientas... revisar `git log` para historia completa.

---

## 11. Qué está bien y no toques a menos que te pidan

- **Diseño visual** (MeshBg, GrainOverlay, Reveal, Legend con filtros clickables): estable, revisado, aprobado.
- **Auth flow con Google sign-in:** funcionando.
- **Live sync onSnapshot legacy en Firestore:** deprecado — no re-activar sin conversar. El refresh actual es `router.refresh()` en `CalendarApp.tsx` post-mutación.
- **Deploy pipeline:** ya documentado arriba. No inventar Cloud Build ni GitHub Actions sin pedirlo.

---

## 12. Pendientes / próximas mejoras (no urgentes)

- [ ] **Agregar viaje 24 sep – 9 oct como evento** categoría `personal` para bloqueo explícito en la vista (actualmente solo existe en la memoria del usuario y en este handoff).
- [ ] **Corregir offsets DST** en eventos de septiembre-noviembre post primer domingo de sep (Chile pasa a UTC-3 y algunos inserts usaron `-04`). Baja prioridad — la UI se ve bien porque el seed usa strings locales.
- [ ] **Confirmar términos de pago con IACC** (Alejandro) — cliente nuevo, evitar sorpresas de plazo.
- [ ] **TTL Firestore `rate_limits.expiresAt`** (pendiente de CLAUDE.md raíz de `nodo/` pero no bloqueante para este proyecto).
- [ ] Considerar **agregar categoría por defecto** en `EventForm` cuando el usuario crea un evento nuevo (UX minor).

---

## 13. Comandos útiles para debugging rápido

**Ver todos los eventos activos:**
```bash
ssh core-prod-scl-01 "docker exec core-postgres-1 psql -U calendario -d calendario -tAc \"
SELECT to_char(start_at AT TIME ZONE 'America/Santiago','YYYY-MM-DD Dy HH24:MI')||' | '||title
FROM events WHERE start_at >= now() ORDER BY start_at;\""
```

**Ver logs del contenedor:**
```bash
ssh core-prod-scl-01 "docker logs --tail 100 calendario"
```

**Recrear contenedor sin rebuild (por ejemplo si cambió env):**
```bash
ssh core-prod-scl-01 "docker rm -f calendario && docker run -d --name calendario --restart unless-stopped --network core_core --env-file /opt/sites/calendario/calendario.env calendario:vps"
```

**Backup rápido de la tabla `events`:**
```bash
ssh core-prod-scl-01 "docker exec core-postgres-1 pg_dump -U calendario -d calendario -t events --data-only" > events_backup_$(date +%Y%m%d).sql
```

---

## 14. Documentos hermanos

- `CLAUDE.md` (raíz del monorepo `nodo/`) — instrucciones globales del proyecto `nodo.` (landing en Firebase Hosting `nodo-build`).
- Memoria persistente Claude en `~/.claude/projects/-Users-eduardolobosstevens-nodo/memory/`.

---

## 15. Cierre

El estado es sólido. Todo commiteado (`54ee7a9`), todo desplegado, sin merge conflicts, sin cambios locales pendientes. Cualquier próxima interacción puede empezar con `git status` para confirmar el árbol limpio y con la tabla de "Compromisos activos" arriba como referencia mental.

Si te toca continuar: lee este archivo, corre `git log --oneline -20` para ver evolución reciente, y pregúntale al usuario qué quiere abordar antes de asumir nada.
