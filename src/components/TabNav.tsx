import Link from "next/link";

const TABS = [
  { key: "run", href: "/", icon: "🏃", label: "Aktyvumas" },
  { key: "mes", href: "/mes", icon: "💛", label: "Mes" },
  { key: "kalendorius", href: "/kalendorius", icon: "📅", label: "Kalendorius" },
  { key: "keliones", href: "/keliones", icon: "✈️", label: "Kelionės" },
  { key: "buitis", href: "/buitis", icon: "🧾", label: "Buitis" },
] as const;

export function TabNav({
  active,
}: {
  active: "run" | "mes" | "kalendorius" | "keliones" | "buitis";
}) {
  return (
    // All 5 tabs stay visible at once, no swiping needed: on phones this
    // is a 5-column grid of equal-width icon-over-label cells (like a
    // native app's bottom tab bar); from sm: up there's room for the
    // familiar single-line icon+label pill instead.
    <div className="mt-4 grid grid-cols-5 gap-1 rounded-2xl border border-line bg-surface-2 p-1 sm:mx-auto sm:flex sm:w-fit sm:rounded-full">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center leading-tight sm:flex-row sm:gap-1.5 sm:whitespace-nowrap sm:rounded-full sm:px-4 sm:py-2"
          style={
            active === t.key
              ? { background: "var(--accent-gradient)", color: "#fff" }
              : { color: "var(--ink-faint)" }
          }
        >
          <span className="text-base sm:text-sm">{t.icon}</span>
          <span className="text-[10px] font-bold sm:text-sm">{t.label}</span>
        </Link>
      ))}
    </div>
  );
}
