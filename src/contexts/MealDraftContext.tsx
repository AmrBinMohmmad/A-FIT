import { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { Food } from "@/types/api";
import { type DraftLine, gramsForServings, macrosFor, servingsForGrams, sumMacros } from "@/utils/foodMath";

interface MealDraftValue {
  lines: DraftLine[];
  totals: ReturnType<typeof sumMacros>;
  reset: (lines?: DraftLine[]) => void;
  add: (food: Food, servings?: number) => void;
  remove: (key: string) => void;
  setServings: (key: string, servings: number) => void;
  setGrams: (key: string, grams: number) => void;
}

const MealDraftContext = createContext<MealDraftValue | null>(null);

let nextKey = 1;

/**
 * The meal being composed: client-only draft state shared between the composer screen and
 * the "add my own food" modal, so a food created there lands in the basket. Nothing here is
 * server state; the server recomputes every number on save.
 */
export function MealDraftProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<DraftLine[]>([]);

  const reset = useCallback((next: DraftLine[] = []) => setLines(next), []);

  const add = useCallback((food: Food, servings = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.food.id === food.id);
      if (existing) {
        const s = existing.servings + servings;
        return prev.map((l) =>
          l.key === existing.key ? { ...l, servings: s, grams: gramsForServings(food, s) } : l,
        );
      }
      return [...prev, { key: `d-${nextKey++}`, food, servings, grams: gramsForServings(food, servings) }];
    });
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);

  const setServings = useCallback(
    (key: string, servings: number) =>
      setLines((prev) =>
        prev.map((l) => (l.key === key ? { ...l, servings, grams: gramsForServings(l.food, servings) } : l)),
      ),
    [],
  );

  const setGrams = useCallback(
    (key: string, grams: number) =>
      setLines((prev) =>
        prev.map((l) => (l.key === key ? { ...l, grams, servings: servingsForGrams(l.food, grams) } : l)),
      ),
    [],
  );

  const totals = useMemo(() => sumMacros(lines.map((l) => macrosFor(l.food, l.grams))), [lines]);

  const value = useMemo<MealDraftValue>(
    () => ({ lines, totals, reset, add, remove, setServings, setGrams }),
    [lines, totals, reset, add, remove, setServings, setGrams],
  );

  return <MealDraftContext.Provider value={value}>{children}</MealDraftContext.Provider>;
}

export function useMealDraft(): MealDraftValue {
  const ctx = useContext(MealDraftContext);
  if (!ctx) throw new Error("useMealDraft must be used within MealDraftProvider");
  return ctx;
}
