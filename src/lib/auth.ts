import { SignJWT, jwtVerify } from "jose";

export type Role = "owner" | "editor" | "viewer";

// ──────────────────────────────────────────────────────────────────────────
// JWT (stateless). El rol va dentro del token de sesión, así el middleware
// (edge, sin acceso a DB/TCP) solo verifica la firma — la allowlist contra la
// DB se chequea en login (Node runtime) y en cada Server Action de escritura.
// ──────────────────────────────────────────────────────────────────────────
export const SESSION_COOKIE = "calendario_session";
const ISSUER = "calendario-edu";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no configurado");
  return new TextEncoder().encode(s);
}

export async function signSessionToken(email: string, role: Role): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), role, kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export interface Session {
  email: string;
  role: Role;
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    if (payload.kind !== "session") return null;
    if (typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    return { email: payload.email, role: payload.role as Role };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 días
