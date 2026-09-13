"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storagePathFromPublicUrl } from "@/lib/storage";
import { recordActivity } from "@/lib/activity";
import { todayKey } from "@/lib/dates";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export type FormState = { error?: string } | undefined;

// ---------- travels ----------

export async function addTravel(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const country = String(formData.get("country") || "").trim();
  const start_date = String(formData.get("start_date") || "").trim() || null;
  const end_date = String(formData.get("end_date") || "").trim() || null;
  if (!country) return { error: "Įvesk šalies pavadinimą." };
  if (start_date && end_date && end_date < start_date) {
    return { error: "Pabaigos data turi būti po pradžios datos." };
  }

  const { error } = await supabase.from("travels").insert({ created_by: userId, country, start_date, end_date });
  if (error) return { error: "Nepavyko pridėti kelionės." };

  await recordActivity(supabase, userId, `pridėjo kelionę: ${country}`, "/keliones");

  revalidatePath("/keliones");
  revalidatePath("/kalendorius");
}

export async function updateTravelDates(id: string, startDate: string | null, endDate: string | null): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };
  if (startDate && endDate && endDate < startDate) {
    return { error: "Pabaigos data turi būti po pradžios datos." };
  }

  const { error } = await supabase
    .from("travels")
    .update({ start_date: startDate, end_date: endDate })
    .eq("id", id);
  if (error) return { error: "Nepavyko išsaugoti datų." };

  revalidatePath("/keliones");
  revalidatePath("/kalendorius");
}

export async function deleteTravel(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;

  const { data: photos } = await supabase.from("travel_photos").select("url").eq("travel_id", id);

  // travel_photos / checklist / itinerary rows cascade-delete with the
  // travel; the Storage objects don't, so clean those up best-effort too —
  // but only once the travel row itself is actually gone. Otherwise a
  // blocked/failed delete (RLS, network blip) would still wipe the photos
  // out from under a travel that's still there.
  const { error: deleteError } = await supabase.from("travels").delete().eq("id", id);
  if (deleteError) return;

  const paths = (photos ?? [])
    .map((p) => storagePathFromPublicUrl(p.url, "photos"))
    .filter((p): p is string => !!p);
  if (paths.length) await supabase.storage.from("photos").remove(paths);

  revalidatePath("/keliones");
  revalidatePath("/kalendorius");
}

// ---------- travel photos ----------

const MAX_TRAVEL_PHOTOS = 5;

export async function addTravelPhotos(travelId: string, urls: string[]) {
  const { supabase, userId } = await currentUserId();
  if (!userId || urls.length === 0) return;

  const { count } = await supabase
    .from("travel_photos")
    .select("id", { count: "exact", head: true })
    .eq("travel_id", travelId);
  const remaining = Math.max(0, MAX_TRAVEL_PHOTOS - (count ?? 0));
  const toInsert = urls.slice(0, remaining);
  if (toInsert.length === 0) return;

  await supabase
    .from("travel_photos")
    .insert(toInsert.map((url) => ({ travel_id: travelId, url, created_by: userId })));

  // The count-then-insert above isn't atomic, so two near-simultaneous
  // uploads (e.g. both of you adding photos right after the same trip) can
  // still push the total past the cap. Re-check afterward and trim back
  // down, removing whichever rows ended up newest along with their Storage
  // objects, so the count always converges back to the cap.
  const { data: allPhotos } = await supabase
    .from("travel_photos")
    .select("id, url, created_at")
    .eq("travel_id", travelId)
    .order("created_at", { ascending: true });
  const overflow = (allPhotos ?? []).slice(MAX_TRAVEL_PHOTOS);
  if (overflow.length > 0) {
    await supabase.from("travel_photos").delete().in("id", overflow.map((p) => p.id));
    const overflowPaths = overflow.map((p) => storagePathFromPublicUrl(p.url, "photos")).filter((p): p is string => !!p);
    if (overflowPaths.length) await supabase.storage.from("photos").remove(overflowPaths);
  }

  await recordActivity(supabase, userId, "pridėjo nuotraukų kelionei", "/keliones");

  revalidatePath("/keliones");
}

