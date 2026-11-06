import { describe, expect, it } from "@jest/globals";

import type { Food } from "@/types/api";
import { gramsForServings, macrosFor, servingsForGrams, sumMacros } from "@/utils/foodMath";

const egg: Food = {
  id: 1,
  name: "Egg, whole",
  name_ar: "بيضة",
  brand: null,
  category: "eggs",
  source: "catalog",
  barcode: null,
  image_url: null,
  generic_id: null,
  variants_count: 8,
  serving_grams: 50,
  serving_label: "1 large egg",
  serving_label_ar: null,
  per_100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
  per_serving: { calories: 72, protein: 6, carbs: 0, fat: 5 },
  is_verified: true,
  is_mine: false,
};

describe("foodMath mirrors App\\Services\\MealComposer", () => {
  it("scales per 100 g and rounds per line like the server", () => {
    // Pinned by FoodTest: 2 eggs = 100 g → 143 kcal / 13 g protein.
    expect(macrosFor(egg, 100)).toEqual({ calories: 143, protein: 13, carbs: 1, fat: 10 });
    expect(macrosFor(egg, 50)).toEqual(egg.per_serving);
  });

  it("converts servings and grams both ways", () => {
    expect(gramsForServings(egg, 2)).toBe(100);
    expect(gramsForServings(egg, 1.5)).toBe(75);
    expect(servingsForGrams(egg, 75)).toBe(1.5);
  });

  it("sums lines", () => {
    expect(sumMacros([macrosFor(egg, 100), macrosFor(egg, 50)])).toEqual({
      calories: 215,
      protein: 19,
      carbs: 1,
      fat: 15,
    });
  });
});
