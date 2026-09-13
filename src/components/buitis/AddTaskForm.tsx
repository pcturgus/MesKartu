"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTask, type FormState } from "@/app/buitis/actions";
import type { Profile } from "@/types/database";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function AddTaskForm({ profiles }: { profiles: Profile[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addTask, initialState);
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
        + Pridėti užduotį
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-text" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Užduotis
        </label>
        <input
          id="task-text"
          name="text"
          type="text"
          required
          maxLength={100}
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-ink-soft">
        <label className="flex items-center gap-1.5">
          <input type="radio" name="assignee" value="both" defaultChecked />
          Abu
        </label>
        {profiles.map((p) => (
          <label key={p.id} className="flex items-center gap-1.5">
            <input type="radio" name="assignee" value={p.id} />
            {p.name}
          </label>
        ))}
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
