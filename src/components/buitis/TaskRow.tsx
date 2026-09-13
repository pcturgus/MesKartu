"use client";

import { useState, useTransition } from "react";
import { toggleTask, deleteTask } from "@/app/buitis/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { Task } from "@/types/database";

export function TaskRow({ task, assigneeLabel }: { task: Task; assigneeLabel: string }) {
  const [isPending, startTransition] = useTransition();
  const isBoth = task.assignee === "both";
  // Same optimistic-then-revert-on-failure pattern as ShopItemRow — a
  // plain server-controlled checkbox would otherwise sit frozen during the
  // round trip, or silently do nothing at all if the save fails.
  const [optimisticDone, setOptimisticDone] = useState(task.done);
  const [failed, setFailed] = useState(false);
  const checked = isPending || failed ? optimisticDone : task.done;

  function handleToggle(next: boolean) {
    setOptimisticDone(next);
    setFailed(false);
    startTransition(async () => {
      const ok = await toggleTask(task.id, next);
      if (!ok) {
        setOptimisticDone(task.done);
        setFailed(true);
      }
    });
  }

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 ${
        task.done ? "opacity-60" : ""
      }`}
    >
      <input type="checkbox" checked={checked} disabled={isPending} onChange={(e) => handleToggle(e.target.checked)} />
      <span className={`flex-1 text-sm ${task.done ? "line-through text-ink-faint" : "text-ink"}`}>
        {task.text}
      </span>
      {failed && (
        <span className="text-xs text-ember-ink" title="Nepavyko išsaugoti — bandyk dar kartą">
          ⚠️
        </span>
      )}
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
        style={
          isBoth
            ? { background: "var(--surface-2)", color: "var(--ink-soft)" }
            : { background: "var(--ember-soft)", color: "var(--ember-ink)" }
        }
      >
        {assigneeLabel}
      </span>
      <ConfirmDeleteButton action={deleteTask.bind(null, task.id)} />
    </div>
  );
}
