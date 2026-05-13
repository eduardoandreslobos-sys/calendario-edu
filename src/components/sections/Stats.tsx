"use client";

import { useMemo } from "react";
import { Tilt } from "@/components/effects/Tilt";
import { CATS, type CatId } from "@/lib/cats";
import { eventsInRange, type CalEvent } from "@/lib/events";
import { diffHours, fmtHours } from "@/lib/format";

interface Props {
  events: CalEvent[];
  start: Date | null;
  end: Date | null;
}

export function Stats({ events, start, end }: Props) {
  const data = useMemo(() => {
    if (!start || !end) return null;
    const items = eventsInRange(events, start, end).filter((e) => !e.canceled);
    const totalHours = items.reduce((acc, e) => acc + diffHours(e._start, e._end), 0);
    const uniqueDays = new Set(items.map((e) => e._start.toISOString().slice(0, 10))).size;
    const byCat: Partial<Record<CatId, number>> = {};
    items.forEach((e) => {
      byCat[e.catId] = (byCat[e.catId] ?? 0) + diffHours(e._start, e._end);
    });
    const order = (Object.keys(byCat) as CatId[]).sort(
      (a, b) => (byCat[b] ?? 0) - (byCat[a] ?? 0),
    );
    return { items, totalHours, uniqueDays, byCat, order };
  }, [start, end]);

  return (
    <section className="grid gap-3 mb-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      <Tilt>
        <Card label="Sesiones" value={data ? `${data.items.length}` : "—"} />
      </Tilt>
      <Tilt>
        <Card
          label="Horas totales"
          value={data ? fmtHours(data.totalHours) : "—"}
          unit={data ? "h" : undefined}
        />
      </Tilt>
      <Tilt>
        <Card label="Días con clase" value={data ? `${data.uniqueDays}` : "—"} />
      </Tilt>
      <Tilt className="md:[grid-column:span_2]">
        <div className="glass p-[18px_20px] h-full">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium mb-2.5">
            Horas por categoría
          </div>
          {data && data.order.length ? (
            <div className="flex flex-col gap-2">
              {data.order.map((id) => {
                const c = CATS[id];
                const h = data.byCat[id] ?? 0;
                return (
                  <div
                    key={id}
                    className="grid items-center gap-2.5 text-[13px] [grid-template-columns:9px_1fr_auto]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.dot, boxShadow: "0 0 0 3px rgba(255,255,255,0.4)" }}
                    />
                    <span className="font-medium">{c.name}</span>
                    <span className="font-mono text-xs font-medium text-[color:var(--color-text-soft)]">
                      {fmtHours(h)}h
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="font-serif italic text-sm text-[color:var(--color-text-soft)] mt-1">
              Sin clases en este período
            </div>
          )}
        </div>
      </Tilt>
    </section>
  );
}

function Card({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="glass p-[18px_20px] h-full">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium mb-2.5">
        {label}
      </div>
      <div
        className="text-[34px] font-extrabold tracking-[-0.035em] leading-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {unit && (
          <span className="font-serif italic font-normal text-[18px] text-[color:var(--color-text-soft)] ml-1 tracking-normal">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
