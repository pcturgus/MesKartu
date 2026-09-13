"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordActivity } from "@/lib/activity";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export type FormState = { error?: string } | undefined;

// ---------- shopping list ----------

export async function addShopItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const text = String(formData.get("text") || "").trim().slice(0, 60);
  if (!text) return { error: "Įvesk prekės pavadinimą." };

  const { error } = await supabase.from("shopping_items").insert({ created_by: userId, text });
  if (error) return { error: "Nepavyko pridėti prekės." };

  await recordActivity(supabase, userId, `pridėjo prekę į pirkinių sąrašą: ${text}`, "/buitis");

  revalidatePath("/buitis");
}

// Returns whether the toggle actually saved, so the checkbox (which
// optimistically flips immediately) can revert itself and flag the failure
// instead of silently looking "stuck" or reverting with no explanation.
export async function toggleShopItem(id: string, done: boolean): Promise<boolean> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return false;
  const { error } = await supabase.from("shopping_items").update({ done }).eq("id", id);
  revalidatePath("/buitis");
  return !error;
}

export async function deleteShopItem(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("shopping_items").delete().eq("id", id);
  revalidatePath("/buitis");
}

export async function clearBoughtShopItems() {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("shopping_items").delete().eq("done", true);
  revalidatePath("/buitis");
}

// ---------- tasks ----------

export async function addTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const text = String(formData.get("text") || "").trim().slice(0, 100);
  const assigneeRaw = String(formData.get("assignee") || "both");
  if (!text) return { error: "Įvesk užduoties tekstą." };

  // "both" or an actual partner's profile id — anything else (a hand-crafted
  // call, not reachable through the form's own radio buttons) would leave
  // the task permanently mislabeled in the UI, so fall back to "both".
  let assignee = "both";
  if (assigneeRaw !== "both") {
    const { data: profileRows } = await supabase.from("profiles").select("id").eq("id", assigneeRaw).limit(1);
    if (profileRows && profileRows.length > 0) assignee = assigneeRaw;
  }

  const { error } = await supabase.from("tasks").insert({ created_by: userId, text, assignee });
  if (error) return { error: "Nepavyko pridėti užduoties." };

  await recordActivity(supabase, userId, `pridėjo užduotį: ${text}`, "/buitis");

  revalidatePath("/buitis");
}

export async function toggleTask(id: string, done: boolean): Promise<boolean> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return false;
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  revalidatePath("/buitis");
  return !error;
}

export async function deleteTask(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/buitis");
}
