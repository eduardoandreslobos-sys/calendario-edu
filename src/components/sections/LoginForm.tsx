"use client";

import { useState, useTransition } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        setSent(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[color:var(--border-glass)] bg-white/60 p-5 text-sm">
        <p className="font-semibold mb-1">✉︎ Revisa tu correo</p>
        <p className="text-[color:var(--color-text-soft)]">
          Si <span className="font-mono text-[12px]">{email}</span> está autorizado,
          te enviamos un enlace de acceso. Ábrelo desde este dispositivo. Vence en 15 min.
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
        {pending ? "Enviando…" : "Enviar enlace de acceso"}
      </button>
      <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] mt-2">
        Acceso restringido · solo correos autorizados
      </p>
    </form>
  );
}
