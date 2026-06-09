import "server-only";
import { SignJWT, jwtVerify } from "jose";

// ──────────────────────────────────────────────────────────────────────────
// Allowlist (fuente de verdad de quién entra y con qué rol)
// Override de emails via env ALLOWED_OWNER / ALLOWED_VIEWERS (CSV) si hace falta.
// ──────────────────────────────────────────────────────────────────────────
export type Role = "owner" | "viewer";

const OWNER = (process.env.ALLOWED_OWNER ?? "eduardoandres.lobos@gmail.com").toLowerCase();
const VIEWERS = (process.env.ALLOWED_VIEWERS ?? "catarusconi@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function roleFor(email: string | null | undefined): Role | null {
  if (!email) return null;
  const e = email.toLowerCase();
  if (e === OWNER) return "owner";
  if (VIEWERS.includes(e)) return "viewer";
  return null;
}

export function isAllowed(email: string | null | undefined): boolean {
  return roleFor(email) !== null;
}

// ──────────────────────────────────────────────────────────────────────────
// JWT (stateless) — token de magic link (corto) + cookie de sesión (largo)
// ──────────────────────────────────────────────────────────────────────────
export const SESSION_COOKIE = "calendario_session";
const ISSUER = "calendario-edu";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no configurado");
  return new TextEncoder().encode(s);
}

export async function signMagicToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), kind: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret());
}

export async function signSessionToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken(
  token: string | undefined,
  kind: "magic" | "session",
): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    if (payload.kind !== kind) return null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email || !isAllowed(email)) return null;
    return { email };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos
