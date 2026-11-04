"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/access";
import { createBridgeEvent, deleteBridgeEvent, updateBridgeEvent } from "@/lib/gcal-bridge";

// Acciones sobre el calendario de Google (FEN). Solo el dueño puede usarlas, y solo si el
// puente de Google está configurado; el control real de permisos lo hace Google.
const schema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_@.\-]{1,200}$/).optional(),
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_start: z.string().regex(/^\d{2}:\d{2}$/),
  time_end: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(500).default(""),
});

export async function saveExternalEvent(formData: FormData) {
  await requireOwner();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    date: formData.get("date"),
    time_start: formData.get("time_start"),
    time_end: formData.get("time_end"),
    location: formData.get("location") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const d = parsed.data;
  if (d.time_end <= d.time_start) {
    return { ok: false as const, error: "Hora término debe ser posterior a la de inicio" };
  }
  const fields = {
    title: d.title,
    start: `${d.date}T${d.time_start}:00`,
    end: `${d.date}T${d.time_end}:00`,
    location: d.location,
  };
  const r = d.id ? await updateBridgeEvent(d.id, fields) : await createBridgeEvent(fields);
  if (!r.ok) return { ok: false as const, error: r.error };
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteExternalEvent(id: string) {
  await requireOwner();
  if (!/^[A-Za-z0-9_@.\-]{1,200}$/.test(id)) return { ok: false as const, error: "Evento inválido" };
  const r = await deleteBridgeEvent(id);
  if (!r.ok) return { ok: false as const, error: r.error };
  revalidatePath("/");
  return { ok: true as const };
}
