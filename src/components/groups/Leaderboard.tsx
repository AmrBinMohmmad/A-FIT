import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { ListState } from "@/components/ListState";
import { StandingRow } from "@/components/line/StandingRow";
import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { makeStyles } from "@/hooks/useStyles";
import type { Leaderboard as LeaderboardData, LeaderboardPeriod, Standing } from "@/types/api";

interface LeaderboardProps {
  period: LeaderboardPeriod;
  onPeriod: (p: LeaderboardPeriod) => void;
  data?: LeaderboardData;
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  /** Owner only: holding a member row removes them (confirmed by the caller). */
  onRemove?: (standing: Standing) => void;
}

const PERIODS: LeaderboardPeriod[] = ["today", "week", "month"];

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.sm },
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
  hint: { alignSelf: "flex-end" },
}));

/** Period switcher (segmented, native-shaped) + ranked standings on one shared scale. */
export function Leaderboard({ period, onPeriod, data, loading, error, onRetry, onRemove }: LeaderboardProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const max = Math.max(...(data?.standings.map((s) => s.steps) ?? [0]), 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => onPeriod(p)}
            style={[styles.tab, period === p && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: period === p }}>
            <RText
              variant="footnote"
              weight={period === p ? "bold" : "medium"}
              color={period === p ? "textPrimary" : "textSecondary"}>
              {t(`enums.leaderboardPeriod.${p}`)}
            </RText>
          </Pressable>
        ))}
      </View>
      <ListState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={(data?.standings.length ?? 0) === 0}
        emptyIcon="footsteps-outline"
        emptyBody={t("groups.emptyBoard")}>
        <View>
          {(data?.standings ?? []).map((s, i) => (
            <StandingRow
              key={s.user_id}
              standing={s}
              max={max}
              youLabel={t("common.you")}
              ownerLabel={t("groups.owner")}
              first={i === 0}
              onLongPress={onRemove && !s.is_me && s.role !== "owner" ? () => onRemove(s) : undefined}
            />
          ))}
        </View>
      </ListState>
      <RText variant="caption" color="textMuted" style={styles.hint}>
        {onRemove ? t("groups.removeHint") : t("groups.refreshHint")}
      </RText>
    </View>
  );
}
