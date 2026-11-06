import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";

import { Button } from "@/components/Button";
import { MealComposer } from "@/components/foods/MealComposer";
import { ListState } from "@/components/ListState";
import { MealForm } from "@/components/MealForm";
import { Screen } from "@/components/Screen";
import { useAlert } from "@/contexts/AlertContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeleteMeal, useMealsForDay, useUpdateMeal } from "@/hooks/meals/useMeals";
import { formatShortDate, fromDateKey, todayKey } from "@/utils/date";

/**
 * Edit/delete an existing meal; the record comes from the day's cached list (no extra request).
 * A meal composed from foods re-opens in the composer; a typed one in the macro form.
 */
export default function EditMealScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { confirm } = useAlert();
  const { language } = useLanguage();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const day = date ?? todayKey();
  const meals = useMealsForDay(day);
  const update = useUpdateMeal();
  const remove = useDeleteMeal();
  const meal = meals.data?.find((m) => String(m.id) === id) ?? null;
  const composed = (meal?.items.length ?? 0) > 0;

  const onDelete = async () => {
    if (!meal) return;
    const ok = await confirm({
      title: t("meals.deleteConfirmTitle"),
      message: t("meals.deleteConfirmBody", {
        name: meal.name,
        date: formatShortDate(fromDateKey(meal.eaten_on), language),
      }),
      confirmText: t("common.delete"),
      destructive: true,
    });
    if (ok) remove.mutate(meal.id, { onSuccess: () => router.back() });
  };

  return (
    <Screen
      title={t("meals.editTitle")}
      back
      action={
        <Button
          title={t("common.delete")}
          variant="danger"
          onPress={() => void onDelete()}
          loading={remove.isPending}
        />
      }>
      <ListState
        loading={meals.isPending}
        error={meals.isError ? meals.error : undefined}
        empty={!meal}
        emptyTitle={t("errors.notFound")}
        onRetry={() => void meals.refetch()}>
        {meal ? (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            {composed ? (
              <MealComposer
                date={day}
                initial={meal}
                submitting={update.isPending}
                onSubmit={(payload) =>
                  update.mutate({ id: meal.id, ...payload }, { onSuccess: () => router.back() })
                }
              />
            ) : (
              <MealForm
                initial={meal}
                date={day}
                submitting={update.isPending}
                submitLabel={t("common.save")}
                onSubmit={(payload) =>
                  update.mutate({ id: meal.id, ...payload }, { onSuccess: () => router.back() })
                }
              />
            )}
          </KeyboardAvoidingView>
        ) : null}
      </ListState>
    </Screen>
  );
}
