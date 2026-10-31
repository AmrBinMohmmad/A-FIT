import { View, type StyleProp, type ViewStyle } from "react-native";

import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

interface SignPanelProps {
  label: string;
  value: string;
  endLabel?: string;
  endValue?: string;
  tone?: "default" | "accent";
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((theme) => ({
  panel: {
    backgroundColor: theme.colors.signPanel,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
  },
  col: { gap: 2 },
  end: { alignItems: "flex-end" },
}));

/** The dark station sign carrying the one fact that matters: "Next station · 8,000 steps". */
export function SignPanel({ label, value, endLabel, endValue, tone = "default", style }: SignPanelProps) {
  const styles = useStyles();
  return (
    <View style={[styles.panel, style]} accessibilityRole="summary">
      <View style={styles.col}>
        <RText variant="caption" color="signPanelMuted">
          {label}
        </RText>
        <RText variant="subtitle" color="onSignPanel" tabular>
          {value}
        </RText>
      </View>
      {endLabel || endValue ? (
        <View style={[styles.col, styles.end]}>
          {endLabel ? (
            <RText variant="caption" color="signPanelMuted">
              {endLabel}
            </RText>
          ) : null}
          {endValue ? (
            <RText variant="subtitle" color={tone === "accent" ? "accent" : "onSignPanel"} tabular>
              {endValue}
            </RText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
