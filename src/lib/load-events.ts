import "server-only";
import { createClient } from "@/lib/supabase/server";
import { EVENTS as STATIC_EVENTS, type CalEvent } from "@/lib/events";
import { chileISO, chileLocalFromISO } from "@/lib/tz";
import type { CatId } from "@/lib/cats";

interface DbRow {
  id: string;
  external_id: string | null;
  title: string;
  start_at: string;
  end_at: string;
  cat_id: CatId;
  location: string;
  notes: string;
  canceled: boolean;
}

const rowToEvent = (r: DbRow): CalEvent => ({
  id: r.id,
  title: r.title,
  start: chileLocalFromISO(r.start_at),
  end: chileLocalFromISO(r.end_at),
  catId: r.cat_id,
  location: r.location,
  notes: r.notes,
  canceled: r.canceled,
  externalId: r.external_id,
});

export interface LoadedEvents {
  events: CalEvent[];
  canEdit: boolean;
  userEmail: string | null;
  configured: boolean;
}

export async function loadEvents(): Promise<LoadedEvents> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { events: STATIC_EVENTS, canEdit: false, userEmail: null, configured: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { events: STATIC_EVENTS, canEdit: false, userEmail: null, configured: true };
  }

  let { data: rows, error } = await supabase
    .from("events")
    .select(
      "id, external_id, title, start_at, end_at, cat_id, location, notes, canceled",
    )
    .order("start_at", { ascending: true });

  if (error) {
    console.error("loadEvents:", error.message);
    return { events: [], canEdit: true, userEmail: user.email ?? null, configured: true };
  }

  // Auto-seed on first login.
  if (!rows || rows.length === 0) {
    const seed = STATIC_EVENTS.map((e) => ({
      user_id: user.id,
      external_id: e.id,
      title: e.title,
      cat_id: e.catId,
      start_at: chileISO(e.start),
      end_at: chileISO(e.end),
      location: e.location,
      notes: e.notes,
      canceled: false,
    }));
    const { error: seedError } = await supabase
      .from("events")
      .upsert(seed, { onConflict: "user_id,external_id", ignoreDuplicates: true });
    if (seedError) console.error("seed:", seedError.message);
    const refresh = await supabase
      .from("events")
      .select("id, external_id, title, start_at, end_at, cat_id, location, notes, canceled")
      .order("start_at", { ascending: true });
    rows = refresh.data ?? [];
  }

  return {
    events: (rows as DbRow[]).map(rowToEvent),
    canEdit: true,
    userEmail: user.email ?? null,
    configured: true,
  };
}
