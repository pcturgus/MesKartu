import type { Profile } from "@/types/database";

// Profiles are fetched ordered by created_at, so [0]/[1] are stable across
// pages — this just gives a safe fallback pair of display names.
export function namesFromProfiles(profiles: Profile[]): [string, string] {
  return [profiles[0]?.name ?? "Mantas", profiles[1]?.name ?? "Diana"];
}
