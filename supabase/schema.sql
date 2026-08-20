-- JLPT Sprint Desk 云同步表结构：在 Supabase SQL Editor 执行一次

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "Users manage own data" on public.user_data;
create policy "Users manage own data"
  on public.user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_data_updated_at_idx
  on public.user_data (updated_at);
