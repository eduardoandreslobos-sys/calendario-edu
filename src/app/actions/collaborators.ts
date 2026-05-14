"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { calendarRef, requireOwner, OWNER_EMAIL } from "@/lib/calendar-access";

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
  await calendarRef().set(
    {
      collaborators: {
        [email]: {
          role,
          addedAt: FieldValue.serverTimestamp(),
        },
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  revalidatePath("/");
  return { ok: true as const };
}

export async function removeCollaborator(email: string) {
  await requireOwner();
  const e = email.toLowerCase().trim();
  await calendarRef().set(
    {
      collaborators: {
        [e]: FieldValue.delete(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateCollaboratorRole(email: string, role: "editor" | "viewer") {
  await requireOwner();
  const e = email.toLowerCase().trim();
  await calendarRef().set(
    {
      collaborators: { [e]: { role } },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  revalidatePath("/");
  return { ok: true as const };
}
