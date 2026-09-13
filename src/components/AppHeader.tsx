import { logout } from "@/app/actions";
import { GreetingLine } from "@/components/GreetingLine";
import { NotificationsBell } from "@/components/NotificationsBell";
import { SettingsForm } from "@/components/SettingsForm";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import type { Profile } from "@/types/database";

// The same top bar (greeting, notifications, profile photo / settings,
// sign out) on every tab. Previously each page hand-rolled its own header
// and only the home page happened to include the profile-photo button —
// this is the single source of truth so every tab stays in sync.
export function AppHeader({
  profiles,
  userId,
  goalKm,
  goalNote,
}: {
  profiles: Profile[];
  userId: string | null | undefined;
  goalKm: number;
  goalNote: string | null;
}) {
  const me = profiles.find((p) => p.id === userId);

  return (
    // Stacked on mobile — the greeting gets the full row width to itself
    // (long greetings like "Sveiki, dienos vidurys — laikas judėti" need
    // room to wrap cleanly in the wider display font), with the icon
    // cluster on its own right-aligned row below. From sm: up there's
    // enough width for both side by side again.
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <GreetingLine profiles={profiles} />
      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
        <NotificationsBell />
        <ThemeToggleButton />
        {me && (
          <SettingsForm myName={me.name} goalKm={goalKm} goalNote={goalNote} avatarUrl={me.avatar_url} />
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line px-3 py-2 text-sm font-bold text-ink-soft transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 sm:px-4"
          >
            Atsijungti
          </button>
        </form>
      </div>
    </header>
  );
}
