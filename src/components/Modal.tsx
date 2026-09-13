"use client";

import { useEffect, useRef } from "react";

// A centered, backdrop-dimmed dialog for the site's "+ X" / "⚙" toggle
// forms. Rendering these as a real modal (instead of expanding inline next
// to their trigger button) keeps narrow/mobile layouts from breaking when
// a form pops open next to a heading or icon button.
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return <ModalDialog onClose={onClose}>{children}</ModalDialog>;
}

function ModalDialog({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[88vh] w-[min(480px,94vw)] overflow-y-auto rounded-xl border-0 bg-transparent p-0 backdrop:bg-black/60"
    >
      <div className="relative rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
        <button
          type="button"
          onClick={onClose}
          title="Uždaryti"
          className="absolute right-3 top-3 text-ink-faint hover:text-ember-ink"
        >
          ✕
        </button>
        {children}
      </div>
    </dialog>
  );
}
