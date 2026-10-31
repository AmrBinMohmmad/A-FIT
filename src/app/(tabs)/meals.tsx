import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";

import { Button } from "@/components/Button";
import { ListState } from "@/components/ListState";
import { MacroGrid } from "@/components/MacroGrid";
import { MealItem } from "@/components/MealItem";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMealsForDay } from "@/hooks/meals/useMeals";
import { useProfile } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import { addDays, formatLongDate, fromDateKey, isSameDay, toDateKey, todayKey } from "@/utils/date";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.sm,
    height: MIN_TOUCH_TARGET + 8,
  },
  nav: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  list: { gap: 0 },
}));

/** Meals ledger per local day; totals are summed from the day's own complete list (data provably complete). */
export default function MealsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { isRTL } = useRTL();
  const styles = useStyles();
  const router = useRouter();
  const [date, setDate] = useState(todayKey());
  const meals = useMealsForDay(date);
  const profile = useProfile();
  const isToday = date === todayKey();

  const totals = useMemo(
    () =>
      (meals.data ?? []).reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [meals.data],
  );

  const shift = (days: number) => {
    const next = addDays(fromDateKey(date), days);
    if (next > new Date()) return;
    setDate(toDateKey(next));
  };

  return (
    <Screen
      insideTabs
      title={t("meals.title")}
      subtitle={t("meals.subtitle", { count: meals.data?.length ?? 0, calories: formatInt(totals.calories) })}
      refreshControl={
        <RefreshControl
          refreshing={meals.isRefetching}
          onRefresh={() => void meals.refetch()}
          tintColor={theme.colors.primary}
        />
      }
      bottomInset={theme.spacing.xl}
      footer={
        <Button
          title={t("home.logMeal")}
          variant="accent"
          size="lg"
          icon="add"
          onPress={() => router.push({ pathname: "/meals/new", params: { date } })}
        />
      }>
      <View style={styles.dateBar}>
        <Pressable
          onPress={() => shift(-1)}
          style={styles.nav}
          accessibilityRole="button"
          accessibilityLabel={t("meals.prevDay")}>
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={20}
            color={theme.colors.textPrimary}
          />
        </Pressable>
        <Pressable
          onPress={() => setDate(todayKey())}
          disabled={isToday}
          accessibilityRole="button"
          accessibilityLabel={t("common.today")}>
          <RText variant="callout" weight="bold" align="center">
            {isSameDay(fromDateKey(date), new Date())
              ? t("common.today")
              : isSameDay(fromDateKey(date), addDays(new Date(), -1))
                ? t("common.yesterday")
                : formatLongDate(fromDateKey(date), language)}
          </RText>
        </Pressable>
        <Pressable
          onPress={() => shift(1)}
          disabled={isToday}
          style={[styles.nav, isToday && { opacity: 0.3 }]}
          accessibilityRole="button"
          accessibilityLabel={t("meals.nextDay")}
          accessibilityState={{ disabled: isToday }}>
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={20}
            color={theme.colors.textPrimary}
          />
        </Pressable>
      </View>

      <MacroGrid totals={totals} targets={profile.data ?? null} />

      <ListState
        loading={meals.isPending}
        error={meals.isError ? meals.error : undefined}
        onRetry={() => void meals.refetch()}
        empty={(meals.data?.length ?? 0) === 0}
        emptyIcon="restaurant-outline"
        emptyTitle={t("meals.emptyTitle")}
        emptyBody={isToday ? t("meals.emptyToday") : t("meals.emptyBody")}>
        <View style={styles.list}>
          {(meals.data ?? []).map((meal, i) => (
            <MealItem
              key={meal.id}
              meal={meal}
              first={i === 0}
              onPress={() => router.push({ pathname: "/meals/[id]", params: { id: String(meal.id), date } })}
            />
          ))}
        </View>
      </ListState>
    </Screen>
  );
}
