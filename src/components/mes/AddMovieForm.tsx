"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addMovie, type FormState } from "@/app/mes/actions";
import { Modal } from "@/components/Modal";

const initialState: FormState = undefined;

export function AddMovieForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addMovie, initialState);
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
        + Filmas
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-wrap gap-2 items-start">
          <input
            name="title"
            type="text"
            required
            placeholder="Filmo pavadinimas"
            autoFocus
            className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
            style={{ background: "var(--accent-gradient)" }}
          >
            {pending ? "..." : "Pridėti"}
          </button>
          {state?.error && (
            <p className="basis-full text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
          )}
        </form>
      </Modal>
    </>
  );
}
