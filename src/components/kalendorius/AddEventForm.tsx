"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCalendarEvent, type FormState } from "@/app/kalendorius/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function AddEventForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addCalendarEvent, initialState);
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
        + Įvykis
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-title" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Pavadinimas
            </label>
            <input
              id="ev-title"
              name="title"
              type="text"
              required
              maxLength={60}
              placeholder="Vizitas pas gydytoją, susitikimas..."
              className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ev-date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Data
              </label>
              <input
                id="ev-date"
                name="date"
                type="date"
                required
                className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
              />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-ink-soft pb-2">
              <input type="checkbox" name="recurring_yearly" />
              kasmet
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-note" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Pastaba (nebūtina)
            </label>
            <input
              id="ev-note"
              name="note"
              type="text"
              maxLength={100}
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
