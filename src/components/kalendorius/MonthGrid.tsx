import { monthKeyOf, LT_WEEKDAYS_SHORT } from "@/lib/calendar";

export type DayMarker = { milestone?: boolean; event?: boolean; trip?: boolean };

export function MonthGrid({
  year,
  month,
  nDays,
  offset,
  todayStr,
  markers,
}: {
  year: number;
  month: number; // 0-indexed
  nDays: number;
  offset: number; // 0 = Monday
  todayStr: string;
  markers: Record<number, DayMarker>;
}) {
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: nDays }, (_, i) => i + 1)];

  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow)]">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink-faint mb-1.5">
        {LT_WEEKDAYS_SHORT.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const isToday = monthKeyOf(year, month) + "-" + String(day).padStart(2, "0") === todayStr;
          const m = markers[day];
          return (
            <div
              key={day}
              className="aspect-square flex flex-col items-center justify-center rounded-lg text-sm"
              style={
                isToday
                  ? { background: "var(--accent-gradient)", color: "#fff", fontWeight: 700 }
                  : { background: "var(--surface-2)" }
              }
            >
              <span>{day}</span>
              {m && (
                <span className="text-[9px] leading-none mt-0.5">
                  {m.milestone ? "🎉" : ""}
                  {m.event ? "📌" : ""}
                  {m.trip ? "✈️" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
