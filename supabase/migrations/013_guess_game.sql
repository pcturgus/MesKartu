-- "Kaip gerai mane pažįsti" žaidimas Mes skiltyje: kas raundą vienas
-- profilis (target) tikrai atsako į klausimą apie save, kitas (guesser)
-- spėja, ką jis atsakys; kai abu atsakę, bet kuris pažymi ar atspėjo.

create table public.guess_game_rounds (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  target_answer text,
  guesser_answer text,
  correct boolean,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.guess_game_rounds enable row level security;
create policy "Authenticated users can view guess game rounds"
  on public.guess_game_rounds for select to authenticated using (true);
create policy "Authenticated users can add guess game rounds"
  on public.guess_game_rounds for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated users can update guess game rounds"
  on public.guess_game_rounds for update to authenticated using (true);
create policy "Authenticated users can delete guess game rounds"
  on public.guess_game_rounds for delete to authenticated using (true);
