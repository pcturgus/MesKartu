-- Photo uploads: a shared Storage bucket for run/memory/travel photos,
-- plus a travel_photos table (a travel can have many photos).

-- storage bucket (public so <img src> can load photos directly)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Photos are publicly viewable" on storage.objects;
create policy "Photos are publicly viewable"
  on storage.objects for select
  to public
  using (bucket_id = 'photos');

drop policy if exists "Authenticated users can upload photos" on storage.objects;
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

drop policy if exists "Authenticated users can delete photos" on storage.objects;
create policy "Authenticated users can delete photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

-- travel photos (many per travel; travels themselves had no photo storage before)
create table if not exists public.travel_photos (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete cascade,
  url text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.travel_photos enable row level security;

drop policy if exists "Authenticated users can view travel photos" on public.travel_photos;
create policy "Authenticated users can view travel photos"
  on public.travel_photos for select to authenticated using (true);

drop policy if exists "Authenticated users can add travel photos" on public.travel_photos;
create policy "Authenticated users can add travel photos"
  on public.travel_photos for insert to authenticated with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can delete travel photos" on public.travel_photos;
create policy "Authenticated users can delete travel photos"
  on public.travel_photos for delete to authenticated using (true);
