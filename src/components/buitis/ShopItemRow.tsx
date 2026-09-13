"use client";

import { useState, useTransition } from "react";
import { toggleShopItem, deleteShopItem } from "@/app/buitis/actions";
import { guessProductEmoji } from "@/lib/products";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { ShoppingItem } from "@/types/database";

export function ShopItemRow({ item }: { item: ShoppingItem }) {
  const [isPending, startTransition] = useTransition();
  // The checkbox is otherwise a plain server-controlled input, so a click
  // would just sit there until the round trip finishes (or silently do
  // nothing at all if it fails) — flip it right away, then revert with a
  // visible flag if the save didn't actually go through.
  const [optimisticDone, setOptimisticDone] = useState(item.done);
  const [failed, setFailed] = useState(false);
  const checked = isPending || failed ? optimisticDone : item.done;

  function handleToggle(next: boolean) {
    setOptimisticDone(next);
    setFailed(false);
    startTransition(async () => {
      const ok = await toggleShopItem(item.id, next);
      if (!ok) {
        setOptimisticDone(item.done);
        setFailed(true);
      }
    });
  }

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 shadow-[var(--shadow)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] ${
        item.done ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <span className="text-base leading-none">{guessProductEmoji(item.text)}</span>
      <span className={`flex-1 text-sm ${item.done ? "line-through text-ink-faint" : "text-ink"}`}>
        {item.text}
      </span>
      {failed && (
        <span className="text-xs text-ember-ink" title="Nepavyko išsaugoti — bandyk dar kartą">
          ⚠️
        </span>
      )}
      <ConfirmDeleteButton action={deleteShopItem.bind(null, item.id)} />
    </div>
  );
}
