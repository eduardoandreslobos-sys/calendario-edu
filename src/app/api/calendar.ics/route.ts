import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CATS, type CatId } from "@/lib/cats";

// Feed público de solo lectura, protegido por token en la URL en vez de la
// cookie de sesión (Google/Outlook no pueden iniciar sesión para leerlo).
// El token vive en ICS_FEED_TOKEN, mismo modelo que Outlook usa para sus
// links "Publish a calendar": un secreto largo en la URL, no una cuenta.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

interface Row {
  id: string;
  title: string;
  start_at: Date;
  end_at: Date;
  cat_id: CatId;
  location: string;
  notes: string;
  canceled: boolean;
  updated_at: Date;
}

// RFC 5545: líneas de máx. 75 octetos, continuación con salto + espacio.
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= 75) return line;
  const out: Buffer[] = [];
  let rest = bytes;
  while (rest.length > 75) {
    let cut = 75;
    // no cortar a mitad de un carácter multibyte UTF-8
    while (cut > 0 && (rest[cut] & 0xc0) === 0x80) cut--;
    out.push(rest.subarray(0, cut));
    rest = Buffer.concat([Buffer.from(" "), rest.subarray(cut)]);
  }
  out.push(rest);
  return out.map((b) => b.toString("utf-8")).join("\r\n");
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Hora local Chile en formato flotante (sin offset): TZID=America/Santiago
// se encarga de la conversión real, incluido cualquier cambio de horario
// futuro — no hay que recalcular el offset a mano por evento.
function localStamp(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}${g("month")}${g("day")}T${g("hour")}${g("minute")}${g("second")}`;
}

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Santiago",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0300",
  "TZNAME:-03",
  "DTSTART:19700906T000000",
  "RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0300",
  "TZOFFSETTO:-0400",
  "TZNAME:-04",
  "DTSTART:19700405T000000",
  "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\r\n");

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.ICS_FEED_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Feed no configurado" }, { status: 503 });
  }
  if (!token || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 403 });
  }

  const rows = await sql<Row[]>`
    SELECT id, title, start_at, end_at, cat_id, location, notes, canceled, updated_at
    FROM events ORDER BY start_at ASC`;

  const now = stamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calendario Edu//eloboss@fen.uchile.cl//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Calendario Edu",
    "X-WR-TIMEZONE:America/Santiago",
    VTIMEZONE,
  ];

  for (const r of rows) {
    const catName = CATS[r.cat_id]?.name ?? r.cat_id;
    const notes = [r.notes, r.location ? `Lugar: ${r.location}` : ""].filter(Boolean).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@calendario-edu.eloboss`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=America/Santiago:${localStamp(r.start_at)}`,
      `DTEND;TZID=America/Santiago:${localStamp(r.end_at)}`,
      fold(`SUMMARY:${esc(r.title)}`),
      fold(`CATEGORIES:${esc(catName)}`),
    );
    if (r.location) lines.push(fold(`LOCATION:${esc(r.location)}`));
    if (notes) lines.push(fold(`DESCRIPTION:${esc(notes)}`));
    lines.push(
      `STATUS:${r.canceled ? "CANCELLED" : "CONFIRMED"}`,
      `LAST-MODIFIED:${stamp(r.updated_at)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  const body = lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendario-edu.ics"',
      "Cache-Control": "private, max-age=1800",
    },
  });
}
