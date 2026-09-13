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

// ---------- progos (milestones) ----------

export async function addMilestone(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const label = String(formData.get("label") || "").trim();
  const date = String(formData.get("date") || "");
  const recurring = formData.get("recurring") === "on";
  if (!label || !date) return { error: "Įvesk pavadinimą ir datą." };

  const { error } = await supabase.from("milestones").insert({ created_by: userId, label, date, recurring });
  if (error) return { error: "Nepavyko pridėti progos." };

  await recordActivity(supabase, userId, `pridėjo progą: ${label}`, "/kalendorius");

  revalidatePath("/kalendorius");
}

export async function deleteMilestone(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("milestones").delete().eq("id", id);
  revalidatePath("/kalendorius");
}

// ---------- laisvi įvykiai ----------

export async function addCalendarEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "");
  const recurring_yearly = formData.get("recurring_yearly") === "on";
  const note = String(formData.get("note") || "").trim() || null;
  if (!title || !date) return { error: "Įvesk pavadinimą ir datą." };

  const { error } = await supabase
    .from("calendar_events")
    .insert({ created_by: userId, title, date, recurring_yearly, note });
  if (error) return { error: "Nepavyko pridėti įvykio." };

  await recordActivity(supabase, userId, `pridėjo įvykį: ${title}`, "/kalendorius");

  revalidatePath("/kalendorius");
}

export async function deleteCalendarEvent(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("calendar_events").delete().eq("id", id);
  revalidatePath("/kalendorius");
}
