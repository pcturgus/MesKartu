"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storagePathFromPublicUrl } from "@/lib/storage";
import { recordActivity } from "@/lib/activity";
import { isActivityType, activityGenitive } from "@/lib/runs";
import type { ActivityType } from "@/types/database";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type AddRunState = { error?: string } | undefined;

export async function addRun(
  _prevState: AddRunState,
  formData: FormData
): Promise<AddRunState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Reikia prisijungti." };
  }

  const date = String(formData.get("date") || "");
  const activityRaw = String(formData.get("activity") || "begimas");
  const activity: ActivityType = isActivityType(activityRaw) ? activityRaw : "begimas";
  const kmRaw = String(formData.get("km") || "");
  const km = parseFloat(kmRaw.replace(",", "."));
  const durationRaw = String(formData.get("duration_min") || "");
  const duration_min = durationRaw ? parseInt(durationRaw, 10) : null;
  const note = String(formData.get("note") || "").trim() || null;
  const weather = String(formData.get("weather") || "").trim() || null;
  const mood = String(formData.get("mood") || "").trim() || null;
  const photo_url = String(formData.get("photo_url") || "").trim() || null;

  if (!date || !isFinite(km) || km <= 0) {
    return { error: "Įvesk datą ir teisingą atstumą (km)." };
  }

  const { error } = await supabase.from("runs").insert({
    user_id: user.id,
    date,
    activity,
    km,
    duration_min,
    note,
    weather,
    mood,
    photo_url,
  });

  if (error) {
    return { error: "Nepavyko išsaugoti įrašo. Bandyk dar kartą." };
  }

  await recordActivity(supabase, user.id, `pridėjo ${activityGenitive(activity)} įrašą: ${km} km`, "/");

  revalidatePath("/");
}

export async function deleteRun(runId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Scoped by user_id here too (not just on the delete below) — otherwise
  // this fetches and then deletes the PARTNER's photo from Storage even
  // when the delete itself is correctly blocked by ownership, leaving
  // their run in place but its photo gone.
  const { data: run } = await supabase
    .from("runs")
    .select("photo_url")
    .eq("id", runId)
    .eq("user_id", user.id)
    .single();

  await supabase.from("runs").delete().eq("id", runId).eq("user_id", user.id);

  if (run?.photo_url) {
    const path = storagePathFromPublicUrl(run.photo_url, "photos");
    if (path) await supabase.storage.from("photos").remove([path]);
  }

  revalidatePath("/");
}

export type SettingsState = { error?: string } | undefined;

export async function updateSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Reikia prisijungti." };

  const myName = String(formData.get("my_name") || "").trim();
  const goalKmRaw = String(formData.get("goal_km") || "").replace(",", ".");
  const goalKm = parseFloat(goalKmRaw);
  const goalNote = String(formData.get("goal_note") || "").trim() || null;
  const avatarUrl = String(formData.get("avatar_url") || "").trim() || null;

  if (!myName) return { error: "Įvesk savo vardą." };
  if (!isFinite(goalKm) || goalKm <= 0) return { error: "Įvesk teisingą tikslo atstumą." };

  const { data: prevProfile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();

  const [{ error: nameError }, { error: goalError }] = await Promise.all([
    supabase.from("profiles").update({ name: myName, avatar_url: avatarUrl }).eq("id", user.id),
    supabase.from("couple_settings").update({ goal_km: goalKm, goal_note: goalNote }).eq("id", 1),
  ]);

  if (prevProfile?.avatar_url && prevProfile.avatar_url !== avatarUrl) {
    const path = storagePathFromPublicUrl(prevProfile.avatar_url, "photos");
    if (path) await supabase.storage.from("photos").remove([path]);
  }

  if (nameError || goalError) return { error: "Nepavyko išsaugoti nustatymų." };

  // Name/avatar and the shared goal show up in AppHeader on every tab, not
  // just these two — without revalidating the rest, a change looked stale
  // on Kelionės/Buitis/Kalendorius until something else refreshed them.
  revalidatePath("/");
  revalidatePath("/mes");
  revalidatePath("/keliones");
  revalidatePath("/buitis");
  revalidatePath("/kalendorius");
}
