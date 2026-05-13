-- ============================================================================
-- Calendario Edu — schema + RLS
-- Correr en Supabase SQL Editor (Dashboard → SQL → New query → Run)
-- ============================================================================

-- Events table
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  external_id text,                       -- e.g. "santander-1" for seeded events
  title       text not null,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  cat_id      text not null,
  location    text not null default '',
  notes       text not null default '',
  canceled    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists events_user_start_idx on public.events (user_id, start_at);
create unique index if not exists events_user_external_idx
  on public.events (user_id, external_id) where external_id is not null;

-- Row Level Security
alter table public.events enable row level security;

drop policy if exists "users read own events" on public.events;
create policy "users read own events"
  on public.events for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own events" on public.events;
create policy "users insert own events"
  on public.events for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own events" on public.events;
create policy "users update own events"
  on public.events for update
  using (auth.uid() = user_id);

drop policy if exists "users delete own events" on public.events;
create policy "users delete own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();
