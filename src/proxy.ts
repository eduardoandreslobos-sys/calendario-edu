import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  // Sin AUTH_SECRET = modo público (dev sin auth configurada).
  if (!process.env.AUTH_SECRET) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request });
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const verified = await verifyToken(session, "session");

  if (!verified) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    if (session) {
      // cookie inválida/expirada/revocada → limpiar
      res.cookies.set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/" });
    }
    return res;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
