"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCapsule, type FormState } from "@/app/mes/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function AddCapsuleForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addCapsule, initialState);
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
        + Nauja kapsulė
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cap-date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Atrakins
        </label>
        <input
          id="cap-date"
          name="unlock_date"
          type="date"
          required
          min={todayLocalISO()}
          className="w-fit rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cap-text" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Laiškas
        </label>
        <textarea
          id="cap-text"
          name="text"
          required
          rows={4}
          maxLength={2000}
          placeholder="Parašyk laišką, kurį atversite tik ateityje..."
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft resize-y"
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
          {pending ? "Saugoma..." : "Užantspauduoti"}
        </button>
      </div>
        </form>
      </Modal>
    </>
  );
}
