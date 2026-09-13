-- Kartu tab: together-since counter + milestones, and time capsules

-- couple settings: singleton row holding the "together since" date
create table public.couple_settings (
  id smallint primary key default 1,
  start_date date,
  constraint couple_settings_singleton check (id = 1)
);
insert into public.couple_settings (id) values (1) on conflict (id) do nothing;
alter table public.couple_settings enable row level security;
create policy "Authenticated users can view couple settings"
  on public.couple_settings for select to authenticated using (true);
create policy "Authenticated users can update couple settings"
  on public.couple_settings for update to authenticated using (true);

-- milestones: birthdays, anniversaries, recurring or one-off
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  date date not null,
  recurring boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.milestones enable row level security;
create policy "Authenticated users can view milestones"
  on public.milestones for select to authenticated using (true);
create policy "Authenticated users can add milestones"
  on public.milestones for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can delete milestones"
  on public.milestones for delete to authenticated using (true);

-- capsules: sealed letters that unlock on a future date
create table public.capsules (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  unlock_date date not null,
  text text not null,
  opened boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.capsules enable row level security;
create policy "Authenticated users can view capsules"
  on public.capsules for select to authenticated using (true);
create policy "Authenticated users can add capsules"
  on public.capsules for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can open capsules"
  on public.capsules for update to authenticated using (true);
create policy "Authenticated users can delete capsules"
  on public.capsules for delete to authenticated using (true);
