import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { RText } from "@/components/RText";
import { FOOD_CATEGORY_EMOJI } from "@/constants/emoji";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import type { Food } from "@/types/api";
import { foodName, servingLabel } from "@/utils/foodMath";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
  body: { flex: 1, gap: 1 },
  pressed: { opacity: 0.7 },
}));

/**
 * One catalog item: aisle glyph, name in the active language, brand · serving, calories per
 * serving. A generic item with kinds shows the count and a chevron; others show a plus.
 */
export function FoodRow({ food, onPress, first }: { food: Food; onPress: () => void; first?: boolean }) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isRTL } = useRTL();
  const hasKinds = food.variants_count > 0;
  const subtitle = [
    food.brand,
    servingLabel(food, language, t("common.grams")),
    hasKinds ? t("foods.kinds", { count: food.variants_count }) : null,
    food.is_mine ? t("foods.mine") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${foodName(food, language)}, ${formatInt(food.per_serving.calories)} ${t("common.kcal")}${hasKinds ? `, ${t("foods.kinds", { count: food.variants_count })}` : ""}`}
      accessibilityHint={hasKinds ? t("foods.openKinds") : t("foods.tapAdds")}>
      <View style={styles.icon}>
        <RText style={{ fontSize: 18, lineHeight: 22 }}>{FOOD_CATEGORY_EMOJI[food.category]}</RText>
      </View>
      <View style={styles.body}>
        <RText variant="callout" weight="medium" numberOfLines={1}>
          {foodName(food, language)}
        </RText>
        <RText variant="caption" color="textSecondary" numberOfLines={1}>
          {subtitle}
        </RText>
      </View>
      <RText variant="callout" weight="bold" tabular>
        {formatInt(food.per_serving.calories)}{" "}
        <RText variant="caption" color="textMuted">
          {t("common.kcal")}
        </RText>
      </RText>
      <Ionicons
        name={hasKinds ? (isRTL ? "chevron-back" : "chevron-forward") : "add-circle-outline"}
        size={20}
        color={hasKinds ? theme.colors.textMuted : theme.colors.primary}
      />
    </Pressable>
  );
}
