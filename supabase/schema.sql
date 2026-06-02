-- JLPT Sprint Desk — cloud sync schema
-- Run this once in your Supabase project's SQL editor.
--
-- Design: one JSON blob per user holds their entire localStorage namespace
-- (profiles, settings, generated plans, records). Sync is last-write-wins
-- by updated_at. This keeps the schema trivial and matches the app's
-- existing local data model with zero migration risk.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: each user can only read/write their own row.
alter table public.user_data enable row level security;

drop policy if exists "Users manage own data" on public.user_data;
create policy "Users manage own data"
  on public.user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: index not needed (PK is user_id), but keep updated_at handy.
create index if not exists user_data_updated_at_idx
  on public.user_data (updated_at);
