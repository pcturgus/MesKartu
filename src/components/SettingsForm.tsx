"use client";

import { useActionState, useState } from "react";
import { updateSettings, type SettingsState } from "@/app/actions";
import { GOAL_PRESETS } from "@/lib/runs";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/Avatar";
import { PhotoField } from "@/components/PhotoField";

const initialState: SettingsState = undefined;

export function SettingsForm({
  myName,
  goalKm,
  goalNote,
  avatarUrl,
}: {
  myName: string;
  goalKm: number;
  goalNote: string | null;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateSettings, initialState);
  const [presetKm, setPresetKm] = useState<number | null>(null);
  const [presetName, setPresetName] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Nustatymai"
        aria-label="Nustatymai"
        className="rounded-full"
      >
        <Avatar url={avatarUrl} name={myName} size={36} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="flex flex-col gap-3 text-left">
          <h3 className="text-sm font-bold" style={{ color: "var(--dusk)" }}>
            Nustatymai
          </h3>
      <PhotoField
        name="avatar_url"
        folder="avatars"
        label="Profilio nuotrauka"
        shape="circle"
        maxDim={320}
        initialUrl={avatarUrl}
        removeLabel="Pašalinti nuotrauką"
        onUploadingChange={setPhotoUploading}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="my-name" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
          Mano vardas
        </label>
        <input
          id="my-name"
          name="my_name"
          type="text"
          required
          maxLength={24}
          defaultValue={myName}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-dusk-soft"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="goal-km" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Bendras tikslas (km)
          </label>
          <input
            id="goal-km"
            name="goal_km"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={presetKm ?? goalKm}
            key={presetKm ?? "km-default"}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="goal-note" className="text-xs font-bold uppercase tracking-wide text-ink-faint">
            Kelionės tikslas
          </label>
          <input
            id="goal-note"
            name="goal_note"
            type="text"
            maxLength={30}
            placeholder="Paryžius"
            defaultValue={presetName ?? goalNote ?? ""}
            key={presetName ?? "note-default"}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-dusk-soft"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Greiti pasiūlymai</span>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPresetKm(p.km);
                setPresetName(p.name);
              }}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink-soft"
            >
              {p.name} · ~{p.km} km
            </button>
          ))}
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
          disabled={pending || photoUploading}
          className="rounded-full px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
          style={{ background: "var(--accent-gradient)" }}
        >
          {pending ? "..." : "Išsaugoti"}
        </button>
      </div>
        </form>
      </Modal>
    </>
  );
}
