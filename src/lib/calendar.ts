// Small helpers for the Kalendorius month grid: which day-of-month a
// (possibly yearly-recurring) date falls on, and building the Monday-start
// grid layout for a given "YYYY-MM" month key.

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [y, m] = monthKey.split("-").map(Number);
  return { year: y, month: m - 1 }; // month: 0-indexed
}

export function monthKeyOf(year: number, month0: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}`;
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month + delta, 1);
  return monthKeyOf(d.getFullYear(), d.getMonth());
}

// True if a (possibly yearly-recurring) date falls on the given calendar
// day. Non-recurring items only match their exact date. Parses the stored
// "YYYY-MM-DD" string directly instead of via `new Date(...)`, so this
// can't be thrown off by the server's own timezone. A Feb 29 anniversary is
// clamped to Feb 28 in non-leap years (consistent with nextOccurrence in
// dates.ts) — otherwise it would never match any day at all in those years.
export function occursOn(dateStr: string, recurring: boolean, year: number, month0: number, day: number): boolean {
  const [, dMonth1, dDay] = dateStr.split("-").map(Number);
  const dMonth0 = dMonth1 - 1;
  if (recurring) {
    const clampedDay = Math.min(dDay, daysInMonth(year, dMonth0));
    return dMonth0 === month0 && clampedDay === day;
  }
  const [dYear] = dateStr.split("-").map(Number);
  return dYear === year && dMonth0 === month0 && dDay === day;
}

// True if [startDate, endDate] (either may be missing) overlaps the given
// calendar day. A trip with only ONE of the two dates set (the form allows
// leaving either blank) is treated as a single-day range on whichever date
// it has — otherwise a trip with only an end date would never show up on
// the calendar at all.
export function rangeOccursOn(
  startDate: string | null,
  endDate: string | null,
  year: number,
  month0: number,
  day: number
): boolean {
  if (!startDate && !endDate) return false;
  const dayDate = new Date(year, month0, day).getTime();
  const start = new Date((startDate ?? endDate!) + "T00:00:00").getTime();
  const end = new Date((endDate ?? startDate!) + "T00:00:00").getTime();
  return dayDate >= start && dayDate <= end;
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

// 0 = Monday .. 6 = Sunday, for the 1st of the month.
export function firstWeekdayMon(year: number, month0: number): number {
  const jsDay = new Date(year, month0, 1).getDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

export const LT_MONTH_NAMES = [
  "Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis",
  "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis",
];

export const LT_WEEKDAYS_SHORT = ["Pr", "An", "Tr", "Ke", "Pn", "Št", "Sk"];
