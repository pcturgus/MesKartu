import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TabNav } from "@/components/TabNav";
import { AddMilestoneForm } from "@/components/kalendorius/AddMilestoneForm";
import { AddEventForm } from "@/components/kalendorius/AddEventForm";
import { MonthGrid, type DayMarker } from "@/components/kalendorius/MonthGrid";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { AppHeader } from "@/components/AppHeader";
import { deleteMilestone, deleteCalendarEvent } from "@/app/kalendorius/actions";
import { nextOccurrence, todayKey, todayAtMidnight } from "@/lib/dates";
import {
  parseMonthKey,
  monthKeyOf,
  shiftMonthKey,
  occursOn,
  rangeOccursOn,
  daysInMonth,
  firstWeekdayMon,
  LT_MONTH_NAMES,
} from "@/lib/calendar";
import type { Profile, Milestone, CalendarEvent, Travel, CoupleSettings } from "@/types/database";

export default async function KalendoriusPage({ searchParams }: PageProps<"/kalendorius">) {
  const params = await searchParams;
  // Vilnius-anchored, not the server's own local time (Vercel runs UTC) —
  // otherwise which month opens by default could be off by a day right
  // around midnight.
  const todayMid = todayAtMidnight();
  const defaultMonthKey = monthKeyOf(todayMid.getFullYear(), todayMid.getMonth());
  // Requires a real month (01-12) and a 4-digit year that doesn't start
  // with "0" — a hand-typed/bookmarked ?month= with an out-of-range month
  // (e.g. "13") or a year like "0050" would otherwise either render an
  // unlabeled month (LT_MONTH_NAMES[undefined]) or get silently
  // reinterpreted by JS's legacy two-digit-year Date behavior (year "50"
  // becomes 1950), disagreeing with the printed heading.
  const monthKey =
    typeof params.month === "string" && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(params.month)
      ? params.month
      : defaultMonthKey;
  const { year, month } = parseMonthKey(monthKey);

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: profiles },
    { data: milestoneRows },
    { data: eventRows },
    { data: travelRows },
    { data: coupleSettingsRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("milestones").select("*"),
    supabase.from("calendar_events").select("*"),
    supabase.from("travels").select("*"),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allMilestones = (milestoneRows ?? []) as Milestone[];
  const allEvents = (eventRows ?? []) as CalendarEvent[];
  const allTravels = (travelRows ?? []) as Travel[];
  const coupleSettings = (coupleSettingsRows?.[0] ?? {
    id: 1,
    start_date: null,
    goal_km: 260,
    goal_note: "Ryga",
  }) as CoupleSettings;

  const nDays = daysInMonth(year, month);
  const offset = firstWeekdayMon(year, month);
  const todayStr = todayKey();

  const markers: Record<number, DayMarker> = {};
  for (let day = 1; day <= nDays; day++) {
    const m: DayMarker = {};
    if (allMilestones.some((ms) => occursOn(ms.date, ms.recurring, year, month, day))) m.milestone = true;
    if (allEvents.some((ev) => occursOn(ev.date, ev.recurring_yearly, year, month, day))) m.event = true;
    if (allTravels.some((t) => rangeOccursOn(t.start_date, t.end_date, year, month, day))) m.trip = true;
    if (m.milestone || m.event || m.trip) markers[day] = m;
  }

  // This month's items, for the list under the grid.
  type MonthItem =
    | { kind: "milestone"; day: number; label: string; id: string }
    | { kind: "event"; day: number; label: string; id: string; note: string | null }
    | { kind: "trip"; day: number; label: string };
  const monthItems: MonthItem[] = [];
  for (const ms of allMilestones) {
    for (let day = 1; day <= nDays; day++) {
      if (occursOn(ms.date, ms.recurring, year, month, day)) monthItems.push({ kind: "milestone", day, label: ms.label, id: ms.id });
    }
  }
  for (const ev of allEvents) {
    for (let day = 1; day <= nDays; day++) {
      if (occursOn(ev.date, ev.recurring_yearly, year, month, day))
        monthItems.push({ kind: "event", day, label: ev.title, id: ev.id, note: ev.note });
    }
  }
  for (const t of allTravels) {
    // List the trip once, on the first day of its stay that falls in this month.
    for (let day = 1; day <= nDays; day++) {
      const startsHere = day === 1 || !rangeOccursOn(t.start_date, t.end_date, year, month, day - 1);
      if (rangeOccursOn(t.start_date, t.end_date, year, month, day) && startsHere) {
        monthItems.push({ kind: "trip", day, label: t.country });
      }
    }
  }
  monthItems.sort((a, b) => a.day - b.day);

  // Nearest upcoming item overall, for the highlight card.
  const upcoming: { label: string; icon: string; days: number }[] = [];
  const nowMid = todayMid;
  for (const ms of allMilestones) {
    const next = nextOccurrence(ms.date, ms.recurring);
    upcoming.push({ label: ms.label, icon: "🎉", days: Math.round((next.getTime() - nowMid.getTime()) / 86400000) });
  }
  for (const ev of allEvents) {
    const next = nextOccurrence(ev.date, ev.recurring_yearly);
    upcoming.push({ label: ev.title, icon: "📌", days: Math.round((next.getTime() - nowMid.getTime()) / 86400000) });
  }
  for (const t of allTravels) {
    if (t.start_date && t.start_date >= todayStr) {
      const next = new Date(t.start_date + "T00:00:00");
      upcoming.push({ label: t.country, icon: "✈️", days: Math.round((next.getTime() - nowMid.getTime()) / 86400000) });
    }
  }
  upcoming.sort((a, b) => a.days - b.days);
  const nearest = upcoming.find((u) => u.days >= 0) ?? null;

  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <AppHeader
        profiles={allProfiles}
        userId={user?.id}
        goalKm={Number(coupleSettings.goal_km)}
        goalNote={coupleSettings.goal_note}
      />

      <TabNav active="kalendorius" />

      {nearest && (
        <section className="mt-8">
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-[var(--shadow)] text-white flex items-center gap-3"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% -10%, rgba(255,255,255,.25), transparent 55%), linear-gradient(160deg, var(--accent-fill-1), var(--ember) 130%)",
            }}
          >
            <span className="text-2xl leading-none">{nearest.icon}</span>
            <div>
              <div className="font-bold">{nearest.label}</div>
              <div className="text-xs opacity-85">{nearest.days === 0 ? "Šiandien! 🎉" : `už ${nearest.days} d.`}</div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/kalendorius?month=${shiftMonthKey(monthKey, -1)}`}
              className="rounded-full border border-line px-3 py-1.5 text-sm font-bold text-ink-soft"
            >
              ◀
            </Link>
            <h2 className="text-xl font-bold w-40 text-center" style={{ color: "var(--dusk)" }}>
              {LT_MONTH_NAMES[month]} {year}
            </h2>
            <Link
              href={`/kalendorius?month=${shiftMonthKey(monthKey, 1)}`}
              className="rounded-full border border-line px-3 py-1.5 text-sm font-bold text-ink-soft"
            >
              ▶
            </Link>
          </div>
          <div className="flex gap-2">
            <AddEventForm />
            <AddMilestoneForm />
          </div>
        </div>

        <MonthGrid year={year} month={month} nDays={nDays} offset={offset} todayStr={todayStr} markers={markers} />
      </section>

      <section className="mt-8 mb-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Šio mėnesio įvykiai
        </h2>
        {monthItems.length === 0 ? (
          <p className="text-sm text-ink-faint">Šį mėnesį įrašytų progų ar įvykių nėra.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {monthItems.map((it, i) => (
              <li
                key={`${it.kind}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5"
              >
                <span className="text-base leading-none">{it.kind === "milestone" ? "🎉" : it.kind === "event" ? "📌" : "✈️"}</span>
                <span className="font-mono text-xs text-ink-faint w-8">{it.day} d.</span>
                <span className="flex-1 text-sm">
                  {it.label}
                  {it.kind === "event" && it.note && <span className="text-ink-faint"> — {it.note}</span>}
                  {it.kind === "trip" && <span className="text-ink-faint"> · žr. Kelionės skiltį</span>}
                </span>
                {it.kind === "milestone" && <ConfirmDeleteButton action={deleteMilestone.bind(null, it.id)} />}
                {it.kind === "event" && <ConfirmDeleteButton action={deleteCalendarEvent.bind(null, it.id)} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
