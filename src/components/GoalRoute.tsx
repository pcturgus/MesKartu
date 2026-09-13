"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fmtKm } from "@/lib/stats";

const PATH_D = "M20,85 C160,25 230,150 320,70 C410,-10 480,120 580,55";

type Pt = { x: number; y: number };

// A fully virtual/illustrated "journey" — no map, no tiles, no external
// service of any kind, just an animated SVG path. Distance is symbolic
// (progress toward a km goal), so this deliberately never claimed to be a
// real route.
export function GoalRoute({ totalKm, goalKm, goalNote }: { totalKm: number; goalKm: number; goalNote: string | null }) {
  const gradientId = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const goal = goalKm || 1;
  const pct = Math.max(0, Math.min(1, totalKm / goal));
  const remaining = Math.max(0, goal - totalKm);
  const reached = pct >= 1;
  const markerEmoji = reached ? "🎉" : "🏃";

  const [points, setPoints] = useState<{ start: Pt; end: Pt; way25: Pt; way50: Pt; way75: Pt; marker: Pt }>({
    start: { x: 20, y: 85 },
    end: { x: 580, y: 55 },
    way25: { x: 20, y: 85 },
    way50: { x: 20, y: 85 },
    way75: { x: 20, y: 85 },
    marker: { x: 20, y: 85 },
  });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const at = (ratio: number): Pt => {
      const p = path.getPointAtLength(len * ratio);
      return { x: p.x, y: p.y };
    };
    // Geometry read from the rendered SVG path (DOM-only API) — must run
    // post-mount, so this legitimately syncs React state with the DOM.
    setPoints({
      start: at(0),
      end: at(1),
      way25: at(0.25),
      way50: at(0.5),
      way75: at(0.75),
      marker: at(pct),
    });
  }, [pct]);

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-baseline justify-between gap-1 text-sm">
        <span className="text-ink-soft">
          Virtuali kelionė iki <b style={{ color: "var(--ink)" }}>{goalNote || "tikslo"}</b>
        </span>
        <span className="font-mono text-ink-soft">
          <b style={{ color: "var(--ink)" }}>{fmtKm(totalKm)}</b> / {fmtKm(goal)} km
          {remaining > 0 ? ` · liko ${fmtKm(remaining)} km` : " · tikslas pasiektas! 🎉"}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">Kiekvienas nueitas ar nubėgtas kilometras artina jus prie tikslo.</p>
      <div className="mt-3 w-full">
        {/* No min-width / horizontal scroll — the illustration scales down
            to whatever width the card actually has (via the SVG's own
            viewBox + aspect-ratio) instead of getting clipped on narrow
            phones, so the whole route is always visible without the card
            itself needing to grow. */}
        <svg viewBox="0 0 600 110" className="w-full" style={{ aspectRatio: "600 / 110" }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: "var(--dusk)" }} />
              <stop offset="55%" style={{ stopColor: "var(--ember)" }} />
              <stop offset="100%" style={{ stopColor: "var(--rose)" }} />
            </linearGradient>
          </defs>

          {/* A soft ambient glow behind the path — same tint the rest of the
              app uses for its aurora background, kept faint. */}
          <ellipse cx="300" cy="60" rx="260" ry="60" fill="var(--accent-glow)" opacity="0.5" style={{ filter: "blur(26px)" }} />

          <path
            ref={pathRef}
            d={PATH_D}
            className="goal-route-line"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          <g transform={`translate(${points.start.x},${points.start.y})`}>
            <text textAnchor="middle" y="-8" fontSize="18">
              🏠
            </text>
          </g>
          <g transform={`translate(${points.end.x},${points.end.y})`}>
            <text textAnchor="middle" y="-8" fontSize="18">
              📍
            </text>
            <text textAnchor="middle" y="16" fontSize="11" fill="var(--ink-faint)">
              {goalNote || ""}
            </text>
          </g>
          {([
            [points.way25, 0.25],
            [points.way50, 0.5],
            [points.way75, 0.75],
          ] as [Pt, number][]).map(([pt, ratio]) => (
            <g key={ratio} transform={`translate(${pt.x},${pt.y})`}>
              <circle
                r="5"
                fill={pct >= ratio ? "var(--gold-fill)" : "var(--surface-2)"}
                stroke="var(--line)"
                style={pct >= ratio ? { filter: "drop-shadow(0 0 4px var(--gold-fill))" } : undefined}
              />
            </g>
          ))}
          {/* Position via the SVG `transform` attribute on the outer <g>,
              animate via CSS `transform` (scale) on the inner one — a CSS
              `transform` completely replaces an element's SVG `transform`
              attribute rather than composing with it, so putting both the
              translate and the animated scale on one element would snap
              the marker back to the SVG's origin every time the animation
              ran. */}
          <g transform={`translate(${points.marker.x},${points.marker.y})`}>
            <g className={reached ? "goal-route-marker-pop" : "goal-route-marker-pulse"}>
              <circle r="10" fill="var(--gold-fill)" stroke="var(--surface)" strokeWidth="2" />
              <text textAnchor="middle" dy="5" fontSize="12">
                {markerEmoji}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
