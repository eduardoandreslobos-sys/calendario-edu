import { type NextRequest, NextResponse } from "next/server";
import { verifyMagic, signSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { roleForEmail } from "@/lib/access";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") ?? undefined;
  const magic = await verifyMagic(token);
  const role = magic ? await roleForEmail(magic.email) : null;

  if (!magic || !role) {
    return NextResponse.redirect(new URL("/login?error=link-invalido", req.url));
  }

  const session = await signSessionToken(magic.email, role);
  const res = NextResponse.redirect(new URL("/", req.url));
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
