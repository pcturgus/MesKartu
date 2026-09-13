const LT_MONTHS = [
  "saus.", "vas.", "kov.", "bal.", "geg.", "birž.",
  "liep.", "rugp.", "rugs.", "spal.", "lapkr.", "gruod.",
];

export function fmtDateLt(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return LT_MONTHS[d.getMonth()] + " " + d.getDate();
}

export function dayKey(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function todayKey(): string {
  return dayKey(new Date());
}

export function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Next occurrence of a date: itself if one-off, or the next upcoming
// anniversary of it (this year or next) if recurring.
export function nextOccurrence(dateStr: string, recurring: boolean): Date {
  const d = new Date(dateStr + "T00:00:00");
  if (!recurring) return d;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
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
