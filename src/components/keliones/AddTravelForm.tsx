"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTravel, type FormState } from "@/app/keliones/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function AddTravelForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addTravel, initialState);
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
        + Kelionė
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tr-country" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Šalis
            </label>
            <input
              id="tr-country"
              name="country"
              type="text"
              required
              placeholder="Šalies pavadinimas"
              autoFocus
              className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tr-start" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Nuo (nebūtina)
              </label>
              <input
                id="tr-start"
                name="start_date"
                type="date"
                className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tr-end" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Iki (nebūtina)
              </label>
              <input
                id="tr-end"
                name="end_date"
                type="date"
                className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
              />
            </div>
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
