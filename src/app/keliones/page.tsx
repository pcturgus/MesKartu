import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { TabNav } from "@/components/TabNav";
import { FlagIcon } from "@/components/keliones/FlagIcon";
import { AddTravelForm } from "@/components/keliones/AddTravelForm";
import { TravelAlbum } from "@/components/keliones/TravelAlbum";
import { TravelPlanButton } from "@/components/keliones/TravelPlanButton";
import { AddContributionForm } from "@/components/keliones/AddContributionForm";
import { EditGoalForm } from "@/components/keliones/EditGoalForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Avatar } from "@/components/Avatar";
import { AppHeader } from "@/components/AppHeader";
import { deleteTravel, deleteContribution } from "@/app/keliones/actions";
import { fmtDateLt } from "@/lib/dates";
import type {
  Profile,
  Travel,
  TravelPhoto,
  TravelChecklistItem,
  TravelItineraryItem,
  TravelExpense,
  SavingsGoal,
  Contribution,
  CoupleSettings,
} from "@/types/database";

// The world-map library bundles its own topojson country data, so it's
// worth its own chunk, fetched in parallel rather than padding out the
// rest of this page's JS — SSR stays on (it doesn't touch window/document),
// so the map itself still renders straight into the HTML.
const WorldMapCard = dynamic(() =>
  import("@/components/keliones/WorldMapCard").then((m) => m.WorldMapCard)
);

export default async function KelionesPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: profiles },
    { data: travels },
    { data: travelPhotos },
    { data: checklistRows },
    { data: itineraryRows },
    { data: expenseRows },
    { data: savingsGoalRows },
    { data: contributions },
    { data: coupleSettingsRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("travels").select("*").order("created_at", { ascending: false }),
    supabase.from("travel_photos").select("*").order("created_at", { ascending: true }),
    supabase.from("travel_checklist_items").select("*").order("created_at", { ascending: true }),
    supabase.from("travel_itinerary_items").select("*").order("day_date", { ascending: true }),
    supabase.from("travel_expenses").select("*").order("created_at", { ascending: true }),
    supabase.from("savings_goal").select("*").eq("id", 1).limit(1),
    supabase.from("contributions").select("*").order("date", { ascending: false }),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allTravels = (travels ?? []) as Travel[];
  const allTravelPhotos = (travelPhotos ?? []) as TravelPhoto[];
  const allChecklist = (checklistRows ?? []) as TravelChecklistItem[];
  const allItinerary = (itineraryRows ?? []) as TravelItineraryItem[];
  const allExpenses = (expenseRows ?? []) as TravelExpense[];
  const goal = (savingsGoalRows?.[0] ?? { id: 1, label: "Bendra kelionė", target: 500 }) as SavingsGoal;
  const allContributions = (contributions ?? []) as Contribution[];
  const coupleSettings = (coupleSettingsRows?.[0] ?? {
    id: 1,
    start_date: null,
    goal_km: 260,
    goal_note: "Ryga",
  }) as CoupleSettings;

  function nameFor(userId: string) {
    return allProfiles.find((p) => p.id === userId)?.name ?? "?";
  }
  function profileFor(userId: string) {
    return allProfiles.find((p) => p.id === userId);
  }

  const totalSaved = allContributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const savedPct = Math.max(0, Math.min(1, totalSaved / (goal.target || 1)));

  const photosByTravel = allTravelPhotos.reduce<Record<string, TravelPhoto[]>>((acc, p) => {
    (acc[p.travel_id] ??= []).push(p);
    return acc;
  }, {});
  const checklistByTravel = allChecklist.reduce<Record<string, TravelChecklistItem[]>>((acc, c) => {
    (acc[c.travel_id] ??= []).push(c);
    return acc;
  }, {});
  const itineraryByTravel = allItinerary.reduce<Record<string, TravelItineraryItem[]>>((acc, it) => {
    (acc[it.travel_id] ??= []).push(it);
    return acc;
  }, {});
  const expensesByTravel = allExpenses.reduce<Record<string, TravelExpense[]>>((acc, e) => {
    (acc[e.travel_id] ??= []).push(e);
    return acc;
  }, {});

  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <AppHeader
        profiles={allProfiles}
        userId={user?.id}
        goalKm={Number(coupleSettings.goal_km)}
        goalNote={coupleSettings.goal_note}
      />

      <TabNav active="keliones" />

      {/* Pasaulio žemėlapis */}
      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Pasaulio žemėlapis
        </h2>
        <WorldMapCard travels={allTravels} />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Kelionės
          </h2>
          <AddTravelForm />
        </div>
        {allTravels.length === 0 ? (
          <p className="text-sm text-ink-faint">Dar nėra įrašytų kelionių.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {allTravels.map((t) => {
              const photos = photosByTravel[t.id] ?? [];
              const expenses = expensesByTravel[t.id] ?? [];
              const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
              return (
                <li key={t.id} className="rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow)]">
                  <div className="flex items-center gap-2">
                    <FlagIcon country={t.country} />
                    <div className="flex-1">
                      <span className="text-sm font-bold">{t.country}</span>
                      {(t.start_date || t.end_date) && (
                        <div className="text-xs text-ink-faint font-mono">
                          {t.start_date ? fmtDateLt(t.start_date) : "?"}
                          {t.end_date ? ` – ${fmtDateLt(t.end_date)}` : ""}
                        </div>
                      )}
                      {spent > 0 && (
                        <div className="text-xs text-ink-faint">
                          Išleista: <b style={{ color: "var(--ink)" }}>{spent.toFixed(2)} €</b>
                        </div>
                      )}
                    </div>
                    <TravelPlanButton
                      travelId={t.id}
                      country={t.country}
                      checklist={checklistByTravel[t.id] ?? []}
                      itinerary={itineraryByTravel[t.id] ?? []}
                      expenses={expenses}
                      minDate={t.start_date}
                      maxDate={t.end_date}
                    />
                    <ConfirmDeleteButton action={deleteTravel.bind(null, t.id)} />
                  </div>
                  <TravelAlbum travelId={t.id} country={t.country} photos={photos} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Santaupos */}
      <section className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Santaupos
          </h2>
          <AddContributionForm />
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">
              Kelionė iki <b style={{ color: "var(--ink)" }}>{goal.label}</b>
            </span>
            <span className="font-mono text-sm text-ink-soft">
              <b style={{ color: "var(--ink)" }}>{totalSaved.toFixed(2)}</b> / {goal.target.toFixed(2)} €
            </span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${savedPct * 100}%`, background: "var(--accent-gradient)" }}
            />
          </div>
          <EditGoalForm goal={goal} />
        </div>

        {allContributions.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {allContributions.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-[var(--shadow)]"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar url={profileFor(c.user_id)?.avatar_url} name={nameFor(c.user_id)} />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm">{nameFor(c.user_id)}</span>
                      <span className="text-xs text-ink-faint font-mono">{c.date}</span>
                    </div>
                    {c.note && <div className="text-xs text-ink-soft">{c.note}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold">{Number(c.amount).toFixed(2)} €</span>
                  {/* Only the person who added a contribution can delete it
                      (enforced server-side too) — showing this for the
                      partner's rows meant clicking it silently did nothing. */}
                  {c.user_id === user?.id && (
                    <form action={deleteContribution.bind(null, c.id)}>
                      <button type="submit" className="text-ink-faint hover:text-ember-ink text-sm px-1" title="Ištrinti">
                        ✕
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
