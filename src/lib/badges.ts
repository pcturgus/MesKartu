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
} from "@/types/database";
import { sumKm, longestStreak, sharedDaysCount, WEATHER } from "@/lib/runs";

export type BadgeScope = "personal" | "shared";

export type BadgeDef = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  scope: BadgeScope;
};

// The full badge catalog. Badges component only ever renders the ones a
// person (or the couple) actually has a badges_earned row for — nothing
// here is shown "dimmed" or as a locked placeholder.
export const BADGE_DEFS: BadgeDef[] = [
  // ---- judėjimas: ėjimas / bėgimas / riedučiai / dviračiai (personal) ----
  { id: "first", icon: "🎬", title: "Pirmas žingsnis", desc: "Įrašytas pirmas įrašas", scope: "personal" },
  { id: "km10", icon: "🔟", title: "10 km klubas", desc: "Iš viso surinkta 10 km", scope: "personal" },
  { id: "km50", icon: "🥉", title: "50 km klubas", desc: "Iš viso surinkta 50 km", scope: "personal" },
  { id: "km100", icon: "💯", title: "100 km klubas", desc: "Iš viso surinkta 100 km", scope: "personal" },
  { id: "km250", icon: "🥈", title: "250 km klubas", desc: "Iš viso surinkta 250 km", scope: "personal" },
  { id: "km500", icon: "🏅", title: "500 km klubas", desc: "Iš viso surinkta 500 km", scope: "personal" },
  { id: "km1000", icon: "🥇", title: "1000 km klubas", desc: "Iš viso surinkta 1000 km", scope: "personal" },
  { id: "streak3", icon: "🔥", title: "3 dienų serija", desc: "Judėta 3 dienas iš eilės", scope: "personal" },
  { id: "streak7", icon: "⚡", title: "7 dienų serija", desc: "Judėta 7 dienas iš eilės", scope: "personal" },
  { id: "streak14", icon: "🌟", title: "14 dienų serija", desc: "Judėta 14 dienų iš eilės", scope: "personal" },
  { id: "long10", icon: "🏃", title: "Ilgio rekordas", desc: "Vienas įrašas 10 km ar daugiau", scope: "personal" },
  { id: "long21", icon: "🏅", title: "Pusmaratonis", desc: "Vienas įrašas 21 km ar daugiau", scope: "personal" },
  {
    id: "fast",
    icon: "💨",
    title: "Greitasis bėgikas",
    desc: "3 km+ bėgimas greičiau nei 5:30 min/km tempu",
    scope: "personal",
  },
  {
    id: "weather_variety",
    icon: "🌈",
    title: "Visų orų sportininkas",
    desc: "Judėta visomis oro sąlygomis",
    scope: "personal",
  },
  {
    id: "mood_great10",
    icon: "😄",
    title: "Puikios nuotaikos",
    desc: "10 įrašų pažymėta „Puikiai“ savijauta",
    scope: "personal",
  },

  // ---- other categories (personal) ----
  { id: "traveler1", icon: "✈️", title: "Pirma kelionė", desc: "Įrašyta pirma kelionė", scope: "personal" },
  { id: "traveler5", icon: "🌍", title: "Keliautojas", desc: "Įrašyta 5 kelionės", scope: "personal" },
  { id: "memories10", icon: "💛", title: "Prisiminimų rinkėjas", desc: "Parašyta 10 prisiminimų", scope: "personal" },
  { id: "memories30", icon: "📔", title: "Atminties saugotojas", desc: "Parašyta 30 prisiminimų", scope: "personal" },
  { id: "movie_buff", icon: "🎬", title: "Kino mėgėjas", desc: "Į sąrašą pridėta 10 filmų", scope: "personal" },
  { id: "saver", icon: "💶", title: "Taupytojas", desc: "Sutaupyta 50 € kelionei", scope: "personal" },
  { id: "saver_pro", icon: "💰", title: "Taupymo meistras", desc: "Sutaupyta 200 € kelionei", scope: "personal" },
  { id: "planner", icon: "🎉", title: "Progų planuotojas", desc: "Pridėta 5 progos", scope: "personal" },
  {
    id: "time_capsule_writer",
    icon: "💌",
    title: "Laiškų rašytojas",
    desc: "Parašytos 3 laiko kapsulės",
    scope: "personal",
  },

  // ---- shared (couple) ----
  { id: "together5", icon: "🤝", title: "5 vakarai kartu", desc: "Abu buvote aktyvūs tą pačią dieną 5 kartus", scope: "shared" },
  {
    id: "together15",
    icon: "💪",
    title: "15 vakarų kartu",
    desc: "Abu buvote aktyvūs tą pačią dieną 15 kartų",
    scope: "shared",
  },
  { id: "goal_reached", icon: "🏆", title: "Tikslas pasiektas", desc: "Bendras atstumo tikslas pasiektas", scope: "shared" },
  { id: "world_explorers", icon: "🗺️", title: "Pasaulio tyrinėtojai", desc: "Aplankyta 10 šalių", scope: "shared" },
  { id: "memory_keepers", icon: "📖", title: "Prisiminimų knyga", desc: "Užrašyta 25 bendri prisiminimai", scope: "shared" },
  { id: "movie_night10", icon: "🍿", title: "Kino vakarai", desc: "Kartu peržiūrėta 10 filmų", scope: "shared" },
  {
    id: "savings_goal_hit",
    icon: "🎯",
    title: "Santaupų tikslas",
    desc: "Santaupų tikslas pasiektas",
    scope: "shared",
  },
  { id: "capsule_trio", icon: "🔓", title: "Trys laiškai", desc: "Atidarytos 3 laiko kapsulės", scope: "shared" },
  { id: "one_year", icon: "💞", title: "Metai kartu", desc: "Kartu jau bent metai", scope: "shared" },
];

