export type Profile = {
  id: string;
  name: string;
  accent: "ember" | "rose";
  avatar_url: string | null;
  created_at: string;
};

export type BadgeEarned = {
  id: string;
  badge_id: string;
  user_id: string | null;
  earned_at: string;
};

export type AppNotification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  message: string;
  href: string | null;
  read: boolean;
  created_at: string;
};

export type ActivityType = "ejimas" | "begimas" | "rieduciai" | "dviraciai";

export type Run = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  activity: ActivityType;
  km: number;
  duration_min: number | null;
  weather: string | null;
  mood: string | null;
  note: string | null;
  photo_url: string | null;
  created_at: string;
};

export type Range = "week" | "month" | "all";

export type Travel = {
  id: string;
  created_by: string;
  country: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type TravelPhoto = {
  id: string;
  travel_id: string;
  url: string;
  created_by: string;
  created_at: string;
};

export type TravelChecklistItem = {
  id: string;
  travel_id: string;
  created_by: string;
  text: string;
  done: boolean;
  created_at: string;
};

export type TravelItineraryItem = {
  id: string;
  travel_id: string;
  created_by: string;
  day_date: string;
  time: string | null;
  text: string;
  created_at: string;
};

export type TravelExpense = {
  id: string;
  travel_id: string;
  created_by: string;
  label: string;
  amount: number;
  created_at: string;
};

export type Memory = {
  id: string;
  created_by: string;
  date: string;
  text: string;
  photo_url: string | null;
  created_at: string;
};

// ---------- "Kaip gerai mane pažįsti" žaidimas ----------

export type GuessGameRound = {
  id: string;
  created_by: string;
  question: string;
  target_user_id: string;
  target_answer: string | null;
  guesser_answer: string | null;
  correct: boolean | null;
  resolved: boolean;
  created_at: string;
};

export type Movie = {
  id: string;
  created_by: string;
  title: string;
  watched: boolean;
  rating: number;
  created_at: string;
};

export type SavingsGoal = {
  id: number;
  label: string;
  target: number;
};

export type Contribution = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
};

// ---------- Kartu (counter + milestones) ----------

export type CoupleSettings = {
  id: number;
  start_date: string | null;
  goal_km: number;
  goal_note: string | null;
};

export type Milestone = {
  id: string;
  created_by: string;
  label: string;
  date: string;
  recurring: boolean;
  created_at: string;
};

// ---------- Kalendorius ----------

export type CalendarEvent = {
  id: string;
  created_by: string;
  title: string;
  date: string;
  recurring_yearly: boolean;
  note: string | null;
  created_at: string;
};

// ---------- Laiko kapsulė ----------

export type Capsule = {
  id: string;
  created_by: string;
  unlock_date: string;
  // Server strips this to null for capsules that are still sealed, so the
  // text never reaches the client before its unlock date.
  text: string | null;
  opened: boolean;
  created_at: string;
};

// ---------- Buitis ----------

export type ShoppingItem = {
  id: string;
  created_by: string;
  text: string;
  done: boolean;
  created_at: string;
};

export type TaskAssignee = "both" | string;

export type Task = {
  id: string;
  created_by: string;
  text: string;
  assignee: TaskAssignee;
  done: boolean;
  created_at: string;
};