export async function deleteTravelPhoto(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;

  const { data: photo } = await supabase.from("travel_photos").select("url").eq("id", id).single();

  await supabase.from("travel_photos").delete().eq("id", id);

  if (photo?.url) {
    const path = storagePathFromPublicUrl(photo.url, "photos");
    if (path) await supabase.storage.from("photos").remove([path]);
  }

  revalidatePath("/keliones");
}

// ---------- packing list ----------

export async function addChecklistItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const travel_id = String(formData.get("travel_id") || "");
  const text = String(formData.get("text") || "").trim();
  if (!travel_id || !text) return { error: "Įvesk daiktą." };

  const { error } = await supabase.from("travel_checklist_items").insert({ travel_id, created_by: userId, text });
  if (error) return { error: "Nepavyko pridėti." };

  revalidatePath("/keliones");
}

export async function toggleChecklistItem(id: string, done: boolean) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("travel_checklist_items").update({ done }).eq("id", id);
  revalidatePath("/keliones");
}

export async function deleteChecklistItem(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("travel_checklist_items").delete().eq("id", id);
  revalidatePath("/keliones");
}

// ---------- day plan ----------

export async function addItineraryItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const travel_id = String(formData.get("travel_id") || "");
  const day_date = String(formData.get("day_date") || "") || todayKey();
  const time = String(formData.get("time") || "").trim() || null;
  const text = String(formData.get("text") || "").trim();
  if (!travel_id || !text) return { error: "Įvesk dienos plano punktą." };

  const { error } = await supabase
    .from("travel_itinerary_items")
    .insert({ travel_id, created_by: userId, day_date, time, text });
  if (error) return { error: "Nepavyko pridėti." };

  revalidatePath("/keliones");
}

export async function deleteItineraryItem(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("travel_itinerary_items").delete().eq("id", id);
  revalidatePath("/keliones");
}

// ---------- kelionės išlaidos ----------

export async function addTravelExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const travel_id = String(formData.get("travel_id") || "");
  const label = String(formData.get("label") || "").trim();
  const amountRaw = String(formData.get("amount") || "").replace(",", ".");
  const amount = parseFloat(amountRaw);
  if (!travel_id || !label || !isFinite(amount) || amount <= 0) {
    return { error: "Įvesk pavadinimą ir teisingą sumą." };
  }

  const { error } = await supabase.from("travel_expenses").insert({ travel_id, created_by: userId, label, amount });
  if (error) return { error: "Nepavyko pridėti išlaidos." };

  await recordActivity(supabase, userId, `pridėjo kelionės išlaidą: ${label} (${amount.toFixed(2)} €)`, "/keliones");

  revalidatePath("/keliones");
}

export async function deleteTravelExpense(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("travel_expenses").delete().eq("id", id);
  revalidatePath("/keliones");
}

// ---------- santaupos (kelionei) ----------

export async function addContribution(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const amountRaw = String(formData.get("amount") || "").replace(",", ".");
  const amount = parseFloat(amountRaw);
  const date = String(formData.get("date") || "");
  const note = String(formData.get("note") || "").trim() || null;

  if (!date || !isFinite(amount) || amount <= 0) {
    return { error: "Įvesk datą ir teisingą sumą." };
  }

  const { error } = await supabase.from("contributions").insert({
    user_id: userId,
    amount,
    date,
    note,
  });
  if (error) return { error: "Nepavyko pridėti įnašo." };

  await recordActivity(supabase, userId, `pridėjo įnašą: ${amount.toFixed(2)} €`, "/keliones");

  revalidatePath("/keliones");
}

export async function deleteContribution(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("contributions").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/keliones");
}

export async function updateSavingsGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const label = String(formData.get("label") || "").trim();
  const targetRaw = String(formData.get("target") || "").replace(",", ".");
  const target = parseFloat(targetRaw);

  if (!label || !isFinite(target) || target <= 0) {
    return { error: "Įvesk tikslo pavadinimą ir sumą." };
  }

  const { error } = await supabase.from("savings_goal").update({ label, target }).eq("id", 1);
  if (error) return { error: "Nepavyko atnaujinti tikslo." };

  revalidatePath("/keliones");
}
