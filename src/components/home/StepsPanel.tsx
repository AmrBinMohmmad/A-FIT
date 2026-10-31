import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { DayBars } from "@/components/charts/DayBars";
import { LineDiagram } from "@/components/line/LineDiagram";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { EMOJI } from "@/constants/emoji";
import { useLanguage } from "@/contexts/LanguageContext";
import { makeStyles } from "@/hooks/useStyles";
import type { Dashboard } from "@/types/api";
import { formatWeekday, fromDateKey } from "@/utils/date";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  panel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  friends: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md, marginTop: theme.spacing.xs },
  friend: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  week: { marginTop: theme.spacing.sm, gap: theme.spacing.xs },
  weekHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
}));

/** Stations at 20/50/80/100 % of the goal; the next station is the first one ahead of you. */
function nextStation(steps: number, goal: number): number | null {
  const stations = [0.2, 0.5, 0.8, 1].map((s) => Math.round(goal * s));
  return stations.find((s) => s > steps) ?? null;
}

/** Today's line: the diagram, the dark sign with the next station, friends as ticks. */
export function StepsPanel({ steps, group }: { steps: Dashboard["steps"]; group: Dashboard["group"] }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const goal = Math.max(steps.goal, 1);
  const next = nextStation(steps.steps, goal);
  const friends = [
    ...(group?.others ?? []),
    ...(group?.leader && !group.others.some((o) => o.user_id === group.leader?.user_id)
      ? [group.leader]
      : []),
  ];

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <RText variant="footnote" weight="medium" color="textSecondary">
          {t("home.greeting")}
        </RText>
        <RText variant="footnote" color="textSecondary" tabular>
          {t("common.goal")} {formatInt(goal)}
        </RText>
      </View>

      <LineDiagram
        value={steps.steps}
        goal={goal}
        youLabel={`${t("common.you")} · ${formatInt(steps.steps)}`}
        markers={friends.map((f) => ({ id: f.user_id, label: f.name, value: f.steps }))}
      />

      {next ? (
        <SignPanel
          label={t("home.nextStation")}
          value={`${formatInt(next)} ${t("common.steps")}`}
          endLabel={t("common.remaining")}
          endValue={formatInt(next - steps.steps)}
          tone="accent"
        />
      ) : (
        <SignPanel
          label={`${t("home.goalReached")} ${EMOJI.party}`}
          value={`${formatInt(steps.steps)} ${t("common.steps")}`}
          endValue={
            steps.steps > goal ? t("home.pastGoal", { count: formatInt(steps.steps - goal) }) : undefined
          }
          tone="accent"
        />
      )}

      <View style={styles.week}>
        <View style={styles.weekHead}>
          <RText variant="caption" color="textSecondary">
            {t("home.weekStrip")}
          </RText>
          <RText
            variant="caption"
            color={steps.streak > 0 ? "accent" : "textSecondary"}
            weight="medium"
            tabular>
            {steps.streak > 0
              ? `${EMOJI.streak} ${t("home.streak", { count: steps.streak })}`
              : t("home.streakNone")}
          </RText>
        </View>
        <DayBars
          height={44}
          hideLabels
          bars={steps.week.map((d) => ({
            key: d.date,
            label: formatWeekday(fromDateKey(d.date), language),
            value: d.steps,
          }))}
          goal={goal}
          highlightKey={steps.week[steps.week.length - 1]?.date}
        />
      </View>

      {friends.length ? (
        <View style={styles.friends} accessibilityLabel={t("home.friendsOnLine")}>
          {friends.slice(0, 4).map((f) => (
            <View key={f.user_id} style={styles.friend}>
              <Avatar uri={f.avatar_url} name={f.name} size={20} tone="muted" />
              <RText variant="caption" color="textSecondary" numberOfLines={1}>
                {f.name}{" "}
                <RText variant="caption" color="textPrimary" tabular>
                  {formatInt(f.steps)}
                </RText>
              </RText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
