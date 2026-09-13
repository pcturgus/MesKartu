export type Theme = "light" | "dark";

// There are now two independent theme controls (the quick icon toggle in
// the header, and the fuller two-way choice inside Settings) — each keeps
// its own local state for its own icon/highlight, so changing the theme in
// one wouldn't otherwise be reflected in the other until the page next
// loads. This event lets every mounted control hear about a change made
// anywhere (including this same one) and update in place.
export const THEME_CHANGE_EVENT = "meskartu:theme-change";

// Shared by every theme control in the app (the full ThemeToggle inside
// Settings, and the quick icon toggle in the header) so they always agree
// on where the choice is read from and stored — same attribute, same
// localStorage key.
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Private/incognito mode, storage disabled, etc. — the choice just
    // won't survive a reload, nothing else breaks.
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}

// SSR/first paint can't know the device's preference or any saved choice —
// call this after mount and swap to the real value then, same pattern as
// GreetingLine's clock-dependent text.
export function initialTheme(): Theme {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "light" || current === "dark") return current;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
