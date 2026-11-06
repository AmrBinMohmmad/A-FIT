import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { Food, MealType } from "@/types/api";
import { type DraftLine, gramsForServings, macrosFor, servingsForGrams, sumMacros } from "@/utils/foodMath";
import { getItem, removeItem, setItem } from "@/utils/storage";

/** The macro form's fields, kept as typed so a half-filled form survives leaving the screen. */
export interface ManualDraft {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

interface Snapshot {
  lines: DraftLine[];
  mealType: MealType;
  name: string;
  manual: ManualDraft | null;
  savedAt: number;
}

interface MealDraftValue {
  lines: DraftLine[];
  totals: ReturnType<typeof sumMacros>;
  mealType: MealType;
  name: string;
  manual: ManualDraft | null;
  /** True when the current draft was restored from the phone after an earlier exit. */
  restored: boolean;
  /** New-meal mode: restores an unsaved draft if there is one, and persists from then on. */
  beginNew: () => Promise<void>;
  /** Edit mode: starts from the saved meal's lines; nothing is persisted. */
  beginEdit: (lines: DraftLine[], mealType: MealType, name: string) => void;
  /** Leaves edit mode: empties memory but keeps any unsaved new-meal draft on the phone. */
  endEdit: () => void;
  /** Forgets the draft on the phone and in memory (after a save, or on "discard"). */
  clear: () => Promise<void>;
  setMealType: (type: MealType) => void;
  setName: (name: string) => void;
  setManual: (manual: ManualDraft | null) => void;
  add: (food: Food, servings?: number) => void;
  remove: (key: string) => void;
  setServings: (key: string, servings: number) => void;
  setGrams: (key: string, grams: number) => void;
}

const STORAGE_KEY = "meal-draft";
const MAX_AGE_MS = 36 * 60 * 60 * 1000;
const EMPTY_MANUAL: ManualDraft = { name: "", calories: "", protein: "", carbs: "", fat: "" };
const MealDraftContext = createContext<MealDraftValue | null>(null);
let nextKey = 1;

const isEmpty = (s: Omit<Snapshot, "savedAt">) =>
  s.lines.length === 0 && s.name === "" && (!s.manual || Object.values(s.manual).every((v) => v === ""));

/**
 * The meal being composed. Client-only draft state shared by the composer, the macro form,
 * the scanner and the "add my own food" modal. In new-meal mode it is also written to the
 * phone (debounced) and restored next time, so leaving before Save loses nothing.
 */
export function MealDraftProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [name, setName] = useState("");
  const [manual, setManual] = useState<ManualDraft | null>(null);
  const [restored, setRestored] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback((s: Omit<Snapshot, "savedAt">) => {
    setLines(s.lines);
    setMealType(s.mealType);
    setName(s.name);
    setManual(s.manual);
  }, []);

  const beginNew = useCallback(async () => {
    const stored = await getItem<Snapshot>(STORAGE_KEY);
    const fresh = stored !== null && Date.now() - stored.savedAt < MAX_AGE_MS && !isEmpty(stored);
    apply(fresh && stored ? stored : { lines: [], mealType: "lunch", name: "", manual: null });
    setRestored(fresh);
    setPersisting(true);
  }, [apply]);

  const beginEdit = useCallback(
    (initial: DraftLine[], type: MealType, mealName: string) => {
      setPersisting(false);
      setRestored(false);
      apply({ lines: initial, mealType: type, name: mealName, manual: null });
    },
    [apply],
  );

  const endEdit = useCallback(() => {
    setPersisting(false);
    setRestored(false);
    apply({ lines: [], mealType: "lunch", name: "", manual: null });
  }, [apply]);

  const clear = useCallback(async () => {
    apply({ lines: [], mealType: "lunch", name: "", manual: null });
    setRestored(false);
    await removeItem(STORAGE_KEY);
  }, [apply]);

  // Persist (debounced) while a new meal is being built; an empty draft removes the record.
  useEffect(() => {
    if (!persisting) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const snapshot = { lines, mealType, name, manual };
      void (isEmpty(snapshot)
        ? removeItem(STORAGE_KEY)
        : setItem(STORAGE_KEY, { ...snapshot, savedAt: Date.now() }));
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [persisting, lines, mealType, name, manual]);

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
    () => ({
      lines,
      totals,
      mealType,
      name,
      manual: manual ?? null,
      restored,
      beginNew,
      beginEdit,
      endEdit,
      clear,
      setMealType,
      setName,
      setManual,
      add,
      remove,
      setServings,
      setGrams,
    }),
    [
      lines,
      totals,
      mealType,
      name,
      manual,
      restored,
      beginNew,
      beginEdit,
      endEdit,
      clear,
      add,
      remove,
      setServings,
      setGrams,
    ],
  );

  return <MealDraftContext.Provider value={value}>{children}</MealDraftContext.Provider>;
}

export function useMealDraft(): MealDraftValue {
  const ctx = useContext(MealDraftContext);
  if (!ctx) throw new Error("useMealDraft must be used within MealDraftProvider");
  return ctx;
}

export { EMPTY_MANUAL };
