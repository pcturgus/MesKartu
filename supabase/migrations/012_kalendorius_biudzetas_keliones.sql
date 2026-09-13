-- Three new tabs: Kalendorius, Biudžetas, Kelionės (Kelionės already had a
-- travels table — it just gains dates + a packing list + a day plan).

-- ---------- Biudžetas ----------
-- savings_goal + contributions already existed (just move tab); these are
-- new: recurring bills, and a one-off income/expense log.

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  amount numeric not null,
  payer text not null default 'both',
  due_day integer,
  created_at timestamptz not null default now()
);
alter table public.bills enable row level security;
create policy "Authenticated users can view bills"
  on public.bills for select to authenticated using (true);
create policy "Authenticated users can add bills"
  on public.bills for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update bills"
  on public.bills for update to authenticated using (true);
create policy "Authenticated users can delete bills"
  on public.bills for delete to authenticated using (true);

create table public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  label text not null,
  amount numeric not null,
  date date not null,
  created_at timestamptz not null default now()
);
alter table public.budget_entries enable row level security;
create policy "Authenticated users can view budget entries"
  on public.budget_entries for select to authenticated using (true);
create policy "Authenticated users can add budget entries"
  on public.budget_entries for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete budget entries"
  on public.budget_entries for delete to authenticated using (true);

-- ---------- Kalendorius ----------
-- milestones already existed (just move tab); this is new: freeform events.

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  date date not null,
  recurring_yearly boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);
alter table public.calendar_events enable row level security;
create policy "Authenticated users can view calendar events"
  on public.calendar_events for select to authenticated using (true);
create policy "Authenticated users can add calendar events"
  on public.calendar_events for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete calendar events"
  on public.calendar_events for delete to authenticated using (true);

-- ---------- Kelionės ----------
-- optional trip dates (so a trip can show up on the Kalendorius), a packing
-- list, and a day-by-day plan, each scoped to one travel.

alter table public.travels add column if not exists start_date date;
alter table public.travels add column if not exists end_date date;

create table public.travel_checklist_items (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.travel_checklist_items enable row level security;
create policy "Authenticated users can view travel checklist items"
  on public.travel_checklist_items for select to authenticated using (true);
create policy "Authenticated users can add travel checklist items"
  on public.travel_checklist_items for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update travel checklist items"
  on public.travel_checklist_items for update to authenticated using (true);
create policy "Authenticated users can delete travel checklist items"
  on public.travel_checklist_items for delete to authenticated using (true);

create table public.travel_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  day_date date not null,
  time text,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.travel_itinerary_items enable row level security;
create policy "Authenticated users can view travel itinerary items"
  on public.travel_itinerary_items for select to authenticated using (true);
create policy "Authenticated users can add travel itinerary items"
  on public.travel_itinerary_items for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete travel itinerary items"
  on public.travel_itinerary_items for delete to authenticated using (true);
