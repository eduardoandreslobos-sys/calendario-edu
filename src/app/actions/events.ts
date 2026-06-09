"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireWriter } from "@/lib/access";
import { chileISO } from "@/lib/tz";

const CAT_VALUES = [
  "uai_postgrado","uai_fic","fen_santander","fen_hc","fen_basica","muni_florida","geforce","nodo","personal",
] as const;

const upsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  cat_id: z.enum(CAT_VALUES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_start: z.string().regex(/^\d{2}:\d{2}$/),
  time_end: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(500).default(""),
  notes: z.string().max(2000).default(""),
});

function genId() {
  return "ev-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function upsertEvent(formData: FormData) {
  const user = await requireWriter();

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    cat_id: formData.get("cat_id"),
    date: formData.get("date"),
    time_start: formData.get("time_start"),
    time_end: formData.get("time_end"),
    location: formData.get("location") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const d = parsed.data;
  const startISO = chileISO(`${d.date}T${d.time_start}:00`);
  const endISO = chileISO(`${d.date}T${d.time_end}:00`);
  if (new Date(endISO) <= new Date(startISO)) {
    return { ok: false as const, error: "Hora término debe ser posterior a la de inicio" };
  }

  if (d.id) {
    await sql`UPDATE events SET
      title=${d.title}, cat_id=${d.cat_id}, start_at=${startISO}, end_at=${endISO},
      location=${d.location}, notes=${d.notes}, updated_at=now()
      WHERE id=${d.id}`;
  } else {
    await sql`INSERT INTO events (id,title,cat_id,start_at,end_at,location,notes,created_by)
      VALUES (${genId()},${d.title},${d.cat_id},${startISO},${endISO},${d.location},${d.notes},${user.email})`;
  }
  revalidatePath("/");
  return { ok: true as const };
}

export async function setCanceled(id: string, canceled: boolean) {
  await requireWriter();
  await sql`UPDATE events SET canceled=${canceled}, updated_at=now() WHERE id=${id}`;
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteEvent(id: string) {
  await requireWriter();
  await sql`DELETE FROM events WHERE id=${id}`;
  revalidatePath("/");
  return { ok: true as const };
}
