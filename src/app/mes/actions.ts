"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayKey } from "@/lib/dates";
import { storagePathFromPublicUrl } from "@/lib/storage";
import { recordActivity } from "@/lib/activity";
import { getProfilePair } from "@/lib/notify";
import { checkAndAwardBadges } from "@/lib/badges-server";
import { GUESS_GAME_QUESTIONS } from "@/lib/guessGameQuestions";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export type FormState = { error?: string } | undefined;

// ---------- memories ----------

export async function addMemory(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const date = String(formData.get("date") || "");
  const text = String(formData.get("text") || "").trim();
  const photo_url = String(formData.get("photo_url") || "").trim() || null;
  if (!date || !text) return { error: "Įvesk datą ir prisiminimo tekstą." };

  const { error } = await supabase.from("memories").insert({ created_by: userId, date, text, photo_url });
  if (error) return { error: "Nepavyko pridėti prisiminimo." };

  await recordActivity(supabase, userId, "pridėjo prisiminimą", "/mes");

  revalidatePath("/mes");
}

export async function deleteMemory(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;

  const { data: memory } = await supabase.from("memories").select("photo_url").eq("id", id).single();

  await supabase.from("memories").delete().eq("id", id);

  if (memory?.photo_url) {
    const path = storagePathFromPublicUrl(memory.photo_url, "photos");
    if (path) await supabase.storage.from("photos").remove([path]);
  }

  revalidatePath("/mes");
}

// ---------- movies ----------

export async function addMovie(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Įvesk filmo pavadinimą." };

  const { error } = await supabase.from("movies").insert({ created_by: userId, title });
  if (error) return { error: "Nepavyko pridėti filmo." };

  await recordActivity(supabase, userId, `pridėjo filmą: ${title}`, "/mes");

  revalidatePath("/mes");
}

export async function toggleMovieWatched(id: string, watched: boolean) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("movies").update({ watched }).eq("id", id);
  const pair = await getProfilePair(supabase);
  if (pair) await checkAndAwardBadges(supabase, pair.ids);
  revalidatePath("/mes");
}

export async function setMovieRating(id: string, rating: number) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  await supabase.from("movies").update({ rating: clamped }).eq("id", id);
  revalidatePath("/mes");
}

export async function deleteMovie(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("movies").delete().eq("id", id);
  revalidatePath("/mes");
}

// ---------- kartu: counter ----------

export async function setStartDate(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const startDate = String(formData.get("start_date") || "");
  if (!startDate) return { error: "Įvesk datą." };
  if (startDate > todayKey()) return { error: "Data negali būti ateityje." };

  const { error } = await supabase.from("couple_settings").update({ start_date: startDate }).eq("id", 1);
  if (error) return { error: "Nepavyko išsaugoti datos." };

  revalidatePath("/mes");
}

// ---------- laiko kapsulė ----------

export async function addCapsule(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const unlockDate = String(formData.get("unlock_date") || "");
  const text = String(formData.get("text") || "").trim();
  if (!unlockDate || !text) return { error: "Įvesk datą ir laiško tekstą." };
  if (unlockDate < todayKey()) return { error: "Atrakinimo data turi būti šiandien arba vėliau." };

  const { error } = await supabase.from("capsules").insert({ created_by: userId, unlock_date: unlockDate, text });
  if (error) return { error: "Nepavyko sukurti kapsulės." };

  await recordActivity(supabase, userId, "sukūrė laiko kapsulę", "/mes");

  revalidatePath("/mes");
}

export async function openCapsule(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("capsules").update({ opened: true }).eq("id", id);
  const pair = await getProfilePair(supabase);
  if (pair) await checkAndAwardBadges(supabase, pair.ids);
  revalidatePath("/mes");
}

export async function deleteCapsule(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("capsules").delete().eq("id", id);
  revalidatePath("/mes");
}

// ---------- "Kaip gerai mane pažįsti" žaidimas ----------

export async function startGuessRound() {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true });
  const ids = (profileRows ?? []).map((p) => p.id as string);
  if (ids.length < 2) return;

  // Guard against two near-simultaneous "Naujas raundas" clicks (e.g. one
  // from each partner's device) creating two unresolved rounds — the UI
  // only ever shows the newest one, so the other would become a permanently
  // orphaned duplicate. Not fully atomic, but closes almost all of the
  // window since the check and insert are back-to-back.
  const { data: activeRows } = await supabase
    .from("guess_game_rounds")
    .select("id")
    .eq("resolved", false)
    .limit(1);
  if (activeRows && activeRows.length > 0) return;

  const { data: pastRounds } = await supabase
    .from("guess_game_rounds")
    .select("question, target_user_id, created_at")
    .order("created_at", { ascending: false });

  const lastTarget = pastRounds?.[0]?.target_user_id as string | undefined;
  const targetUserId = lastTarget ? ids.find((id) => id !== lastTarget) ?? ids[0] : ids[0];

  const usedQuestions = new Set((pastRounds ?? []).map((r) => r.question as string));
  let candidates = GUESS_GAME_QUESTIONS.filter((q) => !usedQuestions.has(q));
  if (candidates.length === 0) candidates = GUESS_GAME_QUESTIONS;
  const question = candidates[Math.floor(Math.random() * candidates.length)];

  const { error } = await supabase
    .from("guess_game_rounds")
    .insert({ created_by: userId, question, target_user_id: targetUserId });
  if (error) return;

  await recordActivity(supabase, userId, 'pradėjo naują "Kaip gerai mane pažįsti" raundą', "/mes");
  revalidatePath("/mes");
}

export async function submitTargetAnswer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const roundId = String(formData.get("round_id") || "");
  const answer = String(formData.get("answer") || "").trim();
  if (!roundId || !answer) return { error: "Įvesk atsakymą." };

  const { error } = await supabase
    .from("guess_game_rounds")
    .update({ target_answer: answer })
    .eq("id", roundId)
    .eq("target_user_id", userId);
  if (error) return { error: "Nepavyko išsaugoti atsakymo." };

  await recordActivity(supabase, userId, 'atsakė į "Kaip gerai mane pažįsti" klausimą — tavo eilė spėti', "/mes");
  revalidatePath("/mes");
}

export async function submitGuess(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await currentUserId();
  if (!userId) return { error: "Reikia prisijungti." };

  const roundId = String(formData.get("round_id") || "");
  const guess = String(formData.get("guess") || "").trim();
  if (!roundId || !guess) return { error: "Įvesk spėjimą." };

  // The target answers their own question first, then the OTHER partner
  // guesses — without this check, target_user_id could submit the guess
  // too (only prevented client-side by hiding the form), bypassing the
  // two-player turn structure entirely.
  const { error } = await supabase
    .from("guess_game_rounds")
    .update({ guesser_answer: guess })
    .eq("id", roundId)
    .neq("target_user_id", userId);
  if (error) return { error: "Nepavyko išsaugoti spėjimo." };

  await recordActivity(supabase, userId, 'atspėjo atsakymą "Kaip gerai mane pažįsti" žaidime — laikas atskleisti', "/mes");
  revalidatePath("/mes");
}

export async function gradeRound(id: string, correct: boolean) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("guess_game_rounds").update({ correct, resolved: true }).eq("id", id);
  const pair = await getProfilePair(supabase);
  if (pair) await checkAndAwardBadges(supabase, pair.ids);
  revalidatePath("/mes");
}

export async function deleteGuessRound(id: string) {
  const { supabase, userId } = await currentUserId();
  if (!userId) return;
  await supabase.from("guess_game_rounds").delete().eq("id", id);
  revalidatePath("/mes");
}
