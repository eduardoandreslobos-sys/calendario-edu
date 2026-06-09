import { type NextRequest, NextResponse } from "next/server";
import { signMagicToken } from "@/lib/auth";
import { isAllowed } from "@/lib/access";
import { sendMagicLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {}

  if (!email) {
    return NextResponse.json({ error: "Falta el correo" }, { status: 400 });
  }

  // Anti-enumeración: siempre ok, pero solo enviamos si está autorizado.
  if (await isAllowed(email)) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
      const token = await signMagicToken(email);
      const link = `${origin}/api/auth/callback?token=${encodeURIComponent(token)}`;
      await sendMagicLink(email, link);
    } catch (err) {
      console.error("magic link:", err);
      return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
