import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddRunForm } from "@/components/AddRunForm";
import { RunsList } from "@/components/RunsList";
import { Avatar } from "@/components/Avatar";
import { TabNav } from "@/components/TabNav";
import { AppHeader } from "@/components/AppHeader";
import { GoalRoute } from "@/components/GoalRoute";
import { RecapCard } from "@/components/RecapCard";
import { TrendChart } from "@/components/TrendChart";
import { StreakGrid } from "@/components/StreakGrid";
import { Badges } from "@/components/Badges";
import { statsFor, fmtKm, fmtPace } from "@/lib/stats";
import { ACTIVITIES, isActivityType } from "@/lib/runs";
import { checkAndAwardBadges, fetchBadgeInputs } from "@/lib/badges-server";
import type { Profile, Run, Range, CoupleSettings, BadgeEarned } from "@/types/database";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const rangeParam = typeof params.range === "string" ? params.range : "week";
  const range: Range = rangeParam === "month" || rangeParam === "all" ? rangeParam : "week";
  const activityParam = typeof params.activity === "string" ? params.activity : "all";
  const activityFilter = activityParam !== "all" && isActivityType(activityParam) ? activityParam : null;

  const supabase = await createClient();

  const [
    { data: profiles },
    { data: runs },
    { data: coupleSettingsRows },
    {
      data: { user },
    },
    badgeInputs,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("runs").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
    supabase.auth.getUser(),
    // Folded into this same round trip instead of running afterward —
    // checkAndAwardBadges below reuses it instead of re-querying.
    fetchBadgeInputs(supabase),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allRuns = (runs ?? []) as Run[];
  const coupleSettings = (coupleSettingsRows?.[0] ?? {
    id: 1,
    start_date: null,
    goal_km: 260,
    goal_note: "Ryga",
  }) as CoupleSettings;

  const p0 = allProfiles[0];
  const p1 = allProfiles[1];
  const names: [string, string] = [p0?.name ?? "Mantas", p1?.name ?? "Diana"];
  const userIds: [string, string] = [p0?.id ?? "", p1?.id ?? ""];

  // The "Visos veiklos / Ėjimas / Bėgimas / ..." filter sits above every
  // section on this page (stats cards, goal progress, recap, trend,
  // streak, entries) — so it should apply to all of them, not just the
  // entries list below. Badges are the one deliberate exception: they're
  // overall achievements, not tied to whatever filter you happen to be
  // viewing.
  const filteredRuns = activityFilter ? allRuns.filter((r) => r.activity === activityFilter) : allRuns;
  const totalKm = filteredRuns.reduce((sum, r) => sum + Number(r.km), 0);

  let badgesEarned: BadgeEarned[] = badgeInputs.existing;
  if (p0 && p1) {
    // Cheap enough for two people, and keeps badges_earned honest even for
    // activity that doesn't itself re-check badges (e.g. a passing date).
    badgesEarned = await checkAndAwardBadges(supabase, userIds, badgeInputs);
  }
  badgesEarned = [...badgesEarned].sort((a, b) => a.earned_at.localeCompare(b.earned_at));

  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <AppHeader
        profiles={allProfiles}
        userId={user?.id}
        goalKm={Number(coupleSettings.goal_km)}
        goalNote={coupleSettings.goal_note}
      />

      <TabNav active="run" />

      {(() => {
        function hrefFor(nextRange: Range, nextActivity: string | null) {
          const q = new URLSearchParams();
          if (nextRange !== "week") q.set("range", nextRange);
          if (nextActivity) q.set("activity", nextActivity);
          const qs = q.toString();
          return qs ? `/?${qs}` : "/";
        }
        return (
          <>
            <div className="mt-4 flex justify-center gap-1 rounded-full border border-line bg-surface-2 p-1 w-fit mx-auto">
              {(["week", "month", "all"] as Range[]).map((r) => (
                <Link
                  key={r}
                  href={hrefFor(r, activityFilter)}
                  className="rounded-full px-4 py-2 text-sm font-bold"
                  style={
                    range === r
                      ? { background: "var(--accent-gradient)", color: "#fff" }
                      : { color: "var(--ink-faint)" }
                  }
                >
                  {r === "week" ? "Savaitė" : r === "month" ? "Mėnuo" : "Visi laikai"}
                </Link>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <Link
                href={hrefFor(range, null)}
                className="rounded-full border px-3 py-1.5 text-xs font-bold"
                style={
                  !activityFilter
                    ? { borderColor: "var(--dusk-soft)", background: "var(--surface-2)", color: "var(--ink)" }
                    : { borderColor: "var(--line)", color: "var(--ink-faint)" }
                }
              >
                Visos veiklos
              </Link>
              {ACTIVITIES.map((a) => (
                <Link
                  key={a.id}
                  href={hrefFor(range, a.id)}
                  className="rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={
                    activityFilter === a.id
                      ? { borderColor: "var(--dusk-soft)", background: "var(--surface-2)", color: "var(--ink)" }
                      : { borderColor: "var(--line)", color: "var(--ink-faint)" }
                  }
                >
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>
          </>
        );
      })()}

      <section className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allProfiles.map((p) => {
          const s = statsFor(p.id, range, filteredRuns);
          const accentVar = p.accent === "rose" ? "var(--rose)" : "var(--ember)";
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-line bg-surface p-5 text-center shadow-[var(--shadow)]"
              style={{ borderTop: `3px solid ${accentVar}` }}
            >
              <div className="flex items-center justify-center gap-2 font-bold" style={{ color: accentVar }}>
                <Avatar url={p.avatar_url} name={p.name} size={22} accent={accentVar} />
                {p.name}
              </div>
              <div className="mt-1 font-mono text-4xl" style={{ color: accentVar }}>
                {fmtKm(s.km)} <sup className="text-sm">km</sup>
              </div>
              <div className="mt-1 text-sm text-ink-faint">
                {s.count} įraš{s.count === 1 ? "as" : s.count >= 2 && s.count <= 9 ? "ai" : "ų"} · {fmtPace(s.pace)}
              </div>
            </div>
          );
        })}
        {allProfiles.length === 0 && (
          <p className="text-sm text-ink-faint">Dar nėra profilių — sukurk paskyras Supabase administravime.</p>
        )}
        {p0 && p1 && <AddRunForm variant="connector" />}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl" style={{ color: "var(--dusk)" }}>
          Įrašai
        </h2>
        <RunsList
          runs={filteredRuns}
          profiles={allProfiles}
          activityFilter={activityFilter}
          currentUserId={user?.id ?? null}
        />
      </section>

      {p0 && p1 && (
        <section className="mt-4">
          <GoalRoute totalKm={totalKm} goalKm={Number(coupleSettings.goal_km)} goalNote={coupleSettings.goal_note} />
        </section>
      )}

      {p0 && p1 && (
        <section className="mt-4">
          <RecapCard runs={filteredRuns} userIds={userIds} names={names} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Savaičių tendencija
        </h2>
        <TrendChart runs={filteredRuns} userIds={userIds} />
      </section>

      {p0 && p1 && (
        <section className="mt-8">
          <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
            Serija
          </h2>
          <StreakGrid runs={filteredRuns} userIds={userIds} names={names} />
        </section>
      )}

      {p0 && p1 && (
        <section id="pasiekimai" className="mt-8 scroll-mt-4">
          <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
            Pasiekimai
          </h2>
          <Badges badgesEarned={badgesEarned} userIds={userIds} names={names} />
        </section>
      )}
    </main>
  );
}
