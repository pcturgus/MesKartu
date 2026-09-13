import { statsFor, fmtKm } from "@/lib/stats";
import { combinedStreak } from "@/lib/runs";
import { todayAtMidnight } from "@/lib/dates";
import type { Run } from "@/types/database";

export function RecapCard({
  runs,
  userIds,
  names,
}: {
  runs: Run[];
  userIds: [string, string];
  names: [string, string];
}) {
  const s0 = statsFor(userIds[0], "week", runs);
  const s1 = statsFor(userIds[1], "week", runs);
  const totalWeek = s0.km + s1.km;
  const leaderIdx = s0.km === s1.km ? null : s0.km > s1.km ? 0 : 1;

  const start = (() => {
    const today = todayAtMidnight();
    const day = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - day);
    return monday.getTime();
  })();
  const daysActive = new Set(runs.filter((r) => new Date(r.date + "T00:00:00").getTime() >= start).map((r) => r.date));
  const streak = combinedStreak(runs, userIds);

  const lines = [
    <>
      Šią savaitę kartu nuveikėte <b>{fmtKm(totalWeek)} km</b>.
    </>,
    leaderIdx === null ? (
      totalWeek > 0 ? "Lygiosios tarp jūsų dviejų! 🤝" : "Savaitė dar tik prasideda — pirmyn! 🌟"
    ) : (
      <>{names[leaderIdx]} buvo aktyviausias(-ia) šią savaitę. 👏</>
    ),
    <>
      Aktyvių dienų: <b>{daysActive.size}</b> iš 7.
    </>,
    streak > 0 ? (
      <>
        Dabartinė serija: <b>{streak} d.</b> 🔥
      </>
    ) : (
      "Pradėkite naują seriją šiandien! 🌙"
    ),
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-[var(--shadow-lg)] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 85% -10%, rgba(255,255,255,.25), transparent 55%), linear-gradient(160deg, var(--accent-fill-1), var(--ember) 130%)",
      }}
    >
      <div className="relative text-[0.68rem] font-extrabold uppercase tracking-wide opacity-85">Savaitės apžvalga</div>
      <div className="relative mt-3 flex flex-col gap-2">
        {lines.map((l, i) => (
          <div key={i} className="recap-line text-base leading-snug">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
