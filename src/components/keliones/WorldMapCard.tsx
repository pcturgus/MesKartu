"use client";

import { useEffect, useRef, useState } from "react";
import { WorldMap, regions, type ISOCode } from "react-svg-worldmap";
import { guessCountryCode } from "@/lib/countries";
import { todayKey } from "@/lib/dates";
import type { Travel } from "@/types/database";

const WISHLIST = 1;
const VISITED = 2;

// The map only knows how to draw the ~180 countries in its own region
// list — a guessed code outside that set (a small island the low-res map
// skips, say) would make the library choke, so only pass through codes it
// actually recognizes.
const MAP_CODES = new Set(regions.map((r) => r.code));

// The library's own size="responsive" mode measures its container via a
// mount-time effect that, in this app's setup, doesn't reliably fire before
// first paint — the map then renders at its fixed default (640×480) and
// gets cropped by any narrower card. So instead: always render the map at
// that fixed native size, and scale the whole thing down to fit with a
// plain CSS transform, computed the same deterministic post-mount way as
// the conversation-card shuffle (start matching the server markup, adjust
// once mounted, so hydration never mismatches).
const NATIVE_WIDTH = 640;
const NATIVE_HEIGHT = 480;

export function WorldMapCard({ travels }: { travels: Travel[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / NATIVE_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const today = todayKey();
  const byCode = new Map<ISOCode, number>();
  for (const t of travels) {
    const guessed = guessCountryCode(t.country);
    if (!guessed || !MAP_CODES.has(guessed)) continue;
    const code = guessed as ISOCode;
    const visited = !!t.end_date && t.end_date < today;
    if (visited) {
      byCode.set(code, VISITED);
    } else if (byCode.get(code) !== VISITED) {
      byCode.set(code, WISHLIST);
    }
  }

  const data = Array.from(byCode.entries()).map(([country, value]) => ({ country, value }));

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        Pridėk kelionę su atpažįstama šalimi, kad ji atsirastų žemėlapyje.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow)]">
      <div ref={containerRef} style={{ width: "100%", height: NATIVE_HEIGHT * scale, overflow: "hidden" }}>
        <div style={{ width: NATIVE_WIDTH, height: NATIVE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <WorldMap
            data={data}
            size={NATIVE_WIDTH}
            backgroundColor="transparent"
            richInteraction={false}
            styleFunction={(ctx) => ({
              fill:
                ctx.countryValue === VISITED
                  ? "var(--dusk)"
                  : ctx.countryValue === WISHLIST
                    ? "var(--ember)"
                    : "var(--surface-2)",
              stroke: "var(--surface)",
              strokeWidth: 0.6,
              cursor: "default",
            })}
            tooltipTextFunction={(ctx) =>
              ctx.countryValue === VISITED
                ? `${ctx.countryName} — aplankyta`
                : ctx.countryValue === WISHLIST
                  ? `${ctx.countryName} — norime aplankyti`
                  : ctx.countryName
            }
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--dusk)" }} />
          Aplankyta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--ember)" }} />
          Norime aplankyti
        </span>
      </div>
    </div>
  );
}