export function badgeDef(id: string): BadgeDef | undefined {
  return BADGE_DEFS.find((b) => b.id === id);
}

export type BadgeCheckInput = {
  runs: Run[];
  travels: Travel[];
  memories: Memory[];
  movies: Movie[];
  contributions: Contribution[];
  milestones: Milestone[];
  capsules: Capsule[];
  coupleSettings: CoupleSettings;
  savingsGoal: SavingsGoal;
  userIds: [string, string];
};

// Recomputes badge eligibility from scratch every time it's called — cheap
// enough for a two-person app, and it means badges_earned always reflects
// the true current state (a badge is never awarded from stale data).
export function computeEarnedBadgeIds(input: BadgeCheckInput): {
  personal: Record<string, string[]>;
  shared: string[];
} {
  const { runs, travels, memories, movies, contributions, milestones, capsules, coupleSettings, savingsGoal, userIds } =
    input;

  const personal: Record<string, string[]> = { [userIds[0]]: [], [userIds[1]]: [] };

  for (const userId of userIds) {
    const total = sumKm(userId, runs);
    const streak = longestStreak(userId, runs);
    const userRuns = runs.filter((r) => r.user_id === userId);
    const ids: string[] = [];

    if (userRuns.length > 0) ids.push("first");
    if (total >= 10) ids.push("km10");
    if (total >= 50) ids.push("km50");
    if (total >= 100) ids.push("km100");
    if (total >= 250) ids.push("km250");
    if (total >= 500) ids.push("km500");
    if (total >= 1000) ids.push("km1000");
    if (streak >= 3) ids.push("streak3");
    if (streak >= 7) ids.push("streak7");
    if (streak >= 14) ids.push("streak14");
    if (userRuns.some((r) => Number(r.km) >= 10)) ids.push("long10");
    if (userRuns.some((r) => Number(r.km) >= 21)) ids.push("long21");
    if (
      userRuns.some(
        (r) => r.activity === "begimas" && Number(r.km) >= 3 && r.duration_min != null && r.duration_min / Number(r.km) <= 5.5
      )
    ) {
      ids.push("fast");
    }
    const weathersUsed = new Set(userRuns.map((r) => r.weather).filter(Boolean));
    if (weathersUsed.size >= WEATHER.length) ids.push("weather_variety");
    if (userRuns.filter((r) => r.mood === "great").length >= 10) ids.push("mood_great10");

    const userTravels = travels.filter((t) => t.created_by === userId).length;
    if (userTravels >= 1) ids.push("traveler1");
    if (userTravels >= 5) ids.push("traveler5");

    const userMemories = memories.filter((m) => m.created_by === userId).length;
    if (userMemories >= 10) ids.push("memories10");
    if (userMemories >= 30) ids.push("memories30");

    if (movies.filter((m) => m.created_by === userId).length >= 10) ids.push("movie_buff");

    const userSaved = contributions.filter((c) => c.user_id === userId).reduce((s, c) => s + Number(c.amount), 0);
    if (userSaved >= 50) ids.push("saver");
    if (userSaved >= 200) ids.push("saver_pro");

    if (milestones.filter((m) => m.created_by === userId).length >= 5) ids.push("planner");
    if (capsules.filter((c) => c.created_by === userId).length >= 3) ids.push("time_capsule_writer");

    personal[userId] = ids;
  }

  const shared: string[] = [];
  const sharedDays = sharedDaysCount(runs, userIds);
  if (sharedDays >= 5) shared.push("together5");
  if (sharedDays >= 15) shared.push("together15");

  const totalKm = runs.reduce((s, r) => s + Number(r.km), 0);
  if (coupleSettings.goal_km > 0 && totalKm >= coupleSettings.goal_km) shared.push("goal_reached");

  const uniqueCountries = new Set(travels.map((t) => t.country.trim().toLowerCase()));
  if (uniqueCountries.size >= 10) shared.push("world_explorers");

  if (memories.length >= 25) shared.push("memory_keepers");
  if (movies.filter((m) => m.watched).length >= 10) shared.push("movie_night10");

  const totalSaved = contributions.reduce((s, c) => s + Number(c.amount), 0);
  if (savingsGoal.target > 0 && totalSaved >= savingsGoal.target) shared.push("savings_goal_hit");

  if (capsules.filter((c) => c.opened).length >= 3) shared.push("capsule_trio");

  if (coupleSettings.start_date) {
    const start = new Date(coupleSettings.start_date + "T00:00:00");
    const days = Math.floor((Date.now() - start.getTime()) / 86400000);
    if (days >= 365) shared.push("one_year");
  }

  return { personal, shared };
}
