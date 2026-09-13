-- Auto tab: GTI (Mantas) + Tiguan (Diana), odometer/interval tracking, entries

create table public.cars (
  id text primary key,
  odometer integer,
  oil_interval_km integer not null default 15000,
  oil_interval_months integer not null default 12,
  gearbox_interval_km integer not null default 60000,
  gearbox_interval_months integer not null default 48,
  constraint cars_id_check check (id in ('gti', 'tiguan'))
);
insert into public.cars (id) values ('gti'), ('tiguan') on conflict (id) do nothing;
alter table public.cars enable row level security;
create policy "Authenticated users can view cars"
  on public.cars for select to authenticated using (true);
create policy "Authenticated users can update cars"
  on public.cars for update to authenticated using (true);

create table public.car_entries (
  id uuid primary key default gen_random_uuid(),
  car_id text not null references public.cars(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('service', 'repair', 'oil', 'gearbox')),
  date date not null,
  text text not null,
  km integer,
  cost numeric(8,2),
  created_at timestamptz not null default now()
);
alter table public.car_entries enable row level security;
create policy "Authenticated users can view car entries"
  on public.car_entries for select to authenticated using (true);
create policy "Authenticated users can add car entries"
  on public.car_entries for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete car entries"
  on public.car_entries for delete to authenticated using (true);
