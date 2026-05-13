"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase Web config is public by design — safe to commit.
// https://firebase.google.com/docs/projects/api-keys
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyB6WY_spuwZwap_IN_6IL2Vas2wMZGLjtE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "nodo-build.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "nodo-build",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:770391066863:web:e047119fe7d9847306731a",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

/**
 * Google sign-in provider with Calendar scope.
 * Kept for the optional "Connect Google Calendar" flow (needs an OAuth client
 * configured in GCP Console; see README setup).
 */
export function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar.events");
  provider.setCustomParameters({
    prompt: "consent",
    access_type: "offline",
  });
  return provider;
}
