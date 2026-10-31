import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import { formatCompact } from "@/utils/number";

export interface DayBar {
  key: string;
  label: string;
  value: number;
}

interface DayBarsProps {
  bars: DayBar[];
  goal?: number;
  goalLabel?: string;
  height?: number;
  highlightKey?: string;
  /** Hide the day labels (compact strip). */
  hideLabels?: boolean;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.xs },
  labels: { flexDirection: "row" },
  label: { flex: 1 },
}));

/**
 * Single-series bar chart (steps per day). One hue, thin marks with rounded data-ends
 * anchored to the baseline, a dashed ink goal line, 2 px gaps, exact magnitude on one
 * shared scale (dataviz skill). Direction-aware: bars read start→end.
 */
export function DayBars({ bars, goal, goalLabel, height = 140, highlightKey, hideLabels }: DayBarsProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { isRTL } = useRTL();
  const width = 320;
  const n = Math.max(bars.length, 1);
  const gap = 4;
  const barW = (width - gap * (n - 1)) / n;
  const max = Math.max(goal ?? 0, ...bars.map((b) => b.value), 1);
  const scale = (v: number) => (v / max) * (height - 8);
  const ordered = isRTL ? [...bars].reverse() : bars;

  return (
    <View style={styles.wrap}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        accessibilityRole="image">
        {ordered.map((b, i) => {
          const h = Math.max(scale(b.value), b.value > 0 ? 3 : 0);
          const x = i * (barW + gap);
          const on = goal ? b.value >= goal : false;
          const fill =
            b.key === highlightKey
              ? theme.colors.accent
              : on
                ? theme.colors.primary
                : theme.colors.primaryMuted;
          return <Rect key={b.key} x={x} y={height - h} width={barW} height={h} rx={3} fill={fill} />;
        })}
        {goal ? (
          <>
            <Line
              x1={0}
              x2={width}
              y1={height - scale(goal)}
              y2={height - scale(goal)}
              stroke={theme.colors.textPrimary}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <SvgText
              x={isRTL ? width - 2 : 2}
              y={Math.max(10, height - scale(goal) - 4)}
              fill={theme.colors.textSecondary}
              fontSize={10}
              fontFamily={theme.fontFamily.medium}
              textAnchor={isRTL ? "end" : "start"}>
              {`${goalLabel ?? ""} ${formatCompact(goal)}`.trim()}
            </SvgText>
          </>
        ) : null}
      </Svg>
      {hideLabels ? null : (
        <View style={styles.labels}>
          {bars.map((b) => (
            <RText
              key={b.key}
              variant="caption"
              color={b.key === highlightKey ? "accent" : "textMuted"}
              align="center"
              style={styles.label}
              numberOfLines={1}>
              {b.label}
            </RText>
          ))}
        </View>
      )}
    </View>
  );
}
