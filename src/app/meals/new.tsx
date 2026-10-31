import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";

import { MealForm } from "@/components/MealForm";
import { Screen } from "@/components/Screen";
import { useCreateMeal } from "@/hooks/meals/useMeals";
import { todayKey } from "@/utils/date";

export default function NewMealScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const create = useCreateMeal();

  return (
    <Screen title={t("meals.newTitle")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <MealForm
          date={date ?? todayKey()}
          submitting={create.isPending}
          submitLabel={t("common.save")}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => router.back() })}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
