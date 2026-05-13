import { NextResponse, type NextRequest } from "next/server";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/firebase/admin";

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

  if (!decoded && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
