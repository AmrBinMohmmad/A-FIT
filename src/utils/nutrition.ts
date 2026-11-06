/**
 * Mirrors app/Services/NutritionPlan.php exactly — a PREVIEW for the onboarding screen only.
 * The stored targets always come from the server (Rakaya Tier 1.1); this file exists so the
 * user sees their plan update live while adjusting inputs. `utils/nutrition.test.ts` pins
 * this mirror against fixtures produced by the PHP implementation.
 */
import type { ActivityLevel, Gender, GoalType } from "@/types/api";

export interface PhysicalInputs {
  gender: Gender;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: ActivityLevel;
}

export interface NutritionPreview {
  bmr: number;
  tdee: number;
  goalType: GoalType;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

// Mirrors App\Enums\ActivityLevel::multiplier()
export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra_active: 1.9,
};

const round = (n: number) => Math.round(n);

// Mirrors NutritionPlan::KCAL_PER_KG / TARGET_WEEKS / *_PACE_KG_PER_WEEK
const KCAL_PER_KG = 7700;
const TARGET_WEEKS = 12;
const LOSE_PACE: [number, number] = [0.25, 0.5];
const GAIN_PACE: [number, number] = [0.15, 0.3];

/** Mirrors NutritionPlan::dailyAdjustment — a paced surplus/deficit, not a flat number. */
export function dailyAdjustment(goalType: GoalType, kgToGo: number): number {
  if (goalType === "maintain") return 0;
  const [min, max] = goalType === "lose" ? LOSE_PACE : GAIN_PACE;
  const pace = Math.min(max, Math.max(min, kgToGo / TARGET_WEEKS));
  const daily = round((pace * KCAL_PER_KG) / 7 / 10) * 10;
  return goalType === "lose" ? -daily : daily;
}

export function computeNutritionPreview(input: PhysicalInputs): NutritionPreview {
  const { gender, age, height, currentWeight, targetWeight, activityLevel } = input;

  const bmr = round(10 * currentWeight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161));
  const tdee = round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);

  const diff = targetWeight - currentWeight;
  const goalType: GoalType = diff < -0.5 ? "lose" : diff > 0.5 ? "gain" : "maintain";
  const adjustment = dailyAdjustment(goalType, Math.abs(diff));

  const floor = gender === "female" ? 1200 : 1500;
  const dailyCalories = Math.max(floor, round((tdee + adjustment) / 10) * 10);

  const proteinPerKg =
    (gender === "female" ? 1.5 : 1.7) +
    (activityLevel === "active" || activityLevel === "extra_active" ? 0.2 : 0);
  let dailyProtein = round(targetWeight * proteinPerKg);
  dailyProtein = Math.max(
    round((dailyCalories * 0.2) / 4),
    Math.min(round((dailyCalories * 0.3) / 4), dailyProtein),
  );

  const dailyFat = round((dailyCalories * 0.28) / 9);
  const dailyCarbs = round(Math.max(0, dailyCalories - (dailyProtein * 4 + dailyFat * 9)) / 4);

  return { bmr, tdee, goalType, dailyCalories, dailyProtein, dailyCarbs, dailyFat };
}
