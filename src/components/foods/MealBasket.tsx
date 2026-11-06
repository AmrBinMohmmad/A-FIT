import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { DraftLineRow } from "@/components/foods/DraftLineRow";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { EMOJI } from "@/constants/emoji";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { makeStyles } from "@/hooks/useStyles";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.sm },
  empty: {
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
  },
}));

/** What is in the meal so far, with the live total as a sign panel. */
export function MealBasket() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { lines, totals, remove, setServings, setGrams } = useMealDraft();

  if (lines.length === 0) {
    return (
      <View style={styles.empty}>
        <RText style={{ fontSize: 28, lineHeight: 34 }}>{EMOJI.meals}</RText>
        <RText variant="callout" weight="medium">
          {t("meals.basketEmpty")}
        </RText>
        <RText variant="footnote" color="textSecondary" align="center">
          {t("meals.basketHint")}
        </RText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SignPanel
        label={t("meals.totals")}
        value={`${formatInt(totals.calories)} ${t("common.kcal")}`}
        endLabel={t("meals.lineMacros", { p: totals.protein, c: totals.carbs, f: totals.fat })}
        endValue={t("meals.itemsCount", { count: lines.length })}
      />
      <View>
        {lines.map((line, i) => (
          <DraftLineRow
            key={line.key}
            line={line}
            first={i === 0}
            onServings={(s) => setServings(line.key, s)}
            onGrams={(g) => setGrams(line.key, g)}
            onRemove={() => remove(line.key)}
          />
        ))}
      </View>
    </View>
  );
}
