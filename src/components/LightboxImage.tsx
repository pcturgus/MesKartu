"use client";

import { useRef } from "react";

// A thumbnail that opens the full photo in a native <dialog> lightbox on
// click — matches the artifact's click-to-enlarge behavior.
export function LightboxImage({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onClick={() => dialogRef.current?.showModal()}
        className={className ?? "h-14 w-14 shrink-0 rounded-lg object-cover cursor-zoom-in"}
      />
      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-[85vh] max-w-[92vw] rounded-xl border border-line bg-surface p-0 backdrop:bg-black/70"
      >
        <div className="relative">
          <img src={src} alt={alt} className="block max-h-[85vh] max-w-[92vw] rounded-xl object-contain" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            title="Uždaryti"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
          >
            ✕
          </button>
        </div>
      </dialog>
    </>
  );
}
