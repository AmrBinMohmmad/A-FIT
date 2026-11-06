import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { Chips } from "@/components/foods/Chips";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { FOOD_CATEGORY_EMOJI } from "@/constants/emoji";
import { FOOD_CATEGORIES } from "@/constants/enums";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { useCreateFood } from "@/hooks/foods/useFoods";
import { makeStyles } from "@/hooks/useStyles";
import type { FoodCategory } from "@/types/api";
import { parseFloatSafe } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  col: { flex: 1 },
}));

type Errors = Partial<Record<"name" | "serving" | "calories", string>>;

/**
 * A private food typed from a package label. Labels print numbers per serving or per 100 g;
 * the user picks which, the server stores per 100 g. The new food goes straight into the basket.
 */
export default function NewFoodScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const draft = useMealDraft();
  const create = useCreateFood();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [servingGrams, setServingGrams] = useState("");
  const [servingLabel, setServingLabel] = useState("");
  const [per, setPer] = useState<"serving" | "100g">("serving");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const next: Errors = {};
    const grams = parseFloatSafe(servingGrams);
    const kcal = parseFloatSafe(calories);
    if (name.trim().length < 2) next.name = t("meals.nameInvalid");
    if (grams === null || grams < 1 || grams > 2000) next.serving = t("foods.servingInvalid");
    if (kcal === null || kcal < 0 || kcal > 9000) next.calories = t("meals.caloriesInvalid");
    setErrors(next);
    if (Object.keys(next).length || grams === null || kcal === null) return;
    create.mutate(
      {
        name: name.trim(),
        brand: brand.trim() || undefined,
        category,
        serving_grams: grams,
        serving_label: servingLabel.trim() || undefined,
        per,
        calories: kcal,
        protein: parseFloatSafe(protein) ?? 0,
        carbs: parseFloatSafe(carbs) ?? 0,
        fat: parseFloatSafe(fat) ?? 0,
      },
      {
        onSuccess: (res) => {
          draft.add(res.data.data, 1);
          router.back();
        },
      },
    );
  };

  const macro = (label: string, value: string, set: (v: string) => void) => (
    <RTextInput
      label={`${label} (${t("common.grams")})`}
      placeholder="0"
      value={value}
      onChangeText={set}
      keyboardType="decimal-pad"
      englishNumbers
      maxLength={6}
      containerStyle={styles.col}
    />
  );

  return (
    <Screen title={t("foods.newTitle")} subtitle={t("foods.newSubtitle")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.form}>
          <RTextInput
            label={t("foods.nameLabel")}
            placeholder={t("foods.namePlaceholder")}
            value={name}
            onChangeText={setName}
            error={errors.name}
            maxLength={120}
            autoFocus
          />
          <RTextInput
            label={`${t("foods.brandLabel")} (${t("common.optional")})`}
            placeholder={t("foods.brandPlaceholder")}
            value={brand}
            onChangeText={setBrand}
            maxLength={80}
          />

          <RText variant="footnote" weight="medium" color="textSecondary">
            {t("foods.categoryLabel")}
          </RText>
          <Chips
            items={FOOD_CATEGORIES.map((c) => ({
              key: c,
              label: t(`enums.foodCategory.${c}`),
              emoji: FOOD_CATEGORY_EMOJI[c],
            }))}
            selected={category}
            onSelect={(c) => c && setCategory(c)}
            clearable={false}
          />

          <View style={styles.row}>
            <RTextInput
              label={t("foods.servingGrams")}
              placeholder="30"
              value={servingGrams}
              onChangeText={setServingGrams}
              error={errors.serving}
              keyboardType="decimal-pad"
              englishNumbers
              maxLength={6}
              containerStyle={styles.col}
            />
            <RTextInput
              label={t("foods.servingLabelLabel")}
              placeholder={t("foods.servingPlaceholder")}
              value={servingLabel}
              onChangeText={setServingLabel}
              maxLength={60}
              containerStyle={styles.col}
            />
          </View>

          <RText variant="footnote" weight="medium" color="textSecondary">
            {t("foods.perLabel")}
          </RText>
          <Chips
            items={[
              { key: "serving", label: t("foods.perServing") },
              { key: "100g", label: t("foods.per100") },
            ]}
            selected={per}
            onSelect={(k) => k && setPer(k)}
            clearable={false}
          />

          <RTextInput
            label={`${t("meals.calories")} (${t("common.kcal")})`}
            placeholder="0"
            value={calories}
            onChangeText={setCalories}
            error={errors.calories}
            keyboardType="decimal-pad"
            englishNumbers
            maxLength={6}
          />
          <View style={styles.row}>
            {macro(t("meals.protein"), protein, setProtein)}
            {macro(t("meals.carbs"), carbs, setCarbs)}
            {macro(t("meals.fat"), fat, setFat)}
          </View>

          <Button
            title={t("foods.saveAndAdd")}
            variant="accent"
            size="lg"
            onPress={submit}
            loading={create.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
