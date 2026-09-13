import { createClient } from "@/lib/supabase/server";
import { TabNav } from "@/components/TabNav";
import { AddShopItemForm } from "@/components/buitis/AddShopItemForm";
import { ShopItemRow } from "@/components/buitis/ShopItemRow";
import { AddTaskForm } from "@/components/buitis/AddTaskForm";
import { TaskRow } from "@/components/buitis/TaskRow";
import { clearBoughtShopItems } from "@/app/buitis/actions";
import { AppHeader } from "@/components/AppHeader";
import type { Profile, ShoppingItem, Task, CoupleSettings } from "@/types/database";

export default async function BuitisPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: profiles },
    { data: shopping },
    { data: tasks },
    { data: coupleSettingsRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("shopping_items").select("*").order("created_at", { ascending: true }),
    supabase.from("tasks").select("*").order("created_at", { ascending: true }),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allShopping = (shopping ?? []) as ShoppingItem[];
  const allTasks = (tasks ?? []) as Task[];
  const coupleSettings = (coupleSettingsRows?.[0] ?? {
    id: 1,
    start_date: null,
    goal_km: 260,
    goal_note: "Ryga",
  }) as CoupleSettings;

  const sortedShopping = allShopping
    .slice()
    .sort((a, b) => Number(a.done) - Number(b.done) || a.created_at.localeCompare(b.created_at));

  function assigneeLabel(assignee: string) {
    if (assignee === "both") return "Abu";
    return allProfiles.find((p) => p.id === assignee)?.name ?? "?";
  }

  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <AppHeader
        profiles={allProfiles}
        userId={user?.id}
        goalKm={Number(coupleSettings.goal_km)}
        goalNote={coupleSettings.goal_note}
      />

      <TabNav active="buitis" />

      {/* Pirkinių sąrašas */}
      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Pirkinių sąrašas
        </h2>
        <AddShopItemForm />
        {sortedShopping.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">Sąrašas tuščias.</p>
        ) : (
          <>
            <ul className="mt-3 flex flex-col gap-1.5">
              {sortedShopping.map((s) => (
                <li key={s.id}>
                  <ShopItemRow item={s} />
                </li>
              ))}
            </ul>
            {allShopping.some((s) => s.done) && (
              <form action={clearBoughtShopItems} className="mt-2 flex justify-end">
                <button type="submit" className="text-xs font-bold text-ink-faint underline">
                  Išvalyti nupirktus
                </button>
              </form>
            )}
          </>
        )}
      </section>

      {/* Užduotys */}
      <section className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Užduotys
          </h2>
          <AddTaskForm profiles={allProfiles} />
        </div>
        {allTasks.length === 0 ? (
          <p className="text-sm text-ink-faint">Jokių bendrų užduočių — pridėkite iššūkį, dovaną ar priminimą.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {allTasks.map((t) => (
              <li key={t.id}>
                <TaskRow task={t} assigneeLabel={assigneeLabel(t.assignee)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
