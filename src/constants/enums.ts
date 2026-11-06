import type { ActivityLevel, ChallengeType, LeaderboardPeriod, MealType } from "@/types/api";

/** Ordered option lists for pickers; the unions themselves live in types/api.ts. */
export const MEAL_TYPES: readonly MealType[] = ["breakfast", "lunch", "dinner", "snack", "other"];
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "extra_active",
];
export const CHALLENGE_TYPES: readonly ChallengeType[] = ["most_steps", "target_steps"];
export const LEADERBOARD_PERIODS: readonly LeaderboardPeriod[] = ["today", "week", "month"];
