"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Private/incognito mode, storage disabled, etc. — the choice just
    // won't survive a reload, nothing else breaks.
  }
}

// A manual light/dark switch, on top of the site otherwise following the
// device's own setting. Deliberately a simple two-way choice (no "seka
// sistemą" third option) to match what was asked for.
export function ThemeToggle() {
  // SSR/first paint can't know the device's preference or any saved
  // choice, so start from a stable guess and swap to the real value right
  // after mount — same pattern as GreetingLine's clock-dependent text.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    const initial: Theme =
      current === "light" || current === "dark"
        ? current
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  const options: { value: Theme; icon: string; label: string }[] = [
    { value: "light", icon: "☀️", label: "Šviesi tema" },
    { value: "dark", icon: "🌙", label: "Tamsi tema" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Spalvų tema"
      className="flex flex-wrap gap-1 rounded-full border border-line bg-surface-2 p-1"
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(opt.value)}
            className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors"
            style={
              active
                ? { background: "var(--accent-gradient)", color: "#fff" }
                : { color: "var(--ink-soft)" }
            }
          >
            <span aria-hidden="true">{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
