-- Two RLS gaps found during a full app audit:

-- 1. badges_earned had SELECT + INSERT policies but no DELETE policy.
--    checkAndAwardBadges (src/lib/badges-server.ts) already tries to delete
--    a badge row once its condition stops holding (e.g. you delete the trip
--    that earned "Pirma kelionė") — without this policy, that delete is
--    silently filtered to 0 rows by RLS (no error, just a no-op), so
--    revoked badges piled up as permanent orphan rows in the table. The app
--    itself always recomputes badges fresh on every load so this wasn't
--    visible in the UI, but the underlying data was never actually cleaned
--    up. This just lets the delete the app already attempts actually work.
create policy "Authenticated users can revoke badges"
  on public.badges_earned for delete to authenticated using (true);

-- 2. capsules could be read in full (including the sealed `text`) by
--    ANY authenticated user at ANY time via a direct Supabase query — the
--    app's own page only ever *displayed* the text after unlock_date, but
--    nothing stopped a partner from bypassing the app (e.g. browser
--    devtools + the public anon key + their own session) and querying
--    `capsules` directly to read a still-locked letter early. RLS is
--    row-level, so the fix is to not return the row at all to anyone but
--    its author until it's actually unlocked, rather than trying to hide
--    just the text.
--
--    Trade-off: your partner will no longer see a pending capsule's
--    "from X · unlocks in N days" preview card before it unlocks — the
--    whole row (not just the text) is invisible to them until then. If you
--    want that preview back, let me know and I can look at a safer way to
--    expose just the id/unlock_date/creator without the sealed text.
drop policy if exists "Authenticated users can view capsules" on public.capsules;
create policy "Capsule author can always view their own capsule"
  on public.capsules for select to authenticated
  using (created_by = auth.uid());
create policy "Anyone can view an unlocked capsule"
  on public.capsules for select to authenticated
  using (unlock_date <= current_date);

-- Same idea for opening one: don't let it be marked opened before its own
-- unlock date unless you're the one who wrote it.
drop policy if exists "Authenticated users can open capsules" on public.capsules;
create policy "Authenticated users can open an unlocked (or own) capsule"
  on public.capsules for update to authenticated
  using (unlock_date <= current_date or created_by = auth.uid());
