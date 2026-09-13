import { badgeDef } from "@/lib/badges";
import type { BadgeEarned } from "@/types/database";

function fmtEarnedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("lt-LT", { day: "numeric", month: "short" });
}

function BadgeRow({
  earned,
  accent,
}: {
  earned: { badge_id: string; earned_at: string }[];
  accent?: string;
}) {
  if (earned.length === 0) {
    return <p className="text-sm text-ink-faint">Kol kas jokių pasiekimų — pirmyn!</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {earned.map((b) => {
        const def = badgeDef(b.badge_id);
        if (!def) return null;
        return (
          <div
            key={b.badge_id}
            title={`${def.desc} · gauta ${fmtEarnedDate(b.earned_at)}`}
            className="flex w-[92px] flex-col items-center gap-1 rounded-xl border p-2.5 text-center"
            style={{
              borderColor: accent ?? "var(--dusk)",
              background: accent ? `color-mix(in srgb, ${accent} 12%, var(--surface))` : "var(--surface-2)",
            }}
          >
            <span className="text-xl leading-none">{def.icon}</span>
            <span className="text-[0.65rem] font-bold leading-tight text-ink-soft">{def.title}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Badges({
  badgesEarned,
  userIds,
  names,
}: {
  badgesEarned: BadgeEarned[];
  userIds: [string, string];
  names: [string, string];
}) {
  const personal0 = badgesEarned.filter((b) => b.user_id === userIds[0]);
  const personal1 = badgesEarned.filter((b) => b.user_id === userIds[1]);
  const shared = badgesEarned.filter((b) => b.user_id === null);

  if (badgesEarned.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
        <p className="text-sm text-ink-faint">Kol kas jokių pasiekimų — pridėkite įrašą, kad pradėtumėte rinkti!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      {personal0.length > 0 && (
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">{names[0]}</h3>
          <BadgeRow earned={personal0} accent="var(--ember)" />
        </div>
      )}
      {personal1.length > 0 && (
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">{names[1]}</h3>
          <BadgeRow earned={personal1} accent="var(--rose)" />
        </div>
      )}
      {shared.length > 0 && (
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">Kartu</h3>
          <BadgeRow earned={shared} accent="var(--gold)" />
        </div>
      )}
    </div>
  );
}
