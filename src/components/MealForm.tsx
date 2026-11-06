import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { MEAL_TYPE_ICON } from "@/components/MealItem";
import { CodeChip } from "@/components/line/CodeChip";
import { ChoiceRow } from "@/components/onboarding/ChoiceRow";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { useFrequentMeals } from "@/hooks/meals/useMeals";
import { makeStyles } from "@/hooks/useStyles";
import { MEAL_TYPES } from "@/constants/enums";
import type { ManualDraft } from "@/contexts/MealDraftContext";
import type { FrequentMeal, Meal, MealPayload, MealType } from "@/types/api";
import { parseIntSafe } from "@/utils/number";

interface MealFormProps {
  initial?: Meal | null;
  /** New-meal mode: the typed fields are mirrored here so leaving the screen keeps them. */
  draft?: ManualDraft | null;
  onDraftChange?: (draft: ManualDraft) => void;
  date: string;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (payload: MealPayload) => void;
}

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  col: { flex: 1 },
  types: { gap: theme.spacing.sm },
  chips: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
  },
}));

/** Plain controlled form: per-field validation for the two required fields. */
export function MealForm({
  initial,
  draft,
  onDraftChange,
  date,
  submitting,
  submitLabel,
  onSubmit,
}: MealFormProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [name, setNameState] = useState(draft?.name ?? initial?.name ?? "");
  const [calories, setCaloriesState] = useState(draft?.calories ?? (initial ? String(initial.calories) : ""));
  const [protein, setProteinState] = useState(
    draft?.protein ?? (initial?.protein ? String(initial.protein) : ""),
  );
  const [carbs, setCarbsState] = useState(draft?.carbs ?? (initial?.carbs ? String(initial.carbs) : ""));
  const [fat, setFatState] = useState(draft?.fat ?? (initial?.fat ? String(initial.fat) : ""));

  // Each setter also mirrors the whole form to the draft owner (persisted in new-meal mode).
  const mirror = (patch: Partial<ManualDraft>) =>
    onDraftChange?.({ name, calories, protein, carbs, fat, ...patch });
  const setName = (v: string) => {
    setNameState(v);
    mirror({ name: v });
  };
  const setCalories = (v: string) => {
    setCaloriesState(v);
    mirror({ calories: v });
  };
  const setProtein = (v: string) => {
    setProteinState(v);
    mirror({ protein: v });
  };
  const setCarbs = (v: string) => {
    setCarbsState(v);
    mirror({ carbs: v });
  };
  const setFat = (v: string) => {
    setFatState(v);
    mirror({ fat: v });
  };
  const [type, setType] = useState<MealType>(initial?.meal_type ?? "lunch");
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});
  const frequent = useFrequentMeals();

  const applyTemplate = (m: FrequentMeal) => {
    setName(m.name);
    setCalories(String(m.calories));
    setProtein(m.protein ? String(m.protein) : "");
    setCarbs(m.carbs ? String(m.carbs) : "");
    setFat(m.fat ? String(m.fat) : "");
    setType(m.meal_type);
    setErrors({});
  };

  const submit = () => {
    const next: typeof errors = {};
    const trimmed = name.trim();
    const kcal = parseIntSafe(calories);
    if (trimmed.length < 2) next.name = t("meals.nameInvalid");
    if (kcal === null || kcal < 0 || kcal > 10000) next.calories = t("meals.caloriesInvalid");
    setErrors(next);
    if (Object.keys(next).length || kcal === null) return;
    onSubmit({
      name: trimmed,
      calories: kcal,
      protein: parseIntSafe(protein) ?? 0,
      carbs: parseIntSafe(carbs) ?? 0,
      fat: parseIntSafe(fat) ?? 0,
      meal_type: type,
      eaten_on: initial?.eaten_on ?? date,
    });
  };

  return (
    <View style={styles.form}>
      {!initial && (frequent.data?.length ?? 0) > 0 ? (
        <View style={{ gap: 4 }}>
          <RText variant="footnote" weight="medium" color="textSecondary">
            {t("meals.frequent")}
          </RText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            keyboardShouldPersistTaps="handled">
            {(frequent.data ?? []).map((m) => (
              <Pressable
                key={`${m.name}-${m.meal_type}`}
                onPress={() => applyTemplate(m)}
                style={styles.chip}
                accessibilityRole="button"
                accessibilityLabel={m.name}>
                <CodeChip code={m.times} tone="muted" />
                <RText variant="footnote" weight="medium" numberOfLines={1}>
                  {m.name}
                </RText>
                <RText variant="caption" color="textMuted" tabular>
                  {m.calories}
                </RText>
              </Pressable>
            ))}
          </ScrollView>
          <RText variant="caption" color="textMuted">
            {t("meals.frequentHint")}
          </RText>
        </View>
      ) : null}
      <RTextInput
        label={t("meals.name")}
        placeholder={t("meals.namePlaceholder")}
        value={name}
        onChangeText={setName}
        error={errors.name}
        maxLength={80}
        autoFocus={!initial}
      />
      <RTextInput
        label={`${t("meals.calories")} (${t("common.kcal")})`}
        placeholder="0"
        value={calories}
        onChangeText={setCalories}
        error={errors.calories}
        keyboardType="number-pad"
        maxLength={5}
      />

      <RText variant="footnote" weight="medium" color="textSecondary">
        {t("meals.macrosOptional")}
      </RText>
      <View style={styles.row}>
        <RTextInput
          label={`${t("meals.protein")} (${t("common.grams")})`}
          placeholder="0"
          value={protein}
          onChangeText={setProtein}
          keyboardType="number-pad"
          maxLength={4}
          containerStyle={styles.col}
        />
        <RTextInput
          label={`${t("meals.carbs")} (${t("common.grams")})`}
          placeholder="0"
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="number-pad"
          maxLength={4}
          containerStyle={styles.col}
        />
        <RTextInput
          label={`${t("meals.fat")} (${t("common.grams")})`}
          placeholder="0"
          value={fat}
          onChangeText={setFat}
          keyboardType="number-pad"
          maxLength={4}
          containerStyle={styles.col}
        />
      </View>

      <RText variant="footnote" weight="medium" color="textSecondary">
        {t("meals.type")}
      </RText>
      <View style={styles.types}>
        {MEAL_TYPES.map((mt) => (
          <ChoiceRow
            key={mt}
            title={t(`enums.mealType.${mt}`)}
            icon={MEAL_TYPE_ICON[mt]}
            selected={type === mt}
            onPress={() => setType(mt)}
          />
        ))}
      </View>

      <Button title={submitLabel} variant="accent" size="lg" onPress={submit} loading={submitting} />
    </View>
  );
}
