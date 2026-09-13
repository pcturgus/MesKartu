-- Mes (Us) tab: travels, memories, movies, savings

-- travels
create table public.travels (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  country text not null,
  created_at timestamptz not null default now()
);
alter table public.travels enable row level security;
create policy "Authenticated users can view travels"
  on public.travels for select to authenticated using (true);
create policy "Authenticated users can add travels"
  on public.travels for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete travels"
  on public.travels for delete to authenticated using (true);

-- memories
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  text text not null,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
create policy "Authenticated users can view memories"
  on public.memories for select to authenticated using (true);
create policy "Authenticated users can add memories"
  on public.memories for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete memories"
  on public.memories for delete to authenticated using (true);

-- movies
create table public.movies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  watched boolean not null default false,
  rating smallint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.movies enable row level security;
create policy "Authenticated users can view movies"
  on public.movies for select to authenticated using (true);
create policy "Authenticated users can add movies"
  on public.movies for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update movies"
  on public.movies for update to authenticated using (true);
create policy "Authenticated users can delete movies"
  on public.movies for delete to authenticated using (true);

-- savings goal: a single shared row
create table public.savings_goal (
  id smallint primary key default 1,
  label text not null default 'Bendra kelionė',
  target numeric(10,2) not null default 500,
  constraint savings_goal_singleton check (id = 1)
);
insert into public.savings_goal (id) values (1) on conflict (id) do nothing;
alter table public.savings_goal enable row level security;
create policy "Authenticated users can view savings goal"
  on public.savings_goal for select to authenticated using (true);
create policy "Authenticated users can update savings goal"
  on public.savings_goal for update to authenticated using (true);

-- contributions
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);
alter table public.contributions enable row level security;
create policy "Authenticated users can view contributions"
  on public.contributions for select to authenticated using (true);
create policy "Users can insert their own contributions"
  on public.contributions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own contributions"
  on public.contributions for delete to authenticated using (auth.uid() = user_id);
