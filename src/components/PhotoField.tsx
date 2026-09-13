"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "@/lib/image";

// A single-photo picker: resizes the chosen image client-side, uploads it
// straight to the "photos" Storage bucket, and exposes the resulting public
// URL through a hidden form field (`name`) so it rides along with the rest
// of the form on submit. `folder` namespaces uploads (e.g. "runs", "memories").
export function PhotoField({
  name = "photo_url",
  folder,
  label = "Nuotrauka (nebūtina)",
  onUploadingChange,
  initialUrl = null,
  shape = "square",
  removeLabel = "Pašalinti",
  maxDim = 480,
}: {
  name?: string;
  folder: string;
  label?: string;
  onUploadingChange?: (uploading: boolean) => void;
  initialUrl?: string | null;
  shape?: "square" | "circle";
  removeLabel?: string;
  maxDim?: number;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const blob = await resizeImageToBlob(file, maxDim, 0.72);
      const supabase = createClient();
      const path = `${folder}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("Nepavyko įkelti nuotraukos.");
      setInputKey((k) => k + 1);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function handleRemove() {
    setUrl(null);
    setError(null);
    setInputKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</span>
      <input type="hidden" name={name} value={url ?? ""} />
      {url ? (
        <div className="flex items-center gap-2">
          <img
            src={url}
            alt=""
            className={`h-14 w-14 object-cover ${shape === "circle" ? "rounded-full" : "rounded-lg"}`}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-ink-faint hover:text-ember-ink"
          >
            {removeLabel}
          </button>
        </div>
      ) : (
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-ink-soft"
        />
      )}
      {uploading && <p className="text-xs text-ink-faint">Įkeliama...</p>}
      {error && <p className="text-xs text-ember-ink">{error}</p>}
    </div>
  );
}
