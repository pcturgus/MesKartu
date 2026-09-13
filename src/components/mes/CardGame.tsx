"use client";

import { useEffect, useState } from "react";
import { CARD_DECK } from "@/lib/cards";

function shuffled(deck: string[]): string[] {
  const arr = deck.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Deck = { current: string; queue: string[] };

export function CardGame() {
  // Start deterministic (matches the server-rendered markup) and only draw
  // a random card after mount, so hydration never mismatches on Math.random().
  const [deck, setDeck] = useState<Deck>({ current: CARD_DECK[0], queue: CARD_DECK.slice(1) });

  useEffect(() => {
    // One-time sync with a non-deterministic source (Math.random). This has
    // to run post-mount, client-only — computing it during render would
    // break hydration, since the server can't produce the same random draw.
    const shuffledDeck = shuffled(CARD_DECK);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck({ current: shuffledDeck[0], queue: shuffledDeck.slice(1) });
  }, []);

  function drawNext() {
    setDeck((prev) => {
      if (prev.queue.length === 0) {
        const reshuffled = shuffled(CARD_DECK);
        return { current: reshuffled[0], queue: reshuffled.slice(1) };
      }
      return { current: prev.queue[0], queue: prev.queue.slice(1) };
    });
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line bg-surface p-8 text-center shadow-[var(--shadow)]"
      style={{
        backgroundImage: "linear-gradient(160deg, var(--ember-soft), transparent 55%)",
      }}
    >
      <span className="relative text-[0.68rem] font-extrabold uppercase tracking-wide" style={{ color: "var(--dusk)" }}>
        Klausimas / iššūkis
      </span>
      <p
        className="relative my-4 text-balance"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.35rem,4vw,1.9rem)", letterSpacing: "0.01em", lineHeight: 1.25 }}
      >
        {deck.current}
      </p>
      <button
        type="button"
        onClick={drawNext}
        className="relative rounded-full px-5 py-2.5 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
        style={{ background: "var(--accent-gradient)" }}
      >
        🔀 Kita kortelė
      </button>
    </div>
  );
}
