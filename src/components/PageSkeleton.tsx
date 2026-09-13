import { TabNav } from "@/components/TabNav";

// Shown instantly by Next.js while a route's Server Component is still
// fetching data (see each route's loading.tsx). Keeps the tab bar in place
// — so switching tabs feels immediate even before the new page's data has
// come back — and fills the rest with a lightweight pulse placeholder
// instead of a blank screen.
export function PageSkeleton({
  active,
}: {
  active: "run" | "mes" | "kalendorius" | "keliones" | "buitis";
}) {
  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <div className="flex items-start justify-between">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-surface-2" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />
        </div>
      </div>

      <TabNav active={active} />

      <div className="mt-6 flex flex-col gap-4">
        <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </main>
  );
}
