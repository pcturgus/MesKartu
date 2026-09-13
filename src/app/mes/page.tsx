import { createClient } from "@/lib/supabase/server";
import { TabNav } from "@/components/TabNav";
import { AddMemoryForm } from "@/components/mes/AddMemoryForm";
import { AddMovieForm } from "@/components/mes/AddMovieForm";
import { MovieRow } from "@/components/mes/MovieRow";
import { StartDateForm } from "@/components/mes/StartDateForm";
import { AddCapsuleForm } from "@/components/mes/AddCapsuleForm";
import { CardGame } from "@/components/mes/CardGame";
import { GuessGame } from "@/components/mes/GuessGame";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { LightboxImage } from "@/components/LightboxImage";
import { Avatar } from "@/components/Avatar";
import { AppHeader } from "@/components/AppHeader";
import { deleteMemory, openCapsule, deleteCapsule } from "@/app/mes/actions";
import { fmtDateLt, humanDuration, todayKey, todayAtMidnight } from "@/lib/dates";
import type { Profile, Memory, Movie, CoupleSettings, Capsule, GuessGameRound } from "@/types/database";

export default async function MesPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: profiles },
    { data: memories },
    { data: movies },
    { data: coupleSettingsRows },
    { data: capsulesRaw },
    { data: guessRoundsRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("memories").select("*").order("date", { ascending: false }),
    supabase.from("movies").select("*").order("created_at", { ascending: false }),
    supabase.from("couple_settings").select("*").eq("id", 1).limit(1),
    supabase.from("capsules").select("*"),
    supabase.from("guess_game_rounds").select("*"),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allMemories = (memories ?? []) as Memory[];
  const allMovies = (movies ?? []) as Movie[];
  const allGuessRounds = (guessRoundsRaw ?? []) as GuessGameRound[];
  const coupleSettings = (coupleSettingsRows?.[0] ?? {
    id: 1,
    start_date: null,
    goal_km: 260,
    goal_note: "Ryga",
  }) as CoupleSettings;

  const today = todayKey();
  // Strip the letter text for capsules that haven't unlocked yet, so it
  // never reaches the client before its time.
  const allCapsules = ((capsulesRaw ?? []) as Capsule[]).map((c) =>
    c.unlock_date <= today ? c : { ...c, text: null }
  );

  function profileFor(userId: string) {
    return allProfiles.find((p) => p.id === userId);
  }
  function NameWithAvatar({ userId }: { userId: string }) {
    const p = profileFor(userId);
    return (
      <span className="inline-flex items-center gap-1 align-middle">
        <Avatar url={p?.avatar_url} name={p?.name ?? "?"} size={14} />
        {p?.name ?? "?"}
      </span>
    );
  }

  let daysTogether: number | null = null;
  if (coupleSettings.start_date) {
    const start = new Date(coupleSettings.start_date + "T00:00:00");
    const nowMidnight = todayAtMidnight();
    daysTogether = Math.round((nowMidnight.getTime() - start.getTime()) / 86400000);
  }

  const sortedCapsules = allCapsules.slice().sort((a, b) => a.unlock_date.localeCompare(b.unlock_date));

  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-8">
      <AppHeader
        profiles={allProfiles}
        userId={user?.id}
        goalKm={Number(coupleSettings.goal_km)}
        goalNote={coupleSettings.goal_note}
      />

      <TabNav active="mes" />

      {/* Kartu */}
      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Kartu
        </h2>
        <div className="rounded-xl border border-line bg-surface p-6 text-center shadow-[var(--shadow)]">
          {daysTogether === null ? (
            <div className="text-sm text-ink-faint">
              <p className="mb-3">Įveskite pirmo pasimatymo datą, kad matytumėte, kiek laiko esate kartu.</p>
              <StartDateForm startDate={coupleSettings.start_date} />
            </div>
          ) : (
            <>
              <div
                className="font-mono font-bold leading-none"
                style={{ color: "var(--dusk)", fontSize: "clamp(3rem,10vw,4.2rem)", fontVariantNumeric: "tabular-nums" }}
              >
                {daysTogether}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-ink-faint">dienų kartu</div>
              <div className="mt-2.5 text-sm text-ink-soft">
                {humanDuration(daysTogether)} · nuo {fmtDateLt(coupleSettings.start_date as string)}
              </div>
              <div className="mt-1">
                <StartDateForm startDate={coupleSettings.start_date} />
              </div>
            </>
          )}
          <p className="mt-4 text-xs text-ink-faint">
            Progas ir svarbias datas rasite 📅 Kalendoriaus skiltyje.
          </p>
        </div>
      </section>

      {/* Prisiminimai */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Prisiminimai
          </h2>
          <AddMemoryForm />
        </div>
        {allMemories.length === 0 ? (
          <p className="text-sm text-ink-faint">Dar nėra prisiminimų.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {allMemories.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow)]"
              >
                <div className="flex items-start gap-3">
                  {m.photo_url && <LightboxImage src={m.photo_url} alt="" />}
                  <div>
                    <div className="text-xs text-ink-faint font-mono">{m.date}</div>
                    <div className="mt-1 text-sm text-ink">{m.text}</div>
                  </div>
                </div>
                <ConfirmDeleteButton action={deleteMemory.bind(null, m.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Laiko kapsulė */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Laiko kapsulė
          </h2>
          <AddCapsuleForm />
        </div>
        {sortedCapsules.length === 0 ? (
          <p className="text-sm text-ink-faint">Dar nėra kapsulių. Parašykite laišką, kurį atidarysite tik ateityje.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sortedCapsules.map((c) => {
              const unlocked = c.unlock_date <= today;
              // Same confirm-before-delete as everywhere else in this tab —
              // a misclick here could permanently delete a still-sealed,
              // unread letter with no way to recover it.
              const delBtn = (
                <div className="absolute top-2.5 right-2.5">
                  <ConfirmDeleteButton action={deleteCapsule.bind(null, c.id)} />
                </div>
              );
              if (!unlocked) {
                const nowMidnight = todayAtMidnight();
                const unlockAt = new Date(c.unlock_date + "T00:00:00");
                const days = Math.ceil((unlockAt.getTime() - nowMidnight.getTime()) / 86400000);
                return (
                  <li
                    key={c.id}
                    className="relative rounded-xl border border-dashed border-line bg-surface-2 p-5 text-center shadow-[var(--shadow)]"
                  >
                    {delBtn}
                    <div className="text-2xl leading-none">💌</div>
                    <div className="mt-2 text-xs text-ink-faint">
                      Nuo <NameWithAvatar userId={c.created_by} /> · atrakins {fmtDateLt(c.unlock_date)} (už {days} d.)
                    </div>
                  </li>
                );
              }
              if (!c.opened) {
                return (
                  <li
                    key={c.id}
                    className="relative rounded-xl border border-dashed border-line bg-surface-2 p-5 text-center shadow-[var(--shadow)]"
                  >
                    {delBtn}
                    <div className="text-2xl leading-none">🔓</div>
                    <div className="mt-2 text-xs text-ink-faint">
                      Nuo <NameWithAvatar userId={c.created_by} /> · jau galima atverti
                    </div>
                    <form action={openCapsule.bind(null, c.id)} className="mt-3">
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-sm font-bold text-white"
                        style={{ background: "var(--accent-gradient)" }}
                      >
                        Atverti laišką
                      </button>
                    </form>
                  </li>
                );
              }
              return (
                <li key={c.id} className="relative rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
                  {delBtn}
                  <div className="font-mono text-xs font-bold uppercase tracking-wide" style={{ color: "var(--dusk)" }}>
                    Nuo <NameWithAvatar userId={c.created_by} /> · {fmtDateLt(c.unlock_date)}
                  </div>
                  <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap" style={{ overflowWrap: "anywhere" }}>
                    {c.text}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Pokalbių kortelės */}
      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Pokalbių kortelės
        </h2>
        <CardGame />
      </section>

      {/* Kaip gerai mane pažįsti */}
      <section className="mt-8">
        <h2 className="text-2xl mb-3" style={{ color: "var(--dusk)" }}>
          Kaip gerai mane pažįsti?
        </h2>
        <GuessGame profiles={allProfiles} rounds={allGuessRounds} currentUserId={user?.id ?? null} />
      </section>

      {/* Filmai */}
      <section className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl" style={{ color: "var(--dusk)" }}>
            Filmai
          </h2>
          <AddMovieForm />
        </div>
        {allMovies.length === 0 ? (
          <p className="text-sm text-ink-faint">Dar nėra filmų sąraše.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {allMovies.map((m) => (
              <MovieRow key={m.id} movie={m} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
