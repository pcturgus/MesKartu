-- Profile avatars, a badges_earned ledger (so "Pasiekimai" only ever shows
-- badges you actually have, and so newly-earned ones can trigger a
-- notification), and a notifications inbox shared between the two of you.

-- profile avatar
alter table public.profiles add column if not exists avatar_url text;

-- badges_earned: one row per (badge, user) for personal badges, or
-- (badge, NULL) for a shared/couple badge. The unique index treats a NULL
-- user_id as a single shared "slot" per badge so it can't be awarded twice.
create table if not exists public.badges_earned (
  id uuid primary key default gen_random_uuid(),
  badge_id text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  earned_at timestamptz not null default now()
);
alter table public.badges_earned enable row level security;

create unique index if not exists badges_earned_unique
  on public.badges_earned (badge_id, coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid));

drop policy if exists "Authenticated users can view badges" on public.badges_earned;
create policy "Authenticated users can view badges"
  on public.badges_earned for select to authenticated using (true);

drop policy if exists "Authenticated users can award badges" on public.badges_earned;
create policy "Authenticated users can award badges"
  on public.badges_earned for insert to authenticated with check (true);

-- notifications: a small inbox. user_id is the recipient, actor_id is who
-- (or what, for a badge you earned yourself) triggered it.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  message text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Authenticated users can send notifications" on public.notifications;
create policy "Authenticated users can send notifications"
  on public.notifications for insert to authenticated with check (true);

drop policy if exists "Users can mark their own notifications read" on public.notifications;
create policy "Users can mark their own notifications read"
  on public.notifications for update to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete to authenticated using (auth.uid() = user_id);
