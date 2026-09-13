-- Real-map support for the "Aktyvumas" goal route: cache the destination's
-- geocoded coordinates and a driving-route polyline (from OpenStreetMap
-- Nominatim + OSRM) so the app doesn't call those services on every page
-- load — only when the goal destination is saved in Settings.

alter table public.couple_settings add column if not exists goal_lat double precision;
alter table public.couple_settings add column if not exists goal_lng double precision;
alter table public.couple_settings add column if not exists goal_route jsonb;
