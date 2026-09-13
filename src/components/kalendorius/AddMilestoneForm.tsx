"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addMilestone, type FormState } from "@/app/kalendorius/actions";
import { Modal } from "@/components/Modal";
import { todayKey } from "@/lib/dates";

const initialState: FormState = undefined;

export function AddMilestoneForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addMilestone, initialState);
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
        className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
        style={{ background: "var(--accent-gradient)" }}
      >
        + Proga
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ms-label" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Proga
        </label>
        <input
          id="ms-label"
          name="label"
          type="text"
          required
          maxLength={60}
          placeholder="Dianos gimtadienis"
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ms-date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Data
          </label>
          <input
            id="ms-date"
            name="date"
            type="date"
            required
            defaultValue={todayKey()}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft pb-2">
          <input type="checkbox" name="recurring" defaultChecked />
          kasmet
        </label>
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
          className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
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
