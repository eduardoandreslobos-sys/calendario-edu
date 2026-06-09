import { type NextRequest, NextResponse } from "next/server";
import { isAllowed, signMagicToken } from "@/lib/auth";
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

  // No revelamos si el correo está o no autorizado (anti-enumeración):
  // siempre respondemos ok, pero solo enviamos si está en la allowlist.
  if (isAllowed(email)) {
    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
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
