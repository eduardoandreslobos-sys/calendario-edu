import { NextResponse, type NextRequest } from "next/server";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/firebase/admin";
import { isAllowed } from "@/lib/firebase/allowlist";

const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  // Sin config = modo público read-only (dev sin Firebase).
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const decoded = await verifySessionCookie(cookie);
  const emailAllowed = decoded ? await isAllowed(decoded.email) : false;
  const authed = decoded && emailAllowed;

  if (!authed && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Si el cookie existía pero el email no está allowlisted, limpia.
    const res = NextResponse.redirect(url);
    if (cookie && decoded && !emailAllowed) {
      res.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      url.searchParams.set("error", "no-autorizado");
    } else {
      url.searchParams.set("next", pathname);
    }
    return res;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
