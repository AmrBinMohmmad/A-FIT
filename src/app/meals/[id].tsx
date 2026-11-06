import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { Button } from "@/components/Button";
import { MealComposer } from "@/components/foods/MealComposer";
import { ListState } from "@/components/ListState";
import { MealForm } from "@/components/MealForm";
import { Screen } from "@/components/Screen";
import { useAlert } from "@/contexts/AlertContext";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeleteMeal, useMealsForDay, useUpdateMeal } from "@/hooks/meals/useMeals";
import { formatShortDate, fromDateKey, todayKey } from "@/utils/date";
import { linesFromMeal } from "@/utils/foodMath";

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
  // Only lines whose food still exists can be edited; otherwise fall back to the macro form.
  const composed = meal ? linesFromMeal(meal.items).length > 0 : false;
  const { beginEdit, endEdit } = useMealDraft();
  const mealId = meal?.id ?? null;
  useEffect(() => {
    if (meal && composed) beginEdit(linesFromMeal(meal.items), meal.meal_type, meal.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the id, not the refetched object
  }, [mealId, composed, beginEdit]);
  useEffect(() => () => endEdit(), [endEdit]);

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
      keyboard
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
          composed ? (
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
          )
        ) : null}
      </ListState>
    </Screen>
  );
}
