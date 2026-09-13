-- The Auto (car maintenance) feature was removed from the site. Clean up
-- its earned badges so the Pasiekimai section doesn't keep a stale entry
-- for a badge that no longer exists in the app.
-- The cars / car_entries tables themselves are left in place on purpose —
-- no data is lost. Drop them yourself later if you're sure you don't want
-- them anymore:
--   drop table if exists public.car_entries;
--   drop table if exists public.cars;

delete from public.badges_earned where badge_id in ('car_logger', 'car_duo');
