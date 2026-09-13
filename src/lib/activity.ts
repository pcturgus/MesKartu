import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfilePair } from "@/lib/notify";
import { checkAndAwardBadges } from "@/lib/badges-server";

// The single integration point every "add" server action calls after a
// successful insert: tells the other partner what just happened ("Mantas
// pridėjo bėgimą: 5 km"), then re-checks badge eligibility for both of you
// and notifies about anything newly earned. `action` should read naturally
// after the actor's name, e.g. "pridėjo bėgimą: 5 km".
export async function recordActivity(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  href?: string
) {
  const pair = await getProfilePair(supabase);
  if (!pair) return;

  const idx = pair.ids[0] === actorId ? 0 : 1;
  const actorName = pair.names[idx];
  const partnerId = pair.ids[1 - idx];

  await supabase.from("notifications").insert({
    user_id: partnerId,
    actor_id: actorId,
    type: "activity",
    message: `${actorName} ${action}`,
    href: href ?? null,
  });

  await checkAndAwardBadges(supabase, pair.ids);
}
