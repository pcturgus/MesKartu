import Link from "next/link";

const TABS = [
  { key: "run", href: "/", label: "🏃 Aktyvumas" },
  { key: "mes", href: "/mes", label: "💛 Mes" },
  { key: "kalendorius", href: "/kalendorius", label: "📅 Kalendorius" },
  { key: "keliones", href: "/keliones", label: "✈️ Kelionės" },
  { key: "buitis", href: "/buitis", label: "🧾 Buitis" },
] as const;

export function TabNav({
  active,
}: {
  active: "run" | "mes" | "kalendorius" | "keliones" | "buitis";
}) {
  return (
    // flex-wrap used to let 5 tabs break into an uneven, lopsided second
    // row on narrow phones (a lone last pill stranded on its own line
    // inside an otherwise pill-shaped container). A single non-wrapping
    // row that scrolls horizontally when it doesn't fit reads as a normal
    // tab bar instead, and centers itself via the auto margins whenever
    // it's narrower than the screen (nothing to scroll).
    <div className="no-scrollbar mt-4 overflow-x-auto">
      <div className="mx-auto flex w-max flex-nowrap gap-1 rounded-full border border-line bg-surface-2 p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold sm:px-4"
            style={
              active === t.key
                ? { background: "var(--accent-gradient)", color: "#fff" }
                : { color: "var(--ink-faint)" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
