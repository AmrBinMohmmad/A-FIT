import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";

import { DayBars } from "@/components/charts/DayBars";
import { ListState } from "@/components/ListState";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { EMOJI } from "@/constants/emoji";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useStepHistory } from "@/hooks/steps/useSteps";
import { makeStyles } from "@/hooks/useStyles";
import { addDays, dateKeysBetween, formatWeekday, fromDateKey, toDateKey, todayKey } from "@/utils/date";
import { formatInt } from "@/utils/number";

const RANGES = [7, 30, 90] as const;

const useStyles = makeStyles((theme) => ({
  tabs: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.sm,
  },
  tabOn: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  stats: { flexDirection: "row", gap: theme.spacing.sm },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: 2,
  },
}));

/** Step history over a bounded window; bars are exact magnitude on one scale, the goal is a dashed rule. */
export default function StepsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const styles = useStyles();
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const to = todayKey();
  const from = toDateKey(addDays(new Date(), -(days - 1)));
  const history = useStepHistory(from, to);

  const bars = useMemo(() => {
    const byDate = new Map((history.data?.entries ?? []).map((e) => [e.date, e.steps]));
    const keys = dateKeysBetween(fromDateKey(from), fromDateKey(to));
    return keys.map((k, i) => ({
      key: k,
      label:
        days === 7
          ? formatWeekday(fromDateKey(k), language)
          : i % Math.ceil(days / 6) === 0
            ? String(fromDateKey(k).getDate())
            : "",
      value: byDate.get(k) ?? 0,
    }));
  }, [history.data, from, to, days, language]);

  const total = bars.reduce((s, b) => s + b.value, 0);
  const withData = bars.filter((b) => b.value > 0).length;
  const goal = history.data?.goal ?? 10000;
  const best = bars.reduce(
    (m, b) => (b.value > m.value ? b : m),
    bars[0] ?? { key: "", label: "", value: 0 },
  );
  const onGoal = bars.filter((b) => b.value >= goal).length;

  return (
    <Screen
      title={t("steps.title")}
      back
      refreshControl={
        <RefreshControl
          refreshing={history.isRefetching}
          onRefresh={() => void history.refetch()}
          tintColor={theme.colors.primary}
        />
      }>
      <View style={styles.tabs} accessibilityRole="tablist">
        {RANGES.map((r) => (
          <Pressable
            key={r}
            onPress={() => setDays(r)}
            style={[styles.tab, days === r && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: days === r }}>
            <RText
              variant="footnote"
              weight={days === r ? "bold" : "medium"}
              color={days === r ? "textPrimary" : "textSecondary"}>
              {t(`steps.last${r}`)}
            </RText>
          </Pressable>
        ))}
      </View>

      <ListState
        loading={history.isPending}
        error={history.isError ? history.error : undefined}
        onRetry={() => void history.refetch()}
        empty={total === 0}
        emptyEmoji={EMOJI.steps}
        emptyBody={t("steps.empty")}>
        <View style={{ gap: theme.spacing.lg }}>
          <SignPanel
            label={t("steps.average")}
            value={`${formatInt(withData ? total / withData : 0)} ${t("common.steps")}`}
            endLabel={t("steps.total")}
            endValue={formatInt(total)}
          />
          <DayBars bars={bars} goal={goal} goalLabel={t("steps.goalLine")} highlightKey={to} />
          <View style={styles.stats}>
            <View style={styles.stat}>
              <RText variant="caption" color="textSecondary">
                {t("steps.best")}
              </RText>
              <RText variant="subtitle" tabular>
                {formatInt(best.value)}
              </RText>
            </View>
            <View style={styles.stat}>
              <RText variant="caption" color="textSecondary">
                {t("common.goal")}
              </RText>
              <RText variant="subtitle" tabular>
                {t("steps.daysOnGoal", { count: onGoal })}
              </RText>
            </View>
          </View>
        </View>
      </ListState>
    </Screen>
  );
}
