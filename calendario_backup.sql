--
-- PostgreSQL database dump
--

\restrict g13L73a1bxsJHBmqwMB7OAYZRfcMFOGpjp3t4rn4EHig2B8BQLfOKFufCPZDYWo

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: collaborators; Type: TABLE; Schema: public; Owner: calendario
--

CREATE TABLE public.collaborators (
    email text NOT NULL,
    role text NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    password_hash text,
    CONSTRAINT collaborators_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text])))
);


ALTER TABLE public.collaborators OWNER TO calendario;

--
-- Name: events; Type: TABLE; Schema: public; Owner: calendario
--

CREATE TABLE public.events (
    id text NOT NULL,
    title text NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    cat_id text NOT NULL,
    location text DEFAULT ''::text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    canceled boolean DEFAULT false NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.events OWNER TO calendario;

--
-- Data for Name: collaborators; Type: TABLE DATA; Schema: public; Owner: calendario
--

COPY public.collaborators (email, role, added_at, password_hash) FROM stdin;
catarusconi@gmail.com	editor	2026-06-09 14:15:28.306453-04	scrypt$aa3d63bf256183b95d9162bc6ddf74eb$560bf9662196d20b3f0a2a7d1548ccabe51c79ce7c882490beeee17434464865567326987d6c590cc44295c9af70680622727037b4118a63f58d3469546481c5
eloboss@fen.uchile.cl	owner	2026-06-09 14:15:28.306453-04	scrypt$7d1cdb1bc7277312cd1d1ecf4971f6c8$418228868d4e263018b7c6c27b35735a09bce6ef59b1ea011ca96c3faff6f309f3f86e25549f4fe401733ac8d4b135c85193d48971f97ad0e80029c058839e3c
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: calendario
--

COPY public.events (id, title, start_at, end_at, cat_id, location, notes, canceled, created_by, created_at, updated_at) FROM stdin;
santander-1	Ing. de Prompts — Banco Santander	2026-05-11 11:30:00-04	2026-05-11 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 1 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.315703-04	2026-06-09 14:15:28.315703-04
santander-2	Ing. de Prompts — Banco Santander	2026-05-13 11:30:00-04	2026-05-13 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 2 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.33354-04	2026-06-09 14:15:28.33354-04
santander-3	Ing. de Prompts — Banco Santander	2026-05-25 11:30:00-04	2026-05-25 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 3 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.342438-04	2026-06-09 14:15:28.342438-04
santander-4	Ing. de Prompts — Banco Santander	2026-06-01 11:30:00-04	2026-06-01 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 4 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.353267-04	2026-06-09 14:15:28.353267-04
santander-5	Ing. de Prompts — Banco Santander	2026-06-03 11:30:00-04	2026-06-03 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 5 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.365128-04	2026-06-09 14:15:28.365128-04
santander-6	Ing. de Prompts — Banco Santander	2026-06-08 11:30:00-04	2026-06-08 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 6 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.374318-04	2026-06-09 14:15:28.374318-04
santander-7	Ing. de Prompts — Banco Santander	2026-06-10 11:30:00-04	2026-06-10 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 7 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.382481-04	2026-06-09 14:15:28.382481-04
santander-8	Ing. de Prompts — Banco Santander	2026-06-15 11:30:00-04	2026-06-15 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 8 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.395923-04	2026-06-09 14:15:28.395923-04
santander-9	Ing. de Prompts — Banco Santander	2026-06-17 11:30:00-04	2026-06-17 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 9 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.40367-04	2026-06-09 14:15:28.40367-04
santander-10	Ing. de Prompts — Banco Santander	2026-06-22 11:30:00-04	2026-06-22 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 10 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.414003-04	2026-06-09 14:15:28.414003-04
santander-11	Ing. de Prompts — Banco Santander	2026-06-24 11:30:00-04	2026-06-24 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 11 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.42176-04	2026-06-09 14:15:28.42176-04
santander-12	Ing. de Prompts — Banco Santander	2026-07-01 11:30:00-04	2026-07-01 13:30:00-04	fen_santander	En vivo · MS Teams	Sesión 12 de 12 · Coord. Nataly Rengifo Torres	f	\N	2026-06-09 14:15:28.428444-04	2026-06-09 14:15:28.428444-04
santander-online-1	Ing. de Prompts — Santander · Online	2026-08-03 09:00:00-04	2026-08-03 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 1 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.435368-04	2026-06-09 14:15:28.435368-04
santander-online-2	Ing. de Prompts — Santander · Online	2026-08-05 09:00:00-04	2026-08-05 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 2 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.44508-04	2026-06-09 14:15:28.44508-04
santander-online-3	Ing. de Prompts — Santander · Online	2026-08-10 09:00:00-04	2026-08-10 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 3 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.452409-04	2026-06-09 14:15:28.452409-04
santander-online-4	Ing. de Prompts — Santander · Online	2026-08-12 09:00:00-04	2026-08-12 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 4 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.459631-04	2026-06-09 14:15:28.459631-04
santander-online-5	Ing. de Prompts — Santander · Online	2026-08-17 09:00:00-04	2026-08-17 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 5 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.467943-04	2026-06-09 14:15:28.467943-04
santander-online-6	Ing. de Prompts — Santander · Online	2026-08-19 09:00:00-04	2026-08-19 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 6 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.476501-04	2026-06-09 14:15:28.476501-04
santander-online-7	Ing. de Prompts — Santander · Online	2026-08-24 09:00:00-04	2026-08-24 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 7 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.484563-04	2026-06-09 14:15:28.484563-04
santander-online-8	Ing. de Prompts — Santander · Online	2026-08-26 09:00:00-04	2026-08-26 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 8 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.494766-04	2026-06-09 14:15:28.494766-04
santander-online-9	Ing. de Prompts — Santander · Online	2026-08-31 09:00:00-04	2026-08-31 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 9 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.503299-04	2026-06-09 14:15:28.503299-04
santander-online-10	Ing. de Prompts — Santander · Online	2026-09-02 09:00:00-04	2026-09-02 11:00:00-04	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 10 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.511768-04	2026-06-09 14:15:28.511768-04
santander-online-11	Ing. de Prompts — Santander · Online	2026-09-07 09:00:00-03	2026-09-07 11:00:00-03	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 11 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.607304-04	2026-06-09 14:15:28.607304-04
santander-online-12	Ing. de Prompts — Santander · Online	2026-09-09 09:00:00-03	2026-09-09 11:00:00-03	fen_santander	En vivo · MS Teams (desde sala habilitada en Banco Santander)	Sesión 12 de 12 · Grupo Online · se dicta desde Santander · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.617711-04	2026-06-09 14:15:28.617711-04
santander-presencial-1	Ing. de Prompts — Santander · Presencial	2026-08-03 11:30:00-04	2026-08-03 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 1 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.627502-04	2026-06-09 14:15:28.627502-04
santander-presencial-2	Ing. de Prompts — Santander · Presencial	2026-08-05 11:30:00-04	2026-08-05 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 2 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.635699-04	2026-06-09 14:15:28.635699-04
santander-presencial-3	Ing. de Prompts — Santander · Presencial	2026-08-10 11:30:00-04	2026-08-10 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 3 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.643348-04	2026-06-09 14:15:28.643348-04
santander-presencial-4	Ing. de Prompts — Santander · Presencial	2026-08-12 11:30:00-04	2026-08-12 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 4 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.651551-04	2026-06-09 14:15:28.651551-04
santander-presencial-5	Ing. de Prompts — Santander · Presencial	2026-08-17 11:30:00-04	2026-08-17 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 5 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.660179-04	2026-06-09 14:15:28.660179-04
santander-presencial-6	Ing. de Prompts — Santander · Presencial	2026-08-19 11:30:00-04	2026-08-19 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 6 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.669218-04	2026-06-09 14:15:28.669218-04
santander-presencial-7	Ing. de Prompts — Santander · Presencial	2026-08-24 11:30:00-04	2026-08-24 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 7 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.677821-04	2026-06-09 14:15:28.677821-04
santander-presencial-8	Ing. de Prompts — Santander · Presencial	2026-08-26 11:30:00-04	2026-08-26 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 8 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.686703-04	2026-06-09 14:15:28.686703-04
santander-presencial-9	Ing. de Prompts — Santander · Presencial	2026-08-31 11:30:00-04	2026-08-31 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 9 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.695393-04	2026-06-09 14:15:28.695393-04
santander-presencial-10	Ing. de Prompts — Santander · Presencial	2026-09-02 11:30:00-04	2026-09-02 13:30:00-04	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 10 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.706125-04	2026-06-09 14:15:28.706125-04
santander-presencial-11	Ing. de Prompts — Santander · Presencial	2026-09-07 11:30:00-03	2026-09-07 13:30:00-03	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 11 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.718778-04	2026-06-09 14:15:28.718778-04
santander-presencial-12	Ing. de Prompts — Santander · Presencial	2026-09-09 11:30:00-03	2026-09-09 13:30:00-03	fen_santander	Presencial · dependencias Banco Santander (dirección por definir)	Sesión 12 de 12 · Grupo Presencial · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.728452-04	2026-06-09 14:15:28.728452-04
herramientas-1	Herramientas IA para la Productividad Profesional	2026-05-26 18:00:00-04	2026-05-26 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 1 de 4	f	\N	2026-06-09 14:15:28.742752-04	2026-06-09 14:15:28.742752-04
herramientas-2	Herramientas IA para la Productividad Profesional	2026-05-28 18:00:00-04	2026-05-28 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 2 de 4	f	\N	2026-06-09 14:15:28.758817-04	2026-06-09 14:15:28.758817-04
herramientas-3	Herramientas IA para la Productividad Profesional	2026-06-02 18:00:00-04	2026-06-02 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 3 de 4	f	\N	2026-06-09 14:15:28.774581-04	2026-06-09 14:15:28.774581-04
herramientas-4	Herramientas IA para la Productividad Profesional	2026-06-04 18:00:00-04	2026-06-04 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 4 de 4	f	\N	2026-06-09 14:15:28.783748-04	2026-06-09 14:15:28.783748-04
herramientas-jun-1	Herramientas IA para la Productividad Profesional	2026-06-23 17:00:00-04	2026-06-23 21:00:00-04	uai_postgrado	En vivo · Zoom	Clase 1 de 4 · 2da edición · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.805893-04	2026-06-09 14:15:28.805893-04
herramientas-jun-2	Herramientas IA para la Productividad Profesional	2026-06-25 17:00:00-04	2026-06-25 21:00:00-04	uai_postgrado	En vivo · Zoom	Clase 2 de 4 · 2da edición · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.821507-04	2026-06-09 14:15:28.821507-04
herramientas-jun-3	Herramientas IA para la Productividad Profesional	2026-06-30 17:00:00-04	2026-06-30 21:00:00-04	uai_postgrado	En vivo · Zoom	Clase 3 de 4 · 2da edición · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.837606-04	2026-06-09 14:15:28.837606-04
herramientas-jun-4	Herramientas IA para la Productividad Profesional	2026-07-02 17:00:00-04	2026-07-02 21:00:00-04	uai_postgrado	En vivo · Zoom	Clase 4 de 4 · 2da edición · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.893995-04	2026-06-09 14:15:28.893995-04
claude-code-design-1	Claude Code & Design	2026-08-04 18:00:00-04	2026-08-04 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 1 de 4 · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.904887-04	2026-06-09 14:15:28.904887-04
claude-code-design-2	Claude Code & Design	2026-08-06 18:00:00-04	2026-08-06 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 2 de 4 · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.914767-04	2026-06-09 14:15:28.914767-04
claude-code-design-3	Claude Code & Design	2026-08-11 18:00:00-04	2026-08-11 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 3 de 4 · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.92648-04	2026-06-09 14:15:28.92648-04
claude-code-design-4	Claude Code & Design	2026-08-13 18:00:00-04	2026-08-13 22:00:00-04	uai_postgrado	En vivo · Zoom	Clase 4 de 4 · Coord. Antares Luque Vergara	f	\N	2026-06-09 14:15:28.93812-04	2026-06-09 14:15:28.93812-04
ia-negocios	IA para los Negocios	2026-05-27 08:00:00-04	2026-05-27 18:00:00-04	uai_postgrado	Presencial · UAI Corporate	Jornada completa · UAI Corporate	f	\N	2026-06-09 14:15:28.946172-04	2026-06-09 14:15:28.946172-04
latam-discovery-may26	Reunión LATAM · Giselle Perey	2026-05-26 17:00:00-04	2026-05-26 18:00:00-04	personal	Online · por confirmar	Discovery training IA · VP Personas LATAM · OJO cortar 17:55 sí o sí para alcanzar Herramientas IA UAI 18:00	f	\N	2026-06-09 14:15:28.953434-04	2026-06-09 14:15:28.953434-04
cine-diablo-jun3	Cine con Cata · El Diablo Viste a la Moda 2	2026-06-03 20:30:00-04	2026-06-03 22:30:00-04	personal	Cinemark Alto Las Condes · Sala 1 Premier · Butacas G-10, G-11 · Av. Kennedy 9001, Local 3092	Código retiro: WJQTJWW · Pre NT SUB · pagado con tarjeta ($12.800)	f	\N	2026-06-09 14:15:28.964465-04	2026-06-09 14:15:28.964465-04
florida-1	Herramientas IA — Muni La Florida	2026-06-15 15:00:00-04	2026-06-15 18:15:00-04	muni_florida	En vivo · Zoom	Sesión 1 de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.97334-04	2026-06-09 14:15:28.97334-04
florida-2	Herramientas IA — Muni La Florida	2026-06-17 15:00:00-04	2026-06-17 18:15:00-04	muni_florida	En vivo · Zoom	Sesión 2 de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.98021-04	2026-06-09 14:15:28.98021-04
florida-3	Herramientas IA — Muni La Florida	2026-06-22 15:00:00-04	2026-06-22 18:15:00-04	muni_florida	En vivo · Zoom	Sesión 3 de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.987177-04	2026-06-09 14:15:28.987177-04
florida-4	Herramientas IA — Muni La Florida	2026-06-24 15:00:00-04	2026-06-24 18:15:00-04	muni_florida	En vivo · Zoom	Sesión 4 de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:28.996056-04	2026-06-09 14:15:28.996056-04
florida-5	Herramientas IA — Muni La Florida	2026-07-01 15:00:00-04	2026-07-01 18:00:00-04	muni_florida	En vivo · Zoom	Sesión 5 de 5 · Muni La Florida (remoto) · Coord. Raysa Castillo	f	\N	2026-06-09 14:15:29.007556-04	2026-06-09 14:15:29.007556-04
sistinfo-1	Sistemas de Información	2026-05-07 08:30:00-04	2026-05-07 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 1 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.014742-04	2026-06-09 14:15:29.014742-04
sistinfo-2	Sistemas de Información	2026-05-14 08:30:00-04	2026-05-14 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 2 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.022487-04	2026-06-09 14:15:29.022487-04
sistinfo-3	Sistemas de Información	2026-05-21 08:30:00-04	2026-05-21 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 3 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.029964-04	2026-06-09 14:15:29.029964-04
sistinfo-4	Sistemas de Información	2026-05-28 08:30:00-04	2026-05-28 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 4 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.128852-04	2026-06-09 14:15:29.128852-04
sistinfo-5	Sistemas de Información	2026-06-04 08:30:00-04	2026-06-04 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 5 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.136805-04	2026-06-09 14:15:29.136805-04
sistinfo-6	Sistemas de Información	2026-06-11 08:30:00-04	2026-06-11 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 6 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.147267-04	2026-06-09 14:15:29.147267-04
sistinfo-7	Sistemas de Información	2026-06-18 08:30:00-04	2026-06-18 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 7 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.154814-04	2026-06-09 14:15:29.154814-04
sistinfo-8	Sistemas de Información	2026-06-25 08:30:00-04	2026-06-25 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 8 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.163155-04	2026-06-09 14:15:29.163155-04
sistinfo-9	Sistemas de Información	2026-07-02 08:30:00-04	2026-07-02 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 9 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.170453-04	2026-06-09 14:15:29.170453-04
sistinfo-10	Sistemas de Información	2026-07-09 08:30:00-04	2026-07-09 11:10:00-04	uai_fic	Presencial · UAI Peñalolén · FIC	Sesión 10 de 10 · Ing. Civil 4° año	f	\N	2026-06-09 14:15:29.178477-04	2026-06-09 14:15:29.178477-04
\.


--
-- Name: collaborators collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: calendario
--

ALTER TABLE ONLY public.collaborators
    ADD CONSTRAINT collaborators_pkey PRIMARY KEY (email);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: calendario
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events_start_idx; Type: INDEX; Schema: public; Owner: calendario
--

CREATE INDEX events_start_idx ON public.events USING btree (start_at);


--
-- PostgreSQL database dump complete
--

\unrestrict g13L73a1bxsJHBmqwMB7OAYZRfcMFOGpjp3t4rn4EHig2B8BQLfOKFufCPZDYWo

