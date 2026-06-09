import { type NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  signSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") ?? undefined;
  const verified = await verifyToken(token, "magic");

  if (!verified) {
    return NextResponse.redirect(new URL("/login?error=link-invalido", req.url));
  }

  const session = await signSessionToken(verified.email);
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
