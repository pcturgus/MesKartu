"use client";

import { useEffect, useState } from "react";
import { applyTheme, initialTheme, THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";

// A one-tap light/dark switch living directly in the header, next to the
// notifications bell and settings — for the quick "just flip the theme"
// case. The fuller two-way ThemeToggle (explicit "Šviesi tema" / "Tamsi
// tema" choice) still lives inside Settings; both read and write the same
// localStorage key + data-theme attribute and stay live-synced via a
// shared event, so whichever one is used, the other reflects it immediately
// rather than only after a reload.
export function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme());
    function onChange(e: Event) {
      const next = (e as CustomEvent<Theme>).detail;
      if (next === "light" || next === "dark") setTheme(next);
    }
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "dark" ? "Perjungti į šviesią temą" : "Perjungti į tamsią temą"}
      aria-label="Keisti temą"
      className="rounded-full border border-line w-9 h-9 flex items-center justify-center text-ink-soft transition-transform duration-150 hover:-translate-y-0.5 active:scale-90"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
