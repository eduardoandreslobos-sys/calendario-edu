"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { Stats } from "./Stats";
import { Legend } from "./Legend";
import { CalendarView } from "./CalendarView";
import { Agenda } from "./Agenda";
import { EventModal } from "./EventModal";
import type { CalEvent } from "@/lib/events";
import type { CatId } from "@/lib/cats";

const HIDDEN_CATS_KEY = "calendario-edu:hiddenCats";

interface Props {
  initialEvents: CalEvent[];
}

export function CalendarApp({ initialEvents }: Props) {
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [viewType, setViewType] = useState<string>("dayGridMonth");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hiddenCats, setHiddenCats] = useState<Set<CatId>>(() => new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HIDDEN_CATS_KEY);
      if (raw) setHiddenCats(new Set(JSON.parse(raw) as CatId[]));
    } catch {}
  }, []);

  const persistHidden = useCallback((next: Set<CatId>) => {
    try {
      window.localStorage.setItem(HIDDEN_CATS_KEY, JSON.stringify([...next]));
    } catch {}
  }, []);

  const toggleCat = useCallback(
    (id: CatId) => {
      setHiddenCats((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persistHidden(next);
        return next;
      });
    },
    [persistHidden],
  );

  const showAllCats = useCallback(() => {
    const empty = new Set<CatId>();
    setHiddenCats(empty);
    persistHidden(empty);
  }, [persistHidden]);

  const visibleEvents = useMemo(
    () => (hiddenCats.size === 0 ? initialEvents : initialEvents.filter((e) => !hiddenCats.has(e.catId))),
    [initialEvents, hiddenCats],
  );

  const handleRange = useCallback((r: { start: Date; end: Date }, v: string) => {
    setRange(r);
    setViewType(v);
  }, []);

  const activeEvent = useMemo(
    () => (activeId ? initialEvents.find((e) => e.id === activeId) ?? null : null),
    [activeId, initialEvents],
  );

  return (
    <>
      <Reveal delay={0.62} y={20}>
        <Stats events={visibleEvents} start={range?.start ?? null} end={range?.end ?? null} />
      </Reveal>
      <Reveal delay={0.78} y={20}>
        <Legend hiddenCats={hiddenCats} onToggle={toggleCat} onShowAll={showAllCats} />
      </Reveal>
      <Reveal delay={0.92} y={24}>
        <CalendarView
          events={visibleEvents}
          onRangeChange={handleRange}
          onEventClick={(id) => setActiveId(id)}
        />
      </Reveal>
      <Reveal delay={1.08} y={28}>
        <Agenda
          events={visibleEvents}
          start={range?.start ?? null}
          end={range?.end ?? null}
          viewType={viewType}
          onEventClick={(id) => setActiveId(id)}
        />
      </Reveal>

      <EventModal event={activeEvent} onClose={() => setActiveId(null)} />
    </>
  );
}
