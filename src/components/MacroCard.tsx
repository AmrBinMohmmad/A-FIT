import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { SegmentBar } from "@/components/line/SegmentBar";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
}));

/** One macro: label, grams of goal, a 5-block bar. */
export function MacroCard({ label, value, goal }: { label: string; value: number; goal: number }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.cell}>
      <RText variant="caption" color="textSecondary">
        {label}
      </RText>
      <RText variant="callout" weight="bold" tabular>
        {formatInt(value)}{" "}
        <RText variant="caption" color="textMuted">
          {t("common.grams")}
        </RText>
      </RText>
      <SegmentBar value={value} max={goal} segments={5} height={4} />
      <RText variant="caption" color="textMuted" tabular>
        {t("meals.macroOf", { value: formatInt(value), goal: formatInt(goal) })}
      </RText>
    </View>
  );
}
