/**
 * The wire contract — the ONLY hand-maintained mirror of the backend's responses.
 * `ApiEnvelope<T>` and `Paginated<T>` are structural (Rakaya D1). Every enum is a string
 * union under a `// Mirrors app/Enums/X.php exactly` comment (Tier 1.5); labels render
 * client-side via `t("enums.<x>." + value)`.
 */

export interface ApiEnvelope<T> {
  flag: boolean;
  data: T;
  message: string;
}

export interface Paginated<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

// Mirrors app/Enums/MealType.php exactly
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

// Mirrors app/Enums/Gender.php exactly
export type Gender = "male" | "female";

// Mirrors app/Enums/ActivityLevel.php exactly
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extra_active";

// Mirrors app/Enums/GoalType.php exactly
export type GoalType = "lose" | "maintain" | "gain";

// Mirrors app/Enums/GroupRole.php exactly
export type GroupRole = "owner" | "member";

// Mirrors app/Enums/ChallengeType.php exactly
export type ChallengeType = "most_steps" | "target_steps";

// Mirrors app/Enums/ChallengeStatus.php exactly
export type ChallengeStatus = "upcoming" | "active" | "ended";

// Mirrors app/Enums/StepSource.php exactly
export type StepSource = "healthkit" | "health_connect" | "manual";

// Mirrors app/Enums/LeaderboardPeriod.php exactly
export type LeaderboardPeriod = "today" | "week" | "month";

/** UserResource */
export interface User {
  id: number;
  name: string;
  email: string;
  locale: "ar" | "en";
  avatar_url: string | null;
  has_profile: boolean | null;
  profile?: UserProfile | null;
  created_at: string | null;
}

/** UserProfileResource */
export interface UserProfile {
  gender: Gender;
  age: number;
  height: number;
  current_weight: number;
  target_weight: number;
  activity_level: ActivityLevel;
  goal_type: GoalType;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_steps_goal: number;
  water_goal_ml: number;
  updated_at: string | null;
}

export interface SaveProfilePayload {
  gender: Gender;
  age: number;
  height: number;
  current_weight: number;
  target_weight: number;
  activity_level: ActivityLevel;
  daily_steps_goal?: number;
  water_goal_ml?: number;
}

/** POST auth/otp/verify → data */
export interface VerifyOtpResponse {
  requires_name: boolean;
  token: string | null;
  user: User | null;
  is_new: boolean;
}

/** MealResource */
export interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  eaten_on: string;
  created_at: string | null;
}

export interface MealPayload {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type: MealType;
  eaten_on: string;
}

/** FrequentMealResource (GET meals/frequent) — a template for one-tap logging */
export interface FrequentMeal {
  name: string;
  meal_type: MealType;
  times: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** DayTotalsResource */
export interface DayTotals {
  date: string;
  meals_count: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** StepEntryResource */
export interface StepEntry {
  date: string;
  steps: number;
  source: StepSource;
  synced_at: string;
}

export interface StepSyncPayload {
  entries: { date: string; steps: number; source: StepSource }[];
}

export interface StepSyncResponse {
  entries: StepEntry[];
  goal: number;
}

export interface StepHistory {
  from: string;
  to: string;
  goal: number;
  entries: StepEntry[];
}

/** WaterEntryResource */
export interface WaterEntry {
  date: string;
  ml: number;
}

/** WeightEntryResource */
export interface WeightEntry {
  id: number;
  date: string;
  weight_kg: number;
}

/** GroupResource */
export interface Group {
  id: number;
  name: string;
  photo_url: string | null;
  invite_code: string;
  owner_id: number;
  my_role: GroupRole;
  members_count: number;
  max_members: number;
  created_at: string | null;
}

/** StandingResource */
export interface Standing {
  user_id: number;
  name: string;
  avatar_url: string | null;
  role: GroupRole;
  steps: number;
  rank: number;
  is_me: boolean;
}

/** GET groups/{id} → data */
export interface GroupDetail {
  group: Group;
  today: Standing[];
}

/** LeaderboardResource */
export interface Leaderboard {
  period: LeaderboardPeriod;
  from: string;
  to: string;
  standings: Standing[];
  refresh_after_seconds: number;
}

/** ChallengeResource */
export interface Challenge {
  id: number;
  group_id: number;
  creator_id: number | null;
  title: string;
  type: ChallengeType;
  goal_steps: number | null;
  starts_on: string;
  ends_on: string;
  status: ChallengeStatus;
  days_left: number;
  standings?: Standing[];
  winner_user_id?: number | null;
  created_at: string | null;
}

export interface ChallengePayload {
  title: string;
  type: ChallengeType;
  goal_steps?: number | null;
  starts_on: string;
  ends_on: string;
}

/** DashboardResource (App\Services\DailySummary) */
export interface Dashboard {
  date: string;
  steps: {
    steps: number;
    goal: number;
    source: StepSource | null;
    synced_at: string | null;
    streak: number;
    week: { date: string; steps: number }[];
  };
  nutrition: {
    meals_count: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    targets: { calories: number; protein: number; carbs: number; fat: number } | null;
  };
  water: { ml: number; goal_ml: number };
  weight: { date: string; weight_kg: number } | null;
  group: {
    id: number;
    name: string;
    members_count: number;
    my_rank: number | null;
    photo_url: string | null;
    leader: { user_id: number; name: string; avatar_url: string | null; steps: number } | null;
    others: { user_id: number; name: string; avatar_url: string | null; steps: number }[];
  } | null;
  challenge: {
    id: number;
    group_id: number;
    title: string;
    type: ChallengeType;
    status: ChallengeStatus;
    goal_steps: number | null;
    team_steps: number;
    starts_on: string;
    ends_on: string;
    days_left: number;
  } | null;
  has_profile: boolean;
}
