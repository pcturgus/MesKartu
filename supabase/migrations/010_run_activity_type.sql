-- Lets a run entry be tagged with what kind of activity it was
-- (walking, running, rollerblading, cycling), not just "running".
-- Existing rows default to 'begimas' so nothing already logged changes.

alter table public.runs add column if not exists activity text not null default 'begimas';

alter table public.runs drop constraint if exists runs_activity_check;
alter table public.runs add constraint runs_activity_check
  check (activity in ('ejimas', 'begimas', 'rieduciai', 'dviraciai'));
