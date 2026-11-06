import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { LineDiagram } from "@/components/line/LineDiagram";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";
import type { Dashboard, Standing } from "@/types/api";
import { queryKeys } from "@/utils/api/queryKeys";
import { todayKey } from "@/utils/date";
import { formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  panel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
}));

/**
 * The group's line (STORY): every member is a tick on the same track and "you" is the orange
 * roundel. The goal comes from the dashboard already in the Query cache — no extra request.
 */
export function GroupLine({ standings, periodLabel }: { standings: Standing[]; periodLabel: string }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const cached = qc.getQueryData<Dashboard>(queryKeys.dashboard.day(todayKey()));
  const me = standings.find((s) => s.is_me);
  const others = standings.filter((s) => !s.is_me);
  const top = Math.max(...standings.map((s) => s.steps), 1);
  const goal = Math.max(cached?.steps.goal ?? 10000, top);

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <RText variant="footnote" weight="medium" color="textSecondary">
          {periodLabel}
        </RText>
        <RText variant="footnote" color="textSecondary" tabular>
          {t("common.goal")} {formatInt(goal)}
        </RText>
      </View>
      <LineDiagram
        compact
        value={me?.steps ?? 0}
        goal={goal}
        youLabel={`${t("common.you")} · ${formatInt(me?.steps ?? 0)}`}
        markers={others.map((s) => ({ id: s.user_id, label: s.name, value: s.steps }))}
      />
    </View>
  );
}
