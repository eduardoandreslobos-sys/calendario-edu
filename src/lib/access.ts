import "server-only";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifySession, SESSION_COOKIE, type Role } from "@/lib/auth";

export async function roleForEmail(email: string | null | undefined): Promise<Role | null> {
  if (!email) return null;
  const rows = await sql<{ role: Role }[]>`
    SELECT role FROM collaborators WHERE email = ${email.toLowerCase()} LIMIT 1`;
  return rows[0]?.role ?? null;
}

export async function isAllowed(email: string | null | undefined): Promise<boolean> {
  return (await roleForEmail(email)) !== null;
}

export interface CurrentUser {
  email: string;
  role: Role;
}

/**
 * Usuario actual desde la cookie de sesión, re-verificando el rol contra la DB
 * (así una revocación tiene efecto inmediato en escrituras).
 */
export async function currentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const role = await roleForEmail(session.email);
  if (!role) return null; // revocado
  return { email: session.email, role };
}

export async function requireWriter(): Promise<CurrentUser> {
  const u = await currentUser();
  if (!u) throw new Error("No autenticado");
  if (u.role !== "owner" && u.role !== "editor") throw new Error("Sin permiso de edición");
  return u;
}

export async function requireOwner(): Promise<CurrentUser> {
  const u = await currentUser();
  if (!u) throw new Error("No autenticado");
  if (u.role !== "owner") throw new Error("Solo el dueño puede hacer esto");
  return u;
}
