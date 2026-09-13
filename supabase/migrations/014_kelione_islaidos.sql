-- Per-trip expense tracking, and moving the shared savings goal from
-- Biudžetas to Kelionės (santaupos "iki kelionės" tables already exist —
-- savings_goal / contributions — this just relocates the tab, no schema
-- change needed for them).

create table public.travel_expenses (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);
alter table public.travel_expenses enable row level security;
create policy "Authenticated users can view travel expenses"
  on public.travel_expenses for select to authenticated using (true);
create policy "Authenticated users can add travel expenses"
  on public.travel_expenses for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update travel expenses"
  on public.travel_expenses for update to authenticated using (true);
create policy "Authenticated users can delete travel expenses"
  on public.travel_expenses for delete to authenticated using (true);
