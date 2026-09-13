"use client";

import { useEffect, useState } from "react";
import { greetingText } from "@/lib/runs";
import { Avatar } from "@/components/Avatar";
import { namesFromProfiles } from "@/lib/profiles";
import type { Profile } from "@/types/database";

function accentOf(p: Profile): string {
  return p.accent === "rose" ? "var(--rose)" : "var(--ember)";
}

// Both partners' avatars, slightly overlapping — a ring in the page
// background color (rather than a border, which would add to the box size
// and throw off the overlap) separates them from each other and from
// whatever's behind.
function AvatarPair({ profiles, size }: { profiles: Profile[]; size: number }) {
  const [p0, p1] = profiles;
  return (
    <span className="flex shrink-0 items-center">
      {p0 && (
        <span
          className="inline-flex rounded-full"
          style={{ boxShadow: "0 0 0 2.5px var(--bg)", marginRight: p1 ? -size * 0.32 : 0 }}
        >
          <Avatar url={p0.avatar_url} name={p0.name} size={size} accent={accentOf(p0)} />
        </span>
      )}
      {p1 && (
        <span className="inline-flex rounded-full" style={{ boxShadow: "0 0 0 2.5px var(--bg)" }}>
          <Avatar url={p1.avatar_url} name={p1.name} size={size} accent={accentOf(p1)} />
        </span>
      )}
    </span>
  );
}

export function GreetingLine({ profiles }: { profiles: Profile[] }) {
  const names = namesFromProfiles(profiles);
  // Deterministic on first paint (matches SSR), then swapped for the real
  // time-of-day greeting once mounted — avoids a server/client clock mismatch.
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({ text: "MesKartu.Lt", emoji: "🌆" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingText(names));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names[0], names[1]]);

  return (
    <h1 className="flex min-w-0 flex-1 items-center gap-2.5 text-xl leading-tight sm:gap-3 sm:text-2xl md:text-3xl">
      <AvatarPair profiles={profiles} size={30} />
      <span className="min-w-0">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 600,
            backgroundImage: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {greeting.text}
        </span>{" "}
        <span>{greeting.emoji}</span>
      </span>
    </h1>
  );
}
