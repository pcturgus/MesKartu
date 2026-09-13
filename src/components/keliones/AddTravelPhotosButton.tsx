"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "@/lib/image";
import { addTravelPhotos } from "@/app/keliones/actions";

// A small "+" tile in a travel's photo album: picks one or more images,
// uploads each (resized) to Storage, then attaches the resulting URLs to
// the travel via the addTravelPhotos server action. `max` caps how many of
// the picked files are actually uploaded (the album holds at most 5).
export function AddTravelPhotosButton({
  travelId,
  max,
  className,
}: {
  travelId: string;
  max?: number;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const urls: string[] = [];
      const picked = max ? Array.from(files).slice(0, max) : Array.from(files);
      for (const file of picked) {
        const blob = await resizeImageToBlob(file, 320, 0.68);
        const path = `travels/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("photos").upload(path, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (error) continue;
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (urls.length) await addTravelPhotos(travelId, urls);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      title="Pridėti nuotraukų"
      className={
        className
          ? `${className} flex items-center justify-center rounded-lg border border-dashed border-line text-ink-faint disabled:opacity-60`
          : "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-ink-faint disabled:opacity-60"
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {uploading ? "…" : "+"}
    </button>
  );
}
