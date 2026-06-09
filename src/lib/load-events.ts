import "server-only";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/access";
import { chileLocalFromISO } from "@/lib/tz";
import type { CalEvent } from "@/lib/events";
import type { CatId } from "@/lib/cats";
import type { Role } from "@/lib/auth";

export interface CollaboratorSummary {
  email: string;
  role: Role;
}

export interface LoadedEvents {
  events: CalEvent[];
  role: Role | null;
  userEmail: string | null;
  collaborators: CollaboratorSummary[];
}

interface Row {
  id: string;
  title: string;
  start_at: Date;
  end_at: Date;
  cat_id: CatId;
  location: string;
  notes: string;
  canceled: boolean;
}

export async function loadEvents(): Promise<LoadedEvents> {
  const user = await currentUser();

  const rows = await sql<Row[]>`
    SELECT id, title, start_at, end_at, cat_id, location, notes, canceled
    FROM events ORDER BY start_at ASC`;

  const events: CalEvent[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    start: chileLocalFromISO(r.start_at.toISOString()),
    end: chileLocalFromISO(r.end_at.toISOString()),
    catId: r.cat_id,
    location: r.location ?? "",
    notes: r.notes ?? "",
    canceled: r.canceled ?? false,
  }));

  let collaborators: CollaboratorSummary[] = [];
  if (user?.role === "owner") {
    collaborators = await sql<CollaboratorSummary[]>`
      SELECT email, role FROM collaborators ORDER BY
        CASE role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, email`;
  }

  return {
    events,
    role: user?.role ?? null,
    userEmail: user?.email ?? null,
    collaborators,
  };
}
