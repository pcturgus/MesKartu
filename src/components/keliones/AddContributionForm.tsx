"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addContribution, type FormState } from "@/app/keliones/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function AddContributionForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addContribution, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-2 text-sm font-bold text-white"
        style={{ background: "var(--accent-gradient)" }}
      >
        + Įnašas
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Data
          </label>
          <input
            id="c-date"
            name="date"
            type="date"
            required
            defaultValue={todayLocalISO()}
            max={todayLocalISO()}
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-amount" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Suma (€)
          </label>
          <input
            id="c-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="20"
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-note" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Pastaba (nebūtina)
        </label>
        <input
          id="c-note"
          name="note"
          type="text"
          maxLength={80}
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft border border-line"
        >
          Atšaukti
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
          style={{ background: "var(--accent-gradient)" }}
        >
          {pending ? "Saugoma..." : "Pridėti"}
        </button>
      </div>
        </form>
      </Modal>
    </>
  );
}
