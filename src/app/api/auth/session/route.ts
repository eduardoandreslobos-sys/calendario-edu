import { type NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  createSessionCookieFromIdToken,
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  adminAuth,
  adminDb,
  verifySessionCookie,
} from "@/lib/firebase/admin";
import { isAllowed } from "@/lib/firebase/allowlist";

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

  // Verify the ID token directly so we can check the allowlist *before*
  // minting a session cookie or persisting anything.
  let uid: string;
  let email: string | null;
  try {
    const decoded = await adminAuth().verifyIdToken(body.idToken);
    uid = decoded.uid;
    email = decoded.email ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "verify failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  if (!isAllowed(email)) {
    // Defense-in-depth: nuke the just-created Firebase Auth user so this email
    // can't accumulate state by repeated attempts.
    try {
      await adminAuth().deleteUser(uid);
    } catch (err) {
      console.error("deleteUser:", err);
    }
    return NextResponse.json(
      { error: "Acceso restringido. Tu correo no está autorizado para usar este calendario." },
      { status: 403 },
    );
  }

  // Mint session cookie.
  let sessionCookie: string;
  try {
    sessionCookie = await createSessionCookieFromIdToken(body.idToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "cookie mint failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  // Persist Google OAuth tokens for Calendar API (optional, only if user
  // signed in with Google provider and Calendar scope granted).
  if (body.accessToken) {
    try {
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
