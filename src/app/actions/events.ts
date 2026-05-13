"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EVENTS as STATIC_EVENTS } from "@/lib/events";
import { chileISO } from "@/lib/tz";
import type { CatId } from "@/lib/cats";

const CAT_VALUES = [
  "uai_postgrado","uai_fic","fen_santander","fen_hc","fen_basica","geforce","nodo","personal",
] as const;

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  cat_id: z.enum(CAT_VALUES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  time_start: z.string().regex(/^\d{2}:\d{2}$/, "Hora inicio inválida"),
  time_end: z.string().regex(/^\d{2}:\d{2}$/, "Hora término inválida"),
  location: z.string().max(500).default(""),
  notes: z.string().max(2000).default(""),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export async function upsertEvent(formData: FormData) {
  const { supabase, user } = await getUser();

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

  const start_at = chileISO(`${d.date}T${d.time_start}:00`);
  const end_at = chileISO(`${d.date}T${d.time_end}:00`);

  if (new Date(end_at) <= new Date(start_at)) {
    return { ok: false as const, error: "Hora término debe ser posterior a la de inicio" };
  }

  if (d.id) {
    const { error } = await supabase
      .from("events")
      .update({ title: d.title, cat_id: d.cat_id, start_at, end_at, location: d.location, notes: d.notes })
      .eq("id", d.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      title: d.title,
      cat_id: d.cat_id,
      start_at,
      end_at,
      location: d.location,
      notes: d.notes,
    });
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/");
  return { ok: true as const };
}

export async function setCanceled(id: string, canceled: boolean) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("events").update({ canceled }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteEvent(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

/**
 * Seed the user's calendar with the 63 academic events. Idempotent: the
 * (user_id, external_id) unique index prevents duplicates.
 */
export async function seedAcademicEvents() {
  const { supabase, user } = await getUser();

  const rows = STATIC_EVENTS.map((e) => ({
    user_id: user.id,
    external_id: e.id,
    title: e.title,
    cat_id: e.catId as CatId,
    start_at: chileISO(e.start),
    end_at: chileISO(e.end),
    location: e.location,
    notes: e.notes,
    canceled: false,
  }));

  const { error } = await supabase
    .from("events")
    .upsert(rows, { onConflict: "user_id,external_id", ignoreDuplicates: true });

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  return { ok: true as const, inserted: rows.length };
}
