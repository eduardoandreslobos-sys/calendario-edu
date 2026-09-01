import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// /api/calendar.ics hace su propia autenticación por token en la URL (no hay
// cookie de sesión posible: Google/Outlook no inician sesión para leerlo).
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/calendar.ics", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  if (!process.env.AUTH_SECRET) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request });
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    if (request.cookies.get(SESSION_COOKIE)) {
      res.cookies.set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/" });
    }
    return res;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
