-- Bėgimas tab: weather/mood/photo on runs, shared goal, profile renaming

alter table public.runs add column if not exists weather text;
alter table public.runs add column if not exists mood text;
alter table public.runs add column if not exists photo_url text;

alter table public.couple_settings add column if not exists goal_km numeric(8,2) not null default 260;
alter table public.couple_settings add column if not exists goal_note text default 'Ryga';

-- Let each person rename themselves in Settings.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
