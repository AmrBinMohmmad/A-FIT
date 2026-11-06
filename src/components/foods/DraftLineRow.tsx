import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { type DraftLine, foodName, gramsForServings, macrosFor, servingLabel } from "@/utils/foodMath";
import { enterAt, exitRow, listLayout } from "@/utils/motion";
import { formatDecimal, formatInt, parseFloatSafe } from "@/utils/number";

interface DraftLineRowProps {
  line: DraftLine;
  first?: boolean;
  onServings: (servings: number) => void;
  onGrams: (grams: number) => void;
  onRemove: () => void;
}

const STEP = 0.5;

const useStyles = makeStyles((theme) => ({
  row: {
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  first: { borderTopWidth: 0 },
  top: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  bottom: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    overflow: "hidden",
  },
  stepBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { minWidth: 44, alignItems: "center" },
  gramsBtn: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center", paddingHorizontal: theme.spacing.sm },
  remove: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
  },
}));

/** One portion in the basket: name + kcal, a servings stepper, grams you can type, remove. */
export function DraftLineRow({ line, first, onServings, onGrams, onRemove }: DraftLineRowProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [editingGrams, setEditingGrams] = useState(false);
  const [gramsText, setGramsText] = useState(String(line.grams));
  const m = macrosFor(line.food, line.grams);

  // A stepper tap while the grams field is focused refreshes the field, so its later blur
  // cannot write stale text over the step.
  const step = (delta: number) => {
    const servings = Math.min(100, Math.max(STEP, Math.round((line.servings + delta) * 100) / 100));
    onServings(servings);
    if (editingGrams) setGramsText(String(gramsForServings(line.food, servings)));
  };

  const commitGrams = () => {
    const g = parseFloatSafe(gramsText);
    const rounded = g === null ? null : Math.round(g * 10) / 10;
    if (rounded !== null && rounded >= 1 && rounded <= 5000 && rounded !== line.grams) onGrams(rounded);
    setEditingGrams(false);
  };

  return (
    <Animated.View
      entering={enterAt(0)}
      exiting={exitRow}
      layout={listLayout}
      style={[styles.row, first && styles.first]}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <RText variant="callout" weight="medium" numberOfLines={1}>
            {foodName(line.food, language)}
          </RText>
          <RText variant="caption" color="textMuted" tabular numberOfLines={1}>
            {t("meals.lineMacros", { p: m.protein, c: m.carbs, f: m.fat })}
          </RText>
        </View>
        <RText variant="callout" weight="bold" tabular>
          {formatInt(m.calories)}{" "}
          <RText variant="caption" color="textMuted">
            {t("common.kcal")}
          </RText>
        </RText>
        <Pressable
          onPress={onRemove}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel={t("common.delete")}>
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>
      <View style={styles.bottom}>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => step(-STEP)}
            style={styles.stepBtn}
            accessibilityRole="button"
            accessibilityLabel={t("meals.less")}>
            <Ionicons name="remove" size={18} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={styles.count}>
            <RText variant="footnote" weight="bold" tabular>
              {formatDecimal(line.servings, line.servings % 1 === 0 ? 0 : 1)}
            </RText>
          </View>
          <Pressable
            onPress={() => step(STEP)}
            style={styles.stepBtn}
            accessibilityRole="button"
            accessibilityLabel={t("meals.more")}>
            <Ionicons name="add" size={18} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
        <RText variant="caption" color="textSecondary" numberOfLines={1} style={{ flexShrink: 1 }}>
          × {servingLabel(line.food, language, t("common.grams"))}
        </RText>
        {editingGrams ? (
          <RTextInput
            value={gramsText}
            onChangeText={setGramsText}
            keyboardType="decimal-pad"
            englishNumbers
            autoFocus
            onBlur={commitGrams}
            onSubmitEditing={commitGrams}
            returnKeyType="done"
            containerStyle={{ width: 96 }}
            accessibilityLabel={t("meals.grams")}
          />
        ) : (
          <Pressable
            onPress={() => {
              setGramsText(String(line.grams));
              setEditingGrams(true);
            }}
            style={styles.gramsBtn}
            accessibilityRole="button"
            accessibilityLabel={t("meals.editGrams")}>
            <RText variant="footnote" weight="medium" color="primary" tabular>
              {formatDecimal(line.grams, line.grams % 1 === 0 ? 0 : 1)} {t("common.grams")}
            </RText>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
