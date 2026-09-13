import { logout } from "@/app/actions";
import { GreetingLine } from "@/components/GreetingLine";
import { NotificationsBell } from "@/components/NotificationsBell";
import { SettingsForm } from "@/components/SettingsForm";
import { namesFromProfiles } from "@/lib/profiles";
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
    <header className="flex items-start justify-between gap-3">
      <GreetingLine names={namesFromProfiles(profiles)} />
      <div className="flex shrink-0 items-center gap-2">
        <NotificationsBell />
        {me && (
          <SettingsForm myName={me.name} goalKm={goalKm} goalNote={goalNote} avatarUrl={me.avatar_url} />
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line px-3 py-2 text-sm font-bold text-ink-soft sm:px-4"
          >
            Atsijungti
          </button>
        </form>
      </div>
    </header>
  );
}
