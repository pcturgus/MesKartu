"use client";

import { useActionState, useState } from "react";
import { setStartDate, type FormState } from "@/app/mes/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function StartDateForm({ startDate }: { startDate: string | null }) {
  const [open, setOpen] = useState(!startDate);
  const [state, formAction, pending] = useActionState(setStartDate, initialState);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-bold text-ink-faint underline">
        keisti datą
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="flex flex-wrap items-end justify-center gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="start-date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Pirmo pasimatymo data
            </label>
            <input
              id="start-date"
              name="start_date"
              type="date"
              required
              defaultValue={startDate ?? ""}
              className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
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
