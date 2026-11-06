import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/Button";
import { MealComposer } from "@/components/foods/MealComposer";
import { MealForm } from "@/components/MealForm";
import { Screen } from "@/components/Screen";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { useCreateMeal } from "@/hooks/meals/useMeals";
import { todayKey } from "@/utils/date";

/** Log a meal: from catalog foods (default) or by typing the macros. */
export default function NewMealScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const create = useCreateMeal();
  const [manual, setManual] = useState(false);
  const day = date ?? todayKey();
  const { reset } = useMealDraft();
  useEffect(() => () => reset([]), [reset]);

  return (
    <Screen
      title={t("meals.newTitle")}
      back
      keyboard
      action={
        <Button
          title={manual ? t("meals.fromFoods") : t("meals.manual")}
          variant="ghost"
          icon={manual ? "basket-outline" : "create-outline"}
          onPress={() => setManual((m) => !m)}
        />
      }>
      {manual ? (
        <MealForm
          date={day}
          submitting={create.isPending}
          submitLabel={t("common.save")}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => router.back() })}
        />
      ) : (
        <MealComposer
          date={day}
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => router.back() })}
        />
      )}
    </Screen>
  );
}
