"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface Props {
  next?: string;
}

const STORAGE_KEY = "calendario-edu:signin-email";

export function LoginForm({ next }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [completing, setCompleting] = useState(false);

  // If user landed back here from the magic link, finish sign-in.
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    setCompleting(true);
    let savedEmail = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (!savedEmail) {
      savedEmail = window.prompt("Confírmanos tu correo:") ?? "";
    }
    if (!savedEmail) {
      setError("Necesitamos tu correo para completar el inicio de sesión.");
      setCompleting(false);
      return;
    }

    signInWithEmailLink(auth, savedEmail, window.location.href)
      .then(async (result) => {
        const idToken = await result.user.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
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
        window.localStorage.removeItem(STORAGE_KEY);
        router.push(next ?? "/");
        router.refresh();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setCompleting(false);
      });
  }, [next, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        // 1. Pre-check de allowlist — no enviamos el magic link a correos no autorizados.
        const check = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!check.ok) {
          throw new Error("No se pudo verificar el correo. Reintenta.");
        }
        const { allowed } = (await check.json()) as { allowed: boolean };
        if (!allowed) {
          setError(
            "Este correo no está autorizado para usar este calendario. Si crees que debería estarlo, pídeselo al dueño.",
          );
          return;
        }

        // 2. Recién ahora pedimos a Firebase enviar el magic link.
        const auth = getFirebaseAuth();
        const origin =
          process.env.NEXT_PUBLIC_SITE_URL ??
          (typeof window !== "undefined" ? window.location.origin : "");
        const url = `${origin}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
        await sendSignInLinkToEmail(auth, email, {
          url,
          handleCodeInApp: true,
        });
        window.localStorage.setItem(STORAGE_KEY, email);
        setSent(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  if (completing) {
    return (
      <div className="rounded-xl border border-[color:var(--border-glass)] bg-white/60 p-5 text-sm">
        <p className="font-semibold mb-1">Iniciando sesión…</p>
        <p className="text-[color:var(--color-text-soft)]">Un momento.</p>
        {error && <p className="text-red-700 mt-2 text-[13px]">{error}</p>}
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[color:var(--border-glass)] bg-white/60 p-5 text-sm">
        <p className="font-semibold mb-1">✉︎ Revisa tu correo</p>
        <p className="text-[color:var(--color-text-soft)]">
          Te enviamos un enlace de acceso a{" "}
          <span className="font-mono text-[12px]">{email}</span>. Ábrelo desde
          este mismo dispositivo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium">
        Correo
      </label>
      <input
        type="email"
        required
        autoFocus
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        className="w-full rounded-xl border border-[color:var(--border-glass-strong)] bg-white/80 px-4 py-3 text-[15px] font-medium outline-none transition-all duration-200 ease-out focus:border-[color:var(--color-ink)] focus:bg-white"
      />
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !email}
        className="rounded-xl bg-[color:var(--color-ink)] text-white px-5 py-3 text-[14px] font-semibold tracking-[-0.005em] transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--color-ink-soft)] focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2 mt-2"
      >
        {pending ? "Enviando…" : "Enviar enlace mágico"}
      </button>
    </form>
  );
}
