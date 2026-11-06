import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ListState } from "@/components/ListState";
import { SegmentBar } from "@/components/line/SegmentBar";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { EMOJI } from "@/constants/emoji";
import { useTheme } from "@/contexts/ThemeContext";
import { useWaterControls } from "@/hooks/body/useWater";
import { useProfile } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";
import { todayKey } from "@/utils/date";
import { formatDecimal, formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  row: { flexDirection: "row", gap: theme.spacing.sm },
  btn: { flex: 1 },
}));

/** Water: an absolute daily total in glasses; taps are optimistic and coalesce server-side. */
export default function WaterScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { date: param } = useLocalSearchParams<{ date?: string }>();
  const date = param ?? todayKey();
  const water = useWaterControls(date);
  const profile = useProfile();
  const ml = water.ml;
  const goal = profile.data?.water_goal_ml ?? 2500;
  const add = (delta: number) => water.add(delta);

  return (
    <Screen title={`${EMOJI.water} ${t("water.title")}`} subtitle={t("water.today")} back>
      <ListState
        loading={water.query.isPending}
        error={water.query.isError ? water.query.error : undefined}
        onRetry={() => void water.query.refetch()}>
        <View style={{ gap: theme.spacing.xl }}>
          <SignPanel
            label={t("water.today")}
            value={`${formatDecimal(ml / 1000, 2)} ${t("common.liters")}`}
            endLabel={t("common.goal")}
            endValue={`${formatDecimal(goal / 1000, 1)} ${t("common.liters")}`}
            tone={ml >= goal ? "accent" : "default"}
          />
          <SegmentBar value={ml} max={goal} segments={Math.max(4, Math.round(goal / 250))} height={14} />
          {ml >= goal ? (
            <RText variant="callout" weight="bold" color="accent">
              {`${EMOJI.water}${EMOJI.party} ${t("water.goalReached")}`}
            </RText>
          ) : (
            <RText variant="footnote" color="textSecondary" tabular>
              {formatInt(goal - ml)} {t("common.ml")} {t("common.remaining")}
            </RText>
          )}
          <View style={styles.row}>
            <Button
              title={t("water.glass")}
              variant="primary"
              size="lg"
              icon="water-outline"
              onPress={() => add(250)}
              style={styles.btn}
            />
            <Button
              title={t("water.bottle")}
              variant="secondary"
              size="lg"
              icon="water"
              onPress={() => add(500)}
              style={styles.btn}
            />
          </View>
          <Button title={t("water.reset")} variant="ghost" onPress={() => water.set(0)} />
        </View>
      </ListState>
    </Screen>
  );
}
