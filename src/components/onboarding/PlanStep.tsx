import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";
import { formatInt } from "@/utils/number";
import type { NutritionPreview } from "@/utils/nutrition";

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.spacing.lg },
  intro: { gap: theme.spacing.xs },
  macros: { flexDirection: "row", gap: theme.spacing.md },
  macro: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: 2,
  },
  pills: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" },
  pill: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
}));

function Intro({ title, subtitle }: { title: string; subtitle: string }) {
  const styles = useStyles();
  return (
    <View style={styles.intro}>
      <RText variant="title">{title}</RText>
      <RText variant="footnote" color="textSecondary">
        {subtitle}
      </RText>
    </View>
  );
}

/** The final station: the calculated plan (preview; the server confirms on save). */
export function PlanStep({ preview }: { preview: NutritionPreview }) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.planTitle")} subtitle={t("onboarding.planSubtitle")} />
      <SignPanel
        label={t("onboarding.dailyCalories")}
        value={`${formatInt(preview.dailyCalories)} ${t("common.kcal")}`}
        endLabel={t(`enums.goalType.${preview.goalType}`)}
      />
      <View style={styles.pills}>
        <View style={styles.pill}>
          <RText variant="caption" color="textSecondary" tabular>
            {t("onboarding.bmr", { value: formatInt(preview.bmr) })}
          </RText>
        </View>
        <View style={styles.pill}>
          <RText variant="caption" color="textSecondary" tabular>
            {t("onboarding.tdee", { value: formatInt(preview.tdee) })}
          </RText>
        </View>
      </View>
      <RText variant="footnote" weight="medium" color="textSecondary">
        {t("onboarding.macros")}
      </RText>
      <View style={styles.macros}>
        {(
          [
            ["meals.protein", preview.dailyProtein],
            ["meals.carbs", preview.dailyCarbs],
            ["meals.fat", preview.dailyFat],
          ] as const
        ).map(([key, grams]) => (
          <View key={key} style={styles.macro}>
            <RText variant="caption" color="textSecondary">
              {t(key)}
            </RText>
            <RText variant="subtitle" tabular>
              {formatInt(grams)}{" "}
              <RText variant="caption" color="textMuted">
                {t("common.grams")}
              </RText>
            </RText>
          </View>
        ))}
      </View>
    </View>
  );
}
