"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addRun, type AddRunState } from "@/app/actions";
import { WEATHER, MOOD, ACTIVITIES } from "@/lib/runs";
import { PhotoField } from "@/components/PhotoField";
import { Modal } from "@/components/Modal";

const initialState: AddRunState = undefined;

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function AddRunForm({ variant = "inline" }: { variant?: "inline" | "fab" }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addRun, initialState);
  const [photoUploading, setPhotoUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    // Just finished a submit with no error -> reset + collapse the form.
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
        className={
          variant === "fab"
            ? "fixed z-40 flex items-center gap-1.5 rounded-full pl-4 pr-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] active:scale-95 transition-transform"
            : "rounded-full px-5 py-2.5 text-sm font-bold text-white"
        }
        style={
          variant === "fab"
            ? {
                background: "var(--accent-gradient)",
                right: "max(1.25rem, env(safe-area-inset-right))",
                bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
              }
            : { background: "var(--accent-gradient)" }
        }
      >
        <span className="text-lg leading-none">+</span> Įrašas
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Veikla</span>
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITIES.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1.5 text-sm has-[:checked]:border-dusk-soft has-[:checked]:bg-surface-2"
            >
              <input type="radio" name="activity" value={a.id} defaultChecked={a.id === "begimas"} className="sr-only" />
              <span>{a.icon}</span>
              <span className="text-xs text-ink-soft">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={todayLocalISO()}
            max={todayLocalISO()}
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="km" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Atstumas (km)
          </label>
          <input
            id="km"
            name="km"
            type="number"
            step="0.01"
            min="0.1"
            required
            placeholder="5.0"
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="duration_min" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Trukmė (minutėmis, nebūtina)
        </label>
        <input
          id="duration_min"
          name="duration_min"
          type="number"
          min="1"
          step="1"
          placeholder="30"
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Oras (nebūtina)</span>
        <div className="flex flex-wrap gap-1.5">
          {WEATHER.map((w) => (
            <label
              key={w.id}
              className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1.5 text-sm has-[:checked]:border-dusk-soft has-[:checked]:bg-surface-2"
            >
              <input type="radio" name="weather" value={w.id} className="sr-only" />
              <span>{w.icon}</span>
              <span className="text-xs text-ink-soft">{w.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Savijauta (nebūtina)</span>
        <div className="flex flex-wrap gap-1.5">
          {MOOD.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1.5 text-sm has-[:checked]:border-dusk-soft has-[:checked]:bg-surface-2"
            >
              <input type="radio" name="mood" value={m.id} className="sr-only" />
              <span>{m.icon}</span>
              <span className="text-xs text-ink-soft">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Pastaba (nebūtina)
        </label>
        <textarea
          id="note"
          name="note"
          maxLength={140}
          placeholder="Kaip jautėtės, maršrutas..."
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-dusk-soft min-h-14"
        />
      </div>

      <PhotoField folder="runs" onUploadingChange={setPhotoUploading} />

      {state?.error && (
        <p className="text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft border border-line"
        >
          Atšaukti
        </button>
        <button
          type="submit"
          disabled={pending || photoUploading}
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
