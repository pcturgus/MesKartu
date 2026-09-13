import type { SupabaseClient } from "@supabase/supabase-js";
import { computeEarnedBadgeIds, badgeDef } from "@/lib/badges";
import { notifySelf, notifyBoth } from "@/lib/notify";
import type {
  Run,
  Travel,
  Memory,
  Movie,
  Contribution,
  Milestone,
  Capsule,
  CoupleSettings,
  SavingsGoal,
  BadgeEarned,
} from "@/types/database";

const SHARED_KEY = "00000000-0000-0000-0000-000000000000";

export type BadgeInputs = {
  runs: Run[];
  travels: Travel[];
  memories: Memory[];
  movies: Movie[];
  contributions: Contribution[];
  milestones: Milestone[];
  capsules: Capsule[];
  coupleSettings: CoupleSettings;
  savingsGoal: SavingsGoal;
  existing: BadgeEarned[];
};

// The 10 queries checkAndAwardBadges needs, split out on their own so a
// caller that's already firing off a big Promise.all for its own page data
// (e.g. the Aktyvumas page) can fold these into that same round trip
// instead of paying for a second sequential batch of queries.
export async function fetchBadgeInputs(supabase: SupabaseClient): Promise<BadgeInputs> {
  const [
    { data: runs },
    { data: travels },
    { data: memories },
    { data: movies },
    { data: contributions },
    { data: milestones },
    { data: capsules },
    { data: coupleSettingsRows },
    { data: savingsGoalRows },
    { data: existing },
  ] = await Promise.all([
    supabase.from("runs").select("*"),
    supabase.from("travels").select("*"),
    supabase.from("memories").select("*"),
    supabase.from("movies").select("*"),
    supabase.from("contributions").select("*"),
    supabase.from("milestones").select("*"),
    supabase.from("capsules").select("*"),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
    supabase.from("savings_goal").select("*").eq("id", 1).limit(1),
    supabase.from("badges_earned").select("*"),
  ]);

  return {
    runs: (runs ?? []) as Run[],
    travels: (travels ?? []) as Travel[],
    memories: (memories ?? []) as Memory[],
    movies: (movies ?? []) as Movie[],
    contributions: (contributions ?? []) as Contribution[],
    milestones: (milestones ?? []) as Milestone[],
    capsules: (capsules ?? []) as Capsule[],
    coupleSettings: (coupleSettingsRows?.[0] ?? { id: 1, start_date: null, goal_km: 260, goal_note: null }) as CoupleSettings,
    savingsGoal: (savingsGoalRows?.[0] ?? { id: 1, label: "Bendra kelionė", target: 500 }) as SavingsGoal,
    existing: (existing ?? []) as BadgeEarned[],
  };
}

// Recomputes every badge from scratch, diffs against what's already in
// badges_earned, and awards + notifies about whatever is newly earned.
// Called at the end of every "add" server action — cheap enough for two
// people, and it means a badge is awarded the moment it's actually earned
// rather than only when someone happens to open the Aktyvumas tab.
//
// Pass `prefetched` when the caller already fetched a fresh BadgeInputs
// batch itself (folded into its own page-load Promise.all) so this skips
// re-querying everything. Returns the up-to-date badges_earned list
// (existing rows plus anything just inserted) so a caller that needs it
// for immediate rendering doesn't have to issue a second SELECT.
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userIds: [string, string],
  prefetched?: BadgeInputs
): Promise<BadgeEarned[]> {
  const inputs = prefetched ?? (await fetchBadgeInputs(supabase));
  const { existing, ...badgeData } = inputs;

  const { personal, shared } = computeEarnedBadgeIds({ ...badgeData, userIds });

  const stillEarned = new Set<string>();
  for (const userId of userIds) {
    for (const badgeId of personal[userId] ?? []) stillEarned.add(`${badgeId}|${userId}`);
  }
  for (const badgeId of shared) stillEarned.add(`${badgeId}|${SHARED_KEY}`);

  const already = new Set(existing.map((b) => `${b.badge_id}|${b.user_id ?? SHARED_KEY}`));

  const newRows: { badge_id: string; user_id: string | null }[] = [];

  for (const userId of userIds) {
    for (const badgeId of personal[userId] ?? []) {
      if (already.has(`${badgeId}|${userId}`)) continue;
      newRows.push({ badge_id: badgeId, user_id: userId });
      const def = badgeDef(badgeId);
      if (def) await notifySelf(supabase, userId, `🏅 Naujas pasiekimas: ${def.title}`, "/#pasiekimai");
    }
  }
  for (const badgeId of shared) {
    if (already.has(`${badgeId}|${SHARED_KEY}`)) continue;
    newRows.push({ badge_id: badgeId, user_id: null });
    const def = badgeDef(badgeId);
    if (def) await notifyBoth(supabase, userIds, `🏆 Naujas bendras pasiekimas: ${def.title}`, "/#pasiekimai");
  }

  // Every badge here is a live threshold against current data (km total,
  // trip count, etc.) — the whole point of recomputing from scratch each
  // time is that badges_earned reflects the truth right now. But deleting
  // whatever earned a badge (e.g. the trip behind "Pirma kelionė") only
  // ever showed up on the *award* side before: nothing ever removed the
  // row once the condition stopped holding, so a revoked badge stayed
  // forever. Delete any earned row whose condition no longer holds, same
  // as we'd insert one whose condition just started holding.
  const staleRows = existing.filter((b) => !stillEarned.has(`${b.badge_id}|${b.user_id ?? SHARED_KEY}`));
  let current = existing;
  if (staleRows.length > 0) {
    await Promise.all(staleRows.map((b) => supabase.from("badges_earned").delete().eq("id", b.id)));
    const staleIds = new Set(staleRows.map((b) => b.id));
    current = current.filter((b) => !staleIds.has(b.id));
  }

  if (newRows.length === 0) return current;

  // Ignore duplicate-key races (e.g. both partners triggering the same
  // shared badge at nearly the same time) — the unique index protects us.
  const { data: inserted } = await supabase.from("badges_earned").insert(newRows).select("*");
  return [...current, ...((inserted ?? []) as BadgeEarned[])];
}
