import { Pressable, View } from "react-native";

import { CodeChip } from "@/components/line/CodeChip";
import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import type { Standing } from "@/types/api";
import { formatInt } from "@/utils/number";

interface StandingRowProps {
  standing: Standing;
  max: number;
  youLabel: string;
  ownerLabel?: string;
  onLongPress?: () => void;
  first?: boolean;
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  first: { borderTopWidth: 0 },
  body: { flex: 1, gap: theme.spacing.xs },
  nameRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  track: { height: 4, borderRadius: 2, backgroundColor: theme.colors.track, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
}));

/** A ranked member on the group line: rank chip, name, exact-magnitude bar on one shared scale, steps. */
export function StandingRow({ standing, max, youLabel, ownerLabel, onLongPress, first }: StandingRowProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const share = Math.max(0, Math.min(1, standing.steps / Math.max(max, 1)));
  const tone = standing.is_me ? "accent" : standing.rank === 1 ? "primary" : "muted";

  const content = (
    <>
      <CodeChip code={standing.rank} tone={tone} />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <RText
            variant="callout"
            weight={standing.is_me ? "bold" : "medium"}
            color={standing.is_me ? "accent" : "textPrimary"}
            numberOfLines={1}
            style={{ flexShrink: 1 }}>
            {standing.is_me ? youLabel : standing.name}
          </RText>
          {standing.role === "owner" && ownerLabel ? (
            <RText variant="caption" color="textMuted">
              {ownerLabel}
            </RText>
          ) : null}
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${share * 100}%`,
                backgroundColor: standing.is_me ? theme.colors.accent : theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>
      <RText variant="callout" weight="bold" tabular>
        {formatInt(standing.steps)}
      </RText>
    </>
  );

  if (!onLongPress) return <View style={[styles.row, first && styles.first]}>{content}</View>;
  return (
    <Pressable
      onLongPress={onLongPress}
      style={[styles.row, first && styles.first]}
      accessibilityRole="button"
      accessibilityLabel={standing.name}>
      {content}
    </Pressable>
  );
}
