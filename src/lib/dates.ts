const LT_MONTHS = [
  "saus.", "vas.", "kov.", "bal.", "geg.", "birž.",
  "liep.", "rugp.", "rugs.", "spal.", "lapkr.", "gruod.",
];

// The app is built for one specific Lithuania-based couple, but the server
// (Vercel) runs in UTC. Without pinning "today" to Vilnius, every date
// computed server-side (todayKey, nextOccurrence, ...) would flip over at
// UTC midnight instead of Vilnius midnight — a 2-3 hour daily window where
// the server thinks it's still "yesterday" (or already "tomorrow") relative
// to what the couple actually sees on their phones.
const APP_TIMEZONE = "Europe/Vilnius";

export function fmtDateLt(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return LT_MONTHS[d.getMonth()] + " " + d.getDate();
}

// Vilnius-local calendar day for a given instant, regardless of the
// server's own timezone.
export function dayKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

// Midnight (wall-clock) of "today" in Vilnius, as a plain Date — safe for
// calendar-day-difference arithmetic (e.g. "days until X"), unlike
// `new Date()` + setHours(0,0,0,0), which zeroes out the SERVER's local
// midnight, not Vilnius's.
export function todayAtMidnight(): Date {
  return new Date(todayKey() + "T00:00:00");
}

export function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function daysInMonthOf(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

// Next occurrence of a date: itself if one-off, or the next upcoming
// anniversary of it (this year or next) if recurring. A Feb 29 anniversary
// is clamped to Feb 28 in non-leap years, consistent with occursOn in
// calendar.ts — otherwise the two would disagree on whether/when it lands.
export function nextOccurrence(dateStr: string, recurring: boolean): Date {
  const d = new Date(dateStr + "T00:00:00");
  if (!recurring) return d;
  const today = todayAtMidnight();
  const clampedDay = Math.min(d.getDate(), daysInMonthOf(today.getFullYear(), d.getMonth()));
  let next = new Date(today.getFullYear(), d.getMonth(), clampedDay);
  if (next < today) {
    const nextYearDay = Math.min(d.getDate(), daysInMonthOf(today.getFullYear() + 1, d.getMonth()));
    next = new Date(today.getFullYear() + 1, d.getMonth(), nextYearDay);
  }
  return next;
}

export function humanDuration(days: number): string {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0) return years + " m. " + (months > 0 ? months + " mėn." : "");
  if (months > 0) return months + " mėn.";
  return days + " d.";
}

export function addMonths(dateStr: string, months: number): Date {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d;
}

export function fmtInt(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
