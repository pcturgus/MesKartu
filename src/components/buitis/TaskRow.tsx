"use client";

import { useTransition } from "react";
import { toggleTask, deleteTask } from "@/app/buitis/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { Task } from "@/types/database";

export function TaskRow({ task, assigneeLabel }: { task: Task; assigneeLabel: string }) {
  const [isPending, startTransition] = useTransition();
  const isBoth = task.assignee === "both";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 ${
        task.done ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={task.done}
        disabled={isPending}
        onChange={(e) => startTransition(() => toggleTask(task.id, e.target.checked))}
      />
      <span className={`flex-1 text-sm ${task.done ? "line-through text-ink-faint" : "text-ink"}`}>
        {task.text}
      </span>
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
