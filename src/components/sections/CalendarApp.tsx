"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { Stats } from "./Stats";
import { Legend } from "./Legend";
import { CalendarView } from "./CalendarView";
import { Agenda } from "./Agenda";
import { EventModal } from "./EventModal";
import { EventForm } from "./EventForm";
import { ShareModal } from "./ShareModal";
import type { CalEvent } from "@/lib/events";
import type { CatId } from "@/lib/cats";
import type { Role } from "@/lib/auth";
import type { CollaboratorSummary } from "@/lib/load-events";

const HIDDEN_CATS_KEY = "calendario-edu:hiddenCats";

interface Props {
  initialEvents: CalEvent[];
  role: Role | null;
  collaborators: CollaboratorSummary[];
}

type Mode =
  | { type: "closed" }
  | { type: "view"; id: string }
  | { type: "edit"; event: CalEvent }
  | { type: "create" };

export function CalendarApp({ initialEvents, role, collaborators }: Props) {
  const router = useRouter();
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [viewType, setViewType] = useState<string>("dayGridMonth");
  const [mode, setMode] = useState<Mode>({ type: "closed" });
  const [shareOpen, setShareOpen] = useState(false);
  const [hiddenCats, setHiddenCats] = useState<Set<CatId>>(() => new Set());
  const [, startTransition] = useTransition();

  const canWrite = role === "owner" || role === "editor";
  const isOwner = role === "owner";

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
    () => (mode.type === "view" ? initialEvents.find((e) => e.id === mode.id) ?? null : null),
    [mode, initialEvents],
  );

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  return (
    <>
      {canWrite && (
        <Reveal delay={0.55} y={14}>
          <div className="flex justify-end items-center gap-2 mb-3 flex-wrap">
            {isOwner && (
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[color:var(--border-glass-strong)] px-3.5 py-2 text-[12px] font-semibold transition-colors duration-200 hover:bg-[color:var(--color-cream)]"
              >
                <Users className="w-3.5 h-3.5" />
                Compartir
                {collaborators.filter((c) => c.role !== "owner").length > 0 && (
                  <span className="ml-1 rounded-full bg-zinc-900 text-white px-1.5 text-[10px] leading-[16px]">
                    {collaborators.filter((c) => c.role !== "owner").length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMode({ type: "create" })}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] text-white px-4 py-2 text-[13px] font-semibold transition-all duration-200 ease-out hover:bg-[color:var(--color-ink-soft)] focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo evento
            </button>
          </div>
        </Reveal>
      )}

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
          onEventClick={(id) => setMode({ type: "view", id })}
        />
      </Reveal>
      <Reveal delay={1.08} y={28}>
        <Agenda
          events={visibleEvents}
          start={range?.start ?? null}
          end={range?.end ?? null}
          viewType={viewType}
          onEventClick={(id) => setMode({ type: "view", id })}
        />
      </Reveal>

      <EventModal
        event={activeEvent}
        canEdit={canWrite}
        onClose={() => setMode({ type: "closed" })}
        onEdit={(e) => setMode({ type: "edit", event: e })}
        onMutated={refresh}
      />

      {(mode.type === "create" || mode.type === "edit") && (
        <EventForm
          event={mode.type === "edit" ? mode.event : null}
          onClose={() => setMode({ type: "closed" })}
          onSaved={() => {
            setMode({ type: "closed" });
            refresh();
          }}
        />
      )}

      {isOwner && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          ownerEmail="eduardoandres.lobos@gmail.com"
          collaborators={collaborators.filter((c) => c.role !== "owner")}
        />
      )}
    </>
  );
}
