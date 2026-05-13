import { type NextRequest, NextResponse } from "next/server";
import {
  createSessionCookieFromIdToken,
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  adminDb,
} from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  let body: {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    profile?: { email?: string | null; name?: string | null; picture?: string | null };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  let sessionCookie: string;
  try {
    sessionCookie = await createSessionCookieFromIdToken(body.idToken);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "verify failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  // Persist Google OAuth tokens for Calendar API (server-side only).
  // Decoded uid pulled from session cookie verify in a follow-up read.
  if (body.accessToken) {
    try {
      const { verifySessionCookie } = await import("@/lib/firebase/admin");
      const decoded = await verifySessionCookie(sessionCookie);
      if (decoded) {
        await adminDb()
          .collection("users")
          .doc(decoded.uid)
          .set(
            {
              google: {
                accessToken: body.accessToken,
                refreshToken: body.refreshToken ?? null,
                tokenUpdatedAt: FieldValue.serverTimestamp(),
              },
              profile: body.profile ?? {},
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      }
    } catch (err) {
      console.error("persist google tokens:", err);
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionCookie,
    maxAge: SESSION_DURATION_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
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
