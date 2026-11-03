"use client";

import { useMemo, useSyncExternalStore } from "react";
import { catOf } from "@/lib/cats";
import type { CalEvent } from "@/lib/events";
import { DAYS_FULL, fmtHM, MONTHS_SHORT } from "@/lib/format";

interface Props {
  events: CalEvent[];
  onEventClick: (id: string) => void;
}

const DAYS_AHEAD = 7;
const MAX_ITEMS = 12;

const noopSubscribe = () => () => {};

function dayLabel(d: Date, today: Date): string {
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  const name = DAYS_FULL[d.getDay()];
  return `${name[0].toUpperCase()}${name.slice(1)} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/**
 * Lo que viene en los próximos días, pensado para el teléfono: es lo primero que se ve
 * al abrir la app. Solo se calcula en el navegador porque depende de la hora actual.
 */
export function Upcoming({ events, onEventClick }: Props) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const groups = useMemo(() => {
    if (!mounted) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const limit = today.getTime() + (DAYS_AHEAD + 1) * 86_400_000;
    const items = events
      .filter((e) => !e.canceled && new Date(e.end) > now && new Date(e.start).getTime() < limit)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, MAX_ITEMS);

    const out: { label: string; items: CalEvent[] }[] = [];
    for (const e of items) {
      const label = dayLabel(new Date(e.start), today);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [events, mounted]);

  return (
    <section className="glass p-[18px] mb-4 md:hidden" aria-label="Próximos compromisos">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium m-0 mb-3">
        Próximos 7 días
      </h2>
      {!mounted ? (
        <div className="h-14" />
      ) : groups.length === 0 ? (
        <p className="font-serif italic text-[15px] text-[color:var(--color-text-soft)] m-0 py-2">
          Nada programado en los próximos días.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="text-[13px] font-bold tracking-[-0.01em] mb-1.5">{g.label}</div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                {g.items.map((e) => {
                  const cat = catOf(e.catId);
                  const s = new Date(e.start);
                  const en = new Date(e.end);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onEventClick(e.id)}
                        className="w-full text-left grid gap-3 items-center rounded-xl bg-white/70 border border-[color:var(--border-glass)] px-3 py-2.5 [grid-template-columns:4px_1fr] active:bg-white"
                      >
                        <span className="self-stretch rounded-full" style={{ background: cat.dot }} />
                        <span className="min-w-0">
                          <span className="block text-[14px] font-semibold leading-snug truncate">{e.title}</span>
                          <span className="block text-[12px] text-[color:var(--color-text-soft)] font-medium">
                            <span className="font-mono text-[11.5px]">
                              {fmtHM(s)} – {fmtHM(en)}
                            </span>
                            {e.location ? ` · ${e.location}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
