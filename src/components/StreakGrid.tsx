import { combinedStreak, dayRunners } from "@/lib/runs";
import { dayKey, todayAtMidnight } from "@/lib/dates";
import type { Run } from "@/types/database";

export function StreakGrid({ runs, userIds, names }: { runs: Run[]; userIds: [string, string]; names: [string, string] }) {
  const weeks = 9;
  const total = weeks * 7;
  const today = todayAtMidnight();

  const cells: { key: string; cls: "both" | "p0" | "p1" | "" }[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const r = dayRunners(runs, key, userIds);
    const cls = r.p0 && r.p1 ? "both" : r.p0 ? "p0" : r.p1 ? "p1" : "";
    cells.push({ key, cls });
  }

  const streak = combinedStreak(runs, userIds);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridAutoColumns: "10px" }}>
          {cells.map((c) => (
            <div
              key={c.key}
              title={c.key}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{
                background:
                  c.cls === "both"
                    ? "linear-gradient(135deg, var(--ember), var(--gold-fill) 55%, var(--rose))"
                    : c.cls === "p0"
                      ? "var(--ember)"
                      : c.cls === "p1"
                        ? "var(--rose)"
                        : "var(--surface-2)",
              }}
            />
          ))}
        </div>
        <div className="text-center">
          <div className="font-mono font-bold text-3xl leading-none" style={{ color: "var(--dusk)" }}>
            {streak}
          </div>
          <div className="text-xs text-ink-faint mt-0.5">dienų iš eilės</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: "var(--ember)" }} />
          {names[0]}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: "var(--rose)" }} />
          {names[1]}
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ background: "linear-gradient(135deg, var(--ember), var(--gold-fill) 55%, var(--rose))" }}
          />
          abu
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-faint">{streak > 0 ? "Nenutraukite serijos!" : "Pradėkite naują seriją šiandien."}</p>
    </div>
  );
}
