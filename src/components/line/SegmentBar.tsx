import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";

interface SegmentBarProps {
  value: number;
  max: number;
  /** Discrete blocks; a fixed measure that never stretches. Overflow strikes the last block. */
  segments?: number;
  height?: number;
  color?: "primary" | "accent";
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((theme) => ({
  row: { flexDirection: "row", gap: 2 },
  seg: { flex: 1, borderRadius: 2, backgroundColor: theme.colors.track },
}));

/** A fixed-measure budget bar made of discrete blocks (kcal budget, water glasses). */
export function SegmentBar({
  value,
  max,
  segments = 10,
  height = 6,
  color = "primary",
  style,
}: SegmentBarProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const safeMax = Math.max(max, 1);
  const filled = Math.min(segments, Math.round((Math.min(value, safeMax) / safeMax) * segments));
  const over = value > safeMax;
  const fill = color === "accent" ? theme.colors.accent : theme.colors.primary;

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeMax, now: Math.min(value, safeMax) }}>
      {Array.from({ length: segments }, (_, i) => {
        const isLast = i === segments - 1;
        const on = i < filled;
        return (
          <Animated.View
            key={`${i}-${on}-${over && isLast}`}
            entering={FadeIn.duration(theme.duration.base).delay(i * 20)}
            style={[
              styles.seg,
              { height },
              on && { backgroundColor: fill },
              over && isLast && { backgroundColor: theme.colors.danger },
            ]}
          />
        );
      })}
    </View>
  );
}
