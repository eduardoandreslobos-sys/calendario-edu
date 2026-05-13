"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { Stats } from "./Stats";
import { Legend } from "./Legend";
import { CalendarView } from "./CalendarView";
import { Agenda } from "./Agenda";
import { EventModal } from "./EventModal";
import { EventForm } from "./EventForm";
import { pushAllToGoogle } from "@/app/actions/events";
import type { CalEvent } from "@/lib/events";

interface Props {
  initialEvents: CalEvent[];
  canEdit: boolean;
  googleConnected?: boolean;
}

type Mode = { type: "closed" } | { type: "view"; id: string } | { type: "edit"; event: CalEvent } | { type: "create" };

export function CalendarApp({ initialEvents, canEdit, googleConnected }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [viewType, setViewType] = useState<string>("dayGridMonth");
  const [mode, setMode] = useState<Mode>({ type: "closed" });
  const [, startTransition] = useTransition();

  // Re-sync when server-fetched events change (after revalidatePath).
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const handleRange = useCallback(
    (r: { start: Date; end: Date }, v: string) => {
      setRange(r);
      setViewType(v);
    },
    [],
  );

  const activeEvent = useMemo(() => {
    if (mode.type !== "view") return null;
    return events.find((e) => e.id === mode.id) ?? null;
  }, [mode, events]);

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const [syncing, startSync] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const onSyncAll = () =>
    startSync(async () => {
      setSyncResult(null);
      try {
        const r = await pushAllToGoogle();
        setSyncResult(`Sincronizados ${r.pushed} eventos`);
        refresh();
      } catch (e) {
        setSyncResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  return (
    <>
      {canEdit && (
        <Reveal delay={0.55} y={14}>
          <div className="flex justify-end items-center gap-2 mb-3 flex-wrap">
            {syncResult && (
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-soft)]">
                {syncResult}
              </span>
            )}
            {googleConnected && (
              <button
                onClick={onSyncAll}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[color:var(--border-glass-strong)] px-3.5 py-2 text-[12px] font-semibold transition-colors duration-200 hover:bg-[color:var(--color-cream)] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando…" : "Empujar todo a Google"}
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
        <Stats events={events} start={range?.start ?? null} end={range?.end ?? null} />
      </Reveal>
      <Reveal delay={0.78} y={20}>
        <Legend />
      </Reveal>
      <Reveal delay={0.92} y={24}>
        <CalendarView
          events={events}
          onRangeChange={handleRange}
          onEventClick={(id) => setMode({ type: "view", id })}
        />
      </Reveal>
      <Reveal delay={1.08} y={28}>
        <Agenda
          events={events}
          start={range?.start ?? null}
          end={range?.end ?? null}
          viewType={viewType}
          onEventClick={(id) => setMode({ type: "view", id })}
        />
      </Reveal>

      <EventModal
        event={activeEvent}
        canEdit={canEdit}
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
    </>
  );
}
