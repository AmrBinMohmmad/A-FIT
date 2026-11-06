import type { Food, Macros, MealItemInput, MealLineItem } from "@/types/api";
import type { AppLanguage } from "@/utils/localization/i18n";
import { localizedField } from "@/utils/localization/localizedField";

/**
 * Portion arithmetic for the composer PREVIEW only. The server recomputes every total from
 * the same per-100 g values when the meal is saved (App\Services\MealComposer), so this
 * mirrors its rounding: each macro is rounded per line, then lines are summed.
 */
export interface DraftLine {
  key: string;
  food: Food;
  servings: number;
  grams: number;
}

const round = (n: number) => Math.round(n);

export function macrosFor(food: Food, grams: number): Macros {
  const f = grams / 100;
  return {
    calories: round(food.per_100g.calories * f),
    protein: round(food.per_100g.protein * f),
    carbs: round(food.per_100g.carbs * f),
    fat: round(food.per_100g.fat * f),
  };
}

export function sumMacros(lines: readonly Macros[]): Macros {
  return lines.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function gramsForServings(food: Food, servings: number): number {
  return Math.round(servings * food.serving_grams * 10) / 10;
}

export function servingsForGrams(food: Food, grams: number): number {
  return food.serving_grams > 0 ? Math.round((grams / food.serving_grams) * 100) / 100 : 0;
}

/** The name in the active language, falling back to the other. */
export function foodName(food: Pick<Food, "name" | "name_ar">, language: AppLanguage): string {
  return localizedField(food, "name", language);
}

export function servingLabel(food: Food, language: AppLanguage): string {
  return localizedField(food, "serving_label", language) || `${food.serving_grams} g`;
}

export function toItemInputs(lines: readonly DraftLine[]): MealItemInput[] {
  return lines.map((l) => ({ food_id: l.food.id, grams: l.grams }));
}

/** Re-opening a saved meal: lines whose food still exists become editable again. */
export function linesFromMeal(items: readonly MealLineItem[]): DraftLine[] {
  return items
    .filter((i): i is MealLineItem & { food: Food } => !!i.food)
    .map((i) => ({
      key: `m-${i.id}`,
      food: i.food,
      servings: i.servings ?? servingsForGrams(i.food, i.grams),
      grams: i.grams,
    }));
}
