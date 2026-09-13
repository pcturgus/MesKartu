import type { SupabaseClient } from "@supabase/supabase-js";

// Small helpers for writing to the shared `notifications` inbox from server
// actions. Every add-action in the app calls one of these after a
// successful insert; badge awarding (see badges-server.ts) uses notifySelf
// and notifyBoth for newly-earned personal/shared badges.

export async function getProfilePair(
  supabase: SupabaseClient
): Promise<{ ids: [string, string]; names: [string, string] } | null> {
  const { data } = await supabase.from("profiles").select("id, name").order("created_at", { ascending: true });
  if (!data || data.length < 2) return null;
  return {
    ids: [data[0].id, data[1].id],
    names: [data[0].name, data[1].name],
  };
}

export async function notifySelf(
  supabase: SupabaseClient,
  userId: string,
  message: string,
  href?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    actor_id: userId,
    type: "badge",
    message,
    href: href ?? null,
  });
}

export async function notifyBoth(
  supabase: SupabaseClient,
  userIds: [string, string],
  message: string,
  href?: string
) {
  await supabase.from("notifications").insert(
    userIds.map((userId) => ({
      user_id: userId,
      actor_id: null,
      type: "badge",
      message,
      href: href ?? null,
    }))
  );
}
