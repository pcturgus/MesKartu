-- Buitis tab: shopping list + shared tasks

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shopping_items enable row level security;
create policy "Authenticated users can view shopping items"
  on public.shopping_items for select to authenticated using (true);
create policy "Authenticated users can add shopping items"
  on public.shopping_items for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update shopping items"
  on public.shopping_items for update to authenticated using (true);
create policy "Authenticated users can delete shopping items"
  on public.shopping_items for delete to authenticated using (true);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  assignee text not null default 'both',
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "Authenticated users can view tasks"
  on public.tasks for select to authenticated using (true);
create policy "Authenticated users can add tasks"
  on public.tasks for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update tasks"
  on public.tasks for update to authenticated using (true);
create policy "Authenticated users can delete tasks"
  on public.tasks for delete to authenticated using (true);
