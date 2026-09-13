"use client";

import { useEffect, useState } from "react";
import { greetingText } from "@/lib/runs";
import { HeartMark } from "@/components/HeartMark";

export function GreetingLine({ names }: { names: [string, string] }) {
  // Deterministic on first paint (matches SSR), then swapped for the real
  // time-of-day greeting once mounted — avoids a server/client clock mismatch.
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({ text: "MesKartu.Lt", emoji: "🌆" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingText(names));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names[0], names[1]]);

  return (
    <h1 className="flex min-w-0 flex-1 items-center gap-1.5 text-xl leading-tight sm:gap-2 sm:text-2xl md:text-3xl">
      <HeartMark size={22} className="shrink-0 sm:hidden" />
      <HeartMark size={28} className="hidden shrink-0 sm:block" />
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
