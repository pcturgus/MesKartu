"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          El. paštas
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none focus:border-dusk-soft"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Slaptažodis
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none focus:border-dusk-soft"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full px-5 py-2.5 font-bold text-white shadow-[0_6px_18px_-8px_var(--accent-glow)] disabled:opacity-70"
        style={{ background: "var(--accent-gradient)" }}
      >
        {pending ? "Jungiamasi..." : "Prisijungti"}
      </button>
    </form>
  );
}
