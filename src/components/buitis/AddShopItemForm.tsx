"use client";

import { useActionState, useEffect, useRef } from "react";
import { addShopItem, type FormState } from "@/app/buitis/actions";

const initialState: FormState = undefined;

export function AddShopItemForm() {
  const [state, formAction, pending] = useActionState(addShopItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="text"
          type="text"
          required
          maxLength={60}
          placeholder="Pridėti prekę..."
          className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
          style={{ background: "var(--accent-gradient)" }}
        >
          +
        </button>
      </div>
      {state?.error && (
        <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
      )}
    </form>
  );
}
