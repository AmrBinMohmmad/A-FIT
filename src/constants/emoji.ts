import type { MealType } from "@/types/api";

/**
 * Friendly accents (owner request 2026-10-31, an adaptation of the Metro Line contract: emoji
 * are allowed as CONTENT glyphs — meal types, celebrations, empty states — never as UI
 * controls, which stay stroke icons). Language-neutral, so they live here, not in locales.
 */
export const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
  other: "🍴",
};

export const EMOJI = {
  wave: "👋",
  party: "🎉",
  streak: "🔥",
  water: "💧",
  weight: "⚖️",
  group: "👥",
  challenge: "🏁",
  trophy: "🏆",
  steps: "👟",
  meals: "🥘",
  sparkle: "✨",
} as const;
