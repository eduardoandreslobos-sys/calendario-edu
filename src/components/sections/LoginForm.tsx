"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase/client";

interface Props {
  next?: string;
}

export function LoginForm({ next }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        const auth = getFirebaseAuth();
        const result = await signInWithPopup(auth, googleProvider());
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const idToken = await result.user.getIdToken();

        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            accessToken: credential?.accessToken ?? null,
            profile: {
              email: result.user.email,
              name: result.user.displayName,
              picture: result.user.photoURL,
            },
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        router.push(next ?? "/");
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Si el usuario cierra la popup de Google, no es un error real.
        if (msg.includes("popup-closed") || msg.includes("cancelled-popup-request")) {
          return;
        }
        setError(msg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[color:var(--color-ink)] text-white px-5 py-3 text-[14px] font-semibold tracking-[-0.005em] transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--color-ink-soft)] focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2"
      >
        <GoogleIcon />
        {pending ? "Conectando…" : "Continuar con Google"}
      </button>

      <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] mt-2">
        Acceso restringido · solo correos autorizados
      </p>

      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29.1 35.1 26.7 36 24 36c-5.1 0-9.5-3.3-11.2-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.8 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
