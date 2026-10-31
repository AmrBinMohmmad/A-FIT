import type { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { RText } from "@/components/RText";
import { MEAL_TYPE_EMOJI } from "@/constants/emoji";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { makeStyles } from "@/hooks/useStyles";
import type { Meal, MealType } from "@/types/api";
import { formatInt } from "@/utils/number";

export const MEAL_TYPE_ICON: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
  other: "ellipsis-horizontal",
};

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: MIN_TOUCH_TARGET + 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  first: { borderTopWidth: 0 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  macros: { flexDirection: "row", gap: theme.spacing.sm },
  pressed: { opacity: 0.7 },
}));

/** One ledger line: type icon, name, macros in words, calories as the figure. */
export function MealItem({ meal, onPress, first }: { meal: Meal; onPress: () => void; first?: boolean }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={meal.name}>
      <View style={styles.icon}>
        <RText style={{ fontSize: 18, lineHeight: 22 }}>{MEAL_TYPE_EMOJI[meal.meal_type]}</RText>
      </View>
      <View style={styles.body}>
        <RText variant="callout" weight="medium" numberOfLines={1}>
          {meal.name}
        </RText>
        <View style={styles.macros}>
          <RText variant="caption" color="textSecondary">
            {t(`enums.mealType.${meal.meal_type}`)}
          </RText>
          <RText variant="caption" color="textMuted" tabular>
            {t("meals.protein")} {meal.protein} · {t("meals.carbs")} {meal.carbs} · {t("meals.fat")}{" "}
            {meal.fat}
          </RText>
        </View>
      </View>
      <RText variant="callout" weight="bold" tabular>
        {formatInt(meal.calories)}
      </RText>
    </Pressable>
  );
}
