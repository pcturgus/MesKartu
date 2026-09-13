"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  addItineraryItem,
  deleteItineraryItem,
  addTravelExpense,
  deleteTravelExpense,
  type FormState,
} from "@/app/keliones/actions";
import { Modal } from "@/components/Modal";
import { fmtDateLt } from "@/lib/dates";
import type { TravelChecklistItem, TravelItineraryItem, TravelExpense } from "@/types/database";

const initialState: FormState = undefined;

function ChecklistRow({ item }: { item: TravelChecklistItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 ${item.done ? "opacity-60" : ""}`}>
      <input
        type="checkbox"
        checked={item.done}
        disabled={isPending}
        onChange={(e) => startTransition(() => toggleChecklistItem(item.id, e.target.checked))}
      />
      <span className={`flex-1 text-sm ${item.done ? "line-through text-ink-faint" : "text-ink"}`}>{item.text}</span>
      <button
        onClick={() => startTransition(() => deleteChecklistItem(item.id))}
        title="Ištrinti"
        className="text-ink-faint hover:text-ember-ink text-sm px-1"
      >
        ✕
      </button>
    </div>
  );
}

function ExpenseRow({ item }: { item: TravelExpense }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
      <span className="flex-1 text-sm text-ink">{item.label}</span>
      <span className="font-mono text-sm font-bold">{Number(item.amount).toFixed(2)} €</span>
      <button
        onClick={() => startTransition(() => deleteTravelExpense(item.id))}
        disabled={isPending}
        title="Ištrinti"
        className="text-ink-faint hover:text-ember-ink text-sm px-1 disabled:opacity-60"
      >
        ✕
      </button>
    </div>
  );
}

function ItineraryRow({ item }: { item: TravelItineraryItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
      <div className="text-xs font-mono text-ink-faint whitespace-nowrap pt-0.5">
        {fmtDateLt(item.day_date)}
        {item.time ? ` · ${item.time}` : ""}
      </div>
      <span className="flex-1 text-sm text-ink">{item.text}</span>
      <button
        onClick={() => startTransition(() => deleteItineraryItem(item.id))}
        disabled={isPending}
        title="Ištrinti"
        className="text-ink-faint hover:text-ember-ink text-sm px-1 disabled:opacity-60"
      >
        ✕
      </button>
    </div>
  );
}

export function TravelPlanButton({
  travelId,
  country,
  checklist,
  itinerary,
  expenses,
  minDate,
  maxDate,
}: {
  travelId: string;
  country: string;
  checklist: TravelChecklistItem[];
  itinerary: TravelItineraryItem[];
  expenses: TravelExpense[];
  minDate: string | null;
  maxDate: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [checklistState, checklistAction, checklistPending] = useActionState(addChecklistItem, initialState);
  const [itineraryState, itineraryAction, itineraryPending] = useActionState(addItineraryItem, initialState);
  const [expenseState, expenseAction, expensePending] = useActionState(addTravelExpense, initialState);

  const sortedItinerary = itinerary
    .slice()
    .sort((a, b) => a.day_date.localeCompare(b.day_date) || (a.time ?? "").localeCompare(b.time ?? ""));

  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-bold text-ink-faint underline">
        planas
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-bold" style={{ color: "var(--dusk)" }}>
            {country} — planas
          </h3>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">Bagažo sąrašas</h4>
            {checklist.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {checklist.map((c) => (
                  <ChecklistRow key={c.id} item={c} />
                ))}
              </div>
            )}
            <form action={checklistAction} className="flex gap-2">
              <input type="hidden" name="travel_id" value={travelId} />
              <input
                name="text"
                type="text"
                required
                maxLength={60}
                placeholder="Daiktas..."
                className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
              />
              <button
                type="submit"
                disabled={checklistPending}
                className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
                style={{ background: "var(--accent-gradient)" }}
              >
                +
              </button>
            </form>
            {checklistState?.error && (
              <p className="mt-1.5 text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{checklistState.error}</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">Dienos planas</h4>
            {sortedItinerary.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {sortedItinerary.map((it) => (
                  <ItineraryRow key={it.id} item={it} />
                ))}
              </div>
            )}
            <form action={itineraryAction} className="flex flex-col gap-2">
              <input type="hidden" name="travel_id" value={travelId} />
              <div className="flex gap-2">
                <input
                  name="day_date"
                  type="date"
                  required
                  min={minDate ?? undefined}
                  max={maxDate ?? undefined}
                  className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                />
                <input
                  name="time"
                  type="time"
                  className="w-28 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                />
              </div>
              <div className="flex gap-2">
                <input
                  name="text"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ką veikiate?"
                  className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                />
                <button
                  type="submit"
                  disabled={itineraryPending}
                  className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  +
                </button>
              </div>
            </form>
            {itineraryState?.error && (
              <p className="mt-1.5 text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{itineraryState.error}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">Išlaidos</h4>
              {expensesTotal > 0 && (
                <span className="font-mono text-xs font-bold" style={{ color: "var(--dusk)" }}>
                  Iš viso: {expensesTotal.toFixed(2)} €
                </span>
              )}
            </div>
            {expenses.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {expenses.map((e) => (
                  <ExpenseRow key={e.id} item={e} />
                ))}
              </div>
            )}
            <form action={expenseAction} className="flex flex-col gap-2">
              <input type="hidden" name="travel_id" value={travelId} />
              <input
                name="label"
                type="text"
                required
                maxLength={60}
                placeholder="Kam išleista..."
                className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
              />
              <div className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Suma (€)"
                  className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-dusk-soft"
                />
                <button
                  type="submit"
                  disabled={expensePending}
                  className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  +
                </button>
              </div>
            </form>
            {expenseState?.error && (
              <p className="mt-1.5 text-sm text-ember-ink bg-ember-soft rounded-md px-3 py-2">{expenseState.error}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft border border-line"
            >
              Uždaryti
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
