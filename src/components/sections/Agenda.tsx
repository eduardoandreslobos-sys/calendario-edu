"use client";

import { useMemo } from "react";
import { CATS } from "@/lib/cats";
import { eventsInRange, type CalEvent } from "@/lib/events";
import { fmtHM, MONTHS_SHORT } from "@/lib/format";

interface Props {
  events: CalEvent[];
  start: Date | null;
  end: Date | null;
  viewType: string;
  onEventClick: (id: string) => void;
}

export function Agenda({ events, start, end, viewType, onEventClick }: Props) {
  const items = useMemo(() => {
    if (!start || !end) return [];
    return eventsInRange(events, start, end);
  }, [events, start, end]);

  const title = viewType === "timeGridWeek" ? "Agenda de la semana" : "Agenda del mes";
  const meta = `${items.length} ${items.length === 1 ? "compromiso" : "compromisos"}`;

  return (
    <section className="glass p-[clamp(18px,2.5vw,26px)]">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mx-2 mb-4">
        <h2 className="text-base font-bold tracking-[-0.015em] m-0">{title}</h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-soft)] font-medium">
          {meta}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="font-serif italic text-[color:var(--color-text-soft)] text-[15px] py-7 text-center">
          Sin compromisos en este período.
        </div>
      ) : (
        <ul className="list-none m-0 p-0 flex flex-col">
          {items.map((e) => {
            const cat = CATS[e.catId];
            return (
              <li
                key={e.id}
                tabIndex={0}
                role="button"
                aria-label={e.title}
                onClick={() => onEventClick(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onEventClick(e.id);
                  }
                }}
                className={`grid items-center gap-4 px-3 py-3.5 rounded-xl cursor-pointer border-b border-[color:var(--border-glass)] last:border-b-0 transition-[background,transform] duration-200 ease-out hover:bg-white/60 hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2 [grid-template-columns:64px_1fr_auto] max-md:[grid-template-columns:56px_1fr] ${e.canceled ? "opacity-50 line-through" : ""}`}
              >
                <div
                  className="flex flex-col items-center justify-center py-2 rounded-xl bg-white/60 border border-[color:var(--border-glass)]"
                  style={{ color: cat.dot }}
                >
                  <div
                    className="text-[24px] font-extrabold leading-none tracking-[-0.035em]"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {e._start.getDate()}
                  </div>
                  <div className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] mt-1">
                    {MONTHS_SHORT[e._start.getMonth()]}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-semibold mb-0.5 truncate tracking-[-0.012em]">
                    {e.title}
                  </div>
                  <div className="text-[12.5px] text-[color:var(--color-text-soft)] font-medium">
                    <span className="font-mono text-[11.5px] tracking-[-0.01em]">
                      {fmtHM(e._start)} – {fmtHM(e._end)}
                    </span>{" "}
                    · {e.location}
                  </div>
                </div>
                <div
                  className="text-[10.5px] font-semibold px-2.5 py-1.5 rounded-full whitespace-nowrap max-md:[grid-column:2] max-md:justify-self-start max-md:mt-1.5"
                  style={{ background: cat.bg, color: cat.text }}
                >
                  {cat.name}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
