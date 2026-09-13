"use client";

import { useActionState, useState } from "react";
import { updateSavingsGoal, type FormState } from "@/app/keliones/actions";
import type { SavingsGoal } from "@/types/database";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function EditGoalForm({ goal }: { goal: SavingsGoal }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateSavingsGoal, initialState);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-bold text-ink-faint underline">
        keisti tikslą
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="g-label" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Tikslas
            </label>
            <input
              id="g-label"
              name="label"
              type="text"
              required
              defaultValue={goal.label}
              className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="g-target" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Suma (€)
            </label>
            <input
              id="g-target"
              name="target"
              type="number"
              step="0.01"
              min="1"
              required
              defaultValue={goal.target}
              className="w-28 rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
            style={{ background: "var(--accent-gradient)" }}
          >
            {pending ? "..." : "Išsaugoti"}
          </button>
          {state?.error && (
            <p className="basis-full text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
          )}
        </form>
      </Modal>
    </>
  );
}
