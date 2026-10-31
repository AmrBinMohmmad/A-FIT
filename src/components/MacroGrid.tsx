import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { SegmentBar } from "@/components/line/SegmentBar";
import { SignPanel } from "@/components/line/SignPanel";
import { MacroCard } from "@/components/MacroCard";
import { makeStyles } from "@/hooks/useStyles";
import type { UserProfile } from "@/types/api";
import { formatInt } from "@/utils/number";

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.md },
  row: { flexDirection: "row", gap: theme.spacing.sm },
}));

/** The day's calorie budget (fixed measure, strikes when over) and the three macro rows. */
export function MacroGrid({ totals, targets }: { totals: Totals; targets: UserProfile | null }) {
  const styles = useStyles();
  const { t } = useTranslation();
  if (!targets) return null;
  const left = targets.daily_calories - totals.calories;
  return (
    <View style={styles.wrap}>
      <SignPanel
        label={t("meals.budget")}
        value={`${formatInt(totals.calories)} / ${formatInt(targets.daily_calories)}`}
        endValue={
          left >= 0
            ? t("meals.left", { count: formatInt(left) })
            : t("meals.over", { count: formatInt(-left) })
        }
        tone={left < 0 ? "accent" : "default"}
      />
      <SegmentBar value={totals.calories} max={targets.daily_calories} segments={20} height={8} />
      <View style={styles.row}>
        <MacroCard label={t("meals.protein")} value={totals.protein} goal={targets.daily_protein} />
        <MacroCard label={t("meals.carbs")} value={totals.carbs} goal={targets.daily_carbs} />
        <MacroCard label={t("meals.fat")} value={totals.fat} goal={targets.daily_fat} />
      </View>
    </View>
  );
}
