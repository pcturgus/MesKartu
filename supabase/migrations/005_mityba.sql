-- Mityba tab: daily calorie goal, meal/calorie log, supplements

create table public.calorie_goal (
  id smallint primary key default 1,
  goal integer,
  constraint calorie_goal_singleton check (id = 1)
);
insert into public.calorie_goal (id) values (1) on conflict (id) do nothing;
alter table public.calorie_goal enable row level security;
create policy "Authenticated users can view calorie goal"
  on public.calorie_goal for select to authenticated using (true);
create policy "Authenticated users can update calorie goal"
  on public.calorie_goal for update to authenticated using (true);

create table public.quick_foods (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  kcal_per_100g numeric(6,1) not null,
  created_at timestamptz not null default now()
);
alter table public.quick_foods enable row level security;
create policy "Authenticated users can view quick foods"
  on public.quick_foods for select to authenticated using (true);
create policy "Authenticated users can add quick foods"
  on public.quick_foods for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete quick foods"
  on public.quick_foods for delete to authenticated using (true);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  text text not null,
  grams numeric(7,1),
  calories integer,
  created_at timestamptz not null default now()
);
alter table public.meals enable row level security;
create policy "Authenticated users can view meals"
  on public.meals for select to authenticated using (true);
create policy "Authenticated users can add meals"
  on public.meals for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete meals"
  on public.meals for delete to authenticated using (true);

create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.supplements enable row level security;
create policy "Authenticated users can view supplements"
  on public.supplements for select to authenticated using (true);
create policy "Authenticated users can add supplements"
  on public.supplements for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete supplements"
  on public.supplements for delete to authenticated using (true);

create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (supplement_id, date)
);
alter table public.supplement_logs enable row level security;
create policy "Authenticated users can view supplement logs"
  on public.supplement_logs for select to authenticated using (true);
create policy "Authenticated users can add supplement logs"
  on public.supplement_logs for insert to authenticated with check (true);
create policy "Authenticated users can delete supplement logs"
  on public.supplement_logs for delete to authenticated using (true);
