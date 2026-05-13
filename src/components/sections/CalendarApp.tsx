"use client";

import { useCallback, useMemo, useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { Stats } from "./Stats";
import { Legend } from "./Legend";
import { CalendarView } from "./CalendarView";
import { Agenda } from "./Agenda";
import { EventModal } from "./EventModal";
import { EVENTS } from "@/lib/events";

export function CalendarApp() {
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [viewType, setViewType] = useState<string>("dayGridMonth");
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRange = useCallback(
    (r: { start: Date; end: Date }, v: string) => {
      setRange(r);
      setViewType(v);
    },
    [],
  );

  const activeEvent = useMemo(
    () => (activeId ? EVENTS.find((e) => e.id === activeId) ?? null : null),
    [activeId],
  );

  return (
    <>
      <Reveal delay={0.62} y={20}>
        <Stats start={range?.start ?? null} end={range?.end ?? null} />
      </Reveal>
      <Reveal delay={0.78} y={20}>
        <Legend />
      </Reveal>
      <Reveal delay={0.92} y={24}>
        <CalendarView onRangeChange={handleRange} onEventClick={setActiveId} />
      </Reveal>
      <Reveal delay={1.08} y={28}>
        <Agenda
          start={range?.start ?? null}
          end={range?.end ?? null}
          viewType={viewType}
          onEventClick={setActiveId}
        />
      </Reveal>
      <EventModal event={activeEvent} onClose={() => setActiveId(null)} />
    </>
  );
}
