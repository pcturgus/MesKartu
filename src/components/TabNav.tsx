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
    <div className="mt-4 flex flex-wrap justify-center gap-1 rounded-full border border-line bg-surface-2 p-1 w-fit mx-auto">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className="rounded-full px-4 py-2 text-sm font-bold"
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
  );
}
