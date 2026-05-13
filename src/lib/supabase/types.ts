import type { CatId } from "../cats";

export interface EventRow {
  id: string;
  user_id: string;
  external_id: string | null;
  title: string;
  start_at: string; // ISO with tz
  end_at: string;
  cat_id: CatId;
  location: string;
  notes: string;
  canceled: boolean;
  created_at: string;
  updated_at: string;
}

export type EventInsert = Omit<
  EventRow,
  "id" | "user_id" | "created_at" | "updated_at"
> & { user_id?: string };

export type EventUpdate = Partial<
  Omit<EventRow, "id" | "user_id" | "created_at" | "updated_at">
>;
