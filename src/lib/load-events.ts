import "server-only";
import { cookies } from "next/headers";
import { EVENTS, type CalEvent } from "@/lib/events";
import { verifyToken, roleFor, SESSION_COOKIE, type Role } from "@/lib/auth";

export interface LoadedEvents {
  events: CalEvent[];
  role: Role | null;
  userEmail: string | null;
}

export async function loadEvents(): Promise<LoadedEvents> {
  // Sin AUTH_SECRET = modo público read-only (dev).
  if (!process.env.AUTH_SECRET) {
    return { events: EVENTS, role: null, userEmail: null };
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const verified = await verifyToken(session, "session");

  return {
    events: EVENTS,
    role: verified ? roleFor(verified.email) : null,
    userEmail: verified?.email ?? null,
  };
}
