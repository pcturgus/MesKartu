import type { Range, Run } from "@/types/database";

export function rangeStart(range: Range): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === "all") {
    return new Date(0);
  }

  if (range === "month") {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  // week: Monday of the current week
  const day = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - day);
  return monday;
}

export function statsFor(userId: string, range: Range, runs: Run[]) {
  const start = rangeStart(range).getTime();
  const mine = runs.filter((r) => {
    if (r.user_id !== userId) return false;
    const d = new Date(r.date + "T00:00:00").getTime();
    return d >= start;
  });

  const km = mine.reduce((sum, r) => sum + Number(r.km), 0);
  const count = mine.length;
  const totalMin = mine.reduce((sum, r) => sum + (r.duration_min || 0), 0);
  const pace = totalMin > 0 && km > 0 ? totalMin / km : null;

  return { km, count, pace };
}

export function fmtKm(km: number): string {
  return km.toFixed(1);
}

export function fmtPace(pace: number | null): string {
  if (pace === null) return "–";
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${String(sec).padStart(2, "0")} /km`;
}

export function combinedStreak(runs: Run[]): number {
  const days = new Set(runs.map((r) => r.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
