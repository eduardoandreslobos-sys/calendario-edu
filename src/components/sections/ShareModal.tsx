"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus, Trash2 } from "lucide-react";
import {
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from "@/app/actions/collaborators";
import type { CollaboratorSummary } from "@/lib/load-events";

interface Props {
  open: boolean;
  onClose: () => void;
  ownerEmail: string;
  collaborators: CollaboratorSummary[];
}

export function ShareModal({ open, onClose, ownerEmail, collaborators }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addCollaborator(fd);
      if (!r.ok) {
        setError(r.error);
      } else {
        setEmail("");
        router.refresh();
      }
    });
  }

  function onRemove(emailToRemove: string) {
    setError(null);
    startTransition(async () => {
      try {
        await removeCollaborator(emailToRemove);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  function onChangeRole(emailToUpdate: string, newRole: "editor" | "viewer") {
    setError(null);
    startTransition(async () => {
      try {
        await updateCollaboratorRole(emailToUpdate, newRole);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="share-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-5 bg-black/30 backdrop-blur-md backdrop-saturate-125"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
            className="relative w-full max-w-[520px] overflow-hidden rounded-[22px] border border-white/60 bg-white/92 shadow-[0_30px_80px_-20px_rgba(12,12,13,0.5)] backdrop-blur-3xl backdrop-saturate-180"
            style={{ backgroundColor: "rgba(255,255,255,0.94)" }}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-[#0c0c0d] to-[#6b6b70]" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full border-0 bg-black/5 text-[color:var(--color-text-soft)] flex items-center justify-center transition-all duration-200 ease-out hover:bg-black/10 hover:text-[color:var(--color-ink)] hover:rotate-90"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-[26px_26px_22px]">
              <h3 className="text-[20px] font-bold tracking-[-0.022em] m-0 mb-1">
                Compartir calendario
              </h3>
              <p className="font-serif italic text-[14px] text-[color:var(--color-text-soft)] mb-5">
                Solo tú y a quienes autorices pueden entrar.
              </p>

              <div className="mb-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium mb-2">
                  Dueño
                </p>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/60 border border-[color:var(--border-glass)] px-3 py-2.5">
                  <span className="font-mono text-[13px] truncate">{ownerEmail}</span>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.05em] bg-zinc-900 text-white px-2 py-1 rounded-full">
                    Dueño
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium mb-2">
                  Colaboradores ({collaborators.length})
                </p>
                {collaborators.length === 0 ? (
                  <p className="font-serif italic text-[13px] text-[color:var(--color-text-soft)] py-2">
                    Nadie más todavía.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {collaborators.map((c) => (
                      <li
                        key={c.email}
                        className="flex items-center gap-3 rounded-lg bg-white/60 border border-[color:var(--border-glass)] px-3 py-2"
                      >
                        <span className="font-mono text-[13px] truncate flex-1">{c.email}</span>
                        <select
                          value={c.role}
                          onChange={(e) => onChangeRole(c.email, e.target.value as "editor" | "viewer")}
                          disabled={pending}
                          className="rounded-md border border-[color:var(--border-glass-strong)] bg-white px-2 py-1 text-[12px] font-semibold"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Solo lectura</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onRemove(c.email)}
                          disabled={pending}
                          aria-label="Quitar"
                          className="rounded-full p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form onSubmit={onAdd} className="flex flex-col gap-2">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium">
                  Invitar
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-[color:var(--border-glass-strong)] bg-white px-3 py-2 text-[14px] font-medium outline-none focus:border-[color:var(--color-ink)]"
                  />
                  <select
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                    className="rounded-lg border border-[color:var(--border-glass-strong)] bg-white px-3 py-2 text-[14px] font-medium"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Solo lectura</option>
                  </select>
                  <button
                    type="submit"
                    disabled={pending || !email}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-ink)] text-white px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[color:var(--color-ink-soft)] disabled:opacity-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Agregar
                  </button>
                </div>
                {error && (
                  <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
