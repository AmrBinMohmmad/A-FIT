import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { MEAL_TYPE_ICON } from "@/components/MealItem";
import { ChoiceRow } from "@/components/onboarding/ChoiceRow";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { makeStyles } from "@/hooks/useStyles";
import { MEAL_TYPES } from "@/constants/enums";
import type { Meal, MealPayload, MealType } from "@/types/api";
import { parseIntSafe } from "@/utils/number";

interface MealFormProps {
  initial?: Meal | null;
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
}));

/** Plain controlled form (Rakaya D9): per-field validation for the two required fields. */
export function MealForm({ initial, date, submitting, submitLabel, onSubmit }: MealFormProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [name, setName] = useState(initial?.name ?? "");
  const [calories, setCalories] = useState(initial ? String(initial.calories) : "");
  const [protein, setProtein] = useState(initial?.protein ? String(initial.protein) : "");
  const [carbs, setCarbs] = useState(initial?.carbs ? String(initial.carbs) : "");
  const [fat, setFat] = useState(initial?.fat ? String(initial.fat) : "");
  const [type, setType] = useState<MealType>(initial?.meal_type ?? "lunch");
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});

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
