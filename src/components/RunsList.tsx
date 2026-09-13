"use client";

import { useState } from "react";
import { LightboxImage } from "@/components/LightboxImage";
import { Avatar } from "@/components/Avatar";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { weatherIcon, moodIcon, activityIcon, activityLabel } from "@/lib/runs";
import { fmtKm } from "@/lib/stats";
import { fmtDateLt } from "@/lib/dates";
import { deleteRun } from "@/app/actions";
import type { Run, Profile } from "@/types/database";

// Only the most recent entries render up front — with a long history this
// used to push everything below (map, trend, streak, badges) far down the
// page, especially on a phone. "Rodyti daugiau" reveals the rest without a
// separate page/query.
const INITIAL_COUNT = 6;

export function RunsList({
  runs,
  profiles,
  activityFilter,
  currentUserId,
}: {
  runs: Run[];
  profiles: Profile[];
  activityFilter: string | null;
  currentUserId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-9 text-center text-ink-faint">
        <p className="mb-3">
          {activityFilter
            ? `Dar nė vieno „${activityLabel(activityFilter)}“ įrašo šiame filtre.`
            : "Dar nė vieno įrašo. Pirmas žingsnis — įrašyti pirmą."}
        </p>
      </div>
    );
  }

  const moodCounts: Record<string, number> = {};
  runs.forEach((r) => {
    if (r.weather) moodCounts["w:" + r.weather] = (moodCounts["w:" + r.weather] || 0) + 1;
    if (r.mood) moodCounts["m:" + r.mood] = (moodCounts["m:" + r.mood] || 0) + 1;
  });
  const hasMoodStats = Object.keys(moodCounts).length > 0;

  const shownRuns = expanded ? runs : runs.slice(0, INITIAL_COUNT);
  const hiddenCount = runs.length - shownRuns.length;

  return (
    <>
      {hasMoodStats && (
        <div className="mb-3 flex flex-wrap gap-3 text-sm text-ink-soft">
          {Object.entries(moodCounts).map(([key, count]) => {
            const icon = key.startsWith("w:") ? weatherIcon(key.slice(2)) : moodIcon(key.slice(2));
            return (
              <span key={key}>
                {icon} {count}
              </span>
            );
          })}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {shownRuns.map((r) => {
          const owner = profiles.find((p) => p.id === r.user_id);
          const accentVar = owner?.accent === "rose" ? "var(--rose)" : "var(--ember)";
          return (
            <li
              key={r.id}
              className="relative flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
              style={{ borderLeft: `3px solid ${accentVar}` }}
            >
              <div className="flex items-center gap-3">
                {r.photo_url && <LightboxImage src={r.photo_url} alt="" />}
                <Avatar url={owner?.avatar_url} name={owner?.name ?? "?"} accent={accentVar} />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold" style={{ color: accentVar }}>
                      {owner?.name ?? "?"}
                    </span>
                    <span title={activityLabel(r.activity)}>{activityIcon(r.activity)}</span>
                    <span className="text-xs text-ink-faint font-mono">{fmtDateLt(r.date)}</span>
                    {r.weather && <span title="Oras">{weatherIcon(r.weather)}</span>}
                    {r.mood && <span title="Savijauta">{moodIcon(r.mood)}</span>}
                  </div>
                  {r.note && <div className="mt-1 text-sm text-ink-soft">{r.note}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="font-bold text-lg">{fmtKm(Number(r.km))} km</div>
                  {r.duration_min && <div className="text-xs text-ink-faint">{r.duration_min} min</div>}
                </div>
                {/* Deleting only ever works for your own run (the server
                    action and DB both enforce that) — showing the button
                    for the partner's entries too just meant clicking it
                    silently did nothing. */}
                {r.user_id === currentUserId && <ConfirmDeleteButton action={deleteRun.bind(null, r.id)} />}
              </div>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-line py-2.5 text-sm font-bold text-ink-soft"
        >
          Rodyti dar {hiddenCount}
        </button>
      )}
      {expanded && runs.length > INITIAL_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm font-bold text-ink-faint"
        >
          Slėpti
        </button>
      )}
    </>
  );
}
