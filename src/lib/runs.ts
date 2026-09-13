import type { ActivityType, Run } from "@/types/database";
import { dayKey } from "@/lib/dates";

export const ACTIVITIES: { id: ActivityType; icon: string; label: string; genitive: string }[] = [
  { id: "ejimas", icon: "🚶", label: "Ėjimas", genitive: "ėjimo" },
  { id: "begimas", icon: "🏃", label: "Bėgimas", genitive: "bėgimo" },
  { id: "rieduciai", icon: "⛸️", label: "Riedučiai", genitive: "riedučių" },
  { id: "dviraciai", icon: "🚴", label: "Dviračiai", genitive: "dviračių" },
] as const;

export function activityIcon(id: string | null | undefined): string {
  return ACTIVITIES.find((a) => a.id === id)?.icon ?? "🏃";
}
export function activityLabel(id: string | null | undefined): string {
  return ACTIVITIES.find((a) => a.id === id)?.label ?? "Bėgimas";
}
export function activityGenitive(id: string | null | undefined): string {
  return ACTIVITIES.find((a) => a.id === id)?.genitive ?? "bėgimo";
}
export function isActivityType(id: string): id is ActivityType {
  return ACTIVITIES.some((a) => a.id === id);
}

export const WEATHER = [
  { id: "sun", icon: "☀️", label: "Saulėta" },
  { id: "cloud", icon: "⛅", label: "Debesuota" },
  { id: "rain", icon: "🌧️", label: "Lietinga" },
  { id: "cold", icon: "❄️", label: "Šalta" },
  { id: "wind", icon: "💨", label: "Vėjuota" },
] as const;

export const MOOD = [
  { id: "great", icon: "😄", label: "Puikiai" },
  { id: "good", icon: "🙂", label: "Gerai" },
  { id: "meh", icon: "😐", label: "Vidutiniškai" },
  { id: "hard", icon: "😩", label: "Sunkiai" },
] as const;

export function weatherIcon(id: string | null): string {
  return WEATHER.find((w) => w.id === id)?.icon ?? "";
}
export function moodIcon(id: string | null): string {
  return MOOD.find((m) => m.id === id)?.icon ?? "";
}

export function sumKm(userId: string, runs: Run[]): number {
  return runs.filter((r) => r.user_id === userId).reduce((s, r) => s + Number(r.km), 0);
}

export function longestStreak(userId: string, runs: Run[]): number {
  const days = new Set(runs.filter((r) => r.user_id === userId).map((r) => r.date));
  const keys = Array.from(days).sort();
  let max = 0;
  let cur = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const d = new Date(k + "T00:00:00");
    cur = prev && (d.getTime() - prev.getTime()) / 86400000 === 1 ? cur + 1 : 1;
    max = Math.max(max, cur);
    prev = d;
  }
  return max;
}

export function sharedDaysCount(runs: Run[], userIds: [string, string]): number {
  const d0 = new Set(runs.filter((r) => r.user_id === userIds[0]).map((r) => r.date));
  const d1 = new Set(runs.filter((r) => r.user_id === userIds[1]).map((r) => r.date));
  let c = 0;
  d0.forEach((k) => {
    if (d1.has(k)) c++;
  });
  return c;
}

export type Badge = { id: string; icon: string; title: string; desc: string; earned: boolean };

export function personalBadges(userId: string, runs: Run[]): Badge[] {
  const total = sumKm(userId, runs);
  const streak = longestStreak(userId, runs);
  return [
    {
      id: "first",
      icon: "🎬",
      title: "Pirmas žingsnis",
      desc: "Įrašytas pirmas bėgimas",
      earned: runs.some((r) => r.user_id === userId),
    },
    { id: "km10", icon: "🔟", title: "10 km klubas", desc: "Iš viso nubėgta 10 km", earned: total >= 10 },
    { id: "km100", icon: "💯", title: "100 km klubas", desc: "Iš viso nubėgta 100 km", earned: total >= 100 },
    { id: "km500", icon: "🏅", title: "500 km klubas", desc: "Iš viso nubėgta 500 km", earned: total >= 500 },
    { id: "streak3", icon: "🔥", title: "3 dienų serija", desc: "Bėgiota 3 dienas iš eilės", earned: streak >= 3 },
    { id: "streak7", icon: "⚡", title: "7 dienų serija", desc: "Bėgiota 7 dienas iš eilės", earned: streak >= 7 },
    {
      id: "long10",
      icon: "🏃",
      title: "Ilgio rekordas",
      desc: "Vienas bėgimas 10 km ar daugiau",
      earned: runs.some((r) => r.user_id === userId && Number(r.km) >= 10),
    },
    {
      id: "fast",
      icon: "💨",
      title: "Greitasis",
      desc: "3 km+ bėgimas greičiau nei 5:30 min/km tempu",
      earned: runs.some(
        (r) => r.user_id === userId && Number(r.km) >= 3 && r.duration_min != null && r.duration_min / Number(r.km) <= 5.5
      ),
    },
  ];
}

export function sharedBadges(runs: Run[], userIds: [string, string]): Badge[] {
  return [
    {
      id: "together5",
      icon: "🤝",
      title: "5 vakarai kartu",
      desc: "Abu bėgote tą pačią dieną 5 kartus",
      earned: sharedDaysCount(runs, userIds) >= 5,
    },
  ];
}

export function weeklyKmSeries(runs: Run[], userIds: [string, string], weeksCount: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(thisMonday.getDate() - day);

  const out: { start: Date; k0: number; k1: number; total: number }[] = [];
  for (let w = weeksCount - 1; w >= 0; w--) {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    let k0 = 0;
    let k1 = 0;
    for (const r of runs) {
      const d = new Date(r.date + "T00:00:00");
      if (d >= start && d < end) {
        if (r.user_id === userIds[0]) k0 += Number(r.km);
        else if (r.user_id === userIds[1]) k1 += Number(r.km);
      }
    }
    out.push({ start, k0, k1, total: k0 + k1 });
  }
  return out;
}

export function dayRunners(runs: Run[], key: string, userIds: [string, string]): { p0: boolean; p1: boolean } {
  let p0 = false;
  let p1 = false;
  for (const r of runs) {
    if (r.date !== key) continue;
    if (r.user_id === userIds[0]) p0 = true;
    else if (r.user_id === userIds[1]) p1 = true;
  }
  return { p0, p1 };
}

export function combinedStreak(runs: Run[], userIds: [string, string]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  while (true) {
    const r = dayRunners(runs, dayKey(cursor), userIds);
    if (r.p0 || r.p1) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

export function greetingText(names: [string, string]): { text: string; emoji: string } {
  const h = new Date().getHours();
  const [n0, n1] = names;
  if (h < 5) return { text: `Labos nakties, ${n0} ir ${n1}`, emoji: "🌙" };
  if (h < 11) return { text: `Labas rytas, ${n0} ir ${n1}`, emoji: "☀️" };
  if (h < 17) return { text: "Sveiki, dienos vidurys — laikas judėti", emoji: "🏃" };
  if (h < 22) return { text: "MesKartu.Lt", emoji: "🌆" };
  return { text: "Vėlus vakaras — poilsio metas", emoji: "🌙" };
}

export const GOAL_PRESETS = [
  { name: "Ryga", km: 260 },
  { name: "Varšuva", km: 460 },
  { name: "Berlynas", km: 950 },
  { name: "Paryžius", km: 1900 },
];
