import { View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import { formatDecimal } from "@/utils/number";

export interface TrendPoint {
  key: string;
  label: string;
  value: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  target?: number;
  targetLabel?: string;
  height?: number;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.xs },
  labels: { flexDirection: "row", justifyContent: "space-between" },
}));

/** Single-series line (weight over time): 2 px ink line, ≥ 8 px markers, dashed target. */
export function TrendLine({ points, target, targetLabel, height = 160 }: TrendLineProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { isRTL } = useRTL();
  const width = 320;
  const pad = 14;
  const values = points.map((p) => p.value);
  const lo = Math.min(...(target ? [...values, target] : values)) - 1;
  const hi = Math.max(...(target ? [...values, target] : values)) + 1;
  const span = Math.max(hi - lo, 1);
  const n = points.length;
  const xAt = (i: number) => {
    const t = n > 1 ? i / (n - 1) : 0.5;
    const x = pad + t * (width - pad * 2);
    return isRTL ? width - x : x;
  };
  const yAt = (v: number) => pad + (1 - (v - lo) / span) * (height - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(" ");
  const first = points[0];
  const last = points[n - 1];

  return (
    <View style={styles.wrap}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        accessibilityRole="image">
        {target ? (
          <>
            <Line
              x1={0}
              x2={width}
              y1={yAt(target)}
              y2={yAt(target)}
              stroke={theme.colors.primary}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <SvgText
              x={isRTL ? width - 2 : 2}
              y={Math.max(10, yAt(target) - 4)}
              fill={theme.colors.primary}
              fontSize={10}
              fontFamily={theme.fontFamily.medium}
              textAnchor={isRTL ? "end" : "start"}>
              {`${targetLabel ?? ""} ${formatDecimal(target)}`.trim()}
            </SvgText>
          </>
        ) : null}
        {n > 1 ? (
          <Path
            d={d}
            stroke={theme.colors.textPrimary}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {points.map((p, i) => (
          <Circle
            key={p.key}
            cx={xAt(i)}
            cy={yAt(p.value)}
            r={i === n - 1 ? 5 : 4}
            fill={i === n - 1 ? theme.colors.accent : theme.colors.background}
            stroke={theme.colors.textPrimary}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.labels}>
        <RText variant="caption" color="textMuted">
          {first?.label ?? ""}
        </RText>
        <RText variant="caption" color="textMuted">
          {n > 1 ? (last?.label ?? "") : ""}
        </RText>
      </View>
    </View>
  );
}
