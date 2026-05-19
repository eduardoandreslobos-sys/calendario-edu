import { type NextRequest, NextResponse } from "next/server";
import { isAllowed } from "@/lib/firebase/allowlist";

/**
 * Pre-check de allowlist antes de enviar el magic link.
 * Evita que Firebase Auth mande un email a un correo que después no podrá entrar.
 *
 * No revela si el email existe en Firebase Auth ni quién es el dueño:
 * solo retorna { allowed: boolean }.
 */
export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email : undefined;
  } catch {}

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const allowed = await isAllowed(email);
  return NextResponse.json({ allowed });
}
