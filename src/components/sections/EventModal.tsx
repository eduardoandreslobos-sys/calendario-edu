"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CATS } from "@/lib/cats";
import { fmtFullDate, fmtHM } from "@/lib/format";
import type { CalEvent } from "@/lib/events";

interface Props {
  event: CalEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/30 backdrop-blur-md backdrop-saturate-125"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.34, 1.4, 0.64, 1] }}
            className="relative w-full max-w-[460px] overflow-hidden rounded-[22px] border border-white/60 bg-white/92 shadow-[0_30px_80px_-20px_rgba(12,12,13,0.5)] backdrop-blur-3xl backdrop-saturate-180"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
          >
            <ModalContent event={event} closeBtnRef={closeBtnRef} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  event,
  closeBtnRef,
  onClose,
}: {
  event: CalEvent;
  closeBtnRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const cat = CATS[event.catId];
  const start = new Date(event.start);
  const end = new Date(event.end);

  return (
    <>
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${cat.dot}, ${cat.text})` }}
      />
      <button
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full border-0 bg-black/5 text-[color:var(--color-text-soft)] flex items-center justify-center transition-all duration-200 ease-out hover:bg-black/10 hover:text-[color:var(--color-ink)] hover:rotate-90 focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="p-[28px_28px_26px]">
        <span
          className="inline-block text-[10.5px] font-bold px-[11px] py-[5px] rounded-full tracking-[0.02em] mb-3"
          style={{ background: cat.bg, color: cat.text }}
        >
          {cat.name}
        </span>
        <h3
          id="modal-title"
          className="text-[22px] font-bold leading-tight tracking-[-0.022em] m-0 mb-[18px]"
        >
          {event.title}
        </h3>
        <div className="flex flex-col gap-3">
          <Row emoji="📅" label="Fecha" value={fmtFullDate(start)} />
          <Row
            emoji="⏰"
            label="Horario"
            value={
              <span className="font-mono font-medium tracking-[-0.01em]">
                {fmtHM(start)} – {fmtHM(end)}
              </span>
            }
          />
          <Row emoji="📍" label="Lugar" value={event.location || "—"} />
          {event.notes && <Row emoji="📝" label="Notas" value={event.notes} />}
        </div>
      </div>
    </>
  );
}

function Row({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid items-baseline gap-3 text-[13.5px] [grid-template-columns:20px_78px_1fr]">
      <span className="text-sm leading-none">{emoji}</span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] font-medium text-[color:var(--color-text-soft)] self-center">
        {label}
      </span>
      <span className="text-[color:var(--color-ink)] font-medium text-[13.5px]">{value}</span>
    </div>
  );
}
