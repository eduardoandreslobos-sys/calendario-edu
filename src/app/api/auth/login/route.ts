import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, type Role } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
    password = typeof body?.password === "string" ? body.password : undefined;
  } catch {}

  if (!email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const rows = await sql<{ role: Role; password_hash: string | null }[]>`
    SELECT role, password_hash FROM collaborators WHERE email = ${email} LIMIT 1`;
  const row = rows[0];

  const ok = row ? await verifyPassword(password, row.password_hash) : false;
  if (!ok || !row) {
    // Mensaje genérico (no revelar si el correo existe).
    return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  }

  const session = await signSessionToken(email, row.role);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: session,
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}
