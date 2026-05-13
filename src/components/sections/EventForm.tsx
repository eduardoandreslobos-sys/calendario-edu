"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { CATS, CAT_ORDER, type CatId } from "@/lib/cats";
import { fmtHM } from "@/lib/format";
import type { CalEvent } from "@/lib/events";
import { upsertEvent } from "@/app/actions/events";

interface Props {
  event: CalEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EventForm({ event, onClose, onSaved }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [catId, setCatId] = useState<CatId>(event?.catId ?? "personal");

  const initialDate = event ? event.start.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const initialStart = event ? fmtHM(new Date(event.start)) : "09:00";
  const initialEnd = event ? fmtHM(new Date(event.end)) : "10:00";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("cat_id", catId);
    startTransition(async () => {
      const r = await upsertEvent(formData);
      if (r.ok) onSaved();
      else setError(r.error);
    });
  }

  const cat = CATS[catId];

  return (
    <AnimatePresence>
      <motion.div
        key="form-backdrop"
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
          <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${cat.dot}, ${cat.text})` }} />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
            className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full border-0 bg-black/5 text-[color:var(--color-text-soft)] flex items-center justify-center transition-all duration-200 ease-out hover:bg-black/10 hover:text-[color:var(--color-ink)] hover:rotate-90"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <form ref={formRef} onSubmit={onSubmit} className="p-[26px_26px_22px] flex flex-col gap-4">
            <h3 className="text-[20px] font-bold tracking-[-0.022em] m-0">
              {event ? "Editar evento" : "Nuevo evento"}
            </h3>
            {event && <input type="hidden" name="id" value={event.id} />}

            <Field label="Título">
              <input
                type="text"
                name="title"
                required
                maxLength={200}
                defaultValue={event?.title ?? ""}
                placeholder="ej. Clase de IA"
                className={inputCls}
              />
            </Field>

            <Field label="Categoría">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CAT_ORDER.map((id) => {
                  const c = CATS[id];
                  const selected = id === catId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCatId(id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-left transition-all duration-150 ${
                        selected
                          ? "border-[color:var(--color-ink)] bg-white shadow-sm"
                          : "border-[color:var(--border-glass-strong)] bg-white/60 hover:bg-white"
                      }`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: c.dot }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Fecha">
              <input
                type="date"
                name="date"
                required
                defaultValue={initialDate}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Inicio">
                <input
                  type="time"
                  name="time_start"
                  required
                  defaultValue={initialStart}
                  className={inputCls}
                />
              </Field>
              <Field label="Término">
                <input
                  type="time"
                  name="time_end"
                  required
                  defaultValue={initialEnd}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Lugar / dirección">
              <input
                type="text"
                name="location"
                maxLength={500}
                defaultValue={event?.location ?? ""}
                placeholder="ej. Av. Las Condes 12345 · UAI Peñalolén · MS Teams"
                className={inputCls}
              />
            </Field>

            <Field label="Notas">
              <textarea
                name="notes"
                maxLength={2000}
                rows={2}
                defaultValue={event?.notes ?? ""}
                placeholder="Contexto extra, link, contacto…"
                className={`${inputCls} resize-y min-h-[60px]`}
              />
            </Field>

            {error && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="rounded-full bg-white border border-[color:var(--border-glass-strong)] px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[color:var(--color-cream)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[color:var(--color-ink)] text-white px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[color:var(--color-ink-soft)] disabled:opacity-50"
              >
                {pending ? "Guardando…" : event ? "Guardar cambios" : "Crear evento"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-lg border border-[color:var(--border-glass-strong)] bg-white/80 px-3 py-2 text-[14px] font-medium outline-none transition-all duration-200 ease-out focus:border-[color:var(--color-ink)] focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}
