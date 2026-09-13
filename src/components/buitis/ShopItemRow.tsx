"use client";

import { useTransition } from "react";
import { toggleShopItem, deleteShopItem } from "@/app/buitis/actions";
import { guessProductEmoji } from "@/lib/products";
import type { ShoppingItem } from "@/types/database";

export function ShopItemRow({ item }: { item: ShoppingItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 ${
        item.done ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={item.done}
        disabled={isPending}
        onChange={(e) => startTransition(() => toggleShopItem(item.id, e.target.checked))}
      />
      <span className="text-base leading-none">{guessProductEmoji(item.text)}</span>
      <span className={`flex-1 text-sm ${item.done ? "line-through text-ink-faint" : "text-ink"}`}>
        {item.text}
      </span>
      <button
        onClick={() => startTransition(() => deleteShopItem(item.id))}
        title="Ištrinti"
        className="text-ink-faint hover:text-ember-ink text-sm px-1"
      >
        ✕
      </button>
    </div>
  );
}
