"use client";

import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventContentArg, DatesSetArg, EventClickArg } from "@fullcalendar/core";

import { type CalEvent } from "@/lib/events";
import { CATS, type CatId } from "@/lib/cats";
import { fmtHM } from "@/lib/format";

interface Props {
  events: CalEvent[];
  onRangeChange: (range: { start: Date; end: Date }, viewType: string) => void;
  onEventClick: (eventId: string) => void;
}

export function CalendarView({ events, onRangeChange, onEventClick }: Props) {
  const fcRef = useRef<FullCalendar>(null);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    extendedProps: { catId: e.catId, canceled: !!e.canceled },
    classNames: [`cat-${e.catId}`, e.canceled ? "fc-event-canceled" : ""].filter(Boolean),
  }));

  return (
    <section className="glass p-[clamp(16px,2vw,24px)] mb-[clamp(20px,3vw,28px)]">
      <FullCalendar
        ref={fcRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate="2026-05-13"
        locale={esLocale}
        firstDay={1}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        buttonText={{ today: "Hoy", month: "Mes", week: "Semana" }}
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        nowIndicator
        expandRows
        dayMaxEvents={3}
        moreLinkText={(n) => `+${n} más`}
        dayHeaderContent={(arg) => arg.text.replace(/\./g, "")}
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        events={fcEvents}
        eventClick={(info: EventClickArg) => {
          info.jsEvent.preventDefault();
          onEventClick(info.event.id);
        }}
        eventContent={(arg: EventContentArg) => {
          if (arg.view.type === "dayGridMonth") {
            const catId = arg.event.extendedProps.catId as CatId;
            const cat = CATS[catId];
            const wrap = document.createElement("div");
            wrap.className = "fc-pill";
            wrap.style.background = cat.bg;
            wrap.style.color = cat.text;

            const dot = document.createElement("span");
            dot.className = "fc-pill-dot";
            dot.style.background = cat.dot;

            const time = document.createElement("span");
            time.className = "fc-pill-time";
            time.textContent = arg.event.start ? fmtHM(arg.event.start) : "";

            const title = document.createElement("span");
            title.className = "fc-pill-title";
            title.textContent = arg.event.title;

            wrap.append(dot, time, title);
            return { domNodes: [wrap] };
          }
          return undefined;
        }}
        datesSet={(info: DatesSetArg) => {
          onRangeChange({ start: info.start, end: info.end }, info.view.type);
        }}
      />
    </section>
  );
}
