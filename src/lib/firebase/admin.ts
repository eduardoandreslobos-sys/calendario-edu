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

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "nodo-build";

  // Vercel / cualquier host fuera de GCP: service account JSON en base64 via env.
  // Cloud Run / GCE / App Hosting / local con gcloud: ADC automático (fallback).
  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (saB64) {
    const json = JSON.parse(Buffer.from(saB64, "base64").toString("utf8"));
    _app = initializeApp({ credential: cert(json), projectId });
    return _app;
  }

  _app = initializeApp({ credential: applicationDefault(), projectId });
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
