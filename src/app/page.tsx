import { Header } from "@/components/sections/Header";
import { CalendarApp } from "@/components/sections/CalendarApp";
import { loadEvents } from "@/lib/load-events";
import { calcTotals } from "@/lib/events";

export default async function Home() {
  const { events, role, userEmail, ownerEmail, collaborators, googleConnected } =
    await loadEvents();
  const totals = calcTotals(events);

  return (
    <main className="mx-auto max-w-[1280px] px-[clamp(16px,3vw,28px)] pt-[clamp(28px,5vw,64px)] pb-[clamp(48px,8vw,96px)] relative">
      <Header
        totals={totals}
        userEmail={userEmail}
        role={role}
        googleConnected={googleConnected}
      />
      <CalendarApp
        initialEvents={events}
        role={role}
        ownerEmail={ownerEmail}
        collaborators={collaborators}
        googleConnected={googleConnected}
      />
    </main>
  );
}
