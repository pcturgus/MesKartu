import { weeklyKmSeries } from "@/lib/runs";
import { fmtKm } from "@/lib/stats";
import type { Run } from "@/types/database";

const LT_MONTHS_SHORT = ["saus", "vas", "kov", "bal", "geg", "birž", "liep", "rugp", "rugs", "spal", "lapkr", "gruod"];

export function TrendChart({ runs, userIds }: { runs: Run[]; userIds: [string, string] }) {
  const series = weeklyKmSeries(runs, userIds, 8);
  const maxTotal = Math.max(...series.map((s) => s.total), 1);
  const w = 600;
  const h = 140;
  const padBottom = 20;
  const padTop = 10;
  const barW = w / series.length;
  const scale = (h - padTop - padBottom) / maxTotal;
  const totalAll = series.reduce((a, s) => a + s.total, 0);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <p className="text-sm text-ink-soft">
        Pastarosios {series.length} savaitės: <b style={{ color: "var(--ink)" }}>{fmtKm(totalAll)} km</b>
      </p>
      <div className="mt-2 w-full overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full min-w-[420px]" style={{ height: "140px" }}>
          {series.map((s, i) => {
            const x = i * barW + barW * 0.18;
            const bw = barW * 0.64;
            const h0 = s.k0 * scale;
            const h1 = s.k1 * scale;
            const yBase = h - padBottom;
            const y1 = yBase - h0;
            const y0top = y1 - h1;
            const label = `${LT_MONTHS_SHORT[s.start.getMonth()]} ${s.start.getDate()}`;
            return (
              <g key={i}>
                {h0 > 0 && <rect x={x} y={y1} width={bw} height={h0} rx={3} fill="var(--ember)" />}
                {h1 > 0 && <rect x={x} y={y0top} width={bw} height={h1} rx={3} fill="var(--rose)" />}
                <text
                  x={x + bw / 2}
                  y={h - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill="var(--ink-faint)"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
