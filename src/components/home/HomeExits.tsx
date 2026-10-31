import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ExitRow } from "@/components/line/ExitRow";
import { SegmentBar } from "@/components/line/SegmentBar";
import { RText } from "@/components/RText";
import { useWaterControls } from "@/hooks/body/useWater";
import { makeStyles } from "@/hooks/useStyles";
import type { Dashboard } from "@/types/api";
import { formatDecimal, formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  wrap: { gap: 0 },
  head: { paddingBottom: theme.spacing.xs },
  bar: { width: 96 },
  waterRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  quick: { minHeight: 32, paddingHorizontal: theme.spacing.sm },
}));

/** The exits list under the line: meals, group, challenge, water, weight — each one tap away. */
export function HomeExits({ data, date }: { data: Dashboard; date: string }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const n = data.nutrition;
  const targets = n.targets;
  const kcalLeft = targets ? targets.calories - n.calories : null;
  // Quick water: taps coalesce into one PUT; until the day query is loaded, show the dashboard value.
  const water = useWaterControls(date);
  const waterMl = water.query.data ? water.ml : data.water.ml;

  return (
    <View style={styles.wrap}>
      <RText variant="footnote" weight="medium" color="textSecondary" style={styles.head}>
        {t("home.exits")}
      </RText>

      <ExitRow
        first
        code={1}
        title={t("home.mealsExit")}
        subtitle={n.meals_count ? t("home.mealsCount", { count: n.meals_count }) : t("home.noMeals")}
        value={targets ? `${formatInt(n.calories)} / ${formatInt(targets.calories)}` : formatInt(n.calories)}
        valueTone={kcalLeft !== null && kcalLeft < 0 ? "accent" : "default"}
        trailing={
          targets ? (
            <SegmentBar
              value={n.calories}
              max={targets.calories}
              segments={8}
              height={4}
              style={styles.bar}
            />
          ) : undefined
        }
        onPress={() => router.push("/(tabs)/meals")}
      />

      <ExitRow
        code={2}
        title={data.group ? data.group.name : t("home.groupExit")}
        subtitle={
          data.group
            ? data.group.leader && data.group.my_rank !== 1
              ? t("home.leaderAhead", {
                  name: data.group.leader.name,
                  steps: formatInt(data.group.leader.steps),
                })
              : t("common.members", { count: data.group.members_count })
            : t("home.noGroup")
        }
        value={
          data.group?.my_rank
            ? t("home.rank", { rank: data.group.my_rank, total: data.group.members_count })
            : undefined
        }
        valueTone={data.group?.my_rank === 1 ? "accent" : "default"}
        onPress={() =>
          data.group
            ? router.push({ pathname: "/groups/[id]", params: { id: String(data.group.id) } })
            : router.push("/(tabs)/groups")
        }
      />

      {data.challenge ? (
        <ExitRow
          code={3}
          tone="accent"
          title={data.challenge.title}
          subtitle={
            data.challenge.goal_steps
              ? t("home.challengeProgress", {
                  team: formatInt(data.challenge.team_steps),
                  goal: formatInt(data.challenge.goal_steps),
                  days: t("common.days", { count: data.challenge.days_left }),
                })
              : t("home.challengeMost", {
                  team: formatInt(data.challenge.team_steps),
                  days: t("common.days", { count: data.challenge.days_left }),
                })
          }
          trailing={
            data.challenge.goal_steps ? (
              <SegmentBar
                value={data.challenge.team_steps}
                max={data.challenge.goal_steps}
                segments={8}
                height={4}
                color="accent"
                style={styles.bar}
              />
            ) : undefined
          }
          onPress={() =>
            router.push({ pathname: "/challenges/[id]", params: { id: String(data.challenge?.id) } })
          }
        />
      ) : null}

      <ExitRow
        code={data.challenge ? 4 : 3}
        title={t("home.waterExit")}
        value={`${formatDecimal(waterMl / 1000, 2)} / ${formatDecimal(data.water.goal_ml / 1000, 1)} ${t("common.liters")}`}
        trailing={
          <View style={styles.waterRow}>
            <SegmentBar value={waterMl} max={data.water.goal_ml} segments={8} height={4} style={styles.bar} />
            <Button
              title={t("home.quickWater")}
              variant="secondary"
              onPress={() => water.add(250)}
              style={styles.quick}
              accessibilityLabel={t("water.glass")}
            />
          </View>
        }
        onPress={() => router.push({ pathname: "/water", params: { date } })}
      />

      <ExitRow
        code={data.challenge ? 5 : 4}
        title={t("home.weightExit")}
        subtitle={data.weight ? undefined : t("home.noWeight")}
        value={data.weight ? `${formatDecimal(data.weight.weight_kg)} ${t("common.kg")}` : undefined}
        onPress={() => router.push("/weight")}
      />
    </View>
  );
}
