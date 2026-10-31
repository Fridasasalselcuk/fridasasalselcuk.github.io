-- Supabase SQL Editor'de tamamını çalıştırın.
create extension if not exists pgcrypto;
create table if not exists public.business_data (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('sale','expense','stock','account','cash')),
 data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists business_data_user_kind_date on public.business_data(user_id,kind,created_at desc);
alter table public.business_data enable row level security;
drop policy if exists "user reads own data" on public.business_data;
create policy "user reads own data" on public.business_data for select using (auth.uid() = user_id);
drop policy if exists "user inserts own data" on public.business_data;
create policy "user inserts own data" on public.business_data for insert with check (auth.uid() = user_id);
drop policy if exists "user updates own data" on public.business_data;
create policy "user updates own data" on public.business_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user deletes own data" on public.business_data;
create policy "user deletes own data" on public.business_data for delete using (auth.uid() = user_id);
