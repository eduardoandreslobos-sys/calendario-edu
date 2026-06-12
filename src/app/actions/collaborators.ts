"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireOwner } from "@/lib/access";

const OWNER_EMAIL = "eloboss@fen.uchile.cl";

const addSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  role: z.enum(["editor", "viewer"]),
});

export async function addCollaborator(formData: FormData) {
  await requireOwner();
  const parsed = addSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { email, role } = parsed.data;
  if (email === OWNER_EMAIL) {
    return { ok: false as const, error: "Ese correo ya es el dueño." };
  }
  await sql`INSERT INTO collaborators (email, role) VALUES (${email}, ${role})
    ON CONFLICT (email) DO UPDATE SET role=EXCLUDED.role`;
  revalidatePath("/");
  return { ok: true as const };
}

export async function removeCollaborator(email: string) {
  await requireOwner();
  const e = email.toLowerCase().trim();
  if (e === OWNER_EMAIL) return { ok: false as const, error: "No puedes quitar al dueño." };
  await sql`DELETE FROM collaborators WHERE email=${e}`;
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateCollaboratorRole(email: string, role: "editor" | "viewer") {
  await requireOwner();
  const e = email.toLowerCase().trim();
  if (e === OWNER_EMAIL) return { ok: false as const, error: "No puedes cambiar el rol del dueño." };
  await sql`UPDATE collaborators SET role=${role} WHERE email=${e}`;
  revalidatePath("/");
  return { ok: true as const };
}
