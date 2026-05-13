import "server-only";
import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;

function getApp(): App {
  if (_app) return _app;
  const existing = getApps()[0];
  if (existing) {
    _app = existing;
    return _app;
  }

  // En App Hosting / Cloud Run / GCE: ADC automático.
  // Localmente con GOOGLE_APPLICATION_CREDENTIALS apuntando a un service account JSON.
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "nodo-build";

  _app = initializeApp({
    credential: applicationDefault(),
    projectId,
  });
  return _app;
}

export function adminAuth(): Auth {
  return getAuth(getApp());
}

export function adminDb(): Firestore {
  return getFirestore(getApp());
}

export const SESSION_COOKIE = "__session";
export const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 días

export async function createSessionCookieFromIdToken(idToken: string) {
  return adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
}

export async function verifySessionCookie(sessionCookie: string | undefined) {
  if (!sessionCookie) return null;
  try {
    return await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
