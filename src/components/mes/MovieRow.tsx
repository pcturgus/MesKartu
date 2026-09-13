"use client";

import { useTransition } from "react";
import { toggleMovieWatched, setMovieRating, deleteMovie } from "@/app/mes/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { Movie } from "@/types/database";

export function MovieRow({ movie }: { movie: Movie }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-[var(--shadow)]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => startTransition(() => toggleMovieWatched(movie.id, !movie.watched))}
          title={movie.watched ? "Pažiūrėta" : "Pažymėti kaip pažiūrėtą"}
          className="shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-sm"
          style={
            movie.watched
              ? { background: "var(--accent-gradient)", color: "#fff", borderColor: "transparent" }
              : {}
          }
        >
          {movie.watched ? "✓" : ""}
        </button>
        <span className={`truncate ${movie.watched ? "text-ink-faint line-through" : "text-ink"}`}>
          {movie.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => startTransition(() => setMovieRating(movie.id, n))}
              disabled={isPending}
              className="text-lg leading-none"
              style={{ color: n <= movie.rating ? "var(--gold-fill)" : "var(--line)" }}
              title={`${n} žvaigždutė(s)`}
            >
              ★
            </button>
          ))}
        </div>
        <ConfirmDeleteButton action={deleteMovie.bind(null, movie.id)} />
      </div>
    </li>
  );
}
