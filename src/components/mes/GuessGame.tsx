"use client";

import { useActionState, useTransition } from "react";
import {
  startGuessRound,
  submitTargetAnswer,
  submitGuess,
  gradeRound,
  deleteGuessRound,
  type FormState,
} from "@/app/mes/actions";
import { Avatar } from "@/components/Avatar";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { Profile, GuessGameRound } from "@/types/database";

const initialState: FormState = undefined;

export function GuessGame({
  profiles,
  rounds,
  currentUserId,
}: {
  profiles: Profile[];
  rounds: GuessGameRound[];
  currentUserId: string | null;
}) {
  const [, startTransition] = useTransition();
  const [targetState, targetAction, targetPending] = useActionState(submitTargetAnswer, initialState);
  const [guessState, guessAction, guessPending] = useActionState(submitGuess, initialState);

  function nameFor(id: string) {
    return profiles.find((p) => p.id === id)?.name ?? "?";
  }
  function guesserIdFor(round: GuessGameRound) {
    return profiles.find((p) => p.id !== round.target_user_id)?.id ?? null;
  }

  const active = rounds.filter((r) => !r.resolved).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const history = rounds
    .filter((r) => r.resolved)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20);

  const scores: Record<string, number> = {};
  for (const p of profiles) scores[p.id] = 0;
  for (const r of rounds) {
    if (r.resolved && r.correct) {
      const gId = guesserIdFor(r);
      if (gId) scores[gId] = (scores[gId] ?? 0) + 1;
    }
  }

  const isTarget = active ? currentUserId === active.target_user_id : false;

  return (
    <div className="flex flex-col gap-4">
      {profiles.length === 2 && (
        <div className="flex items-center justify-center gap-5 text-sm text-ink-soft">
          {profiles.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5">
              <Avatar url={p.avatar_url} name={p.name} size={18} />
              {p.name}: <b style={{ color: "var(--ink)" }}>{scores[p.id] ?? 0}</b>
            </span>
          ))}
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 text-center shadow-[var(--shadow)]"
        style={{ backgroundImage: "linear-gradient(160deg, var(--accent-fill-1), transparent 55%)" }}
      >
        {!active ? (
          <>
            <p className="text-sm text-ink-faint mb-4">Nėra aktyvaus raundo.</p>
            <button
              type="button"
              onClick={() => startTransition(() => startGuessRound())}
              className="relative rounded-full px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              🎲 Naujas raundas
            </button>
          </>
        ) : (
          <>
            <span className="relative text-[0.68rem] font-extrabold uppercase tracking-wide" style={{ color: "var(--dusk)" }}>
              Klausimas apie {nameFor(active.target_user_id)}
            </span>
            <p
              className="relative my-4 text-balance"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,3.6vw,1.6rem)", letterSpacing: "0.01em", lineHeight: 1.3 }}
            >
              {active.question}
            </p>

            {!active.target_answer ? (
              isTarget ? (
                <form action={targetAction} className="relative flex flex-col items-center gap-2">
                  <input type="hidden" name="round_id" value={active.id} />
                  <input
                    name="answer"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Tavo tikrasis atsakymas..."
                    className="w-full max-w-xs rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                  />
                  <button
                    type="submit"
                    disabled={targetPending}
                    className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-70"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    Išsaugoti atsakymą
                  </button>
                  {targetState?.error && (
                    <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{targetState.error}</p>
                  )}
                </form>
              ) : (
                <p className="relative text-sm text-ink-faint">Lauki, kol {nameFor(active.target_user_id)} atsakys...</p>
              )
            ) : !active.guesser_answer ? (
              !isTarget ? (
                <form action={guessAction} className="relative flex flex-col items-center gap-2">
                  <input type="hidden" name="round_id" value={active.id} />
                  <input
                    name="guess"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Tavo spėjimas..."
                    className="w-full max-w-xs rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                  />
                  <button
                    type="submit"
                    disabled={guessPending}
                    className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-70"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    Spėti
                  </button>
                  {guessState?.error && (
                    <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{guessState.error}</p>
                  )}
                </form>
              ) : (
                <p className="relative text-sm text-ink-faint">
                  {nameFor(active.target_user_id)} jau atsakė — lauki, kol {nameFor(guesserIdFor(active) ?? "")} atspės...
                </p>
              )
            ) : (
              <div className="relative flex flex-col items-center gap-3">
                <div className="w-full max-w-xs rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left">
                  <div className="text-xs text-ink-faint">Tikrasis atsakymas ({nameFor(active.target_user_id)})</div>
                  <div className="text-sm font-bold">{active.target_answer}</div>
                </div>
                <div className="w-full max-w-xs rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left">
                  <div className="text-xs text-ink-faint">Spėjimas ({nameFor(guesserIdFor(active) ?? "")})</div>
                  <div className="text-sm font-bold">{active.guesser_answer}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startTransition(() => gradeRound(active.id, false))}
                    className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink-soft"
                  >
                    ❌ Neatspėjo
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => gradeRound(active.id, true))}
                    className="rounded-full px-4 py-2 text-sm font-bold text-white"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    ✅ Atspėjo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {history.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {history.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2.5"
            >
              <span className="text-base leading-none">{r.correct ? "✅" : "❌"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{r.question}</div>
                <div className="text-xs text-ink-faint truncate">
                  apie {nameFor(r.target_user_id)}: „{r.target_answer}“ · spėjo „{r.guesser_answer}“
                </div>
              </div>
              <ConfirmDeleteButton action={deleteGuessRound.bind(null, r.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
