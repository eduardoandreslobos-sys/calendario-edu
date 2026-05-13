import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}
