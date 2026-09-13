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
// day. Non-recurring items only match their exact date.
export function occursOn(dateStr: string, recurring: boolean, year: number, month0: number, day: number): boolean {
  const d = new Date(dateStr + "T00:00:00");
  if (recurring) return d.getMonth() === month0 && d.getDate() === day;
  return d.getFullYear() === year && d.getMonth() === month0 && d.getDate() === day;
}

// True if [startDate, endDate] (either may be missing) overlaps the given
// calendar day.
export function rangeOccursOn(
  startDate: string | null,
  endDate: string | null,
  year: number,
  month0: number,
  day: number
): boolean {
  if (!startDate) return false;
  const dayDate = new Date(year, month0, day).getTime();
  const start = new Date(startDate + "T00:00:00").getTime();
  const end = endDate ? new Date(endDate + "T00:00:00").getTime() : start;
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
