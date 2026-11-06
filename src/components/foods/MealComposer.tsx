import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { Chips } from "@/components/foods/Chips";
import { FoodPicker, type FoodPickerHandle } from "@/components/foods/FoodPicker";
import { MealBasket } from "@/components/foods/MealBasket";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { MEAL_TYPE_EMOJI } from "@/constants/emoji";
import { MEAL_TYPES } from "@/constants/enums";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { useToast } from "@/contexts/ToastContext";
import { makeStyles } from "@/hooks/useStyles";
import type { Food, Meal, MealPayload, MealType } from "@/types/api";
import { foodName, linesFromMeal, toItemInputs } from "@/utils/foodMath";
import { formatInt } from "@/utils/number";

interface MealComposerProps {
  date: string;
  initial?: Meal | null;
  submitting: boolean;
  onSubmit: (payload: MealPayload) => void;
}

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
  done: { minHeight: 44, justifyContent: "center", alignItems: "center" },
}));

/**
 * Build a meal from catalog portions: meal type, the picker, the basket, an optional name.
 * Totals shown here are a preview; the server recomputes them from the same per-100 g data.
 */
export function MealComposer({ date, initial, submitting, onSubmit }: MealComposerProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { language } = useLanguage();
  const draft = useMealDraft();
  const picker = useRef<FoodPickerHandle>(null);
  const [type, setType] = useState<MealType>(initial?.meal_type ?? "lunch");
  const [name, setName] = useState(initial?.name ?? "");
  const [pickerActive, setPickerActive] = useState(false);

  // Start from the saved lines when editing, from empty when logging. Keyed on the meal id,
  // not the object: a background refetch must not wipe in-progress edits. The SCREEN clears
  // the draft on unmount, so toggling to the macro form and back keeps the basket.
  const { reset } = draft;
  const initialId = initial?.id ?? null;
  useEffect(() => {
    reset(initial ? linesFromMeal(initial.items) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see the comment above
  }, [initialId, reset]);

  const onPick = useCallback(
    (food: Food) => {
      draft.add(food, 1);
      toast.info(t("meals.added", { name: foodName(food, language) }));
    },
    [draft, language, t, toast],
  );

  const submit = () => {
    if (draft.lines.length === 0) return;
    onSubmit({
      meal_type: type,
      eaten_on: initial?.eaten_on ?? date,
      name: name.trim() || undefined,
      items: toItemInputs(draft.lines),
    });
  };

  return (
    <View style={styles.form}>
      <Chips
        items={MEAL_TYPES.map((mt) => ({
          key: mt,
          label: t(`enums.mealType.${mt}`),
          emoji: MEAL_TYPE_EMOJI[mt],
        }))}
        selected={type}
        onSelect={(k) => k && setType(k)}
        clearable={false}
      />

      {draft.lines.length > 0 ? (
        <SignPanel
          label={t("meals.totals")}
          value={`${formatInt(draft.totals.calories)} ${t("common.kcal")}`}
          endLabel={t("meals.lineMacros", {
            p: draft.totals.protein,
            c: draft.totals.carbs,
            f: draft.totals.fat,
          })}
          endValue={t("meals.itemsCount", { count: draft.lines.length })}
        />
      ) : null}

      <FoodPicker ref={picker} onPick={onPick} onActiveChange={setPickerActive} />

      {!pickerActive ? (
        <>
          <MealBasket />
          {draft.lines.length > 0 ? (
            <>
              <RTextInput
                label={t("meals.nameOptional")}
                placeholder={t("meals.namePlaceholder")}
                value={name}
                onChangeText={setName}
                maxLength={80}
              />
              <Button
                title={t("common.save")}
                variant="accent"
                size="lg"
                onPress={submit}
                loading={submitting}
                disabled={draft.lines.length === 0}
              />
            </>
          ) : null}
        </>
      ) : (
        <Pressable
          onPress={() => picker.current?.clear()}
          style={styles.done}
          accessibilityRole="button"
          accessibilityLabel={t("meals.doneAdding", { count: draft.lines.length })}>
          <RText variant="footnote" weight="bold" color="primary">
            {t("meals.doneAdding", { count: draft.lines.length })}
          </RText>
        </Pressable>
      )}
    </View>
  );
}
