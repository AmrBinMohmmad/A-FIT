export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface PhysicalProfileInput {
  gender: Gender;
  age: number;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
}

export interface CalculatedNutritionPlan {
  bmr: number;
  tdee: number;
  goalType: GoalType;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  calorieAdjustment: number;
}

export const ACTIVITY_INFO: Record<
  ActivityLevel,
  { label: string; description: string; multiplier: number; icon: string }
> = {
  sedentary: {
    label: 'قليل النشاط / مكتبي',
    description: 'قليل الحركة أو عمل مكتبي دون تمارين منتظمة',
    multiplier: 1.2,
    icon: 'desktop-outline',
  },
  light: {
    label: 'نشاط خفيف',
    description: 'تمارين خفيفة أو مشي 1 إلى 3 أيام أسبوعياً',
    multiplier: 1.375,
    icon: 'walk-outline',
  },
  moderate: {
    label: 'نشاط متوسط',
    description: 'تمارين معتدلة أو نادي 3 إلى 5 أيام أسبوعياً',
    multiplier: 1.55,
    icon: 'fitness-outline',
  },
  active: {
    label: 'نشاط عالي',
    description: 'تمارين مكثفة وشاقة 6 إلى 7 أيام أسبوعياً',
    multiplier: 1.725,
    icon: 'bicycle-outline',
  },
  extra_active: {
    label: 'رياضي محترف / نشاط شاق',
    description: 'تدريب يومي مضاعف أو عمل بدني شاق جداً',
    multiplier: 1.9,
    icon: 'flame-outline',
  },
};

/**
 * Calculates scientifically-backed daily calories and macro targets using
 * the Mifflin-St Jeor Equation & TDEE.
 */
export function calculateNutritionPlan(input: PhysicalProfileInput): CalculatedNutritionPlan {
  const { gender, age, height, currentWeight, targetWeight, activityLevel } = input;

  // 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor
  let bmr = 10 * currentWeight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 2. Total Daily Energy Expenditure (TDEE)
  const multiplier = ACTIVITY_INFO[activityLevel]?.multiplier || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Determination & Calorie Adjustment
  let goalType: GoalType = 'maintain';
  let calorieAdjustment = 0;

  const diff = targetWeight - currentWeight;
  if (diff < -0.5) {
    goalType = 'lose';
    calorieAdjustment = -450; // Healthy, sustainable fat-loss deficit
  } else if (diff > 0.5) {
    goalType = 'gain';
    calorieAdjustment = 350; // Clean muscle building surplus
  } else {
    goalType = 'maintain';
    calorieAdjustment = 0;
  }

  // Minimum safe calorie boundaries (1200 for women, 1500 for men)
  const minSafeCalories = gender === 'female' ? 1200 : 1500;
  const dailyCalories = Math.max(minSafeCalories, Math.round(tdee + calorieAdjustment));

  // 4. Balanced, Realistic Macro Splits (Clinical Nutrition Standard)
  // Base protein on Target Weight rather than total current overweight mass.
  // 1.5g/kg for women, 1.7g/kg for men (higher if active/extra_active).
  let proteinMultiplier = gender === 'female' ? 1.5 : 1.7;
  if (activityLevel === 'active' || activityLevel === 'extra_active') {
    proteinMultiplier += 0.2;
  }
  let proteinGrams = Math.round(targetWeight * proteinMultiplier);

  // Guardrail: Keep protein between 20% and 30% of total daily calories
  const maxProteinGrams = Math.round((dailyCalories * 0.30) / 4);
  const minProteinGrams = Math.round((dailyCalories * 0.20) / 4);
  proteinGrams = Math.max(minProteinGrams, Math.min(maxProteinGrams, proteinGrams));
  const proteinCalories = proteinGrams * 4;

  // Healthy Fats: 28% of total calories (critical for hormone balance & satiety)
  const fatGrams = Math.round((dailyCalories * 0.28) / 9);
  const fatCalories = fatGrams * 9;

  // Carbohydrates: Remaining calories (~45-50% for sustainable daily energy)
  const remainingCalories = Math.max(0, dailyCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    bmr,
    tdee,
    goalType,
    calorieAdjustment,
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}
