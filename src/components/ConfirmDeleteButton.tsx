"use client";

import { useState, useTransition } from "react";

// Matches the artifact's two-step delete: a single click swaps the ✕ for an
// inline "Ne / Taip" confirmation instead of deleting immediately — guards
// against fat-fingering a run or a memory away.
export function ConfirmDeleteButton({
  action,
  title = "Ištrinti",
  className,
}: {
  action: () => Promise<void> | void;
  title?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-ink-soft"
        >
          Ne
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await action();
            })
          }
          className="rounded-full px-2.5 py-1 text-xs font-bold text-white disabled:opacity-70"
          style={{ background: "var(--ember)" }}
        >
          Taip
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={title}
      className={className ?? "px-1 text-sm text-ink-faint hover:text-ember-ink"}
    >
      ✕
    </button>
  );
}
